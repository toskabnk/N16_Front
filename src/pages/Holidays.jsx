import { useSelector } from "react-redux";
import ListDataGrid from "../components/ListDataGrid";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import { Fragment, useCallback, useEffect, useState } from "react";
import { Button, TextField, Tooltip } from "@mui/material";
import holidayService from "../services/holidayService";
import { useNavigate } from "react-router-dom";

function Holidays() {
    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    const navigate = useNavigate();
    //Token
    const token = useSelector((state) => state.user.token);
    //Row data for the table
    const [rows, setRows] = useState([]);
    const [unfilteredRows, setUnfilteredRows] = useState([]);
    //Role
    const role = useSelector((state) => state.user.role);
    //Columns for the table
    const [columns, setColumns] = useState([
        { field: 'teacher_name', headerName: 'Teacher', flex: 1, overflow: 'hidden' },
        { field: 'created_at', headerName: 'Created', flex: 1, overflow: 'hidden' , type: 'date', valueGetter: (value) => value && new Date(value), },
        { field: 'start_date', headerName: 'Date start', flex: 1, overflow: 'hidden', type: 'date', valueGetter: (value) => value && new Date(value), },
        { field: 'end_date', headerName: 'Date end', flex: 1, overflow: 'hidden', type: 'date', valueGetter: (value) => value && new Date(value), },
        { field: 'status', headerName: 'Status', flex: 1, overflow: 'hidden' },
        { field: 'absence_type', headerName: 'Absence type', flex: 1, overflow: 'hidden' },
        { field: 'information', headerName: 'Information', flex: 1, overflow: 'hidden',
            renderCell: (params) => {
                return (
                    <div>
                        <Tooltip title={params.row.details} arrow placement="left">
                            <Button
                                variant="contained"
                                color="primary"
                            >
                                Info
                            </Button>
                        </Tooltip>
                    </div>
                );
            },
         },
        { field: 'actions', headerName: 'Actions', flex: 1.5, resizable: true, overflow: 'hidden',
            renderCell: (params) => {
                const currentRows = params.api.getRowModels();
                return (
                    <div>
                            {params.row.status === 'pending' || params.row.status === 'rejected' ? (
                                <>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => handleAccept(params.row, Array.from(currentRows.values()))}>
                                        Accept
                                    </Button>
                                    <Button 
                                        variant="contained"
                                        color="warning"
                                        onClick={() => handleEdit(params.row)}>
                                        Edit
                                    </Button>
                                </>
                                ) : null}
                                {params.row.status === 'accepted' || params.row.status === 'pending'? (
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleRevoke(params.row, Array.from(currentRows.values()))}>
                                    {params.row.status === 'accepted' ? 'Revoke' : 'Reject'}
                                    </Button>
                            ) : null}
                    </div>
                );
            },
         },
    ]);
    //Loading state
    const [loading, setLoading] = useState(true);
    //Filter text
    const [filterText, setFilterText] = useState('');

    //Al cargar la pagina carga las companias
    useEffect(() => {
        if(token){
            getHolidays();
        }
    }, [token]);

    //Elimina las columnas de acciones y teacher_name si no es super_admin
    useEffect(() => {
        if(role){
            if(role !== 'super_admin'){
                //Elimina la columna de acciones y de teacher_name
                setColumns(a => a.filter((column) => column.field !== 'actions'));
                setColumns(a => a.filter((column) => column.field !== 'teacher_name'));
            }
        }
    }, [role]);

    //Obtienes las solicitudes de vacaciones
    const getHolidays = async () => {
        try {
            const response = await holidayService.getAll(token);
            //Transforma los datos para que el id sea el _id
            const transformedData = response.data.map((holiday) => ({
                ...holiday,
                id: holiday._id,
                teacher_name: holiday.teacher?.name? holiday.teacher.name : '',
                details: holiday.notes? holiday.notes : '',
            }));
            setRows(transformedData);
            setUnfilteredRows(transformedData);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
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
    }

    //Maneja la aceptacion de una solicitud
    const handleAccept = useCallback(async (row, currentRows) => {
        try {
            await holidayService.acceptHolidayRequest(token, row.id);
            showSnackbar('Holiday accepted successfully.', {
                variant: 'success',
                autoHideDuration: 6000,
                action: (key) => (
                    <Fragment>
                        <Button size='small' onClick={() => closeSnackbarGlobal(key)}>
                            Dismiss
                        </Button>
                    </Fragment>
                ),
            });
            //Actualiza el estado de esa celda
            const updatedRows = currentRows.map((holiday) => {
                if (holiday.id === row.id) {
                    console.log(holiday);
                    return {
                        ...holiday,
                        status: 'accepted',
                    };
                }
                return holiday;
            });
            setRows(updatedRows);
        } catch (error) {
            console.error(error);
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
    }, [rows]);

    //Maneja la edicion de una solicitud
    const handleEdit = useCallback(async (row) => {
        navigate(`/holiday/${row.id}`, { state: { objectID: row } });
    }, [rows]);

    //Maneja la revocacion de una solicitud
    const handleRevoke = useCallback(async (row, currentRows) => {
        try {
            if(row.status === 'accepted'){
                await holidayService.revokeHolidayRequest(token, row.id);
            } else {
                await holidayService.rejectHolidayRequest(token, row.id);
            }
            showSnackbar(`Holiday ${row.status === 'accepted' ? 'revoked' : 'rejected'} successfully`, {
                variant: 'success',
                autoHideDuration: 6000,
                action: (key) => (
                    <Fragment>
                        <Button size='small' onClick={() => closeSnackbarGlobal(key)}>
                            Dismiss
                        </Button>
                    </Fragment>
                ),
            });
            //Actualiza el estado de esa celda
            const updatedRows = currentRows.map((holiday) => {
                if (holiday._id === row.id) {
                    return {
                        ...holiday,
                        status: 'rejected',
                    };
                }
                return holiday;
            });
            setRows(updatedRows);
        } catch (error) {
            console.error(error);
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
    }, [rows]);

    //update filter with text change or user data
    useEffect(() => {
        if(filterText === ''){
            setRows(unfilteredRows);
        } else {
            let data = unfilteredRows;
            if(filterText !== ''){
                data = filterRows(data);
            }
            setRows(data);
        }
    }, [filterText]);

    //Filter only the name column
    const filterRows = (data) => {
        const filteredRows = data.filter((row) => {
            return row.teacher?.name.toLowerCase().includes(filterText.toLowerCase());
        });
        return filteredRows;
    };

    const components = [
        <FilterNameComponent filterText={filterText} setFilterText={setFilterText} />,
    ];

    return (
        <ListDataGrid
            rows={rows}
            columns={columns}
            name="Holidays"
            subname="List"
            url="/holiday"
            buttonName="New"
            loading={loading}
            noClick={true}
            filterComponent={components}
            sort={
                    {
                      field: 'created_at',
                      sort: 'desc', 
                    }
            }
        />

    );
}

export default Holidays;

const FilterNameComponent = ({ filterText, setFilterText }) => {
    return (
        <TextField
            label="Filter by name"
            variant="outlined"
            margin='none'
            size="small"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
        />
    );
}
