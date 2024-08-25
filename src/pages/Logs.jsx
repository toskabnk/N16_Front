import { Box, TextField, Paper, Grid, Button, Select, InputLabel, FormControl, Typography, Autocomplete, Link } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ListDataGrid from "../components/ListDataGrid";

import { useSelector } from "react-redux";
import React, { useEffect, useState, Fragment, } from "react";
import { useNavigate } from 'react-router-dom';
import LogsService from "../services/historyLogService";
import { useSnackbarContext } from '../providers/SnackbarWrapperProvider';
import UserService from "../services/userService";
import Swal from "sweetalert2";

function Logs() {

    // Función para convertir fechas y objetos en cadenas legibles
    const formatValue = (value) => {

        if (value instanceof Date) {
            try {
                return value.toISOString(); // O usa algún formato de fecha específico
            }
            catch (error) {
                return value.toString();
            }
        } else if (typeof value === 'object') {
            return JSON.stringify(value, null, 4); // Convierte objetos en cadenas JSON
        } else {
            return value; // Retorna el valor tal cual si no es objeto
        }
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
        { field: 'user', headerName: 'user', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'action', headerName: 'action', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'entity', headerName: 'entity', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'updated_at', headerName: 'updated_at', flex: 1, resizable: true, overflow: 'hidden' },
        {
            field: 'details',
            headerName: 'Details',
            flex: 1,
            renderCell: (params) => {
                const handleClick = () => {
                    const { original_entity, updated_entity } = params.row;
                    const originalEntityEmpty = !original_entity || Object.keys(original_entity).length === 0;
                    const updatedEntityEmpty = !updated_entity || Object.keys(updated_entity).length === 0;

                    // Crear contenido del popup
                    const originalEntityDetails = !originalEntityEmpty ? `
                        <strong>Name:</strong> ${formatValue(original_entity.name)}<br />
                         <strong>Data:</strong> <pre style="text-align: left; white-space: pre-wrap;"> ${formatValue(original_entity)}</pre><br />
                        <strong>_id:</strong> ${formatValue(original_entity._id)}<br />
                        <strong>Updated at:</strong> ${formatValue(original_entity.updated_at)}<br />
                        <strong>Created at:</strong> ${formatValue(original_entity.created_at)}<br />
                    ` : 'No Original Entity Data';

                    const updatedEntityDetails = !updatedEntityEmpty ? `
                        <strong>Name:</strong> ${formatValue(updated_entity.name)}<br />
                         <strong>Data:</strong> <pre style="text-align: left; white-space: pre-wrap;"> ${formatValue(updated_entity)}</pre><br />
                        <strong>_id:</strong> ${formatValue(updated_entity._id)}<br />
                        <strong>Updated at:</strong> ${formatValue(updated_entity.updated_at)}<br />
                        <strong>Created at:</strong> ${formatValue(updated_entity.created_at)}<br />
                    ` : 'No Updated Entity Data';

                    // Mostrar el popup con SweetAlert2
                    Swal.fire({
                        title: 'Entity Details',
                        html: `
                            <div style="display: flex; justify-content: space-between;">
                                <div style="width: 45%; text-align: left;">
                                    <h3>Original Entity</h3>
                                    ${originalEntityDetails}
                                </div>
                                <div style="width: 45%; text-align: left;">
                                    <h3>Updated Entity</h3>
                                    ${updatedEntityDetails}
                                </div>
                            </div>
                        `,
                        width: 1200,
                        padding: '3em',
                        confirmButtonText: 'Close',
                        confirmButtonColor: '#3085d6',
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

    const handleUserChange = (event, value) => {
        setUser_id(value ? value.id : '');
    };

    const handleSelectChange = (e) => {
        setUser_id(e.target.value);
    };

    const handleRowClick = (params) => {
        navigate(`/logs/${params.id}`, { state: { logs: params.row } });
    };

    return (
        <Box>
            <Box
                gap={4}
                p={2}>
                <Paper
                    elevation={3}>
                    <Box spacing={{ xs: 1, sm: 2, md: 2 }}
                        p={2}
                        sx={{ display: 'flex', justifyContent: 'start', gap: 2 }}>

                        <FormControl fullWidth>
                            <Autocomplete
                                options={userData}
                                getOptionLabel={(option) => option.name}
                                value={userData.find(user => user.id === user_id) || null}
                                onChange={handleUserChange}
                                renderInput={(params) => <TextField {...params} label="User" variant="outlined" />}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <TextField
                                label="Filter"
                                variant="outlined"
                                margin='none'
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            /></FormControl>
                    </Box>
                </Paper>
            </Box>
            <ListDataGrid
                rows={rows}
                columns={columns}
                name="Logs"
                subname="Logs of changes"
                url="/logs"
                loading={loading}
                noClick={true}
                createButton={false}
            />
        </Box >
    );
}


export default Logs;
