import { Autocomplete, TextField } from "@mui/material";
import { useFormikContext } from "formik";
import { useEffect, useState } from "react";


export default function DataForm(props) {
    //Token de autenticación
    const token = props.token;

    //Estados de los campos de formulario
    const [selectedOption, setSelectedOption] = useState(null);
    const [statusValue, setOptionValue] = useState('');
    const [selectedDepartment,setSelectedDepartment] = useState(null);
    const [departmentValue, setDepartmentValue] = useState('');
    const [selectedEventType, setSelectedEventType] = useState(null);
    const [eventTypeValue, setEventTypeValue] = useState('');

    //Valores del formulario
    const { values: formValues, errors, touched } = useFormikContext();

    //Opciones de los campos de selección
    const options = [
        { id: '1', name: 'Active' },
        { id: '2', name: 'Cancelled +24h' },
        { id: '3', name: 'Cancelled -24h' },
        { id: '4', name: 'Cancelled - Holiday' }
    ];

    //Campos del formulario
    const {
        formField: {
            status_id,
            department_id,
            event_type_id,
            description
        }
    } = props;

    //Carga los valores del formulario y los valores de los campos de selección
    useEffect(() => {
        if (token) {
            //Si es la primera vez que se carga el formulario, se cargan los valores del evento, si no, se mantienen los valores del formulario
            updateValueAndSelection('department_id', 'department_id', setDepartmentValue, setSelectedDepartment, props.departments);
            updateValueAndSelection('event_type_id', 'event_type_id', setEventTypeValue, setSelectedEventType, props.eventTypes);
            updateValueAndSelection('status_id', 'status_id', setOptionValue, setSelectedOption, options);
            console.log(formValues);
        }
    }, [token]);

    const updateValueAndSelection = (formValueKey, propKey, setValue, setSelected, items) => {
        //Si el valor del formulario no está definido, se asigna el valor del prop
        if (formValues[formValueKey] === undefined || formValues[formValueKey] === '') {
            formValues[formValueKey] = props.event.extendedProps[propKey];
            setValue(props.event.extendedProps[propKey.slice(0, -3)] ? props.event.extendedProps[propKey.slice(0, -3)].name : '');
            setSelected(items.find(item => item.id === props.event.extendedProps[propKey]));
        } else {
            //Si el valor del formulario está definido, se asigna el valor del formulario
            setValue(items.find(item => item.id === formValues[formValueKey]).name);
            setSelected(items.find(item => item.id === formValues[formValueKey]));
        }
    };

    return (
        <>
            <Autocomplete
                fullWidth
                loading={false}
                id="status_id"
                options={options}
                inputValue={statusValue}
                getOptionLabel={(option) => option.name}
                value={selectedOption}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event, newValue) => {
                    console.log(newValue);
                    setSelectedOption(newValue);
                    newValue ? formValues.status_id = newValue.id : formValues.status_id = '';
                    console.log(formValues);
                }}
                onInputChange={(event, newInputValue) => {
                    console.log(newInputValue);
                    setOptionValue(newInputValue);
                }}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    label="Status"
                    margin='normal'
                    error={touched['status_id'] && Boolean(errors['status_id'])}
                    helperText={touched['status_id'] && errors['status_id']}
                    inputProps={{
                        ...params.inputProps
                    }}
                    />
                )}/>
            <Autocomplete
                fullWidth
                loading={false}
                id="department_id"
                options={props.departments}
                inputValue={departmentValue}
                getOptionLabel={(option) => option.name}
                value={selectedDepartment}
                onChange={(event, newValue) => {
                    console.log(newValue);
                    setSelectedDepartment(newValue);
                    newValue ? formValues.department_id = newValue.id : formValues.department_id = '';
                }}
                onInputChange={(event, newInputValue) => {
                    console.log(newInputValue);
                    setDepartmentValue(newInputValue);
                }}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    label="Department"
                    margin='normal'
                    error={touched['department_id'] && Boolean(errors['department_id'])}
                    helperText={touched['department_id'] && errors['department_id']}
                    inputProps={{
                        ...params.inputProps
                    }}
                    />
                )}/>
            <Autocomplete
                fullWidth
                loading={false}
                id="event_type_id"
                options={props.eventTypes}
                inputValue={eventTypeValue}
                getOptionLabel={(option) => option.name}
                value={selectedEventType}
                onChange={(event, newValue) => {
                    console.log(newValue);
                    setSelectedEventType(newValue);
                    newValue ? formValues.event_type_id = newValue.id : formValues.event_type_id = '';
                }}
                onInputChange={(event, newInputValue) => {
                    console.log(newInputValue);
                    setEventTypeValue(newInputValue);
                }}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    sx={{ width: '554px' }}
                    label="Event type"
                    margin='normal'
                    error={touched['event_type_id'] && Boolean(errors['event_type_id'])}
                    helperText={touched['event_type_id'] && errors['event_type_id']}
                    inputProps={{
                        ...params.inputProps
                    }}
                    />
                )}/>
        </>
    )
}
