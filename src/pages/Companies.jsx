import { useSelector } from "react-redux";
import ListDataGrid from "../components/ListDataGrid";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import { Fragment, useEffect, useState } from "react";
import { Button } from "@mui/material";
import CompanyService from "../services/companyService";
import { set } from "lodash";

function Companies() {
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

    //Al cargar la pagina carga las companias
    useEffect(() => {
        if(token){
            getCompanies();
        }
    }, [token]);

    //Obtiene las companias
    const getCompanies = async () => {
        try {
            const response = await CompanyService.getAll(token);
            //Transforma los datos para que el id sea el _id
            const transformedData = response.data.map((company) => ({
                ...company,
                id: company._id,
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
    };

    return (
        <ListDataGrid
        rows={rows}
        columns={columns}
        name="Companies"
        subname="List"
        url="/company"
        buttonName="New Company"
        loading={loading}
    />
    );
}

export default Companies;