import { CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import HolidaySuperAdmin from "../components/HolidayFormComponents/HolidaySuperAdmin";
import HolidayTeacher from "../components/HolidayFormComponents/HolidayTeacher";

function HolidayForm() {
    //Token de usuario
    const token = useSelector((state) => state.user.token);
    //Rol del usuario
    const role = useSelector((state) => state.user.role);

    return (
        <>
            {role ? (
                role === 'super_admin' ? (
                    <HolidaySuperAdmin token={token}/>
                ) : (
                    <HolidayTeacher token={token}/>
                )
            ) : (<CircularProgress />)}
        </>
    );
}

export default HolidayForm;