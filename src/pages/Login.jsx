import React, { useEffect, useState } from 'react';
import { Box, Container, FormGroup, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import FormikTextField from '../components/FormikTextField';
import { useNavigate } from 'react-router-dom';
import { addUser } from '../redux/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, IconButton } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { StyledFullCenter } from '../styles/StyledContainers';
import { login } from '../services/authService';

/**
 * Pagina de login
 * @returns {JSX.Element} Pagina de login
 */
function Login() {
  //Variables
  const [isLoading, setIsLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  //Obtener datos del store
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const role = useSelector((state) => state.user.role)

  //Dispatch para ejecutar acciones y navigate para redireccionar
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //Validacion de formulario
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().min(4, 'Must be 4 characters or more').required('Username is required'),
      password: Yup.string().min(4, 'Must be 4 characters or more').required('Password is required'),
    }),
    onSubmit: async (values) => {
      await handleLogin(values);
    }
  })

  //Funcion para iniciar sesion
  const handleLogin = async (values) => {
    //Cambia el estado del boton de submit
    setIsLoading(true);

    try {
      //Ejecuta login y obtiene los datos si se ejecuta correctamente
      const loginData = await login(values);
      console.log(loginData);
      setIsLoading(false);

      //Guarda los datos del usuario en el store
      let userData = {
        id: loginData.user.id,
        name: loginData.user.name,
        role: loginData.user.user_role,
        token: loginData.authorisation.token,
        company_id: loginData.user.company_id,
        isAuthenticated: true,
      }
      dispatch(addUser(userData));

      //Si hay un error, muestra una alerta y cambia el estado del boton de submit
    } catch (error) {
      console.error('Failed to login:', error);
      setOpenAlert(true);
      setIsLoading(false);
    }
  };

  //Redireccionar a la pagina correspondiente segun el rol del usuario
  useEffect(() => {
    if (isAuthenticated) {
      if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/myCalendar");
      }
    }
  }, [isAuthenticated]);

  return (
    <StyledFullCenter>
      <form onSubmit={formik.handleSubmit}>
        <Container
          component="main"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            bgcolor: "gray.300",
          }}
        >
          <Box
            sx={{
              bgcolor: "background.paper",
              p: 3,
              borderRadius: "5px",
              boxShadow: "2px 2px 10px gray",
              maxWidth: "sm",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Typography variant="h4" color="text.primary" align="center">
              Login
            </Typography>
            <Collapse in={openAlert} sx={{ width: "100%" }}>
              <Alert
                variant="outlined"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setOpenAlert(false);
                    }}>
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                severity="error">
                Invalid credentials
              </Alert>
            </Collapse>
            <Box sx={{ width: "100%", mt: 3 }}>
              <FormGroup>
                <FormikTextField
                  label="Username"
                  type="username"
                  id="email"
                  name="email"
                  required
                  formik={formik}
                  sx={{
                    width: "100%",
                    mt: 0.5,
                    px: 1,
                    py: 1,
                    border: "1px solid gray.300",
                    borderRadius: "5px",
                  }}
                />
              </FormGroup>
              <FormGroup>
                <FormikTextField
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  required
                  formik={formik}
                  sx={{
                    width: "100%",
                    mt: 0.5,
                    px: 1,
                    py: 1,
                    border: "1px solid gray.300",
                    borderRadius: "5px",
                  }}
                />
              </FormGroup>
              <LoadingButton
                loading={isLoading}
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Login
              </LoadingButton>
            </Box>
          </Box>
        </Container>
      </form>
    </StyledFullCenter>
  );
}

export default Login;