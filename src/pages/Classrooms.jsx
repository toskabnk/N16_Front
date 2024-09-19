import { useSelector } from "react-redux";
import ListDataGrid from "../components/ListDataGrid";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import { Fragment, useEffect, useState } from "react";
import classroomService from "../services/classroomService";
import { Button } from "@mui/material";

function Classrooms() {
    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    //Token
    const token = useSelector((state) => state.user.token);
    //Row data for the table
    const [rows, setRows] = useState([]);
    //Columns for the table
    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Name', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'order', headerName: 'Order', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'company', headerName: 'Company', flex: 1, resizable: true, overflow: 'hidden' },
    ]);
    //Loading state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(token){
            getClassrooms();
        }
    }
    , [token]);

    const getClassrooms = async () => {
        try {
            const queryParams = {
                company_id: '',
            };
            const response = await classroomService.getClassroomWithFilters(token, queryParams);
            //Transforma los datos para que el id sea el _id
            const transformedData = response.data.map((classroom) => ({
                ...classroom,
                id: classroom._id,
                company: classroom.company ? classroom.company.name : '',
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
        name="Classrooms"
        subname="List"
        url="/classroom"
        buttonName="New Classroom"
        loading={loading}
        sort={
            {
              field: 'order',
              sort: 'asc', 
            }
        }
    />
    );
}

export default Classrooms;