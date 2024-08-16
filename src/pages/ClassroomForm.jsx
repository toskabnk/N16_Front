import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FormGrid from "../components/FormGrid";
import ClassroomService from "../services/classroomService";
import { Autocomplete, Button, CircularProgress, Grid, TextField } from "@mui/material";
import FormikTextField from "../components/FormikTextField";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import companyService from "../services/companyService";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

function ClassroomForm(){
    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    const navigate = useNavigate();
    const location = useLocation();
    //Estado para las compañias
    const [companies, setCompanies] = useState([]);
    const [companyValue, setCompanyValue] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    //Loading states
    const [loading, setLoading] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    //Estado para saber si se está editando o creando un nuevo department
    const [isEdit, setIsEdit] = useState(false);
    //ID del department que se encuentra en la ruta
    const { id } = useParams();
    //ID del eventType que se encuentra en la ubicación
    const locationDepartmentID = location.state?.objectID?.id;
    //Token de usuario
    const token = useSelector((state) => state.user.token);

    //Si hay un classroom en la ubicación, se cargan los datos en el formulario
    useEffect(() => {
        if (id && location.state?.objectID) {
            setIsEdit(true);
            console.log('Edit event type', id, location.state?.objectID);
            formik.setFieldValue('name', location.state?.objectID.name);
            formik.setFieldValue('capacity', location.state?.objectID.capacity);
            formik.setFieldValue('order', location.state?.objectID.order);

        }
    }, [id, locationDepartmentID]);

    //Si las compañias se cargan y estamos editando, se selecciona la compañia del classroom si es que tiene
    useEffect(() => {
        if(companies.length > 0 && isEdit){
            formik.setFieldValue('company_id', location.state?.objectID.company_id);
            setSelectedCompany(companies.find(company => company.id === location.state?.objectID.company_id));
            setCompanyValue(companies.find(company => company.id === location.state?.objectID.company_id)?.name);
        }
    }, [companies, isEdit]);

    //Si no hay un classroom en la ubicación, redirige a la página de creación de eventType
    useEffect(() => {
        if (!locationDepartmentID && window.location.pathname !== '/classroom/new') {
            navigate('/classroom/new');
        }
    }, [locationDepartmentID, navigate]);

    //Obtiene las compañias al cargar la página
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

    //Función para borrar un classroom. Muestra un mensaje de confirmación antes de borrar.
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
                    await ClassroomService.delete(token, location.state?.objectID.id);
                    showSnackbar('Classroom deleted successfully', {
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
                    navigate('/classroom');
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

    const formik = useFormik({
        initialValues: {
            name: '',
            company_id: '',
            capacity: '',
            order: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Name is required'),
            company_id: Yup.string().required('Company is required'),
            order: Yup.number().required('Order is required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            console.log('values', values);
            try {
                //Si se está editando, se llama a la función de update, si no, se llama a la función de create
                const respone = isEdit ? await ClassroomService.update(token, location.state?.objectID.id, values) : await ClassroomService.create(token, values);
                showSnackbar(isEdit ? 'Classroom edited successfully!' : 'Department created successfully!', {
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
            name={"Classrooms"}
            url={"/classroom"}
            isEdit={isEdit}
            onSubmit={formik.handleSubmit}
            handleDelete={handleDelete}
            loadingDelete={loadingDelete}>
                {/* TextField Name */}
                <Grid item xs={12} md={12}>
                <FormikTextField
                    fullWidth
                    id="name"
                    label="Name"
                    name="name"
                    formik={formik}
                    />
                {/* Autocomplete Companies */}
                <Grid item xs={12} md={12}>
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
                {/* NumberField Capacity */}
                <FormikTextField
                    fullWidth
                    id="capacity"
                    label="Capacity"
                    name="capacity"
                    type="number"
                    formik={formik}
                    />
                {/* NumberField Order */}
                <FormikTextField
                    fullWidth
                    id="order"
                    label="Order"
                    name="order"
                    type="number"
                    formik={formik}
                    />
            </Grid>
        </FormGrid>

    );
}

export default ClassroomForm;