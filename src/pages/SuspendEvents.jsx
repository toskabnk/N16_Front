import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import eventService from "../services/eventService";
import companyService from "../services/companyService";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Autocomplete, CircularProgress, Grid, Paper, TextField, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import SnackbarComponent from "../components/SnackbarComponent";
import { LoadingButton } from "@mui/lab";
import { Box } from "@mui/system";
import SaveIcon from '@mui/icons-material/Save';
import dayjs from "dayjs";

function SuspendEvents() {

    //Estado para las compañias
    const [companies, setCompanies] = useState([]);
    const [companyValue, setCompanyValue] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    //Estado de carga de las compañias
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    //Estado para la fecha
    const [startDate, setStartDate] = useState(null);
    //Estado para el snackbar
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [severity, setSeverity] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const snackbarRef = React.createRef();
    //Loading para el LoadingButton
    const [loading, setLoading] = useState(false);

    //Token de autenticación
    const token = useSelector((state) => state.user.token);

    const navigate = useNavigate();

    //Al cargar la pagina se obtienen los datos necesarios
    useEffect(() => {
        if(token){
            getCompanies();
        }
    }, [token]);

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

    //Función para cerrar el snackbar
    const handleCloseSnackbar = () => {
        setShowSnackBar(false);
    };

    const formik = useFormik({
        initialValues: {
            company_id: '',
            date_range_start: '',
        },
        validationSchema: Yup.object({
            company_id: Yup.string().required('Company is required'),
            date_range_start: Yup.string().required('Start date is required'),
        }),
        onSubmit: async (values) => {
            console.log(values);
            setLoading(true);
            try {

                //Convertir date_range_start y date_range_end a YYYY-MM-DD
                let formated_start = dayjs(values.date_range_start).format('YYYY-MM-DD');

                //Enviar datos
                const response = await eventService.suspendEventsDayCompany(token, values.company_id, formated_start);
                console.log(response);
                //Mostrar snackbar
                setSeverity('success');
                setSnackbarMessage('Events suspended successfully');
                setShowSnackBar(true);

                //Reset form
                formik.resetForm();
                setSelectedCompany(null);
                setCompanyValue('');
                setStartDate(null);
                setLoading(false);

            } catch (error) {
                //Mostrar snackbar con el error
                console.error(error);
                setSeverity('error');
                setSnackbarMessage('Error suspending events');
                setShowSnackBar(true);
                setLoading(false);
            }
        }
    });

    return (
        <Box sx={{ flexGrow:1 }}>
            <form onSubmit={formik.handleSubmit}>
            <Box       
                display="flex"
                alignItems="left"
                gap={4}
                p={2}>
                    <Typography variant="h10" >
                        <Link to="/event" color="blue" underline="hover" style={{textDecoration: "none"}}>
                        Events
                        </Link>
                    </Typography>
            </Box>
            <Box       
                gap={4}
                p={2}>
                    <Paper>
                        <Grid container spacing={2} paddingLeft={2} paddingRight={2}>
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
                            <Grid item xs={12} md={12}>
                                <Box
                                sx={{display: 'flex', paddingBottom: 2}}>
                                    <LoadingButton
                                        type="submit"
                                        fullWidth={true}
                                        variant="contained"
                                        color="success"
                                        loading={loading}
                                        onClick={formik.handleSubmit}
                                        loadingPosition="start"
                                        startIcon={<SaveIcon />}
                                    >Submit</LoadingButton>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>  
                </Box>
            </form>
            <SnackbarComponent
            ref={snackbarRef}
            open={showSnackBar}
            message={snackbarMessage}
            severity={severity}
            handleClose={handleCloseSnackbar}/>
        </Box>
    );
}

export default SuspendEvents;