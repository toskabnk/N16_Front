import { Box, TextField, Paper, Typography, InputLabel, Grid, MenuItem, Select, Button, FormControl, } from '@mui/material';
import { useSelector } from "react-redux";
import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import UserService from "../services/userService";
import CompanyService from "../services/companyService";
import { useSnackbarContext } from '../providers/SnackbarWrapperProvider';
import Swal from "sweetalert2";

function UserForm() {
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    const token = useSelector((state) => state.user.token);
    const location = useLocation();
    const navigate = useNavigate();
    //id from url
    const { id } = useParams();
    //id sent from user page. Prevents accessing edit version of the page if null.
    const locationUserID = location.state?.objectID?.id;
    const [user, setUser] = useState({
        name: '',
        surname: '',
        email: '',
        user_role: '',
        company_id: '',
    });

    const [password, setPassword] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    //Loading para el botón de borrar
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [roles, setRoles] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [isNewUser, setIsNewUser] = useState(true);
    const [loading, setLoading] = useState(true);

    //redirect if location id null
    useEffect(() => {
        if (!locationUserID && window.location.pathname !== '/user/new') {
            navigate('/user/new');
        }
    }, [locationUserID, navigate]);

    useEffect(() => {
        if (token) {
            //hardcoded roles, ready to be changed to retrieved ones if needed.
            setRoles(['super_admin', 'admin', 'teacher', 'director']);
            getcompanyData();

        }
    }, [token]);



    //get user data when the page loads
    //wait for company data to prevent MUI warning
    //TO DO loading effect  
    useEffect(() => {
        const fetchData = async () => {
            try {
                const companyData = await getcompanyData();
                setCompanies(companyData);

                const objectID = location.state?.objectID ?? {};
                const validCompanyId = companyData.some(company => company.id === objectID.company_id)
                    ? objectID.company_id
                    : '';

                setUser(prevUser => ({
                    ...prevUser,
                    company_id: validCompanyId || '',
                }));


            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };

        if (id && location.state?.objectID) { //edit mode
            const { company_id, ...rest } = location.state.objectID;
            const sanitizedRest = Object.fromEntries(
                Object.entries(rest).map(([key, value]) => [key, value ?? ''])
            );
            setUser({
                ...sanitizedRest,
                company_id: '', // Inicializa company_id como vacío
            });
            setIsNewUser(false);
        } else { //create mode
            setUser({
                name: '',
                surname: '',
                email: '',
                user_role: '',
                company_id: '',
            });
            setIsNewUser(true);
        }
        fetchData();
        setLoading(false); // Finaliza la carga
    }, [id, location.state, token]);

    useEffect(() => {
        console.log('isNewUser:', isNewUser);
    }, [isNewUser]);

    async function getcompanyData() {
        try {
            const responseCompany = await CompanyService.getAll(token); // Espera la respuesta de la API
            return responseCompany.data; // Devuelve los datos obtenidos
        } catch (error) {
            console.error('Error fetching companies:', error);
            return []; // Devuelve un arreglo vacío en caso de error
        }
    }


    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPassword({
            ...password,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        event.preventDefault();
        try {
            if (isNewUser) {
                await UserService.create(token, user);
                //navigate('/user');    // TODO define if redirect
            } else {
                await UserService.update(token, id, user);
                //navigate(`/user`);    // TODO define if redirect
            }
            showSnackbar(isNewUser ? 'User created successfully!' : 'User updated successfully!', {
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
        } catch (error) {
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
    };

    //password change
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        try {
            if (password.newPassword === password.confirmPassword) {
                let values = { id: user.id, password: password.newPassword };
                await UserService.updateUserPassword(token, values.id, values);
                showSnackbar('Password updated!', {
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

            } else {
                showSnackbar('Passwords must match', {
                    variant: 'warning',
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
        }
        catch (error) {
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
    };

    //Función para borrar un user. Muestra un mensaje de confirmación antes de borrar.
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
                    await UserService.delete(token, locationUserID);
                    showSnackbar('User deleted successfully', {
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
                    navigate('/user');
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



    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Typography variant="h10" sx={{ mb: 3 }}>
                <Link to="/user" color="primary" underline="hover" style={{ textDecoration: "none" }}>
                    Users /
                </Link>

                &nbsp;{isNewUser ? 'New' : 'Edit'}
            </Typography>

            <Grid container spacing={3} sx={{ width: '100%', mt: 2 }}>
                <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'stretch' }}>
                    <Paper elevation={3} sx={{ p: 3, flex: 1 }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
                            <Typography color="primary" variant="h6" sx={{ mb: 2 }}>
                                User
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Name"
                                        type="text"
                                        name="name"
                                        value={user.name}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </FormControl>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Surname"
                                        type="text"
                                        name="surname"
                                        value={user.surname}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </FormControl>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Email"
                                        type="text"
                                        name="email"
                                        value={user.email}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </FormControl>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="userRole-select-label">User Role *</InputLabel>
                                    <Select
                                        labelId="userRole-select-label"
                                        label="User Role"
                                        name="user_role"
                                        value={user.user_role}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    >
                                        <MenuItem value="" disabled>Select a role</MenuItem>
                                        {roles.map((role) => (
                                            <MenuItem key={role} value={role}>
                                                {role}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="company-select-label">Company *</InputLabel>
                                    <Select
                                        labelId="company-select-label"
                                        label="Company"
                                        name='company_id'
                                        value={user.company_id}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    >
                                        <MenuItem value="not_set">All companies</MenuItem> {/* Opción "not_set" */}
                                        {companies.map((company) => (
                                            <MenuItem key={company.id} value={company.id}>
                                                {company.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button type="submit" variant="contained" color="primary">
                                    {isNewUser ? 'Create' : 'Save'}
                                </Button>

                                {isNewUser ? null :
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </Button>
                                }
                            </Box>

                        </Box>
                    </Paper>
                </Grid>
                {isNewUser ? null :
                    <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'stretch' }}>
                        <Paper elevation={3} sx={{ p: 3, flex: 1 }}>
                            <Box component="form" onSubmit={handlePasswordSubmit}>
                                <Typography color="primary" variant="h6" sx={{ mb: 2 }}>
                                    Reset Password
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <FormControl fullWidth>

                                        <TextField
                                            label="New password"
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            value={password.newPassword}
                                            onChange={handlePasswordChange}
                                            variant="outlined"
                                            required
                                        />
                                    </FormControl>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <FormControl fullWidth>

                                        <TextField
                                            label="Repeat new password"
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={password.confirmPassword}
                                            onChange={handlePasswordChange}
                                            variant="outlined"
                                            required
                                        />
                                    </FormControl>
                                </Box>
                                <Button type="submit" variant="contained" color="primary">
                                    Update password
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                }
            </Grid>
        </Box>
    );
}


export default UserForm;