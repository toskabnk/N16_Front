import { useFormik } from "formik";
import { Autocomplete, Button, CircularProgress, Grid, MenuItem, Select, TextField } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import teacherService from "../../services/teacherService";
import { DatePicker } from "@mui/x-date-pickers-pro";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import FormGrid from "../FormGrid";
import FormikTextField from "../FormikTextField";
import holidayService from "../../services/holidayService";
import dayjs, { utc } from "dayjs";
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const HolidaySuperAdmin = ({ token }) => {
    //Hooks
    const location = useLocation();
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    //Loading para el LoadingButton
    const [loading, setLoading] = useState(false);
    //Loading para el botón de borrar
    const [loadingDelete, setLoadingDelete] = useState(false);
    //Estado para saber si se está editando o creando un nuevo eventType
    const [isEdit, setIsEdit] = useState(false);
    //ID del eventType que se encuentra en la ruta
    const { id } = useParams();
    //Estados para los profesores
    const [teachers, setTeachers] = useState([]);
    const [teacherValue, setTeacherValue] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [loadingTeachers, setLoadingTeachers] = useState(true);
    //Estado para la fechas
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    //Estados para los tipos de ausencia
    const [absenceTypeSelected, setAbsenceTypeSelected] = useState('holiday');
    const absenceType = [
        { value: 'holiday', label: 'Holiday' },
        { value: 'short_term_medical_leave', label: 'Short term medical leave' },
        { value: 'personal_leave', label: 'Personal leave' },
        { value: 'work_absence', label: 'Work absence' },
        { value: 'unjustified', label: 'Unjustified' },
        { value: 'other', label: 'Other' },
    ]
    //ID del holiday que se encuentra en la ubicación
    const locationHolidayID = location.state?.objectID?.id;
    //Formik
    const formik = useFormik({
        initialValues: {
            teacher_id: '',
            start_date: '',
            end_date: '',
            notes: '',
            absence_type: '',
            other_absence_type: '',
        },
        validationSchema: Yup.object({
            teacher_id: Yup.string().required('Required'),
            start_date: Yup.date().required('Required'),
            end_date: Yup.date().required('Required').min(Yup.ref('start_date'), 'End date must be after start date'),
            notes: Yup.string().required('Required'),
            absence_type: Yup.string().required('Required'),
            other_absence_type: Yup.string().when('absence_type', {
                is: (value) => value === "other",
                then: (schema) => schema.required('Other type is required'),
                otherwise: (schema) => schema,
              }),
        }),
        onSubmit: async (values) => {
            console.log('values', values);
            setLoading(true);
            try {
                if(values.absence_type === 'other'){
                    //Concatena other mas : y el valor de other_absence_type
                    values.absence_type = values.absence_type + ': ' + values.other_absence_type;
                }
                //Formatea las fechas al formato aceptado por el backend
                values.start_date = (dayjs(values.start_date).format('YYYY-MM-DD'));
                values.end_date = (dayjs(values.end_date).format('YYYY-MM-DD'));
                
                //Si se está editando, se llama a la función de update, si no, se llama a la función de create
                const respone = isEdit ? await holidayService.update(token, location.state?.objectID.id, values) : await holidayService.create(token, values);
                showSnackbar(isEdit ? 'Holiday request edited successfully!' : 'Holiday request created successfully!', {
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
                //Si esta editando no se resetea el formulario, si no, se resetea
                isEdit ? null : formik.resetForm();
                setTeacherValue('');
                setSelectedTeacher(null);
                setStartDate(null);
                setEndDate(null);
                setAbsenceTypeSelected('holidays');
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
            setLoading(false);
        },
    });

    //Para saber si se está editando, si es así, se obtienen los datos del holiday a editar y se añaen al formulario
    useEffect(() => {
        if (id && location.state?.objectID) {
            setIsEdit(true);
            console.log('Edit holiday id', id, location.state?.objectID);
            const { teacher_id, start_date, end_date, notes, absence_type, other_absence_type } = location.state?.objectID;
            formik.setValues({
                teacher_id: teacher_id,
                start_date: start_date,
                end_date: end_date,
                notes: notes,
                absence_type: absence_type,
            });
            //Transforma la fecha de string al formato aceptado por el DatePicker
            setStartDate(dayjs(start_date));
            setEndDate(dayjs(end_date));
            if(absence_type.includes('other')) {
                setAbsenceTypeSelected('other');
                //Separa el valor de other_absence_type
                const other_type = absence_type.split(': ')[1];
                formik.setFieldValue('other_absence_type', other_type);
            } else {
                setAbsenceTypeSelected(absence_type);
            }
        }
    }, [id, locationHolidayID]);

    //Obtiene los profesores al cargar la página
    useEffect(() => {
        if(token){
            getTeachers();
        }
        formik.setFieldValue('absence_type', 'holiday');
    }, [token]);

    //Si se está editando y ya se obtuvieron los profesores, se selecciona el profesor del holiday a editar
    useEffect(() => {
        if(isEdit && teachers.length > 0 && location.state?.objectID.teacher !== null){
            setSelectedTeacher(teachers.find((teacher) => teacher.id === formik.values.teacher_id));
            setTeacherValue(teachers.find((teacher) => teacher.id ===formik.values.teacher_id).name);
        }
    }, [teachers]);

    //Función para obtener los profesores
    const getTeachers = async () => {
        try {
            const response = await teacherService.getAll(token);
            setTeachers(response.data);
            setLoadingTeachers(false);
        } catch (error) {
            console.error(error);
        }
    }

    //Maneja el cambio del absence type
    const handleChange = (event) => {
        setAbsenceTypeSelected(event.target.value);
        formik.setFieldValue('absence_type', event.target.value);
    };

    return (
        <FormGrid
                formik={formik} 
                name='Holiday' 
                url='/holiday' 
                isEdit={isEdit}
                onSubmit={formik.handleSubmit}
                loading={loading}
                noDelete={true}>
                <Grid item xs={12} md={12}>
                    <Autocomplete
                        fullWidth
                        loading={loadingTeachers}
                        id="teacher_id"
                        options={teachers}
                        inputValue={teacherValue}
                        getOptionLabel={(option) => option.name}
                        value={selectedTeacher}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
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
                <Grid item xs={12} md={12}>
                    <Select
                        value={absenceTypeSelected}
                        onChange={handleChange}
                        fullWidth
                        >
                        {absenceType.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                            {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                {absenceTypeSelected === 'other' ? (<Grid item xs={12} md={12}>
                    <FormikTextField
                        fullWidth
                        id="other_absence_type"
                        label="Other absence type"
                        name="other_absence_type"
                        formik={formik}
                        />
                </Grid>) : (null)}
                <Grid item xs={12} md={12}>
                    <DatePicker
                        slotProps={{
                            textField: {
                                id: 'start_date',
                                label: 'From',
                                fullWidth: true,
                                required: true,
                                margin: 'normal',
                                onBlur: (e) => {
                                    formik.handleBlur(e);
                                },
                                error: formik.touched['start_date'] && Boolean(formik.errors['start_date']),
                                helperText: formik.touched['start_date'] && formik.errors['start_date'],
                            },
                        }}
                        views={['year', 'month', 'day']}
                        id="start_date"
                        value={startDate}
                        onChange={(newValue) => {
                            console.log(newValue);
                            setStartDate(newValue);
                            formik.setFieldValue('start_date', newValue);
                            if (newValue) {
                                formik.setFieldError('start_date', '');
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={12}>
                    <DatePicker
                        slotProps={{
                            textField: {
                                id: 'end_date',
                                label: 'To',
                                fullWidth: true,
                                required: true,
                                margin: 'normal',
                                onBlur: (e) => {
                                    formik.handleBlur(e);
                                },
                                error: formik.touched['end_date'] && Boolean(formik.errors['end_date']),
                                helperText: formik.touched['end_date'] && formik.errors['end_date'],
                            },
                        }}
                        views={['year', 'month', 'day']}
                        id="end_date"
                        value={endDate}
                        onChange={(newValue) => {
                            console.log(newValue);
                            setEndDate(newValue);
                            formik.setFieldValue('end_date', newValue);
                            if (newValue) {
                                formik.setFieldError('end_date', '');
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={12}>
                    <FormikTextField
                        fullWidth
                        id="notes"
                        label="Notes"
                        name="notes"
                        formik={formik}
                        multiline={true}
                        />
                </Grid>
            </FormGrid>
    );
}

export default HolidaySuperAdmin;