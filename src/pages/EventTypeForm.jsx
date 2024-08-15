import { LoadingButton } from "@mui/lab";
import { Button, Grid, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import React, { Fragment, useEffect, useState } from "react";
import FormikTextField from "../components/FormikTextField";
import { useFormik } from "formik";
import * as Yup from "yup";
import SaveIcon from '@mui/icons-material/Save';
import { useSelector } from "react-redux";
import eventTypeService from "../services/eventTypeService";
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from "sweetalert2";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";

function EventTypeForm() {
    //Hooks
    const navigate = useNavigate();
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
    //ID del eventType que se encuentra en la ubicación
    const locationEventTypeID = location.state?.eventType?.id;
    //Token de usuario
    const token = useSelector((state) => state.user.token);

    //Si hay un eventType en la ubicación, se carga el nombre en el formulario
    useEffect(() => {
        if (id && location.state?.eventType) {
            setIsEdit(true);
            console.log('Edit event type', id, location.state?.eventType);
            formik.setFieldValue('name', location.state?.eventType.name);
        }
    }, [id, locationEventTypeID]);

    //Si no hay un eventType en la ubicación, redirige a la página de creación de eventType
    useEffect(() => {
        if (!locationEventTypeID && window.location.pathname !== '/eventType/new') {
            navigate('/eventType/new');
        }
    }, [locationEventTypeID, navigate]);

    //Función para borrar un eventType. Muestra un mensaje de confirmación antes de borrar.
    const handleDelete = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoadingDelete(true);
                try {
                    await eventTypeService.delete(token, location.state?.eventType.id);
                    showSnackbar('Event type deleted successfully', {
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
                    navigate('/eventType');
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
                setLoadingDelete(false);
            }
        });
    };

    //Formik
    const formik = useFormik({
        initialValues: {
            name: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Name is required'),
        }),
        onSubmit: async (values) => {
            console.log('values', values);
            setLoading(true);
            try {
                //Si se está editando, se llama a la función de update, si no, se llama a la función de create
                const respone = isEdit ? await eventTypeService.update(token, location.state?.eventType.id, values) : await eventTypeService.create(token, values);
                showSnackbar(isEdit ? 'Event type edited successfully!' : 'Event type created successfully!', {
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
                isEdit ? null : formik.resetForm()
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
        <Box sx={{ flexGrow:1 }}>
            <form onSubmit={formik.handleSubmit}>
            <Box       
                display="flex"
                alignItems="left"
                p={2}>
                    <>
                    <Typography variant="h10" >
                        <Link to="/event" color="blue" underline="hover" style={{textDecoration: "none"}}>
                        Event type /
                        </Link>
                    </Typography>
                    <Typography variant="h10" >
                    &nbsp;{isEdit ? 'Edit' : 'New'}
                    </Typography>
                    </>
            </Box>
            <Box       
                gap={4}
                p={2}>
                    <Paper>
                        <Grid container spacing={2} paddingLeft={2} paddingRight={2}>
                            <Grid item xs={12} md={12}>
                                <FormikTextField
                                    fullWidth
                                    id="name"
                                    label="Name"
                                    name="name"
                                    formik={formik}
                                    />
                            </Grid>
                            <Grid item xs={12} md={12}>
                                <Box
                                sx={{display: 'flex', paddingBottom: 2}}>
                                    <LoadingButton
                                        type="submit"
                                        variant="contained"
                                        color="success"
                                        sx={{marginRight: 2}}
                                        loading={loading}
                                        disabled={loadingDelete}
                                        onClick={formik.handleSubmit}
                                        loadingPosition="start"
                                        startIcon={<SaveIcon />}
                                    >{isEdit ? 'Edit' : 'Submit'}
                                    </LoadingButton>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{marginRight: 2}}
                                        onClick={e => {
                                            e.preventDefault();
                                            navigate('/eventType');
                                        }}
                                    >Cancel
                                    </Button>
                                    {isEdit ? (
                                        <LoadingButton
                                            variant="contained"
                                            color="error"
                                            loading={loadingDelete}
                                            onClick={handleDelete}
                                            loadingPosition="start"
                                            startIcon={<DeleteIcon />}
                                        >{'Delete'}</LoadingButton>) : null}
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>  
                </Box>
            </form>
        </Box>
    );
}

export default EventTypeForm;