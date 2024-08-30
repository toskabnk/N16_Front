import {useSelector} from "react-redux"
import {Navigate, Outlet, useLocation} from "react-router-dom"

/**
 * Protege las rutas de la aplicacion en la que necesitas ser administrador
 * @param {Object} children Componentes hijos
 * @returns {JSX.Element} Ruta protegida
 */
const ProtectedCompanyRoutes = ({children}) => {
    //Obtener datos del store
    const user = useSelector((state) => state.user);
    let location = useLocation();

    //Si el usuario no es administrador redirige a la pagina principal
    if(user.role !== "admin" && user.role !== "super_admin" && user.role !== "director") {
        return <Navigate to="/" state={{ from: location}} replace />
    }
    return children ? children : <Outlet />;
};

export default ProtectedCompanyRoutes;