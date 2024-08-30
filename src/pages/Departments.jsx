import { Button } from "@mui/material";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import ListDataGrid from "../components/ListDataGrid";
import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import departmentservice from "../services/departmentservice";

function Departments() {
    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    //Token
    const token = useSelector((state) => state.user.token);
    //Row data for the table
    const [rows, setRows] = useState([]);
    //Columns for the table
    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Name', flex: 1, resizable: true, overflow: 'hidden' },
    ]);
    //Loading state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(token){
            getDepartments();
        }
    }, [token]);

    const getDepartments = async () => {
        try {
            const response = await departmentservice.getAll(token);
            //Transforma los datos para que el id sea el _id
            const transformedData = response.data.map((department) => ({
                ...department,
                id: department._id,
            }));
            setRows(transformedData);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
            showSnackbar('Something went wrong, please try again later.', {
                variant: 'error',
                autoHideDuration: 6000,
                action: (key) => (
                    <Fragment>
                        <Button
                            size='small'
                            onClick={() => alert(`Error: ${error.message}`)}
                        >
                            Detail
                        </Button>
                        <Button size='small' onClick={() => closeSnackbarGlobal(key)}>
                            Dismiss
                        </Button>
                    </Fragment>
                ),
            });
        }
    }

    return (
        <ListDataGrid
            rows={rows}
            columns={columns}
            name="Departments"
            subname="List"
            url="/department"
            buttonName="New Department"
            loading={loading}
        />
    );
}

export default Departments;