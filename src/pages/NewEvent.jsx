import { Autocomplete, Button, Checkbox, Chip, CircularProgress, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Paper, Select, TextField, Typography } from "@mui/material";
import { Box, flexbox } from "@mui/system";
import FormikTextField from "../components/FormikTextField";
import { useFormik } from "formik";
import * as Yup from 'yup';
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import eventTypeService from "../services/eventTypeService";
import teacherService from "../services/teacherService";
import classroomService from "../services/classroomService";
import groupService from "../services/groupService";
import departmentService from "../services/departmentservice";
import companyService from "../services/companyService";
import { DatePicker, StaticTimePicker, TimeField, TimePicker } from "@mui/x-date-pickers";
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from "dayjs";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import { Description } from "@mui/icons-material";
import eventService from "../services/eventService";
import { Link, useNavigate } from "react-router-dom";
import SnackbarComponent from "../components/SnackbarComponent";
import { set } from "lodash";


function NewEvent () {

    //Estados para los eventos
    const [eventTypes, setEventTypes] = useState([]);
    const [eventTypeValue, setEventTypeValue] = useState('');
    const [selectedEventType, setSelectedEventType] = useState(null);
    //Estados para los profesores
    const [teachers, setTeachers] = useState([]);
    const [teacherValue, setTeacherValue] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    //Estados para las aulas
    const [classrooms, setClassrooms] = useState([]);
    const [classroomValue, setClassroomValue] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    //Estados para los grupos
    const [groups, setGroups] = useState([]);
    const [groupValue, setGroupValue] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    //Estados para los departamentos
    const [departments, setDepartments] = useState([]);
    const [departmentValue, setDepartmentValue] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    //Estado para las compañias
    const [companies, setCompanies] = useState([]);
    const [companyValue, setCompanyValue] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    //Estado de carga
    const [loadingEventTypes, setLoadingEventTypes] = useState(true);
    const [loadingTeachers, setLoadingTeachers] = useState(true);
    const [loadingClassrooms, setLoadingClassrooms] = useState(true);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    //Estado para la fechas
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    //Estado para los días de la semana
    const [daysOfWeek, setDaysOfWeek] = useState([]);
    const daysOfWeekData = [
        {id: 1, name: 'Monday'},
        {id: 2, name: 'Tuesday'},
        {id: 3, name: 'Wednesday'},
        {id: 4, name: 'Thursday'},
        {id: 5, name: 'Friday'},
        {id: 6, name: 'Saturday'},
        {id: 7, name: 'Sunday'},
    ];
    //Estado para la hora
    const [startHour, setStartHour] = useState(dayjs('2024-08-12T00:00'));
    const [endHour, setEndHour] = useState(dayjs('2024-08-12T00:00'));
    //Loading para el LoadingButton
    const [loading, setLoading] = useState(false);
    //Estado para el snackbar
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [severity, setSeverity] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const snackbarRef = React.createRef();

    //Token de autenticación
    const token = useSelector((state) => state.user.token);

    const navigate = useNavigate();

    //Al cargar la pagina se obtienen los datos necesarios
    useEffect(() => {
        if(token){
            getEventTypes();
            getTeachers();
            getClassrooms();
            getGroups();
            getDepartments();
            getCompanies();
        }
    }, [token]);

    //Obtiene los tipos de eventos
    const getEventTypes = async () => {
        try {
            const response = await eventTypeService.getAll(token);
            setEventTypes(response.data);
            console.log(response);
            setLoadingEventTypes(false);
        } catch (error) {
            console.error(error);
        }
    }

    //Obtiene los profesores
    const getTeachers = async () => {
        try {
            const response = await teacherService.getAll(token);
            setTeachers(response.data);
            console.log(response);
            setLoadingTeachers(false);
        }
        catch (error) {
            console.error(error);
        }
    }

    //Obtiene las aulas
    const getClassrooms = async () => {
        try {
            const response = await classroomService.getAll(token);
            setClassrooms(response.data);
            console.log(response);
            setLoadingClassrooms(false);
        }
        catch (error) {
            console.error(error);
        }
    }

    //Obtiene los grupos
    const getGroups = async () => {
        try {
            const response = await groupService.getAll(token);
            setGroups(response.data);
            console.log(response);
            setLoadingGroups(false);
        }
        catch (error) {
            console.error(error);
        }
    }

    //Obtiene los departamentos
    const getDepartments = async () => {
        try {
            const response = await departmentService.getAll(token);
            setDepartments(response.data);
            console.log(response);
            setLoadingDepartments(false);
        }
        catch (error) {
            console.error(error);
        }
    }

    //Obtiene las compañias
    const getCompanies = async () => {
        try {
            const response = await companyService.getAll(token);
            setCompanies(response.data);
            console.log(response);
            setLoadingCompanies(false);
        }
        catch (error) {
            console.error(error);
        }
    }

    //Función para manejar el cambio de valor en el select
    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setDaysOfWeek(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    //Función para manejar el evento de borrar un chip
    const handleDelete = (e, value) => {
        //Evitar que se propague el evento
        e.preventDefault();
        //Borramos el elemento del array
        const newDaysOfWeek = daysOfWeek.filter((item) => item !== value)
        setDaysOfWeek(newDaysOfWeek);
    };

    //Función para cerrar el snackbar
    const handleCloseSnackbar = () => {
        setShowSnackBar(false);
    };

    useEffect(() => {
        formik.setFieldValue('daysOfWeek', daysOfWeek);
    }, [daysOfWeek]);

    const formik = useFormik({
        initialValues: {
            name: '',
            event_type_id: '',
            company_id: '',
            classroom_id: '',
            teacher_id: '',
            group_id: '',
            department_id: '',
            date_range_start: '',
            date_range_end: '',
            daysOfWeek: [],
            start_time: '',
            end_time: '',
            description: '',
            status_id: 1,
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().required('Name is required'),
            event_type_id: Yup.string().required('Event type is required'),
            classroom_id: Yup.string().required('Classroom is required'),
            date_range_start: Yup.string().required('Start date is required'),
            date_range_end: Yup.string().required('End date is required'),
            daysOfWeek: Yup.array().min(1, "At least one day of the week is required"),
            start_time: Yup.string().required('Start time is required'),
            end_time: Yup.string().required('End time is required'),
        }),
        onSubmit: async (values) => {
            await handleSubmit(values);
          }
    });

    //Envia el formulario
    const handleSubmit = async(values) => {
        //Activar el loading
        setLoading(true);

        //Convertir date_range_start y date_range_end a YYYY-MM-DD
        let formated_start = dayjs(values.date_range_start).format('YYYY-MM-DD');
        let formated_end = dayjs(values.date_range_end).format('YYYY-MM-DD');

        //Convertir start_time y end_time a HH:mm
        let formated_start_time = dayjs(values.start_time).format('HH:mm');
        let formated_end_time = dayjs(values.end_time).format('HH:mm');

        //Datos a enviar
        let data = {
            name: values.name,
            event_type_id: values.event_type_id,
            company_id: values.company_id || null,
            classroom_id: values.classroom_id,
            teacher_id: values.teacher_id || null,
            group_id: values.group_id || null,
            department_id: values.department_id || "not_set",
            date_range_start: formated_start,
            date_range_end: formated_end,
            days_of_the_week: values.daysOfWeek,
            time_start: formated_start_time,
            time_end: formated_end_time,
            description: values.description,
            status_id: values.status_id,
        }

        try{
            const response = await eventService.create(token, data);
            console.log(response);
            setLoading(false);
            setSeverity('success');
            setSnackbarMessage('Event created successfully');
            setShowSnackBar(true);
            //Reset formulario y estados
            formik.resetForm();
            setStartDate(null);
            setEndDate(null);
            setDaysOfWeek([]);
            setStartHour(dayjs('2024-08-12T00:00'));
            setEndHour(dayjs('2024-08-12T00:00'));
            setSelectedClassroom(null);
            setSelectedCompany(null);
            setSelectedDepartment(null);
            setSelectedEventType(null);
            setSelectedGroup(null);
            setSelectedTeacher(null);
            setCompanyValue('');
            setDepartmentValue('');
            setEventTypeValue('');
            setGroupValue('');
            setTeacherValue('');
            setClassroomValue('');


        } catch (error) {
            console.error(error);
            setLoading(false);
            setSeverity('error');
            setSnackbarMessage('Something went wrong, please try again later');
            setShowSnackBar(true);
        }
    }

    useEffect(() => {
        console.log("Selected group:", selectedGroup);
        if(selectedGroup){
            //Name
            formik.setFieldValue('name', selectedGroup.name);

            //Start date
            if(selectedGroup.date_start){
                setStartDate(dayjs(selectedGroup?.date_start));
                formik.setFieldValue('date_range_start', dayjs(selectedGroup?.date_start));
                console.log("Start date:", dayjs(selectedGroup?.date_start));
            }
            //End date
            if(selectedGroup.date_end){
                setEndDate(dayjs(selectedGroup?.date_end));
                console.log("End date:", dayjs(selectedGroup?.end));
                formik.setFieldValue('date_range_end', dayjs(selectedGroup?.date_end));
            }
            //Days of week
            setDaysOfWeek(selectedGroup?.days_of_the_week);
            formik.setFieldValue('daysOfWeek', selectedGroup?.days_of_the_week);
        }
    }, [selectedGroup]);

    return (
    <Box sx={{ flexGrow:1 }}>
        <form onSubmit={formik.handleSubmit}>
            <Box       
                display="flex"
                alignItems="left"
                gap={4}
                p={2}>
                    <>
                    <Typography variant="h10" >
                        <Link to="/event" color="blue" underline="hover" style={{textDecoration: "none"}}>
                        Events /
                        </Link>
                    </Typography>
                    <Typography variant="h10" >
                    &nbsp;New
                    </Typography> </>
            </Box>
            <Box       
                gap={4}
                p={2}>
                    <Paper>
                        <Grid container spacing={2} paddingLeft={2} paddingRight={2}>
                            {/* TextField Name */}
                            <Grid item xs={12} md={6}>
                                <FormikTextField
                                    label="Name"
                                    type="name"
                                    id="name"
                                    name="name"
                                    required
                                    formik={formik}
                                    sx={{
                                        width: "100%",
                                    }}
                                />
                            </Grid>
                            {/* Autocomplete Event Type */}
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    fullWidth
                                    loading={loadingEventTypes}
                                    id="event_type_id"
                                    options={eventTypes}
                                    inputValue={eventTypeValue}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedEventType}
                                    onChange={(event, newValue) => {
                                        console.log(newValue);
                                        if(newValue){
                                            setSelectedEventType(newValue);
                                            formik.setFieldValue('event_type_id', newValue.id);
                                        } else {
                                            setSelectedEventType(null);
                                            formik.setFieldValue('event_type_id', '');
                                        }
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        console.log(newInputValue);
                                        setEventTypeValue(newInputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                        {...params}
                                        label="Event Type"
                                        margin='normal'
                                        required={true}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched['event_type_id'] && Boolean(formik.errors['event_type_id'])}
                                        helperText={formik.touched['event_type_id'] && formik.errors['event_type_id']}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                {loadingEventTypes ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        />
                                    )}/>
                            </Grid>
                            {/* Autocomplete Company */}
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    fullWidth
                                    loading={loadingCompanies}
                                    id="company_id"
                                    options={companies}
                                    inputValue={companyValue}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedCompany}
                                    onChange={(event, newValue) => {
                                        console.log(newValue);
                                        if(newValue){
                                            setSelectedCompany(newValue);
                                            formik.setFieldValue('company_id', newValue.id);
                                        } else {
                                            setSelectedCompany(null);
                                            formik.setFieldValue('company_id', '');
                                        }
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        console.log(newInputValue);
                                        setCompanyValue(newInputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                        {...params}
                                        label="Company"
                                        margin='normal'
                                        onBlur={formik.handleBlur}
                                        error={formik.touched['company_id'] && Boolean(formik.errors['company_id'])}
                                        helperText={formik.touched['company_id'] && formik.errors['company_id']}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                {loadingCompanies ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        />
                                    )}/>
                            </Grid>
                            {/* Autocomplete Classroom */}
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    fullWidth
                                    loading={loadingClassrooms}
                                    id="classroom_id"
                                    options={classrooms}
                                    inputValue={classroomValue}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedClassroom}
                                    onChange={(event, newValue) => {
                                        console.log(newValue);
                                        if(newValue){
                                            setSelectedClassroom(newValue);
                                            formik.setFieldValue('classroom_id', newValue.id);
                                        } else {
                                            setSelectedClassroom(null);
                                            formik.setFieldValue('classroom_id', '');
                                        }
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        console.log(newInputValue);
                                        setClassroomValue(newInputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                        {...params}
                                        label="Classroom"
                                        margin='normal'
                                        required={true}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched['classroom_id'] && Boolean(formik.errors['classroom_id'])}
                                        helperText={formik.touched['classroom_id'] && formik.errors['classroom_id']}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                {loadingClassrooms ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        />
                                    )}/>
                            </Grid>
                            {/* Autocomplete Teachers */}
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    fullWidth
                                    loading={loadingTeachers}
                                    id="teacher_id"
                                    options={teachers}
                                    inputValue={teacherValue}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedTeacher}
                                    onChange={(event, newValue) => {
                                        console.log(newValue);
                                        if(newValue){
                                            setSelectedTeacher(newValue);
                                            formik.setFieldValue('teacher_id', newValue.id);
                                        }
                                        else {
                                            setSelectedTeacher(null);
                                            formik.setFieldValue('teacher_id', '');
                                        }
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        console.log(newInputValue);
                                        setTeacherValue(newInputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                        {...params}
                                        label="Teacher"
                                        margin='normal'
                                        onBlur={formik.handleBlur}
                                        error={formik.touched['teacher_id'] && Boolean(formik.errors['teacher_id'])}
                                        helperText={formik.touched['teacher_id'] && formik.errors['teacher_id']}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                {loadingTeachers ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        />
                                    )}/>
                            </Grid>
                            {/* Autocomplete Groups */}
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    fullWidth
                                    loading={loadingGroups}
                                    id="group_id"
                                    options={groups}
                                    inputValue={groupValue}
                                    value={selectedGroup}
                                    onChange={(event, newValue) => {
                                        console.log(newValue);
                                        if(newValue){
                                            setSelectedGroup(newValue);
                                            formik.setFieldValue('group_id', newValue.id);
                                        } else {
                                            setSelectedGroup(null);
                                            formik.setFieldValue('group_id', '');
                                        }
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        console.log(newInputValue);
                                        setGroupValue(newInputValue);
                                    }}
                                    getOptionLabel={(option) => {
                                        if(!option){
                                            return ''
                                        } else {
                                        return '[' + option.id + '] ' + option.name
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                        {...params}
                                        label="Group"
                                        margin='normal'
                                        onBlur={formik.handleBlur}
                                        error={formik.touched['group_id'] && Boolean(formik.errors['group_id'])}
                                        helperText={formik.touched['group_id'] && formik.errors['group_id']}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                {loadingGroups ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        />
                                    )}/>
                            </Grid>
                            {/* Autocomplete Department */}
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    fullWidth
                                    loading={loadingDepartments}
                                    id="deparment_id"
                                    options={departments}
                                    inputValue={departmentValue}
                                    value={selectedDepartment}
                                    onChange={(event, newValue) => {
                                        console.log(newValue);
                                        if(newValue){
                                            setSelectedDepartment(newValue);
                                            formik.setFieldValue('deparment_id', newValue.id);
                                        } else {
                                            setSelectedDepartment(null);
                                            formik.setFieldValue('deparment_id', '');
                                        }
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        console.log(newInputValue);
                                        setDepartmentValue(newInputValue);
                                    }}
                                    getOptionLabel={(option) => option.name}
                                    renderInput={(params) => (
                                        <TextField
                                        {...params}
                                        label="Department"
                                        margin='normal'
                                        onBlur={formik.handleBlur}
                                        error={formik.touched['deparment_id'] && Boolean(formik.errors['deparment_id'])}
                                        helperText={formik.touched['deparment_id'] && formik.errors['deparment_id']}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                {loadingDepartments ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        />
                                    )}/>
                            </Grid>
                            {/* DatePicker Date Start */}
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    slotProps={{
                                        textField: {
                                            id: 'date_range_start',
                                            label: 'Start Date',
                                            fullWidth: true,
                                            required: true,
                                            margin: 'normal',
                                            onBlur: (e) => {
                                                formik.handleBlur(e);
                                            },
                                            error: formik.touched['date_range_start'] && Boolean(formik.errors['date_range_start']),
                                            helperText: formik.touched['date_range_start'] && formik.errors['date_range_start'],
                                        },
                                    }}
                                    views={['year', 'month', 'day']}
                                    id="date_range_start"
                                    margin="normal"
                                    value={startDate}
                                    onChange={(newValue) => {
                                        console.log(newValue);
                                        setStartDate(newValue);
                                        formik.setFieldValue('date_range_start', newValue);
                                        if (newValue) {
                                            formik.setFieldError('date_range_start', '');
                                        }
                                    }}
                                />
                            </Grid>
                            {/* DatePicker Date End */}
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    slotProps={{
                                        textField: {
                                            id: 'date_range_end',
                                            label: 'End Date',
                                            fullWidth: true,
                                            required: true,
                                            margin: 'normal',
                                            onBlur: (e) => {
                                                formik.handleBlur(e);
                                            },
                                            error: formik.touched['date_range_end'] && Boolean(formik.errors['date_range_end']),
                                            helperText: formik.touched['date_range_end'] && formik.errors['date_range_end'],
                                        },
                                    }}
                                    views={['year', 'month', 'day']}
                                    id="date_range_end"
                                    value={endDate}
                                    onChange={(newValue) => {
                                        console.log(newValue);
                                        setEndDate(newValue);
                                        formik.setFieldValue('date_range_end', newValue);
                                        if (newValue) {
                                            formik.setFieldError('date_range_end', '');
                                        }
                                    }}
                                />
                            </Grid>
                            {/* Select Days of Week */}
                            <Grid item xs={12} md={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-multiple-checkbox-label">Days of Week</InputLabel>
                                    <Select
                                        labelId="demo-mutiple-chip-checkbox-label"
                                        id="daysOfWeek"
                                        multiple
                                        fullWidth={true}
                                        value={daysOfWeek}
                                        onChange={handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched['daysOfWeek'] && Boolean(formik.errors['daysOfWeek'])}
                                        helperText={formik.touched['daysOfWeek'] && formik.errors['daysOfWeek']}
                                        input={<OutlinedInput label="Days of Week" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => {
                                                    // Buscar el nombre del día usando el ID
                                                    const day = daysOfWeekData.find((day) => day.id === value);
                                                    return (
                                                        <Chip
                                                            key={value}
                                                            label={day?.name} // Mostrar el nombre del día
                                                            clickable
                                                            deleteIcon={
                                                                <CancelIcon
                                                                    onMouseDown={(event) => event.stopPropagation()}
                                                                />
                                                            }
                                                            onDelete={(e) => handleDelete(e, value)}
                                                            onClick={() => console.log("clicked chip")}
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {
                                            daysOfWeekData.map((days) => (
                                                <MenuItem
                                                    key={days.id}
                                                    value={days.id}
                                                >
                                                    <Checkbox checked={daysOfWeek.indexOf(days.id) > -1} />
                                                    {days.name}
                                                </MenuItem>
                                            ))
                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* TimeField Start Time */}
                            <Grid item xs={12} md={6}>
                                <TimeField
                                    label="Start time"
                                    fullWidth={true}
                                    value={startHour}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched['start_time'] && Boolean(formik.errors['start_time'])}
                                    helperText={formik.touched['start_time'] && formik.errors['start_time']}
                                    onChange={(newValue) => {
                                            console.log(newValue);
                                            if(newValue){
                                                setStartHour(dayjs(newValue));
                                                formik.setFieldValue('start_time', newValue);
                                            }
                                        }}
                                    format="HH:mm"
                                />
                            </Grid>
                            {/* TimeField End Time */}
                            <Grid item xs={12} md={6}>
                                <TimeField 
                                    label="End time"
                                    fullWidth={true}
                                    value={endHour}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched['end_time'] && Boolean(formik.errors['end_time'])}
                                    helperText={formik.touched['end_time'] && formik.errors['end_time']}
                                    onChange={(newValue) => {
                                            console.log(newValue);
                                            if(newValue){
                                                setEndHour(dayjs(newValue));
                                                formik.setFieldValue('end_time', newValue);
                                            }
                                        }}
                                    format="HH:mm"
                                />
                            </Grid>
                            {/* Botones */}
                            <Grid item xs={12} md={12}>
                                <Box
                                sx={{display: 'flex', paddingBottom: 2}}>
                                    <LoadingButton
                                        type="submit"
                                        variant="contained"
                                        sx={{marginRight: 2}}
                                        color="success"
                                        loading={loading}
                                        onClick={formik.handleSubmit}
                                        loadingPosition="start"
                                        startIcon={<SaveIcon />}
                                    >Submit</LoadingButton>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={e => {
                                            e.preventDefault();
                                            navigate('/event');
                                        }}
                                    >Cancel</Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
            </Box>
        </form>
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

export default NewEvent;