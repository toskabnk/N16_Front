import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import scrollGridPlugin from '@fullcalendar/scrollgrid';
import '../styles/FullCalendarstyles.css';
import { Button, Checkbox, Chip, CircularProgress, FormControlLabel, FormGroup, Grid, InputLabel, MenuItem, OutlinedInput, Paper, Select, Switch, Typography } from "@mui/material"
import { Box, Stack } from "@mui/system"
import { FULLCALENDAR_LICENSE_KEY } from "../config/constants"
import { useSelector } from "react-redux";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import CancelIcon from '@mui/icons-material/Cancel';
import teacherService from "../services/teacherService";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import companyService from "../services/companyService";
import eventService from "../services/eventService";
import eventTypeService from "../services/eventTypeService";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";

//Configuración de dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

function CalendarByTeacher() {
    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    //Estado para guardar el valor del select
    const [companyName, setCompanyName] = useState([]);

    //Estados para guardar los datos de las empresas, eventos por fecha, eventos por profesor y aulas
    const [companiesData, setCompaniesData] = useState([]);
    const [eventsDataByDate, setEventsDataByDate] = useState([]);
    const [classroomData, setClassroomData] = useState([]);
    const [teachersData, setTeachersData] = useState([]);
    const [teachersDataFiltered, setTeachersDataFiltered] = useState([]);


    //Estado para saber si se están cargando las empresas y las aulas
    const [companyLoading, setCompanyLoading] = useState(true);

    //Estados para saber si se permite el scroll, la edición y la actualización de eventos futuros
    const [fullWidth, setFullWidth] = useState(false);
    const [allowEdit, setAllowEdit] = useState(false);
    const [updateFuture, setUpdateFuture] = useState(false);

    //Referencia al componente FullCalendar
    const calendarRef = useRef(null); 

    //Token de autenticacion
    const token = useSelector((state) => state.user.token);

    //Rol del usuario 
    const role = useSelector((state) => state.user.role);
    const myCompany = useSelector((state) => state.user.company_id);

    //Estado para guardar el valor del TextField de Date, por defecto es la fecha actual
    const [date, setDate] = useState(dayjs().utc());

    //Estado para guardar los tipos de evento
    const [eventTypes, setEventTypes] = useState([]);

    //Cargar las empresas y los profesores al cargar la página
    useEffect(() => {
        if(token){
            getCompanies();
            getTeachers();
            loadEventTypes();
        }
    }, [token]);

    useEffect(() => {
        if(token && eventTypes.length !== 0){
            getEventsByDate();
        }
    }, [date, eventTypes]);

    // Cambia la fecha en el FullCalendar cuando cambia la fecha en el DatePicker
    useEffect(() => {
        if (calendarRef.current) {
            // Obtenemos la instancia de FullCalendar
            let calendarApi = calendarRef.current.getApi();
            // Formateamos la fecha para que sea compatible con FullCalendar
            let dateFormted = date.format('YYYY-MM-DD');
            // Cambiamos la fecha en FullCalendar
            calendarApi.gotoDate(dateFormted);
        }
    }, [date]);

    //Función para obtener los profesores
    const getTeachers = async () => {
        try {
            const response = await teacherService.getAll(token);
            setTeachersData(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    //Función para obtener los eventos por fecha
    const getEventsByDate = async () => {
        try {
            const queryParams = { date: date.format('YYYY-MM-DD'), by_teacher: true,  };
            const response = await eventService.getEventsWithFilters(token, queryParams);
            console.log(response);
            response.data.forEach((event) => {
                let event_type_name;
                try {
                    event_type_name = eventTypes.filter((eventType) => eventType._id === event.event_type_id)[0].name;
                } catch (error) {
                    event_type_name = "";
                }
                console.log(event_type_name);
                event.event_type_name = event_type_name;
            });
            setEventsDataByDate(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    //Filtrar los profesores por compañia
    useEffect(() => {
        let filteredResources = teachersData;

        if(companyName.length !== 0){
            let companiesIds = companiesData.filter((company) => companyName.includes(company.name)).map((company) => company._id);
            filteredResources = teachersData.filter((teacher) => companiesIds.includes(teacher.company_id));
            //Añadimos a filteredResources tambien los profesores que tienen "not_set" como compañia
            let notSetTeachers = teachersData.filter((teacher) => teacher.company_id === "not_set");
            filteredResources = filteredResources.concat(notSetTeachers);
            setTeachersDataFiltered(filteredResources);
        }
    }, [companyName]);

    //Función para obtener las compañias
    const getCompanies = async () => {
        try {
            const response = await companyService.getAll(token);
            console.log(response);
            setCompaniesData(response.data);
            setCompanyLoading(false);
            if(role === 'professor'){
                //Buscamos el nombre de la compañia del usuario si es profesor para filtrar las aulas
                let companyName = response.data.filter((company) => company._id === myCompany);
                setCompanyName([companyName[0].name]);
            }
        } catch (error) {
            console.error(error);
        }
    }

    //Función para manejar el evento de borrar un chip
    const handleDelete = (e, value) => {
        //Evitar que se propague el evento
        e.preventDefault();
        //Borramos el elemento del array
        const newCompanyName = companyName.filter((item) => item !== value)
        setCompanyName(newCompanyName);
    };

    //Función para manejar el cambio de valor en el select
    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setCompanyName(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    //Función para manejar el cambio de fecha desde el calendario
    const handleDataChange = (info) => { 
        //Si la fecha ha cambiado, actualizamos los eventos
        let newDate = dayjs(info.start).utc().tz('Europe/Madrid');
        if(newDate.format('YYYY-MM-DD') !== date.format('YYYY-MM-DD')){
            setDate(newDate);
        }
    }

    //Función para manejar el cambio de los switches
    const handleSwitchChange = (event) => {
        if(event.target.name === 'fullWidth'){
            setFullWidth(event.target.checked);
        } else if(event.target.name === 'allowEdit'){
            setAllowEdit(event.target.checked);
        } else {
            setUpdateFuture(event.target.checked);
        }
    };

    //Función para deshabilitar los domingos en el calendario
    const shouldDisableDate = (date) => {
        return date.day() === 0;
    };

    const renderEventContent = (eventInfo) => {
        return (
            <div className="fc-event-main-frame">
                <div className="fc-event-time">
                    {eventInfo.event.extendedProps.event_type_name}
                </div>   
                <div className="fc-event-title-container">
                    <div className="fc-event-title fc-sticky">{eventInfo.event.title}</div>
                </div>
          </div>
        );
    };

    /**
     * Función para cargar los tipos de evento
     */
    const loadEventTypes = async () => {
        try {
            const response = await eventTypeService.getAll(token);
            setEventTypes(response.data);
        } catch (error) {
            console.error("Error during loadEventTypes:", error);
            throw error;
        }
    }

    /**
     * Actualiza el evento segun los cambios realizados
     * @param {*} info 
     */
    const updateEvent = async (info) => {
        console.log(info);
        if(allowEdit){
            if(info.newResoruce !== null){
                try {
                    let professorId = info.newResource.id;
                    let classroomId = info.event.id;
                    if(updateFuture){
                        const reponse = await eventService.updateEventTeacherGroup(token, classroomId, professorId);
                    } else {
                        const reponse = await eventService.updateEventTeacher(token, classroomId, professorId);
                    }
                    showSnackbar('Event updated successfully', {
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
        }
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container direction={"column"} spacing={2}>
            <Grid item xs={12} md={12}>
                    <Box
                        gap={4}
                        p={3}>
                        <Paper
                            elevation={3}
                            >
                            <>
                                <Typography variant="h6" component="h2" pl={2} pt={2} >FILTER CLASSES</Typography>
                                <Stack
                                    direction={{ sm: 'column', md: 'row' }}
                                    spacing={{ xs: 1, sm: 2, md: 4 }}
                                    p={2}
                                    sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Box sx={{ width: "100%" }}>
                                        <InputLabel sx={{marginBottom: "5px"}} id="company-label">Company</InputLabel>
                                        <Select
                                            id="company"
                                            multiple
                                            fullWidth={true}
                                            value={companyName}
                                            onChange={handleChange}
                                            input={<OutlinedInput id="select-company" label="Chip" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => (
                                                        <Chip
                                                            key={value}
                                                            label={value}
                                                            clickable
                                                            deleteIcon={
                                                                <CancelIcon
                                                                    onMouseDown={(event) => event.stopPropagation()}
                                                                />
                                                            }
                                                            onDelete={(e) => handleDelete(e, value)}
                                                            onClick={() => console.log("clicked chip")}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        >
                                            {companyLoading ? (
                                                <MenuItem disabled>
                                                    <CircularProgress size={24} sx={{marginRight: '10px'}} />
                                                    Loading...
                                                </MenuItem>
                                            ): (
                                                companiesData.map((company) => (
                                                    <MenuItem
                                                        key={company._id}
                                                        value={company.name}
                                                    >
                                                        <Checkbox checked={companyName.indexOf(company.name) > -1} />
                                                        {company.name}
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </Box>
                                    <Box sx={{ width: "100%" }}>
                                        <InputLabel sx={{marginBottom: "5px"}} id="date-label">Date</InputLabel>
                                        <DatePicker 
                                            slotProps={{ textField: { fullWidth: true } }}
                                            views={['year', 'month', 'day']}
                                            id="date"
                                            value={date}
                                            shouldDisableDate={shouldDisableDate}
                                            onChange={(newValue) => {
                                                console.log(newValue);
                                                setDate(newValue);
                                            }}
                                        />
                                    </Box>
                                </Stack>
                            </>
                        </Paper>
                        <Paper
                            elevation={3}
                            sx={{marginTop: '10px'}}
                            >
                            <FormGroup>
                                <Stack
                                    direction={{ sm: 'row', md: 'row' }}
                                    spacing={{ xs: 1, sm: 2, md: 4 }}
                                    p={2}
                                    >
                                    <FormControlLabel control={<Switch checked={fullWidth} onChange={handleSwitchChange} name="fullWidth"/>} label="Allow Scroll" />
                                    {role === 'admin' || role === 'super_admin' ? 
                                    <>
                                        <FormControlLabel control={<Switch checked={allowEdit} onChange={handleSwitchChange} name="allowEdit"/>} label="Allow Edit" />
                                        <FormControlLabel control={<Switch disabled={!allowEdit} checked={updateFuture} onChange={handleSwitchChange} name="update"/>} label="Update this and future classes" name="update"/>
                                    </> : null}
                                </Stack>
                            </FormGroup>
                        </Paper>
                    </Box>
                </Grid>
                <Grid item>
                    <Box p={2} sx={{width:'auto', overflow:'auto'}}>
                        <FullCalendar
                                ref={calendarRef}
                                height='auto'
                                plugins={[ dayGridPlugin,
                                            timeGridPlugin,
                                            listPlugin,
                                            interactionPlugin,
                                            resourceTimeGridPlugin,
                                            scrollGridPlugin,
                                            ]}
                                resources={(companyName.length!=0)  ? teachersDataFiltered: teachersData}
                                //No cambiar, asi muestra las aulas en el orden de la API
                                resourceOrder="_IDD"
                                {...(fullWidth ? { dayMinWidth: 100 } : {})} // Condicional para dayMinWidth
                                stickyFooterScrollbar={true}
                                expandRows={true}
                                editable={allowEdit}
                                eventDrop={updateEvent}
                                eventDurationEditable={false}
                                startParam='start_date'
                                endParam='end_date'
                                slotMinTime='07:00:00'
                                slotMaxTime='23:00:00'
                                eventMinHeight={10}
                                allDaySlot={false}
                                eventContent={renderEventContent} // Usamos esta propiedad para personalizar el contenido
                                initialView='resourceTimeGridDay'
                                titleFormat={{ 
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                }}
                                events={eventsDataByDate}
                                datesSet={handleDataChange}
                                schedulerLicenseKey={FULLCALENDAR_LICENSE_KEY}
                            />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default CalendarByTeacher