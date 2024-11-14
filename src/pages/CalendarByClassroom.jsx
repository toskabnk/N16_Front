import { Backdrop, Button, Checkbox, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, FormControlLabel, FormGroup, Grid, IconButton, InputLabel, MenuItem, OutlinedInput, Paper, Select, Stack, Switch, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { Fragment, useEffect, useRef, useState } from "react";
import CancelIcon from '@mui/icons-material/Cancel';
import { useSelector } from "react-redux";
import companyService from "../services/companyService";
import eventService from "../services/eventService";
import classroomService from "../services/classroomService";
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import scrollGridPlugin from '@fullcalendar/scrollgrid';
import '../styles/FullCalendarstyles.css';
import { FULLCALENDAR_LICENSE_KEY } from "../config/constants";
import CloseIcon from '@mui/icons-material/Close';
import EditEventStepper from "../components/CalendarComponents/FormSteps/EditEventStepper";
import teacherService from "../services/teacherService";
import departmentService from "../services/departmentservice";
import eventTypeService from "../services/eventTypeService";
import ClassSummary from "../components/CalendarComponents/ClassSummary";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";

//Configuración de dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

function CalendarByClassroom() {
    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();

    //Estado para guardar el valor del select
    const [companyName, setCompanyName] = useState([]);
    
    //Estado para guardar el valor del TextField de Classroom name
    const [classroomName, setClassroomName] = useState('');
    const [classroomNameSearch, setClassroomNameSearch] = useState('');
    
    //Estado para guardar el valor del TextField de Date, por defecto es la fecha actual
    const [date, setDate] = useState(dayjs().utc());
    
    //Estados para guardar los datos de las empresas, eventos por fecha, eventos por profesor y aulas
    const [companiesData, setCompaniesData] = useState([]);
    const [eventsDataByDate, setEventsDataByDate] = useState([]);
    const [classroomData, setClassroomData] = useState([]);
    const [classroomDataFiltered, setClassroomDataFiltered] = useState([]);
    
    //Estados para guardar los datos de los profesores, departamentos y tipos de evento
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [eventTypes, setEventTypes] = useState([]);
    
    //Estado para saber si se están cargando las empresas y las aulas
    const [companyLoading, setCompanyLoading] = useState(true);
    
    //Estado para saber si se está mostrando el Backdrop
    const [openBackDrop, setOpenBackDrop] = useState(false);
    
    //Estados para guardar el evento seleccionado y saber si se está editando
    const [event, setEvent] = useState(null);
    const [eventEdit, setEventEdit] = useState(false);
    
    //Estados para saber si se permite el scroll, la edición y la actualización de eventos futuros
    const [fullWidth, setFullWidth] = useState(false);
    const [allowEdit, setAllowEdit] = useState(false);
    const [updateFuture, setUpdateFuture] = useState(false);
    
    //Estado para guardar la clave del calendario, se usa para recargar el calendario
    const [calendarKey, setCalendarKey] = useState(0);

    //Token de autenticación
    const token = useSelector((state) => state.user.token);

    //Rol del usuario
    const role = useSelector((state) => state.user.role);
    const myCompany = useSelector((state) => state.user.company_id);

    //Referencia al componente FullCalendar
    const calendarRef = useRef(null); 

    //Referencia para la vista de semana
    const [currentView, setCurrentView] = useState('resourceTimeGridDay');
    const [filteredDays, setFilteredDays] = useState([]);
    // Días de la semana disponibles
    const weekDays = [
        { id: 0, label: 'Sun' },
        { id: 1, label: 'Mon' },
        { id: 2, label: 'Tue' },
        { id: 3, label: 'Wed' },
        { id: 4, label: 'Thu' },
        { id: 5, label: 'Fri' },
        { id: 6, label: 'Sat' }
    ];

    //Obtenemos las compañias y las aulas al cargar la página
    useEffect(() => {
        if(token){
            getCompanies();
            getClassrooms();
            loadEventTypes();
        }
    }, [token]);

    //Obtenemos los eventos por fecha cuando cambia la fecha
    useEffect(() => {
        if(token && eventTypes.length > 0){
            //Si la vista es de semana, pedimos los eventos de la semana
            if(currentView === 'resourceTimeGridWeek'){
                getEventsByWeek();
            } else {
                getEventsByDate();
            }
        }
    }, [date, eventTypes]);

    //Filtramos las aulas por el nombre de la clase y por las compañias seleccionadas
    useEffect(() => {
        console.log("companyName:", companyName);
        //Guardamos todas las aulas
        let filteredReources = classroomData;

        //Si hay compañias seleccionadas
        if(companyName.length > 0){
            //Filtramos la lista de companies que coincidan con el valor seleccionado
            const filteredCompanies = companiesData.filter((company) => companyName.includes(company.name));
            //Filtramos la lista de clases que pertenecen a las empresas seleccionadas
            filteredReources = filteredReources.filter((classroom) => filteredCompanies.some((company) => company._id === classroom.company_id));
            console.log(filteredReources);
        }

        //Si hay un nombre de aula en el TextField de Classroom name lo añadimos al filtro
        if(classroomNameSearch.length != 0){
            filteredReources = filteredReources.filter((classroom) => classroom.name.toLowerCase().includes(classroomNameSearch.toLowerCase()));
            console.log(filteredReources);
        }

        //Si la vista es de semana, filtramos las aulas por todas que contengan IN COMP
        if(currentView === 'resourceTimeGridWeek'){
            filteredReources = filteredReources.filter((classroom) => classroom.name.includes('IN COMP'));
            console.log(filteredReources);
        }

        //Guardamos las aulas filtradas
        setClassroomDataFiltered(filteredReources);
    }, [companyName, classroomNameSearch, currentView]);

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

    //Función para obtener las compañias
    const getCompanies = async () => {
        try {
            const response = await companyService.getAll(token);
            console.log(response);
            setCompaniesData(response.data);
            setCompanyLoading(false);
            if(role === 'professor' || role === 'admin'){
                //Buscamos el nombre de la compañia del usuario si es profesor para filtrar las aulas
                let companyName = response.data.filter((company) => company._id === myCompany);
                setCompanyName([companyName[0].name]);
            }
        } catch (error) {
            console.error(error);
        }
    }

    //Función para obtener los eventos por fecha
    const getEventsByDate = async () => {
        try {
            const queryParams = { date: date.format('YYYY-MM-DD') };
            const response = await eventService.getEventsWithFilters(token, queryParams);
            console.log(response);
            response.data.forEach((event) => {
                let event_type_name = eventTypes.filter((eventType) => eventType._id === event.event_type_id)[0].name;
                event.event_type_name = event_type_name;
            });
            setEventsDataByDate(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    //Función para obtener los eventos por semana
    const getEventsByWeek = async () => {
        try {
            const queryParams = { date: date.format('YYYY-MM-DD'), week: true };
            const response = await eventService.getEventsWithFilters(token, queryParams);
            console.log(response);
            setEventsDataByDate(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    //Función para obtener las aulas
    const getClassrooms = async () => {
        try {
            const response = await classroomService.getAll(token);
            console.log(response);
            setClassroomData(response.data);
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

    //Función para manejar el cambio de los switches
    const handleSwitchChange = (event) => {
        if(event.target.name === 'fullWidth'){
            setFullWidth(event.target.checked);
        } else if(event.target.name === 'allowEdit'){
            setAllowEdit(event.target.checked);
        } else {
            setUpdateFuture(event.target.checked);
        }
    }

    //Función para manejar el cambio de fecha desde el calendario
    const handleDataChange = (info) => { 
        //Si la fecha ha cambiado, actualizamos los eventos
        let newDate = dayjs(info.start).utc().tz('Europe/Madrid');
        if(newDate.format('YYYY-MM-DD') !== date.format('YYYY-MM-DD')){
            setDate(newDate);
        }
        //Si la vista ha cambiado, actualizamos la vista actual
        if(info.view.type !== currentView){
            setCurrentView(info.view.type);
        }
    }

    //Función para manejar el cambio de los días filtrados
    const handleDayFilterChange = (dayId) => {
        if (filteredDays.includes(dayId)) {
            setFilteredDays(filteredDays.filter(day => day !== dayId)); // Remueve el día si ya está seleccionado
        } else {
            setFilteredDays([...filteredDays, dayId]); // Agrega el día si no está seleccionado
        }
    };

    // Actualiza FullCalendar para ocultar los días seleccionados
    const applyFilters = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.setOption('hiddenDays', filteredDays);
    };

    //Función para deshabilitar los domingos en el calendario
    const shouldDisableDate = (date) => {
        return date.day() === 0;
    };

    /**
     * Actualiza el evento segun los cambios realizados en el calendario (cambio de aula, cambio de fecha de inicio y fin)
     * @param {*} info Información del evento
     */
    const updateEvent = async (info) => {
        //Si se permite la edición, actualizamos el evento
        if(allowEdit){
            //Si se permite la edición, actualizamos el evento
            if(!updateFuture){
                try{
                    //Guardamos el evento a actualizar
                    let eventId = info.event.id;
                    //Si el resourseId es distinto de null, es que se ha cambiado de aula
                    if(info.newResource !== null){
                        //Guardamos el id del nuevo aula
                        let classroomId = info.newResource.id;
                        //Actualiazmos el evento
                        const response = await eventService.updateEventClassroom(token, eventId, classroomId);
                        console.log("Update event classroom resource:", eventId, classroomId); 
                    }
                    
                    //Si la fecha de inicio y fin del evento han cambiado, actualizamos la fecha
                    if(info.event.start.toISOString() !== info.oldEvent.start.toISOString() || info.event.end.toISOString() !== info.oldEvent.end.toISOString()){
                        //Guardamos la nueva fecha de inicio y fin con este formato: 2021-10-01 10:00 desde este formato: 2021-10-01T10:00:00
                        let startDate = dayjs(info.event.start).format('YYYY-MM-DD HH:mm');
                        let endDate = dayjs(info.event.end).format('YYYY-MM-DD HH:mm');
                        //Actualizamos el evento
                        let values = { start_date: startDate, end_date: endDate };
                        const response = await eventService.updateEventDate(token, eventId, values);
                        console.log("Update event date:", eventId, values);
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
                    console.error("Error during updateEvent, revisa:", error);
                    showSnackbar('Something went wrong, please try again later', {
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

            } else {
                try {
                   let values = {  classroom_id: info.newResource.id,
                                time_start: dayjs(info.event.start).format('HH:mm'),
                                time_end: dayjs(info.event.end).format('HH:mm'),
                                date_range_start: dayjs(info.event.start).format('YYYY-MM-DD') }; 
                    const response = await eventService.updateEventsGroup(token, info.event.extendedProps.group_id, values);
                    console.log("Update event group:", info.event.extendedProps.group_id, values);
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
                    console.error("Error during updateEvent, revisa:", error);
                    showSnackbar('Something went wrong, please try again later', {
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

    /**
     * Maneja el evento de edición de un evento
     * @param {*} info Información del evento
     */
    const handleEditEvent = (info) => {
        console.log(info.event);
        setOpenBackDrop(true);
        setEvent(info.event);

        //Si es admin o super_admin cargamos los datos
        if (role === 'admin' || role === 'super_admin') {
            // Cargamos los profesores, departamentos y tipos de evento antes de abrir el diálogo
            Promise.all([loadTeachers(), loadDepartments()])
            .then(() => {
                // Todas las llamadas se completaron correctamente
                setOpenBackDrop(false);
                setEventEdit(true);
            })
            .catch((error) => {
                // Si alguna llamada falla, ya se maneja dentro de cada función
                console.error("Ocurrió un error en alguna de las llamadas:", error);
                showSnackbar('Something went wrong, please try again later', {
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
                // No necesitamos setOpenBackDrop(false) aquí porque se maneja en las funciones individuales
            });
            //Si no, solo abrimos el diálogo con los datos del event
        } else {
            setOpenBackDrop(false);
            setEventEdit(true);
        }
    }

    /**
     * Función para cargar los profesores
     */
    const loadTeachers = async () => {
        try {
            const queryParams = { company_id: '' };
            const response = await teacherService.getTeachersWithFilters(token, queryParams);
            setTeachers(response.data);
        } catch (error) {
            console.error("Error during loadTeachers:", error);
            setOpenBackDrop(false);
            throw error;
        }
    }

    /**
     * Función para cargar los departamentos
     */
    const loadDepartments = async () => {
        try {
            const response = await departmentService.getAll(token);
            setDepartments(response.data);
        } catch (error) {
            console.error("Error during loadDepartments:", error);
            setOpenBackDrop(false);
            throw error;
        }
    }

    /**
     * Función para cargar los tipos de evento
     */
    const loadEventTypes = async () => {
        try {
            const response = await eventTypeService.getAll(token);
            setEventTypes(response.data);
        } catch (error) {
            console.error("Error during loadEventTypes:", error);
            setOpenBackDrop(false);
            throw error;
        }
    }

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

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Box
                gap={4}
                p={2}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                        <Paper
                            elevation={3}
                            >
                            <>
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
                                        <InputLabel sx={{marginBottom: "5px"}} id="class-label">Classroom name</InputLabel>
                                        <TextField
                                            fullWidth={true}
                                            id="classroomName"
                                            type="text"
                                            value={classroomName}
                                            onKeyDown={(event) => {
                                                if(event.key === 'Enter'){
                                                    console.log(event.target.value);
                                                    //Puede que con darle a enter aqui hagamos el filtrado en el calendario mejor
                                                    setClassroomNameSearch(event.target.value);
                                                }
                                            }}
                                            onChange={(event) => {
                                                setClassroomName(event.target.value);
                                            }}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
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
                    </Grid>
                    <Grid item xs={12} md={currentView === 'resourceTimeGridWeek' ? 6:12} >
                        <Paper
                            elevation={3}>
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
                    </Grid>
                    {currentView === 'resourceTimeGridWeek' && (
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={3}>
                                    <FormGroup>
                                        <Stack
                                            direction={{ sm: 'row', md: 'row' }}
                                            spacing={1}
                                            useFlexGap
                                            sx={{ flexWrap: 'wrap', justifyContent: 'space-evenly' }}
                                            p={2}
                                            >
                                                {weekDays.map(day => (
                                                    <FormControlLabel key={day.id} control={<Checkbox checked={!filteredDays.includes(day.id)} onChange={() => handleDayFilterChange(day.id)} />} label={day.label}/>
                                                ))}
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={applyFilters}
                                                    >
                                                    Apply
                                                </Button>
                                        </Stack>
                                    </FormGroup>
                            </Paper>
                        </Grid>
                    )}
                    <Grid item>
                        <Box sx={{width:'auto', overflow:'auto'}}>
                            <FullCalendar
                                key={calendarKey}
                                ref={calendarRef}
                                height='auto'
                                plugins={[ dayGridPlugin,
                                            timeGridPlugin,
                                            listPlugin,
                                            interactionPlugin,
                                            resourceTimeGridPlugin,
                                            scrollGridPlugin,
                                            ]}
                                resources={(currentView === 'resourceTimeGridWeek' || companyName.length!=0 || classroomNameSearch.length!=0)  ? classroomDataFiltered: classroomData}
                                resourceOrder="order"
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
                                initialView='resourceTimeGridDay'
                                events={eventsDataByDate}
                                datesSet={handleDataChange}
                                eventClick={handleEditEvent}
                                eventContent={renderEventContent} // Usamos esta propiedad para personalizar el contenido
                                schedulerLicenseKey={FULLCALENDAR_LICENSE_KEY}
                                {...(currentView === 'resourceTimeGridWeek' ? { datesAboveResources: true, } : {})} // Condicional para dayMinWidth
                                headerToolbar={
                                    {
                                        right: 'prev,next today resourceTimeGridDay,resourceTimeGridWeek',
                                        left: 'title'
                                    }
                                }
                                titleFormat={{ 
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                }}
                                views={
                                    {
                                        resourceTimeGridDay: {
                                            type: 'resourceTimeGrid',
                                            buttonText: 'Day',
                                            duration: { days: 1 },
                                        },
                                        resourceTimeGridWeek: {
                                            type: 'resourceTimeGrid',
                                            buttonText: 'Week',
                                            duration: { weeks: 1 },
                                        },
                                    }
                                }
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <Dialog
                id="dialog"
                open={eventEdit}
                onClose={() => setEventEdit(false)}
                sx={{ zIndex: 1300}}>
                    <DialogTitle sx={{ m: 0, p: 2 }} id="dialog">
                        {role === 'admin' || role === 'super_admin' ? 
                            ""
                            : "Class summary"}
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={() => setEventEdit(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}>   
                            <CloseIcon/>
                    </IconButton>
                    <DialogContent>
                        {role === 'admin' || role === 'super_admin' ? 
                            <EditEventStepper teachers={teachers} classrooms={classroomData} departments={departments} eventTypes={eventTypes} event={event} events={eventsDataByDate} setEvents={setEventsDataByDate} closeDialog={setEventEdit} token={token}/>
                            : <ClassSummary event={event} />}
                    </DialogContent>
            </Dialog>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={openBackDrop}
                >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}

export default CalendarByClassroom;