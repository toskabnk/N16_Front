import { useFormik } from "formik";
import FormGrid from "../components/FormGrid";
import { Fragment, useEffect, useState } from "react";
import { Button, Grid } from "@mui/material";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import * as Yup from "yup";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import departmentservice from "../services/departmentservice";
import FormikTextField from "../components/FormikTextField";
import Swal from "sweetalert2";

function DepartmentForm() {
    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    const navigate = useNavigate();
    const location = useLocation();
    //Loading para el LoadingButton
    const [loading, setLoading] = useState(false);
    //Loading para el botón de borrar
    const [loadingDelete, setLoadingDelete] = useState(false);
    //Estado para saber si se está editando o creando un nuevo department
    const [isEdit, setIsEdit] = useState(false);
    //ID del department que se encuentra en la ruta
    const { id } = useParams();
    //ID del eventType que se encuentra en la ubicación
    const locationDepartmentID = location.state?.objectID?.id;
    //Token de usuario
    const token = useSelector((state) => state.user.token);

    //Si hay un department en la ubicación, se carga el nombre en el formulario
    useEffect(() => {
        if (id && location.state?.objectID) {
            setIsEdit(true);
            console.log('Edit event type', id, location.state?.objectID);
            formik.setFieldValue('name', location.state?.objectID.name);
        }
    }, [id, locationDepartmentID]);

    //Si no hay un department en la ubicación, redirige a la página de creación de eventType
    useEffect(() => {
        if (!locationDepartmentID && window.location.pathname !== '/deparment/new') {
            navigate('/department/new');
        }
    }, [locationDepartmentID, navigate]);

    //Función para borrar un eventType. Muestra un mensaje de confirmación antes de borrar.
    const handleDelete = async () => {
        console.log('delete');
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
                    await departmentservice.delete(token, location.state?.objectID.id);
                    showSnackbar('Department deleted successfully', {
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
                const respone = isEdit ? await departmentservice.update(token, location.state?.objectID.id, values) : await departmentservice.create(token, values);
                showSnackbar(isEdit ? 'Department edited successfully!' : 'Department created successfully!', {
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
            loading={loading}
            name={"Departments"}
            url={"/department"}
            isEdit={isEdit}
            onSubmit={formik.handleSubmit}
            handleDelete={handleDelete}
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

export default DepartmentForm;