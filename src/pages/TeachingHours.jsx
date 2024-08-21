import { Autocomplete, CircularProgress, Grid, MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { DateRangePicker } from "@mui/x-date-pickers-pro";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from 'dayjs';
import companyService from "../services/companyService";
import { useSelector } from "react-redux";
import eventTypeService from "../services/eventTypeService";
import departmentservice from "../services/departmentservice";
import { DataGrid } from "@mui/x-data-grid";
import teachingHourService from "../services/teachingHourService";


function TeachingHours() {
    //Fecha actual en formato dayjs YYYY-MM-DD
    const today = dayjs().format('YYYY-MM-DD');
    //Fecha actual menos 7 días en formato dayjs YYYY-MM-DD
    const sevenDaysBefore = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
    //Rango de fecha
    const [value, setValue] = useState([
        dayjs(sevenDaysBefore),
        dayjs(today),
    ]);
    //Estado para las compañias
    const [companies, setCompanies] = useState([]);
    const [companyValue, setCompanyValue] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    //Estado para los tipos de eventos
    const [eventTypes, setEventTypes] = useState([]);
    const [eventTypeValue, setEventTypeValue] = useState('');
    const [selectedEventType, setSelectedEventType] = useState(null);
    //Estado para los departamentos
    const [departments, setDepartments] = useState([]);
    const [departmentValue, setDepartmentValue] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    //Loading de las compañias
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    //Token de usuario
    const token = useSelector((state) => state.user.token);
    //Valores del groupBy
    const groupByOptions = [
        { value: 'teacher', label: 'Teacher' },
        { value: 'teacher_and_event_type', label: 'Teacher and event type' },
        { value: 'teacher_and_department', label: 'Teacher and department' },
        { value: 'department', label: 'Department' },
    ];
    //Valor seleccionado del groupBy
    const [groupBy, setGroupBy] = useState('teacher');
    //Valor del filtro
    const [filter, setFilter] = useState('');
    //Tablas
    const defaultTable = [
        { field: 'name', headerName: 'Name',flex: 1, overflow: 'hidden' },
        { field: 'surname', headerName: 'Surname',flex: 1, overflow: 'hidden' },
        { field: 'time', headerName: 'Time',flex: 1, overflow: 'hidden' },
    ];
    const teacherAndeventTypeTable = [
        { field: 'name', headerName: 'Name', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'surname', headerName: 'Surname', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'event_type', headerName: 'Event Type', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'time', headerName: 'Time', flex: 1, resizable: true, overflow: 'hidden' },
    ];
    const teacherAndDepartmentTable = [
        { field: 'name', headerName: 'Name', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'surname', headerName: 'Surname', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'department', headerName: 'Department', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'time', headerName: 'Time', flex: 1, resizable: true, overflow: 'hidden' },
    ];
    //Columnas y datos de la tabla
    const [rows, setRows] = useState([]);
    const [rowsAux, setRowsAux] = useState([]);
    const [columns, setColumns] = useState(defaultTable);

    //Obtiene las compañias al cargar la página
    useEffect(() => {
        if(token){
            getCompanies();
            getEventTypes();
            getDepartments();
        }
    }, [token]);

    //Obtiene los tipos de eventos//Obtiene los tipos de eventos
    const getEventTypes = async () => {
        try {
            const response = await eventTypeService.getAll(token);
            setEventTypes(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    //Obtiene los departamentos
    const getDepartments = async () => {
        try {
            const response = await departmentservice.getAll(token);
            setDepartments(response.data);
        } catch (error) {
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

    //Maneja el cambio del groupBy
    const handleChange = (event) => {
        setGroupBy(event.target.value);
    };

    //Al cambiar el groupBy se cambian las columnas de la tabla
    useEffect(() => {
        console.log(value);
        if(token){
            //Cambia las columnas de la tabla
            if(groupBy === 'teacher_and_event_type'){
                setColumns(teacherAndeventTypeTable);
            } else if(groupBy === 'teacher_and_department'){
                setColumns(teacherAndDepartmentTable);
            } else if(groupBy === 'teacher'){
                setColumns(defaultTable);
            } else if(groupBy === 'department'){
                setColumns(defaultTable);
            }
            getTeachingHours();
        }
    }, [groupBy, token, value, selectedCompany]);

    //Al cambiar el filtro se filtran las filas de la tabla
    useEffect(() => {
        if(filter !== ''){
            const filteredRows = rowsAux.filter((row) => {
                return Object.values(row).some(value =>
                    value.toString().toLowerCase().includes(filter.toLowerCase())   
                );
            });
            setRows(filteredRows);
        } else {
            setRows(rowsAux);
        }
    }, [filter]);

    //Al cambiar el tipo de evento o el departamento se filtran las filas de la tabla
    useEffect(() => {
        if(groupBy === 'teacher_and_event_type'){
            if(selectedEventType){
                const filteredRows = rowsAux.filter((row) => {
                    return row.event_type === selectedEventType.name;
                });
                setRows(filteredRows);
            } else {
                setRows(rowsAux);
            }
        } else if(groupBy === 'teacher_and_department'){
            if(selectedDepartment){
                const filteredRows = rowsAux.filter((row) => {
                    return row.department === selectedDepartment.name;
                });
                setRows(filteredRows);
            } else {
                setRows(rowsAux);
            }
        }
    }, [selectedEventType, selectedDepartment]);


    //Obtiene los datos de la tabla con groupBy teacherAndEventType
    async function getTeachingHours() {
        //Parámetros de la consulta
        const queryParams = {
            start_date: value[0].format('YYYY-MM-DD'),
            end_date: value[1].format('YYYY-MM-DD'),
            group_by: groupBy,
            company_id: selectedCompany ? selectedCompany.id : null,
        }

        try {
            const response = await teachingHourService.getTeachingHours(token, queryParams);
            //Add index to the data
            const transformedData = response.map((data, index) => {
                return {
                    ...data,
                    id: index
                };
            });
            setRows(transformedData);
            setRowsAux(transformedData);
            console.log(response);
        }
        catch (error) {
            console.error(error);
        }
    }

    return (
        <Box sx={{ flexGrow:1, minWidth:0 }}>
            <Box       
                display="flex"
                alignItems="left"
                p={2}>
                    <>
                    <Typography variant="h10" >
                        <Link to="/teachingHours" color="blue" underline="hover" style={{textDecoration: "none"}}>
                        Hours /
                        </Link>
                    </Typography>
                    <Typography variant="h10" >
                        &nbsp;List
                    </Typography>
                    </>
            </Box>
            <Box
                gap={4}
                p={2}>
                        {/* Fecha */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={12}>
                                <Paper>
                                <Box
                                    p={2}>
                                        <Typography variant="h7">Date Range</Typography>
                                        <DateRangePicker 
                                            sx={{ marginTop: 1 }}
                                            localeText={{ start: 'Start Date', end: 'End Date' }}
                                            value={value}
                                            onChange={(newValue) => setValue(newValue)} />
                                </Box>
                                </Paper>
                            </Grid>
                            {/* Company */}
                            <Grid item xs={12} md={6}>
                                <Paper elevation={3}>
                                    <Box
                                        p={2}>
                                            <Typography variant="h7">Filter By Company</Typography>
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
                                                    } else {
                                                        setSelectedCompany(null);
                                                    }
                                                }}
                                                onInputChange={(event, newInputValue) => {
                                                    console.log(newInputValue);
                                                    setCompanyValue(newInputValue);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                    {...params}
                                                    sx={{ marginTop: 1 }}
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
                                    </Box>
                                </Paper>
                            </Grid>
                            {/* Group By */}
                            <Grid item xs={12} md={6}>
                                <Paper elevation={3}>
                                    <Box
                                        sx={{ display: 'flex', flexDirection: 'column' }}
                                        p={2}>
                                            <Typography variant="h7">Group By</Typography>
                                            <Select
                                                sx={{ marginTop: 1 }}
                                                value={groupBy}
                                                onChange={handleChange}
                                                displayEmpty
                                                >
                                                {groupByOptions.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                    </MenuItem>
                                                ))}
                                                </Select>
                                    </Box>
                                </Paper>
                            </Grid>
                            {/* Filter */}
                            <Grid item xs={12} md={6}>
                                <Paper elevation={3}>
                                    <Box
                                        sx={{ display: 'flex', flexDirection: 'column' }}
                                        p={2}>
                                            <Typography variant="h7">Filter</Typography>
                                            <TextField
                                                fullWidth
                                                sx={{ marginTop: 1 }}
                                                onChange={e => setFilter(e.target.value)}
                                                value={filter}/>
                                    </Box>
                                </Paper>
                            </Grid>
                            {/* Event Type */}
                            {groupBy === 'teacher_and_event_type' ? (
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={3}>
                                        <Box
                                            p={2}>
                                                <Typography variant="h7">Filter By Event Type</Typography>
                                                <Autocomplete
                                                    fullWidth
                                                    options={eventTypes}
                                                    inputValue={eventTypeValue}
                                                    getOptionLabel={(option) => option.name}
                                                    value={selectedEventType}
                                                    onChange={(event, newValue) => {
                                                        console.log(newValue);
                                                        if(newValue){
                                                            setSelectedEventType(newValue);
                                                        } else {
                                                            setSelectedEventType(null);
                                                        }
                                                    }}
                                                    onInputChange={(event, newInputValue) => {
                                                        console.log(newInputValue);
                                                        setEventTypeValue(newInputValue);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                        {...params}
                                                        sx={{ marginTop: 1 }}
                                                    />
                                                    )}/>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ) :( <></>)}
                            {/* Department */}
                            {groupBy === 'teacher_and_department' ? (
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={3}>
                                        <Box
                                            p={2}>
                                                <Typography variant="h7">Filter By Department</Typography>
                                                <Autocomplete
                                                    fullWidth
                                                    options={departments}
                                                    inputValue={departmentValue}
                                                    getOptionLabel={(option) => option.name}
                                                    value={selectedDepartment}
                                                    onChange={(event, newValue) => {
                                                        console.log(newValue);
                                                        if(newValue){
                                                            setSelectedDepartment(newValue);
                                                        } else {
                                                            setSelectedDepartment(null);
                                                        }
                                                    }}
                                                    onInputChange={(event, newInputValue) => {
                                                        console.log(newInputValue);
                                                        setDepartmentValue(newInputValue);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                        {...params}
                                                        sx={{ marginTop: 1 }}
                                                    />
                                                    )}/>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ) :( <></>)}
                            <Grid item xs={12} md={12}>
                                <Paper elevation={3}>
                                    <Box
                                        sx={{ display: 'flex', flexDirection: 'column' }}
                                        p={2}>
                                            <Typography variant="h7">Filter</Typography>
                                            <DataGrid
                                                autoHeight={true}
                                                rows={rows}
                                                columns={columns}
                                                initialState={{
                                                    pagination: {
                                                        paginationModel: { page: 0, pageSize: 10 },
                                                    },
                                                }}
                                                pageSizeOptions={[10, 20, 50]}
                                            />
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
            </Box>
        </Box>
    );
} 

export default TeachingHours;