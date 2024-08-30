import { useEffect, useState } from "react";
import InputField from "./FormFields/InputField";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useFormikContext } from "formik";


function DataForm(props){
    //Token de autenticación
    const token = props.token;
    //Estados de los campos de formulario
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [classroomValue, setClassroomValue] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [teacherValue, setTeacherValue] = useState('');
    //Estado de carga
    const [loading, setLoading] = useState(false);

    //Valores del formulario
    const { values: formValues, errors, touched } = useFormikContext();

    //Campos del formulario
    const {
        formField: {
            start_date,
            end_date,
            classroom_id,
            teacher_id,
            description
        }
    } = props;

    //Carga los valores del formulario y los valores de los campos de selección
    //TODO: Los teachers not_set fallan al cargar el formulario
    useEffect(() => {
        if(token){
            //Si es la primera vez que se carga el formulario, se cargan los valores del evento, si no, se mantienen los valores del formulario
            updateValueAndSelection('classroom_id', 'classroom_id', setClassroomValue, setSelectedClassroom, props.classrooms);
            if(formValues.teacher_id !== 'not_set'){
                updateValueAndSelection('teacher_id', 'teacher_id', setTeacherValue, setSelectedTeacher, props.teachers);
            }

            //Si la descripción no está definida, se asigna la descripción del evento
            if(formValues.description === undefined){
                formValues.description = props.event.extendedProps.description;
            }

            //Se asignan los valores de las fechas del evento
            formValues.start_date = props.event.extendedProps.start_date;
            formValues.end_date = props.event.extendedProps.end_date;
            console.log(formValues);
        }
    }, [token]);

    const updateValueAndSelection = (formValueKey, propKey, setValue, setSelected, items) => {
        //Si el valor del formulario no está definido, se asigna el valor del prop
        if (formValues[formValueKey] === undefined) {
            formValues[formValueKey] = props.event.extendedProps[propKey];
            setValue(props.event.extendedProps[propKey.slice(0, -3)] ? props.event.extendedProps[propKey.slice(0, -3)].name : '');
            setSelected(items.find(item => item.id === props.event.extendedProps[propKey]));
        } else {
            //Si el valor del formulario está definido, se asigna el valor del formulario
            let name = items.find(item => item.id === formValues[formValueKey].name);
            if(name){
                setValue(name.name);
            }
            setSelected(items.find(item => item.id === formValues[formValueKey]));
        }
    };

    return (
        <>
            <InputField name={description.name} label={description.label} fullWidth margin='normal' />
            <InputField name={start_date.name} label={start_date.label} fullWidth margin='normal' disabled={true} />
            <InputField name={end_date.name} label={end_date.label} fullWidth margin='normal' disabled={true}/>
            <Autocomplete
                fullWidth
                loading={false}
                id="classroom_id"
                options={props.classrooms}
                inputValue={classroomValue}
                getOptionLabel={(option) => option.name}
                value={selectedClassroom}

                onChange={(event, newValue) => {
                    console.log(newValue);
                    setSelectedClassroom(newValue);
                    newValue ? formValues.classroom_id = newValue.id : formValues.classroom_id = '';
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
                    error={touched['classroom_id'] && Boolean(errors['classroom_id'])}
                    helperText={touched['classroom_id'] && errors['classroom_id']}
                    inputProps={{
                        ...params.inputProps
                    }}
                    />
                )}/>
            <Autocomplete
                fullWidth
                loading={false}
                id="teacher_id"
                options={props.teachers}
                inputValue={teacherValue}
                value={selectedTeacher}
                onChange={(event, newValue) => {
                    console.log(newValue);
                    setSelectedTeacher(newValue);
                    newValue ? formValues.teacher_id = newValue.id : formValues.teacher_id = '';
                }}
                onInputChange={(event, newInputValue) => {
                    console.log(newInputValue);
                    setTeacherValue(newInputValue);
                }}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    label="Teacher"
                    margin='normal'
                    sx={{ width: '554px' }}
                    error={touched['teacher_id'] && Boolean(errors['teacher_id'])}
                    helperText={touched['teacher_id'] && errors['teacher_id']}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                    />
            )}/>
        </>
    )
}

export default DataForm;