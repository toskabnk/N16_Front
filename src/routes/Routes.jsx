import { Routes as ReactRoutes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Home from '../pages/Home'
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import ProtectedAdminRoutes from './ProtectedAdminRoutes';
import CalendarByClassroom from '../pages/CalendarByClassroom';
import CalendarByTeacher from '../pages/CalendarByTeacher';
import MyCalendar from '../pages/MyCalendar';
import NewEvent from '../pages/NewEvent';
import User from '../pages/User.jsx';
import UserForm from '../pages/UserForm.jsx';
import SuspendEvents from '../pages/SuspendEvents.jsx';
import EventType from '../pages/EventType.jsx';
import EventTypeForm from '../pages/EventTypeForm.jsx';
import Teacher from '../pages/Teacher.jsx';
import TeacherForm from '../pages/TeacherForm.jsx';
import Departments from '../pages/Departments.jsx';
import DepartmentForm from '../pages/DepartmentForm.jsx';
import Classrooms from '../pages/Classrooms.jsx';
import ClassroomForm from '../pages/ClassroomForm.jsx';
import Companies from '../pages/Companies.jsx';
import CompanyForm from '../pages/CompanyForm.jsx';
import TeachingHours from '../pages/TeachingHours.jsx';
import Logs from '../pages/Logs.jsx';
import EventLogs from '../pages/EventLogs.jsx';
import Holidays from '../pages/Holidays.jsx';
import HolidayForm from '../pages/HolidayForm.jsx';
import ErrorBoundaryWrapper from '../components/ErrorBoundary/ErrorBoundaryWrapper.jsx';
import ProtectedSuperAdminRoutes from './ProtectedSuperAdminRoutes.jsx';
import ProtectedTeacherRoutes from './ProtectedTeacherRoutes.jsx';
import ProtectedHolidayRoutes from './ProtectedHolidayRoutes.jsx';
import ProtectedCompanyRoutes from './ProtectedCompanyRoutes.jsx';
import NotFound from '../pages/NotFound.jsx';

/**
 * Rutas de la aplicacion
 * @returns {JSX.Element} Rutas de la aplicacion
 */
const Routes = () => {
    return (
        <ErrorBoundaryWrapper>
            <ReactRoutes>
                {/* Rutas publicas */}
                <Route path="/login" element={<Login />} />
                {/* Rutas protegidas */}
                <Route  element={<ProtectedRoute/>} >
                    <Route path="/" element={<Home/>} />
                    <Route path="/calendar" element={<CalendarByClassroom/>} />
                    {/* Rutas para teacher y super_admin */}
                    <Route element={<ProtectedHolidayRoutes/>}>
                        <Route path="/holiday" element={<Holidays/>} />
                        <Route path="/holiday/:id" element={<HolidayForm/>} />
                    </Route>
                    {/* Rutas solo para teacher */}
                    <Route element={<ProtectedTeacherRoutes/>}>
                        <Route path="/myCalendar" element={<MyCalendar/>} />
                    </Route>
                    {/* Rutas solo para admin y super_admin */}
                    <Route element={<ProtectedCompanyRoutes/>}>
                        <Route path="/dashboard" element={<Dashboard/>} />
                        <Route path="/teachingHours" element={<TeachingHours/>} />
                        <Route path="/calendarByTeacher" element={<CalendarByTeacher/>} />
                        <Route element={<ProtectedCompanyRoutes/>}>
                            <Route path="/newEvent" element={<NewEvent/>} />
                        </Route>
                    </Route>
                    {/* Rutas solo para super_admin */}
                    <Route element={<ProtectedSuperAdminRoutes/>}>
                        <Route path="/event" element={<SuspendEvents/>} />
                        <Route path="/eventType" element={<EventType/>} />
                        <Route path="/eventType/:id" element={<EventTypeForm/>} />
                        <Route path="/department" element={<Departments/>} />
                        <Route path="/department/:id" element={<DepartmentForm/>} />
                        <Route path="/classroom" element={<Classrooms/>} />
                        <Route path="/classroom/:id" element={<ClassroomForm/>} />
                        <Route path="/company" element={<Companies/>} />
                        <Route path="/company/:id" element={<CompanyForm/>} />
                        <Route path="/user" element={<User/>} />
                        <Route path="/user/:id" element={<UserForm/>} />  {/* Ruta para editar */}
                        <Route path="/teacher" element={<Teacher/>} />
                        <Route path="/teacher/:id" element={<TeacherForm/>} />  {/* Ruta para editar */}
                        <Route path="/logs" element={<Logs/>} />
                        <Route path="/event-logs" element={<EventLogs/>} />
                    </Route>
                <Route path="*" element={<NotFound/>} />    
                </Route>
            </ReactRoutes>
        </ErrorBoundaryWrapper>
    )
}

export default Routes;