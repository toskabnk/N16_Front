import { Routes as ReactRoutes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Home from '../pages/Home'
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import ProtectedAdminRoutes from './ProtectedAdminRoutes';
import CalendarByClassroom from '../pages/CalendarByClassroom';
import CalendarByTeacher from '../pages/CalendarByTeacher';

/**
 * Rutas de la aplicacion
 * @returns {JSX.Element} Rutas de la aplicacion
 */
const Routes = () => {
    return (
        <ReactRoutes>
            {/* Rutas publicas */}
            <Route path="/login" element={<Login />} />
            {/* Rutas protegidas */}
            <Route  element={<ProtectedRoute/>} >
                <Route path="/" element={<Home/>} />
                <Route path="/calendar" element={<CalendarByClassroom/>} />
                <Route path="/calendarByTeacher" element={<CalendarByTeacher/>} />
                <Route  element={<ProtectedAdminRoutes/>}>
                    <Route path="/dashboard" element={<Dashboard/>} />
                </Route>
            </Route>
        </ReactRoutes>
    )
}

export default Routes;