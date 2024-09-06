import { Box, TextField, Paper, Grid, Button, Select, InputLabel, FormControl, Typography, Autocomplete, Link } from '@mui/material';
import ListDataGrid from "../components/ListDataGrid";

import { useSelector } from "react-redux";
import React, { useEffect, useState, Fragment, } from "react";
import {  useNavigate } from 'react-router-dom';
import LogsService from "../services/historyLogService";
import { useSnackbarContext } from '../providers/SnackbarWrapperProvider';
import UserService from "../services/userService";
import Swal from "sweetalert2";

function Logs() {

    //Funcion para formatear los valores sin comparar. Originales basicamente.
    const formatValue = (value) => {
        if (value === undefined || value === null) {
            return 'null';
        } else if (typeof value === 'object' && value.$date) {
            return formatDateFromJson(value); //epoch. ver comment abajo
        } else if (typeof value === 'object') {
            let result = '';
            for (const key in value) {
                if (value.hasOwnProperty(key)) {
                    const formattedValue = formatValue(value[key]); // recursividad maravillosa por si acaso hay datos anidados. esto hace tambien que se pinte de la misma forma que el updated entity, ya que se tratan igual.
                    result += `<strong>${key}:</strong> ${formattedValue}<br />`;
                }
            }
            return result; // Retornamos el texto final formateado con <br />
        } else {
            return value.toString(); // Para otros tipos de datos, los convertimos a string
        }
    };
    //Funcion para formatear las fechas en que nos vienen en epoch del back. En teoria si el back se actualiza esto deja de detectarlo y deberia funcionar solo.
    const formatDateFromJson = (dateObj) => {
        if (dateObj && dateObj.$date && dateObj.$date.$numberLong) {
            //INT>DATE>ISO
            const timestamp = parseInt(dateObj.$date.$numberLong, 10);
            const date = new Date(timestamp);
            return date.toISOString();
        }
        return dateObj; //just in case
    };
    //comparacion simple de valores para pintar las diferencias.
    const formatValueWithDiff = (originalValue, updatedValue) => {
        const originalFormatted = formatValue(originalValue);
        const updatedFormatted = formatValue(updatedValue);

        if (originalFormatted !== updatedFormatted) {
            return `
                <span style="color: red;">${updatedFormatted}</span>`;
        }
        return updatedFormatted;
    };
    //comparacion de objetos para pintar las diferencias.
    const formatJsonWithHighlightedDiff = (originalObj, updatedObj) => {
        let result = '';
        //pasamos el obj/json entero como clave/valor
        const allKeys = new Set([...Object.keys(originalObj || {}), ...Object.keys(updatedObj || {})]);
        allKeys.forEach(key => {
            let originalValue = originalObj ? originalObj[key] : undefined;
            let updatedValue = updatedObj ? updatedObj[key] : undefined;

            // si tenemos fechas epoch las pasamos a ISO con la funcion de arriba
            if (updatedValue && typeof updatedValue === 'object' && updatedValue.$date) {
                updatedValue = formatDateFromJson(updatedValue);
            }
    
            if (originalValue && typeof originalValue === 'object' && originalValue.$date) {
                originalValue = formatDateFromJson(originalValue);
            }


            const safeOriginalValue = originalValue !== undefined && originalValue !== null ? originalValue : 'null';
            const safeUpdatedValue = updatedValue !== undefined && updatedValue !== null ? updatedValue : 'null';
    
            // buscamos diferencias y las pintamos (o no)
            if (safeOriginalValue !== safeUpdatedValue) {
                result += `<strong>${key}:</strong> <span style="color: red;">${formatValue(safeUpdatedValue)}</span><br />`;
            } else {
                result += `<strong>${key}:</strong> ${formatValue(safeUpdatedValue)}<br />`;
            }
        });

        return result;
    };


    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    //Token
    const token = useSelector((state) => state.user.token);
    //States
    const [historyLogsData, setHistoryLogsData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [user_id, setUser_id] = useState('');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga
    const historyColumns = [
        { field: 'user', headerName: 'User', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'action', headerName: 'Action', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'entity', headerName: 'Entity', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'updated_at', headerName: 'Updated_at', flex: 1, resizable: true, overflow: 'hidden' },
        {
            field: 'details',
            headerName: 'Details',
            flex: 1,
            renderCell: (params) => {
                const handleClick = () => {
                    const { original_entity, updated_entity } = params.row;
                    const originalEntityEmpty = !original_entity || Object.keys(original_entity).length === 0 || params.row.action === 'create';
                    const updatedEntityEmpty = !updated_entity || Object.keys(updated_entity).length === 0 || params.row.action === 'delete';
                    console.log('original_entity', original_entity);
                    console.log('updated_entity', updated_entity);
                    // Crear contenido del popup
                    const originalEntityDetails = !originalEntityEmpty ? `
                        <div style="width: 80%; text-align: left;">
                        <h3>Original Entity</h3>
                        <strong>Name:</strong> ${formatValue(original_entity.name)}<br />
                        <strong>Data:</strong> <pre style="text-align: left; white-space: pre-wrap;"> ${formatValue(original_entity)}</pre><br />
                        <strong>_id:</strong> ${formatValue(original_entity._id)}<br />
                        <strong>Updated at:</strong> ${formatValue(original_entity.updated_at)}<br />
                        <strong>Created at:</strong> ${formatValue(original_entity.created_at)}<br />
                        </div>
                    ` : '';

                    const updatedEntityDetails = !updatedEntityEmpty ? `
                        <div style="width: 80%; text-align: left;">
                        <h3>Updated Entity</h3>
                        <strong>Name:</strong> ${formatValueWithDiff(original_entity.name, updated_entity.name)}<br />
                        <strong>Data:</strong> <pre style="text-align: left; white-space: pre-wrap;"> ${formatJsonWithHighlightedDiff(original_entity, updated_entity)}</pre><br />
                        <strong>_id:</strong> ${formatValueWithDiff(original_entity._id, updated_entity._id)}<br />
                        <strong>Updated at:</strong> ${formatValueWithDiff(original_entity.updated_at, updated_entity.updated_at)}<br />
                        <strong>Created at:</strong> ${formatValueWithDiff(original_entity.created_at, updated_entity.created_at)}<br />
                        </div>
                    ` : '';

                    const containerStyle = (originalEntityDetails && updatedEntityDetails) ?
                        'display: flex; justify-content: space-between;' :
                        'display: flex; justify-content: center;';
                    const swalWidth = (originalEntityDetails && updatedEntityDetails) ? 1200 : 1000;


                    // Mostrar el popup con SweetAlert2
                    Swal.fire({
                        title: 'Entity Details',
                        html: `
                            <div style="${containerStyle}">
                                ${originalEntityDetails}
                                ${updatedEntityDetails}
                            </div>
                        `,
                        width: swalWidth,
                        padding: '3em',
                        confirmButtonText: 'Close',
                        confirmButtonColor: 'primary',
                    });
                };

                return (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleClick}
                        sx={{ m: 0.5 }}
                    >
                        View Details
                    </Button>
                );
            }
        }

    ]

    const [columns, setColumns] = useState(historyColumns);


    const navigate = useNavigate();
    const [filterText, setFilterText] = useState('');

    //get logs data when the page loads
    useEffect(() => {
        if (token) {
            getHistoryLogsData();
            getUsersData();
        }
    }, [token]);

    //update filter with text change or logs data
    useEffect(() => {
        filterRows();
    }, [filterText, user_id, historyLogsData]);

    const getHistoryLogsData = async () => {
        try {
            const response = await LogsService.getHistoryLog(token);

            const transformedData = response.data.map((logs) => ({
                ...logs,
                id: logs._id,
            }));
            setHistoryLogsData(transformedData);
            setRows(transformedData);
            setLoading(false);
        } catch (error) {
            showSnackbar('Something went wrong, please try again later.', {
                variant: 'error',
                autoHideDuration: 6000,
                action: (key) => (
                    <Fragment>
                        <Button
                            size='small'
                            onClick={() => alert(`Error: ${error.message}`)}
                        >
                            Detail
                        </Button>
                        <Button size='small' onClick={() => closeSnackbarGlobal(key)}>
                            Dismiss
                        </Button>
                    </Fragment>
                ),
            });
        }
    };
    const getUsersData = async () => {
        try {
            const response = await UserService.getAll(token);
            const transformedData = response.data.map((user) => ({
                ...user,
                company: user.company ? user.company.name : 'N/A', // get company name from <User><Company>
                id: user._id,
            }));
            setUserData(transformedData);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    //filter in ALL the columns with the text of the filter 
    const filterRows = () => {
        const filteredRows = historyLogsData.filter((row) => {
            const userIdMatches = row.user_id === user_id || !user_id;
            const matchesFilterText = Object.values(row).some(value =>
                String(value).toLowerCase().includes(filterText.toLowerCase())
            );
            return userIdMatches && matchesFilterText;
        });

        setRows(filteredRows);
    };

    return (
        <ListDataGrid
            rows={rows}
            columns={columns}
            name="Logs"
            subname="Logs of changes"
            url="/logs"
            loading={loading}
            noClick={true}
            createButton={false}
            filterComponent={<FilterComponent filterText={filterText} setFilterText={setFilterText} userData={userData} user_id={user_id} setUser_id={setUser_id} />}

        />
    );
}

export default Logs;

const FilterComponent = ({ filterText, setFilterText, userData, user_id, setUser_id }) => {
    const handleUserChange = (event, value) => {
        setUser_id(value ? value.id : '');
    };
    return (
        <Box spacing={{ xs: 1, sm: 2, md: 2 }}
            sx={{ display: 'flex', flexGrow: 1, flexDirection: 'row', minWidth: 0, alignItems: 'start', gap: 2 }}>
            <FormControl fullWidth>
                <Autocomplete
                    size='small'
                    options={userData}
                    getOptionLabel={(option) => option.name}
                    value={userData.find(user => user.id === user_id) || null}
                    onChange={handleUserChange}
                    renderInput={(params) => <TextField {...params} label="User" variant="outlined" />}
                />
            </FormControl>
            <FormControl fullWidth>
                <TextField
                    size='small'
                    label="Filter"
                    variant="outlined"
                    margin='none'
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                /></FormControl>
        </Box>
    );
}