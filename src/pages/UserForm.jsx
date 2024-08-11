import { Box, TextField, Paper, Typography, InputLabel, Grid, MenuItem, Select, Button, FormControl, Link } from '@mui/material';
import { useSelector } from "react-redux";
import React, { useEffect, useState, useRef, } from "react";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import UserService from "../services/userService";

import CompanyService from "../services/companyService";
import SnackbarComponent from "../components/SnackbarComponent";

function UserForm() {

    const token = useSelector((state) => state.user.token);
    const location = useLocation();
    const navigate = useNavigate();
    //id from url
    const { id } = useParams();
    //id sent from user page. Prevents accessing edit version of the page if null.
    const locationUserID = location.state?.user?.id;

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

    const [roles, setRoles] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [isNewUser, setIsNewUser] = useState(!id);
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [severity, setSeverity] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const snackbarRef = useRef();
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

    const getcompanyData = async () => {
        try {
            const responseCompany = await CompanyService.getAll(token);
            console.log(responseCompany.data)
            setCompanies(responseCompany.data);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    useEffect(() => {
        if (id && location.state?.user) { //edit mode
            setUser(location.state.user);
            setIsNewUser(false);
        } else if (!id) { //create mode
            setUser({
                name: '',
                surname: '',
                email: '',
                user_role: '',
                company_id: '',
            });
            setIsNewUser(true);
        }
    }, [id, location.state]);


    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
        console.log(user)
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
            setSeverity('success');
            setSnackbarMessage(isNewUser ? 'User created successfully!' : 'User updated successfully!');
        } catch (error) {
            setSeverity('error');
            setSnackbarMessage('An error occurred, please try again.');
        } finally {
            setShowSnackBar(true);
        }
    };

    //password change
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        try {
            if (password.newPassword === password.confirmPassword) {
                let values = { id: user.id, password: password.newPassword };
                await UserService.updateUserPassword(token, values.id, values);
                setSeverity('success');
                setSnackbarMessage('Password updated!');

            } else {
                setSeverity('warning');
                setSnackbarMessage('Passwords must match');
            }
        }
        catch (error) {
            setSeverity('error');
            setSnackbarMessage('An error occurred, please try again.');
        } finally {
            setShowSnackBar(true);
        }
    };


    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Typography variant="h10" sx={{ mb: 3 }}>
                <Link href="/user" color="primary" underline="hover">
                    Users
                </Link>

                {isNewUser ? '/new' : '/edit'}
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
                                        <MenuItem value="" disabled>Select a company</MenuItem>
                                        {companies.map((company) => (
                                            <MenuItem key={company.id} value={company.id}>
                                                {company.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Button type="submit" variant="contained" color="primary">
                                {isNewUser ? 'Create' : 'Save'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

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

                {/* Snackbar Component */}
                <SnackbarComponent
                    ref={snackbarRef}
                    open={showSnackBar}
                    severity={severity}
                    message={snackbarMessage}
                    onClose={() => setShowSnackBar(false)}
                />
            </Grid>
        </Box>
    );
}


export default UserForm;