import { Autocomplete, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Grid, MenuItem, Paper, Select, Switch, TextField, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { DateRangePicker } from "@mui/x-date-pickers-pro";
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from 'dayjs';
import companyService from "../services/companyService";
import { useSelector } from "react-redux";
import eventTypeService from "../services/eventTypeService";
import departmentservice from "../services/departmentservice";
import { DataGrid } from "@mui/x-data-grid";
import teachingHourService from "../services/teachingHourService";
import FunctionsIcon from '@mui/icons-material/Functions';
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

function TeachingHours() {
    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
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
    const [selectedEventType, setSelectedEventType] = useState([]);
    //Estado para los departamentos
    const [departments, setDepartments] = useState([]);
    const [departmentValue, setDepartmentValue] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState([]);
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
    const [filterRows, setFilterRows] = useState([]);
    const [rowsAux, setRowsAux] = useState([]);
    const [rowsSum, setRowsSum] = useState([]);
    const [columns, setColumns] = useState(defaultTable);
    //Estado del switch para el sumatorio
    const [checkedSum, setCheckedSum] = useState(false);
    const [checkedSumDept, setCheckedSumDept] = useState(false);
    //Iconos para el checkbox
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

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
            //Borra los filtros de evento y departamento
            setSelectedEventType([]);
            setSelectedDepartment([]);
            setFilter('');
            //Obtiene los datos de la tabla
            getTeachingHours();
            //Si el sumatorio está activado se desactiva
            if(checkedSum || checkedSumDept){
                showSnackbar('The hours summation has been turned off', {
                    variant: 'info',
                    autoHideDuration: 6000,
                    action: (key) => (
                        <Fragment>
                            <Button size='small' onClick={() => closeSnackbarGlobal(key)}>
                                Dismiss
                            </Button>
                        </Fragment>
                    ),
                });
            }
            setCheckedSum(false);
            setCheckedSumDept(false);
        }
    }, [groupBy, token, value, selectedCompany]);

    //Al cambiar el filtro se filtran las filas de la tabla
    useEffect(() => {
        if(filter !== ''){
            //Valores a filtrar, por defecto todas
            let toFilter = rowsAux;
            //Si hay un filtro de evento o departamento se filtran las filas de la tabla filtrada
            if(selectedDepartment.length > 0 || selectedEventType.length > 0){
                toFilter = filterRows;
            }
            //Si el sumatorio está activado se filtran las filas de la tabla sumada
            if(checkedSum || checkedSumDept){
                toFilter = rowsSum;
            }
            //Filtra las filas de la tabla
            const filteredRows = toFilter.filter((row) => {
                return Object.values(row).some(value =>
                    value.toString().toLowerCase().includes(filter.toLowerCase())   
                );
            });
            setRows(filteredRows);
        } else {
            //Si no hay filtro se muestran todas las filas
            let unfiltered = rowsAux;
            if(selectedDepartment.length > 0 || selectedEventType.length > 0){
                unfiltered = filterRows;
            }
            if(checkedSum || checkedSumDept){
                unfiltered = rowsSum;
            }
            setRows(unfiltered);
        }
    }, [filter]);

    //Al cambiar el tipo de evento o el departamento se filtran las filas de la tabla
    useEffect(() => {
        if(groupBy === 'teacher_and_event_type'){
            if(selectedEventType.length > 0){
                const filteredRows = rowsAux.filter((row) => {
                    return selectedEventType.some((eventType) => eventType.name === row.event_type);
                });
                console.log(filteredRows);
                setFilterRows(filteredRows);
                setRows(filteredRows);
            } else {
                setRows(rowsAux);
                setFilterRows(rowsAux);
            }
        } else if(groupBy === 'teacher_and_department'){
            console.log(selectedDepartment);
            if(selectedDepartment.length > 0){
                const filteredRows = rowsAux.filter((row) => {
                    return selectedDepartment.some((department) => department.name === row.department);
                });
                console.log(filteredRows);
                setFilterRows(filteredRows);
                setRows(filteredRows);
            } else {
                setRows(rowsAux);
                setFilterRows(rowsAux);
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
            setFilterRows(transformedData);
            console.log(response);
        }
        catch (error) {
            console.error(error);
        }
    }

    //Maneja el cambio del switch
    const handleSwitchChangeEvent = (event) => {
        setFilter('');
        setCheckedSum(event.target.checked);
        if(event.target.checked){
            let rowsToSum = rowsAux;
            if(selectedEventType.length > 0){
                rowsToSum = filterRows;  
            }
            //Hace el sumatorio de las horas de los eventos agrupandolas por profesor.
            const sumRows = rowsToSum.reduce((acc, row) => {
                const existingRow = acc.find((accRow) => accRow.name === row.name);
                if(existingRow){
                    existingRow.time += row.time;
                } else {
                    acc.push({...row});
                }
                return acc;
            }
            , []);
            //Elimina la columna del tipo de evento
            const newColumns = columns.filter((column) => column.field !== 'event_type');
            setColumns(newColumns);
            setRows(sumRows);
            setRowsSum(sumRows);
        } else {
            setColumns(teacherAndeventTypeTable);
            if(selectedEventType.length > 0){
                setRows(filterRows);
            } else {
                setRows(rowsAux);
            }
        }
    }

    //Maneja el cambio del switch de departament
    const handleSwitchChangeDepartment = (event) => {
        setFilter('');
        setCheckedSumDept(event.target.checked);
        if(event.target.checked){
            let rowsToSum = rowsAux;
            if(selectedDepartment.length > 0){
                rowsToSum = filterRows;  
            }
            //Hace el sumatorio de las horas de los eventos agrupandolas por profesor.
            const sumRows = rowsToSum.reduce((acc, row) => {
                const existingRow = acc.find((accRow) => accRow.name === row.name);
                if(existingRow){
                    existingRow.time += row.time;
                } else {
                    acc.push({...row});
                }
                return acc;
            }
            , []);
            //Elimina la columna de department
            const newColumns = columns.filter((column) => column.field !== 'department');
            setColumns(newColumns);
            setRows(sumRows);
            setRowsSum(sumRows);
        } else {
            setColumns(teacherAndDepartmentTable);
            if(selectedDepartment.length > 0){
                setRows(filterRows);
            } else {
                setRows(rowsAux);
            }
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
                                                <Stack direction="row" spacing={2}>
                                                    <Autocomplete
                                                        fullWidth
                                                        multiple
                                                        disableCloseOnSelect
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
                                                        renderOption={(props, option, { selected }) => {
                                                            const { key, ...optionProps } = props;
                                                            return (
                                                              <li key={key} {...optionProps}>
                                                                <Checkbox
                                                                  icon={icon}
                                                                  checkedIcon={checkedIcon}
                                                                  style={{ marginRight: 8 }}
                                                                  checked={selected}
                                                                />
                                                                {option.name}
                                                              </li>
                                                            );
                                                          }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                            {...params}
                                                            sx={{ marginTop: 1 }}
                                                        />
                                                        
                                                        )}/>
                                                    <FormGroup>
                                                        <FormControlLabel control={<Switch checked={checkedSum} />} onChange={handleSwitchChangeEvent} labelPlacement="top" label={<FunctionsIcon/>} />
                                                    </FormGroup>
                                                </Stack>   
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
                                                <Stack direction="row" spacing={2}>
                                                    <Autocomplete
                                                        fullWidth
                                                        multiple
                                                        disableCloseOnSelect
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
                                                        renderOption={(props, option, { selected }) => {
                                                            const { key, ...optionProps } = props;
                                                            return (
                                                              <li key={key} {...optionProps}>
                                                                <Checkbox
                                                                  icon={icon}
                                                                  checkedIcon={checkedIcon}
                                                                  style={{ marginRight: 8 }}
                                                                  checked={selected}
                                                                />
                                                                {option.name}
                                                              </li>
                                                            );
                                                          }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                            {...params}
                                                            sx={{ marginTop: 1 }}
                                                        />
                                                        )}/>
                                                    <FormGroup>
                                                        <FormControlLabel control={<Switch checked={checkedSumDept} />} onChange={handleSwitchChangeDepartment} labelPlacement="top" label={<FunctionsIcon/>} />
                                                    </FormGroup>
                                                </Stack>   
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