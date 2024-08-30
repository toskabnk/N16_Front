import {useSelector} from "react-redux"
import {Navigate, Outlet, useLocation} from "react-router-dom"

/**
 * Protege las rutas de la aplicacion en la que necesitas ser profesor
 * @param {Object} children Componentes hijos
 * @returns {JSX.Element} Ruta protegida
 */
const ProtectedTeacherRoutes = ({children}) => {
    //Obtener datos del store
    const user = useSelector((state) => state.user);
    let location = useLocation();

    //Si el usuario no es administrador redirige a la pagina principal
    if(user.role !== "teacher") {
        return <Navigate to="/dashboard" state={{ from: location}} replace />
    }
    return children ? children : <Outlet />;
};

export default ProtectedTeacherRoutes;