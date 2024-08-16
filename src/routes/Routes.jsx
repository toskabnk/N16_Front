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
                <Route path="/user" element={<User/>} />
                <Route path="/user/new" element={<UserForm/>} /> {/* Ruta para crear */}
                <Route path="/user/:id" element={<UserForm/>} />  {/* Ruta para editar */}

                <Route path="/teacher" element={<Teacher/>} />
                <Route path="/teacher/new" element={<TeacherForm/>} /> {/* Ruta para crear */}
                <Route path="/teacher/:id" element={<TeacherForm/>} />  {/* Ruta para editar */}
                
                <Route path="/calendarByTeacher" element={<CalendarByTeacher/>} />
                <Route path="/myCalendar" element={<MyCalendar/>} />
                <Route element={<ProtectedAdminRoutes/>}>
                    <Route path="/dashboard" element={<Dashboard/>} />
                    <Route path="/newEvent" element={<NewEvent/>} />
                    <Route path="/event" element={<SuspendEvents/>} />
                    <Route path="/eventType" element={<EventType/>} />
                    <Route path="/eventType/:id" element={<EventTypeForm/>} />
                    <Route path="/department" element={<Departments/>} />
                    <Route path="/department/:id" element={<DepartmentForm/>} />
                    <Route path="/classroom" element={<Classrooms/>} />
                    <Route path="/classroom/:id" element={<ClassroomForm/>} />
                </Route>
            </Route>
        </ReactRoutes>
    )
}

export default Routes;