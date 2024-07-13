import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import KpiComponent from "../components/DashboardComponents/KpiComponent";
import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import TeacherService from "../services/teacherService";
import eventService from "../services/eventService";
import SnackbarComponent from "../components/SnackbarComponent";

function Dashboard() {
    //Obtiene el token del usuario
    const token = useSelector((state) => state.user.token)

    //Estados para guardar los datos de los profesores, clases y horas de clases
    const [professorsData, setProfessorsData] = useState(null);
    const [classesData, setClassesData] = useState(null);
    const [hoursClassesData, setHoursClassesData] = useState(null);

    //Estados para indicar si los datos de los profesores y clases ya se cargaron
    const [professorsDataLoading, setProfessorsDataLoading] = useState(true);
    const [classesDataLoading, setClassesDataLoading] = useState(true);

    //Estados para mostrar el snackbar
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [severity, setSeverity] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const snackbarRef = React.createRef();

    //Se ejecuta cuando el token cambia y ejecuta las funciones para obtener los datos cuando el token no es nulo
    useEffect(() => {
        if (token) {
            getProfesorData();
            getClassesData();
        }
    }, [token]);

    /**
     * Obtiene los datos de los profesores
     */
    const getProfesorData = async () => {
        try {
            //Obtiene todos los profesores
            const response = await TeacherService.getAll(token);
            
            //Guarda los profesores en el estado
            setProfessorsData(response.data);
            
            //Indica que los datos ya se cargaron
            setProfessorsDataLoading(false);
            
            console.log(response);
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Something went wrong, please try again later');
            setSeverity('error');
            setShowSnackBar(true);
        }
    }

    /**
     * Obtiene los datos de las clases del día actual y calcula las horas totales de las clases
     */
    const getClassesData = async () => {
        try {
            //Obtiene los eventos del día actual
            const queryParams = { by_teacher: '' };
            const response = await eventService.getEventsWithFilters(token, queryParams);

            //Guarda los eventos en el estado
            setClassesData(response.data);

            //Calcula las horas totales de las clases
            let totalHours = 0;
            for (const item of response.data) {
                totalHours += calculateHours(item.start_date, item.end_date);
            }
            //Añade la unidad de medida
            const totalHoursString = `${totalHours}h`;

            //Guarda las horas totales en el estado
            setHoursClassesData(totalHoursString);

            //Indica que los datos ya se cargaron
            setClassesDataLoading(false);
            
            console.log(response);
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Something went wrong, please try again later');
            setSeverity('error');
            setShowSnackBar(true);
        }
    }

    /**
     * Calcula la diferencia en horas entre dos fechas
     * @param {*} start_date Fecha de inicio
     * @param {*} end_date Fecha de fin
     * @returns {number} Diferencia en horas
     */
    function calculateHours(start_date, end_date) {
        const start = new Date(start_date);
        const end = new Date(end_date);
        //Calcula la diferencia en milisegundos
        const differenceInMilliseconds = end - start;
        //Convierte la diferencia en horas
        const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
        return differenceInHours;
    }

    //Función para cerrar el snackbar
    const handleCloseSnackbar = () => {
        setShowSnackBar(false);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                    <Box       
                        display="flex"
                        alignItems="center"
                        gap={4}
                        p={2}>
                            <h3>Welcome to Dashboard</h3>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <KpiComponent display="Teachers" data={ professorsDataLoading ? 0 : professorsData.length } loading={professorsDataLoading} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <KpiComponent display="Classes Today" data={ classesDataLoading ? 0 : classesData.length } loading={classesDataLoading} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <KpiComponent display="Classes Today" data={ classesDataLoading ? 0 : hoursClassesData } loading={classesDataLoading} />
                </Grid>
            </Grid>
            <SnackbarComponent
            ref={snackbarRef}
            open={showSnackBar}
            message={snackbarMessage}
            severity={severity}
            handleClose={handleCloseSnackbar}/>
        </Box>
    );
}

export default Dashboard;