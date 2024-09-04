import FullCalendar from "@fullcalendar/react";
import { Button, Grid } from "@mui/material";
import { Box } from "@mui/system";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import React, { Fragment, useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import eventService from "../services/eventService";
import { useSelector } from "react-redux";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";

//Configuración de dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

function MyCalendar() {
    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();

    //Estado que almacena los eventos del calendario
    const [events, setEvents] = useState([]);

    //Token de autenticación
    const token = useSelector((state) => state.user.token);
    const role = useSelector((state) => state.user.role); 
  
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
        </Box>
    );
}

export default MyCalendar;