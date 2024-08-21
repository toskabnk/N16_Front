import { Box, TextField, Paper, Grid, Button, FormControl, Typography, Link } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector } from "react-redux";
import React, { useEffect, useState, Fragment, } from "react";
import HistoryLogsService from "../services/historyLogService";
import { useSnackbarContext } from '../providers/SnackbarWrapperProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';

import dayjs from "dayjs";

function EventLogs() {

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
    const [eventLogsData, seteventLogsData] = useState([]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga
    const [params, setParams] = useState({ user: '', name: '', teacher: '', date: '' }); // Parámetros de búsqueda
    const eventColumns = [
        { field: 'user', headerName: 'User', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'date_changed', headerName: 'Date changed', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'name', headerName: 'Name', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'original_teacher', headerName: 'Original teacher', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'new_teacher', headerName: 'New teacher', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'original_classroom', headerName: 'Original classroom', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'new_classroom', headerName: 'New classroom', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'original_start_date', headerName: 'Original start', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'new_start_date', headerName: 'New start', flex: 1, resizable: true, overflow: 'hidden' },

    ]

    const [columns, setColumns] = useState(eventColumns);

    //get EventLogs data when the page loads
    useEffect(() => {
        if (token) {
            getEventLogsData();
        }
    }, [token]);



    const getEventLogsData = async () => {
        try {
            const response = await HistoryLogsService.getEventLog(token);
            console.log(response.data);
            const transformedData = response.data.map((EventLogs) => ({
                ...EventLogs,
                id: EventLogs._id,
            }));
            seteventLogsData(transformedData);
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

    const getfilteredData = async (params) => {
        try {
            const response = await HistoryLogsService.getEventLog(token, params);
            console.log(response.data);
            const transformedData = response.data.map((EventLogs) => ({
                ...EventLogs,
                id: EventLogs._id,
            }));
            seteventLogsData(transformedData);
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


    const handleDateChange = (date) => {
        const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : ''; // Formato de fecha
        setParams((prev) => ({ ...prev, date: formattedDate }));    // Actualiza el estado de la fecha  
    };

    return (

        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h10" sx={{ mb: 3, mr: 1 }}>
                <Link to="/event-logs" color="primary" underline="hover" >
                    Event-logs
                </Link>
            </Typography>
            <Typography variant="h10" sx={{ mb: 3, mr: 1 }}>
                /
            </Typography>
            <Typography variant="h10" sx={{ mb: 3, mr: 1 }}>
                Log of event changes
            </Typography>

            <Grid container direction={"column"} spacing={2}>


                <Grid item xs={12} md={12}>
                    <Box
                        gap={4}
                        p={2}>
                        <Paper
                            elevation={3}>
                            <Box spacing={{ xs: 1, sm: 2, md: 2 }}
                                p={1}
                                sx={{ display: 'flex', justifyContent: 'start', gap: 2 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="User search"
                                        variant="outlined"
                                        margin="none"
                                        value={params.user || ''}
                                        onChange={(e) => setParams((prev) => ({ ...prev, user: e.target.value }))} />
                                </FormControl>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Teacher search"
                                        variant="outlined"
                                        margin="none"
                                        value={params.teacher || ''}
                                        onChange={(e) => setParams((prev) => ({ ...prev, teacher: e.target.value }))} />
                                </FormControl>
                            </Box>
                            <Box spacing={{ xs: 1, sm: 2, md: 2 }}
                                p={1}
                                sx={{ display: 'flex', justifyContent: 'start', gap: 2 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Name search"
                                        variant="outlined"
                                        margin="none"
                                        value={params.name || ''}
                                        onChange={(e) => setParams((prev) => ({ ...prev, name: e.target.value }))} />
                                </FormControl>
                                <FormControl fullWidth>

                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Event date"
                                            value={params.date ? dayjs(params.date) : null}
                                            onChange={handleDateChange}
                                        />
                                    </LocalizationProvider>
                                </FormControl>
                            </Box>
                            <Box spacing={{ xs: 1, sm: 2, md: 2 }}
                                p={2}
                                sx={{ display: 'flex', justifyContent: 'start', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    onClick={() => getfilteredData(params)}
                                    color="primary">
                                    Search
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                </Grid >
                <Grid item >
                    <Box gap={4}
                        p={3} sx={{ flex: 1, overflow: 'hidden' }}>

                        <DataGrid
                            autoHeight={true}
                            rows={rows}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 10 },
                                },
                            }}
                            sx={{
                                '& .MuiDataGrid-cell': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                },
                            }}
                            pageSizeOptions={[5, 10, 20, 50]}
                            loading={loading}
                            slotProps={{
                                loadingOverlay: {
                                    variant: 'linear-progress',
                                    noRowsVariant: 'linear-progress',
                                },
                            }}
                        />
                    </Box>
                </Grid>
            </Grid >
        </Box >
    );
}


export default EventLogs;
