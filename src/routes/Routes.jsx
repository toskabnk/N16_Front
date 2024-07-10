import { Routes as ReactRoutes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Home from '../pages/Home'
import ProtectedRoute from './ProtectedRoute';

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
            </Route>
        </ReactRoutes>
    )
}

export default Routes;