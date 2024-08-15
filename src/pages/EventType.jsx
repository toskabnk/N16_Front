import { Button, Grid, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Link, useNavigate } from "react-router-dom";
import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import eventTypeService from "../services/eventTypeService";
import { DataGrid } from "@mui/x-data-grid";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";

function EventType() {
    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    const navigate = useNavigate();
    //Row data for the table
    const [rows, setRows] = useState([]);
    //Columns for the table
    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Name', flex: 1, resizable: true, overflow: 'hidden' },
    ]);
    //Token de usuario
    const token = useSelector((state) => state.user.token);
    //Carga los tipos de eventos cuando el token carga
    useEffect(() => {
        if(token){
            getEventTypes();
        }
    }, [token]);

    //Cuando se hace click en una fila de la tabla se redirige a la página de edicion del tipo de evento
    const handleRowClick = (params) => {
        console.log(params.row);
        navigate(`/eventType/${params.id}`, { state: { eventType: params.row } });
    };

    //Obtiene los tipos de eventos
    const getEventTypes = async () => {
        try {
            const response = await eventTypeService.getAll(token);
            
            //Transforma los datos para que el id sea el _id
            const transformedData = response.data.map((eventType) => ({
                ...eventType,
                id: eventType._id,
            }));
            setRows(transformedData);
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
    }

    return (
        <Box sx={{ flexGrow:1 }}>
                <Box       
                    display="flex"
                    alignItems="left"
                    p={2}>
                        <>
                        <Typography variant="h10" >
                            <Link to="/eventType" color="blue" underline="hover" style={{textDecoration: "none"}}>
                            Event types /
                            </Link>
                        </Typography>
                        <Typography variant="h10" >
                        &nbsp;List
                        </Typography> </>
                </Box>
                <Box
                    gap={4}
                    p={2}>
                        <Paper>
                            <Grid container direction={"column"} spacing={2}>
                                <Grid item xs={12} md={12}>
                                    <Box
                                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                                        gap={4}
                                        p={2}>
                                        <Typography variant="h6">Event Types</Typography>
                                        <Button variant="contained" color="primary" onClick={() => navigate('/eventType/new')}>New Event Type</Button>
                                    </Box>

                                </Grid>

                                <Grid item xs={12} md={12}>
                                    <Box
                                        gap={4}
                                        p={2}>
                                            <DataGrid
                                                autoHeight={true}
                                                rows={rows}
                                                columns={columns}
                                                initialState={{
                                                    pagination: {
                                                        paginationModel: { page: 0, pageSize: 10 },
                                                    },
                                                }}
                                                pageSizeOptions={[5, 10, 20, 50]}
                                                onRowClick={handleRowClick}
                                            />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                </Box>
        </Box>
    );
}

export default EventType;