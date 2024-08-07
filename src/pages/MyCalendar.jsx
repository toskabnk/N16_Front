import FullCalendar from "@fullcalendar/react";
import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import eventService from "../services/eventService";
import { useSelector } from "react-redux";
import SnackbarComponent from "../components/SnackbarComponent";

//Configuración de dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

function MyCalendar() {
    //Estado que almacena los eventos del calendario
    const [events, setEvents] = useState([]);

    //Token de autenticación
    const token = useSelector((state) => state.user.token);
    const role = useSelector((state) => state.user.role); 

    //Estados para mostrar el snackbar
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [severity, setSeverity] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const snackbarRef = React.createRef();
  
    //Función que se ejecuta cuando se cambian las fechas del calendario
    const handleDatesSet = (arg) => {
        if(role !== 'teacher'){
            const start = arg.start;
            //Formateo de la fecha
            let newDate = dayjs(start).utc().tz('Europe/Madrid');
            getEventsForWeek(newDate.format('YYYY-MM-DD'));
        }
    };

    //Al cargar el componente, si el usuario es profesor, se obtiene su calendario
    useEffect(() => {
        if(token){
            if(role === 'teacher'){
                getMyCalendar();
            }   
        }
    }, [token]);

    //Función que obtiene los eventos de la semana
    const getEventsForWeek = async(start_date) => {
        try{
            console.log('start_date', start_date);
            let params = { 
                date: start_date,
                by_teacher: '',
                company_id: '',
                my_calendar: true
            };
            const response = await eventService.getEventsWithFilters(token, params);
            console.log('response', response);
            setEvents(response.data);
        } catch (error) {
            console.error('Error during getEventsForWeek:', error);
            setSnackbarMessage('Something went wrong, please try again later');
            setSeverity('error');
            setShowSnackBar(true);
        }
    };

    //Función que obtiene los eventos del profesor
    const getMyCalendar = async() => {
        try{
            let params = { 
                my_calendar: true
            };
            const response = await eventService.getEventsWithFilters(token, params);
            console.log('response', response);
            setEvents(response.data);
        } catch (error) {
            console.error('Error during getEventsForWeek:', error);
            setSnackbarMessage('Something went wrong, please try again later');
            setSeverity('error');
            setShowSnackBar(true);
        }
    };

     //Función para cerrar el snackbar
     const handleCloseSnackbar = () => {
        setShowSnackBar(false);
    };

    return (
        <Box sx={{ flexGrow :1 }}>
            <Grid container direction={"column"} spacing={2}>
                <Grid item>
                    <Box p={2} sx={{width:'auto', overflow:'auto'}}>
                        <FullCalendar 
                            plugins={[ timeGridPlugin, interactionPlugin ]}
                            initialView="timeGridWeek"
                            headerToolbar={{
                                left: 'title',
                                right: 'prev,next today timeGridWeek,timeGridDay'
                            }}
                            events={events}
                            datesSet={handleDatesSet}
                            allDaySlot={false}
                            startParam='start_date'
                            endParam='end_date'
                            slotMinTime='07:00:00'
                            slotMaxTime='23:00:00'
                            height={'auto'}
                        />
                    </Box>
                </Grid>
            </Grid>
            <SnackbarComponent
            ref={snackbarRef}
            open={showSnackBar}
            message={snackbarMessage}
            severity={severity}
            handleClose={handleCloseSnackbar}/>
        </Box>
    );
}

export default MyCalendar;