import { Button, Grid } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import React, { Fragment, useEffect, useState } from "react";
import FormikTextField from "../components/FormikTextField";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import FormGrid from "../components/FormGrid";
import companyService from "../services/companyService";

function CompanyForm() {
    //Hooks
    const location = useLocation();
    const navigate = useNavigate();
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
    const locationEventTypeID = location.state?.objectID?.id;
    //Token de usuario
    const token = useSelector((state) => state.user.token);

    //Si hay un company en la ubicación, se carga el nombre en el formulario
    useEffect(() => {
        if (id && location.state?.objectID) {
            setIsEdit(true);
            formik.setFieldValue('name', location.state?.objectID.name);
        }
    }, [id, locationEventTypeID]);

    //Si no hay un eventType en la ubicación, redirige a la página de creación de eventType
    useEffect(() => {
        if (!locationEventTypeID && window.location.pathname !== '/company/new') {
            navigate('/company/new');
        }
    }, [locationEventTypeID, navigate]);

    //Función para borrar un company. Muestra un mensaje de confirmación antes de borrar.
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
                    await companyService.delete(token, location.state?.objectID.id);
                    showSnackbar('Company deleted successfully', {
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
                    navigate('/company');
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
                const respone = isEdit ? await companyService.update(token, location.state?.objectID.id, values) : await companyService.create(token, values);
                showSnackbar(isEdit ? 'Company edited successfully!' : 'Company created successfully!', {
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
        <FormGrid 
            formik={formik} 
            name='Companies' 
            url='/company' 
            isEdit={isEdit}
            handleDelete={handleDelete}
            onSubmit={formik.handleSubmit}
            loading={loading}
            loadingDelete={loadingDelete}>
            <Grid item xs={12} md={12}>
                <FormikTextField
                    fullWidth
                    id="name"
                    label="Name"
                    name="name"
                    formik={formik}
                    />
            </Grid>
        </FormGrid>
    );
}

export default CompanyForm;