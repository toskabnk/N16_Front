import { Box, TextField, Paper, Typography, InputLabel, Grid, MenuItem, Select, Button, FormControl, FormLabel,  } from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { useSelector } from "react-redux";
import React, { useEffect, useState, useRef, } from "react";
import { useNavigate, useLocation, useParams, Link} from 'react-router-dom';
import TeacherService from "../services/teacherService";

import CompanyService from "../services/companyService";
import SnackbarComponent from "../components/SnackbarComponent";

function TeacherForm() {

    const token = useSelector((state) => state.user.token);
    const location = useLocation();
    const navigate = useNavigate();
    //id from url
    const { id } = useParams();
    //id sent from teacher page. Prevents accessing edit version of the page if null.
    const locationTeacherID = location.state?.teacher?.id;

    const [teacher, setTeacher] = useState({
        name: '',
        surname: '',
        email: '',
        start_date: '',
        leave_date: '',
        colour: '',
        text_colour: '',
        start_hours: '',
        contract_hours: '',
        company_id: '',
        user_role: '',
    });


    const [roles, setRoles] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [isNewTeacher, setIsNewTeacher] = useState(!id);
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [severity, setSeverity] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [showMainColorPicker, setShowMainColorPicker] = useState(false);
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const snackbarRef = useRef();
    //redirect if location id null
    useEffect(() => {
        if (!locationTeacherID && window.location.pathname !== '/teacher/new') {
            navigate('/teacher/new');
        }
    }, [locationTeacherID, navigate]);

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
        if (id && location.state?.teacher) { //edit mode
            setTeacher(location.state.teacher);
            setIsNewTeacher(false);
        } else if (!id) { //create mode
            setTeacher({
                name: '',
                surname: '',
                email: '',
                start_date: '',
                leave_date: '',
                colour: '',
                text_colour: '',
                start_hours: '',
                contract_hours: '',
                company_id: '',
                user_role: '',
            });
            setIsNewTeacher(true);
        }
    }, [id, location.state]);


    const handleChange = (e) => {
        setTeacher({
            ...teacher,
            [e.target.name]: e.target.value,
        });
        console.log(teacher)
    };

    const handleColorChange = (colorType) => (color) => {
        setTeacher({
            ...teacher,
            [colorType]: color,
        });
    };

    const handleDelete = async () => {
        try {
            console.log(token, teacher.id)
            await TeacherService.delete(token, teacher.id); 
            //navigate('/teacher');
        } catch (error) {
            setSeverity('error');
            setSnackbarMessage('An error occurred while deleting the teacher.');
            setShowSnackBar(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!teacher.colour || !teacher.text_colour) {
            setSeverity('error');
            setSnackbarMessage('Please select both colors.');
            setShowSnackBar(true);
            return;
        }

        try {
            if (isNewTeacher) {
                await TeacherService.create(token, teacher);
                //navigate('/teacher');    // TODO define if redirect
            } else {
                await TeacherService.update(token, id, teacher);
                //navigate(`/teacher`);    // TODO define if redirect
            }
            setSeverity('success');
            setSnackbarMessage(isNewTeacher ? 'Teacher created successfully!' : 'Teacher updated successfully!');
        } catch (error) {
            setSeverity('error');
            setSnackbarMessage('An error occurred, please try again.');
        } finally {
            setShowSnackBar(true);
        }
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Typography variant="h10" sx={{ mb: 3 }}>
                <Link to="/teacher" color="primary" underline="hover">
                    Teachers
                </Link>

                {isNewTeacher ? '/new' : '/edit'}
            </Typography>

            <Grid container spacing={3} sx={{ width: '100%', mt: 2 }}>
                <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'stretch' }}>
                    <Paper elevation={3} sx={{ p: 3, flex: 1 }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
                            <Typography color="primary" variant="h6" sx={{ mb: 2 }}>
                                Teacher
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Name"
                                        type="text"
                                        name="name"
                                        value={teacher.name}
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
                                        value={teacher.surname}
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
                                        value={teacher.email}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </FormControl>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Start Date"
                                        type="date"
                                        name="start_date"
                                        value={teacher.start_date}
                                        onChange={handleChange}
                                        variant="outlined"
                                        InputLabelProps={{
                                            shrink: true, // Esto fuerza a que el label esté siempre encogido
                                        }}
                                    />
                                </FormControl>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Leave Date"
                                        type="date"
                                        name="leave_date"
                                        value={teacher.leave_date}
                                        onChange={handleChange}
                                        variant="outlined"
                                        InputLabelProps={{
                                            shrink: true, // Esto fuerza a que el label esté siempre encogido
                                        }}
                                    />
                                </FormControl>
                            </Box>


                            {/* Main Color Picker */}
                            <Box sx={{ mb: 2 }}>
                                <FormLabel component="legend">Main Color</FormLabel>
                                <Box
                                    sx={{
                                        mt: 2,
                                        height: 40,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'left',
                                        pl: 2,
                                        backgroundColor: teacher.colour,
                                        borderRadius: 1,
                                        border: '1px solid #ccc',
                                        cursor: 'pointer',
                                        mb: 2,
                                    }}
                                    onClick={() => setShowMainColorPicker(!showMainColorPicker)}
                                >
                                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                                        Hex: {teacher.colour ? teacher.colour.toUpperCase() : ''}
                                    </Typography>
                                </Box>
                                {showMainColorPicker && (
                                    <FormControl fullWidth>
                                        <HexColorPicker
                                            color={teacher.colour}
                                            onChange={handleColorChange('colour')}
                                        />
                                    </FormControl>
                                )}
                            </Box>

                            {/* Text Color Picker */}
                            <Box sx={{ mb: 2 }}>
                                <FormLabel component="legend">Text Color</FormLabel>
                                <Box
                                    sx={{
                                        mt: 2,
                                        height: 40,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'left',
                                        pl: 2,
                                        backgroundColor: teacher.text_colour,
                                        borderRadius: 1,
                                        border: '1px solid #ccc',
                                        cursor: 'pointer',
                                        mb: 2,
                                    }}
                                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                                >
                                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                                        Hex: {teacher.text_colour ? teacher.text_colour.toUpperCase() : ''}
                                    </Typography>
                                </Box>
                                {showTextColorPicker && (
                                    <FormControl fullWidth>
                                        <HexColorPicker
                                            color={teacher.text_colour}
                                            onChange={handleColorChange('text_colour')}
                                        />
                                    </FormControl>
                                )}
                            </Box>


                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Start Hours"
                                        type="number"
                                        name="start_hours"
                                        value={teacher.start_hours}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </FormControl>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Contract Hours"
                                        type="number"
                                        name="contract_hours"
                                        value={teacher.contract_hours}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </FormControl>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="company-select-label">Company *</InputLabel>
                                    <Select
                                        labelId="company-select-label"
                                        label="Company"
                                        name='company_id'
                                        value={teacher.company_id}
                                        onChange={handleChange}
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
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button type="submit" variant="contained" color="primary">
                                    {isNewTeacher ? 'Create' : 'Save'}
                                </Button>
                                {!isNewTeacher && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </Box>
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


export default TeacherForm;