import { Button } from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import eventTypeService from "../services/eventTypeService";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import ListDataGrid from "../components/ListDataGrid";

function EventType() {
    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    //Row data for the table
    const [rows, setRows] = useState([]);
    //Columns for the table
    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Name', flex: 1, resizable: true, overflow: 'hidden' },
    ]);
    //Loading state
    const [loading, setLoading] = useState(true);
    //Token de usuario
    const token = useSelector((state) => state.user.token);
    //Carga los tipos de eventos cuando el token carga
    useEffect(() => {
        if(token){
            getEventTypes();
        }
    }, [token]);

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

    return (
        <ListDataGrid
            rows={rows}
            columns={columns}
            name="Event Types"
            subname="List"
            url="/eventType"
            buttonName="New Event Type"
            loading={loading}
        />
    );
}

export default EventType;