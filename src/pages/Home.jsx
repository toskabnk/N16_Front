import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    const role = useSelector((state) => state.user.role);

    useEffect(() => {
        if(role){
            if(role !== 'teacher'){
                navigate('/dashboard');
            } else {
                navigate('/myCalendar');
            }
        }
    }, [role, navigate]);

    return (
        <>
        </>
    )
}

export default Home;