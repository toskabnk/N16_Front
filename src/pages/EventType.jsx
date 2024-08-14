import { Button, Grid, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Link, useNavigate } from "react-router-dom";
import SnackbarComponent from "../components/SnackbarComponent";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import eventTypeService from "../services/eventTypeService";
import { DataGrid } from "@mui/x-data-grid";

function EventType() {

    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Name', flex: 1, resizable: true, overflow: 'hidden' },
    ]);

    const navigate = useNavigate();

    //Token de usuario
    const token = useSelector((state) => state.user.token);

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

    const getEventTypes = async () => {
        try {
            const response = await eventTypeService.getAll(token);

            const transformedData = response.data.map((eventType) => ({
                ...eventType,
                id: eventType._id,
            }));
            setRows(transformedData);
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Something went wrong, please try again later');
            setSeverity('error');
            setShowSnackBar(true);
        }
    }

    //Estado para el snackbar
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [severity, setSeverity] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const snackbarRef = React.createRef();

    //Función para cerrar el snackbar
    const handleCloseSnackbar = () => {
        setShowSnackBar(false);
    };

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
                <SnackbarComponent
                    ref={snackbarRef}
                    open={showSnackBar}
                    severity={severity}
                    message={snackbarMessage}
                    onClose={handleCloseSnackbar}
                />
        </Box>
    );
}

export default EventType;