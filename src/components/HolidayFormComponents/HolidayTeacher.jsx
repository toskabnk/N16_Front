import { useLocation, useParams } from "react-router-dom";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import { Fragment, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Grid } from "@mui/material";
import FormGrid from "../FormGrid";
import { DatePicker } from "@mui/x-date-pickers-pro";
import FormikTextField from "../FormikTextField";
import dayjs from "dayjs";
import holidayService from "../../services/holidayService";

const HolidayTeacher = ({ token }) => {
    //Hooks
    const location = useLocation();
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    //Loading para el LoadingButton
    const [loading, setLoading] = useState(false);
    //Estado para saber si se está editando o creando un nuevo eventType
    const [isEdit, setIsEdit] = useState(false);
    //ID del eventType que se encuentra en la ruta
    const { id } = useParams();
    //Estado para la fechas
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    //ID del holiday que se encuentra en la ubicación
    const locationHolidayID = location.state?.objectID?.id;

    //Para saber si se está editando o creando un nuevo holiday, si se está editando, se llena el formulario con los datos del holiday
    useEffect(() => {
        if (id && location.state?.objectID) {
            setIsEdit(true);
            console.log('Edit holiday id', id, location.state?.objectID);
            const {  start_date, end_date, notes } = location.state?.objectID;
            formik.setValues({
                start_date: start_date,
                end_date: end_date,
                notes: notes,
            });
            //Transforma la fecha de string al formato aceptado por el DatePicker
            setStartDate(dayjs(start_date));
            setEndDate(dayjs(end_date));
        }
    }, [id, locationHolidayID]);

    //Formik
    const formik = useFormik({
        initialValues: {
            start_date: '',
            end_date: '',
            notes: '',
        },
        validationSchema: Yup.object({
            start_date: Yup.date().required('Required'),
            end_date: Yup.date().required('Required').min(Yup.ref('start_date'), 'End date must be after start date'),
            notes: Yup.string().required('Required'),
        }),
        onSubmit: async (values) => {
            console.log('values', values);
            setLoading(true);
            try {
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
                setStartDate(null);
                setEndDate(null);
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

export default HolidayTeacher;