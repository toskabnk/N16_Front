import { Box, TextField, Paper, Typography, InputLabel, Grid, MenuItem, Select, Button, FormControl, FormLabel, FormHelperText, InputAdornment, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { HexColorPicker } from 'react-colorful';
import { useSelector } from "react-redux";
import React, { useEffect, useState, Fragment, } from "react";
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import TeacherService from "../services/teacherService";
import CompanyService from "../services/companyService";
import { useSnackbarContext } from '../providers/SnackbarWrapperProvider';
import Swal from "sweetalert2";

const getBrightness = (hexColor) => {
    // Eliminar el símbolo '#'
    let color = hexColor.replace('#', '');
    if (color.length === 3) {
        color = color.split('').map(c => c + c).join('');
    }
    // Convertir el color a componentes RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Calcular el brillo
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};


const isValidHex = (hex) => {
    // color hex 
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
};


function TeacherForm() {
    //Token
    const token = useSelector((state) => state.user.token);
    //Hooks
    const location = useLocation();
    const navigate = useNavigate();
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    //id from url
    const { id } = useParams();
    //id sent from teacher page. Prevents accessing edit version of the page if null.
    const locationTeacherID = location.state?.objectID?.id;

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
    const [isNewTeacher, setIsNewTeacher] = useState(true);
    const [showMainColorPicker, setShowMainColorPicker] = useState(false);
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [colour_set, setColour] = useState(false);
    const [text_colour_set, settext_colour] = useState(false);
    const [colourmissing, setColourMissing] = useState(false);
    const [loading, setLoading] = useState(true);
    //redirect if location id null
    useEffect(() => {
        if (!locationTeacherID && window.location.pathname !== '/teacher/new') {
            navigate('/teacher/new');
        }
    }, [locationTeacherID, navigate]);



    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtiene los datos de la compañía
                const companyData = await getcompanyData();
                setCompanies(companyData);
                const objectID = location.state?.objectID ?? {};

                // Valida si el company_id del objeto es válido
                const validCompanyId = companyData.some(company => company.id === objectID.company_id)
                    ? objectID.company_id
                    : '';

                // Actualiza el estado de teacher solo con las propiedades necesarias
                setTeacher(prevTeacher => ({
                    ...prevTeacher,
                    company_id: validCompanyId || 'not_set',
                }));

            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };

        setRoles(['super_admin', 'admin', 'teacher', 'director']); // Establece los roles

        // Modo edición
        if (id && location.state?.objectID) {
            const { company_id, ...rest } = location.state.objectID;
            //saneamos el rest para quitar null values
            const sanitizedRest = Object.fromEntries(
                Object.entries(rest).map(([key, value]) => [key, value ?? ''])
            );
            setTeacher({
                ...sanitizedRest,
                company_id: '', // Inicializa company_id como vacío
            });



            setIsNewTeacher(false);
        } else { // Modo creación
            // Establece teacher con valores predeterminados
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
        fetchData(); // Obtiene y valida company_id
        setLoading(false); // Finaliza la carga
    }, [id, location.state, token]);
    // Función para obtener los datos de las compañías
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
        setTeacher({
            ...teacher,
            [e.target.name]: e.target.value,
        });
    };

    const handleColorChange = (colorType) => (color) => {
        // Asegurarse de que el color comience con '#'
        let updatedColor = color;
        if (updatedColor && !updatedColor.startsWith('#')) {
            updatedColor = `#${updatedColor}`;
        }
        // Limitar a 7 caracteres (incluyendo '#')
        updatedColor = updatedColor.slice(0, 7);
        setTeacher({
            ...teacher,
            [colorType]: updatedColor,
        });

        // Validar el color hex
        if (isValidHex(updatedColor)) {
   
            if (colorType === 'colour' && updatedColor !== '') {
                setColour(true);
            }
    
            if (colorType === 'text_colour' && updatedColor !== '') {
                settext_colour(true);
            }
        } else {
            // Manejar el caso en que el color no es válido
            if (colorType === 'colour') {
                setColour(false);
            }
    
            if (colorType === 'text_colour') {
                settext_colour(false);
            }
        }
    };
    

    //Función para borrar un teacher. Muestra un mensaje de confirmación antes de borrar.
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
                    await TeacherService.delete(token, locationTeacherID);
                    showSnackbar('Teacher deleted successfully', {
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
                    navigate('/teacher');
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



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!teacher.colour || !teacher.text_colour) {
            setColourMissing(true);
            showSnackbar('Please, select bot colors', { //TODO mostrar mensaje en los color pickers
                variant: 'error',
                autoHideDuration: 6000,
                action: (key) => (
                    <Fragment>
                        <Button size='small' onClick={() => closeSnackbarGlobal(key)}>
                            Dismiss
                        </Button>
                    </Fragment>
                ),
            });
            return;
        }

        try {
            const{ company_name, ...cleanTeacher}=teacher;
            if (isNewTeacher) {
                await TeacherService.create(token, cleanTeacher);
                //navigate('/teacher');    // TODO define if redirect
            } else {
                await TeacherService.update(token, id, cleanTeacher);
                //navigate(`/teacher`);    // TODO define if redirect
            }
            showSnackbar(isNewTeacher ? 'Teacher created successfully!' : 'Teacher updated successfully!', {
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

    const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Typography variant="h10" sx={{ mb: 3 }}>
                <Link to="/teacher" color="primary" underline="hover" style={{ textDecoration: "none" }}>
                    Teachers /
                </Link>

                &nbsp;{isNewTeacher ? 'New' : 'Edit'}
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
                                {(colourmissing && !colour_set) && (
                                    <FormHelperText sx={{ color: 'red' }}> Please select a colour</FormHelperText>
                                )}

                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Box
                                        sx={{
                                            mt: 2,
                                            height: 40,
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: teacher.colour,
                                            borderRadius: 1,
                                            border: '1px solid #ccc',
                                            cursor: 'pointer',
                                            flex: 1, // Ocupa todo el espacio disponible
                                            mr: 1, // Margen a la derecha para separar del botón
                                        }}
                                        onClick={() => setShowMainColorPicker(!showMainColorPicker)} // Despliega el color picker al hacer clic
                                    >
                                        <TextField
                                            variant="outlined"
                                            size="small"
                                            value={teacher.colour ? teacher.colour.toUpperCase() : ''}
                                            onChange={(e) => handleColorChange('colour')(e.target.value)}
                                            onFocus={(e) => e.target.select()}
                                            inputProps={{ maxLength: 7 }} // Limita la entrada a 7 caracteres
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography sx={{ color: !isValidHex(teacher.colour) ? '#000' : (getBrightness(teacher.colour) < 0.5 ? '#fff' : '#000') }}>
                                                            Hex:
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                width: '150px',
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                input: {
                                                    color: !isValidHex(teacher.colour) ? '#000' : (getBrightness(teacher.colour) < 0.5 ? '#fff' : '#000'),
                                                    fontWeight: 'bold',
                                                    padding: 0,
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    border: 'none',
                                                },
                                            }}
                                        />
                                    </Box>

                                    {/* Botón para copiar */}
                                    <IconButton
                                        onClick={() => handleCopyToClipboard(teacher.colour)}
                                        edge="end"
                                        sx={{
                                            height: 40, // Asegúrate de que el botón tenga la misma altura que el TextField
                                            color: '#000',
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: 1,
                                            border: '1px solid #ccc',
                                            mt: 2,
                                            mr: 1
                                        }}
                                    >
                                        <ContentCopyIcon />
                                    </IconButton>
                                </Box>

                                {showMainColorPicker && (
                                    <FormControl fullWidth>
                                        <HexColorPicker
                                            style={{ width: '100%', marginTop: 4 }}
                                            color={teacher.colour}
                                            onChange={handleColorChange('colour')}
                                        />
                                    </FormControl>
                                )}
                            </Box>


                            {/* Text Color Picker */}
                            <Box sx={{ mb: 2 }}>
                                <FormLabel component="legend">Text Color</FormLabel>
                                {(colourmissing && !text_colour_set) && (
                                    <FormHelperText sx={{ color: 'red' }}> Please select a colour</FormHelperText>
                                )}

                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Box
                                        sx={{
                                            mt: 2,
                                            height: 40,
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: teacher.text_colour,
                                            borderRadius: 1,
                                            border: '1px solid #ccc',
                                            cursor: 'pointer',
                                            flex: 1, // Ocupa todo el espacio disponible
                                            mr: 1, // Margen a la derecha para separar del botón
                                        }}

                                        onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                                    >
                                        <TextField
                                            variant="outlined"
                                            size="small"
                                            value={teacher.text_colour ? teacher.text_colour.toUpperCase() : ''}
                                            onChange={(e) => handleColorChange('text_colour')(e.target.value)}
                                            onFocus={(e) => e.target.select()}
                                            inputProps={{ maxLength: 7 }} // Limita la entrada a 7 caracteres
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography sx={{ color: !isValidHex(teacher.text_colour) ? '#000' : (getBrightness(teacher.text_colour) < 0.5 ? '#fff' : '#000') }}>
                                                            Hex:
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                width: '150px',
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                input: {
                                                    color: !isValidHex(teacher.text_colour) ? '#000' : (getBrightness(teacher.text_colour) < 0.5 ? '#fff' : '#000'), //si el color no es valido, el box es blanco asi que fijamos el texto negro. Si es valido calculamos el brillo para que se pueda leer en B o N.
                                                    fontWeight: 'bold',
                                                    padding: 0,
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    border: 'none',
                                                }
                                            }}
                                        />
                                    </Box>

                                    {/* Botón para copiar */}
                                    <IconButton
                                        onClick={() => handleCopyToClipboard(teacher.text_colour)}
                                        edge="end"
                                        sx={{
                                            height: 40, // Asegúrate de que el botón tenga la misma altura que el TextField
                                            color: '#000',
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: 1,
                                            border: '1px solid #ccc',
                                            mt: 2,
                                            mr: 1

                                        }}
                                    >
                                        <ContentCopyIcon />
                                    </IconButton>
                                </Box>
                                {showTextColorPicker && (
                                    <FormControl fullWidth>
                                        <HexColorPicker
                                            style={{ width: '100%', marginTop: 4 }}
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
                                    {isNewTeacher ? 'Create' : 'Save'}
                                </Button>
                                {!isNewTeacher && (
                                    <Button
                                        variant="contained"
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
            </Grid>
        </Box >
    );
}


export default TeacherForm;