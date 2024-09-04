import { TextField, Button } from '@mui/material';
import ListDataGrid from "../components/ListDataGrid";
import { useSelector } from "react-redux";
import React, { useEffect, useState, Fragment, } from "react";
import { useNavigate } from 'react-router-dom';
import TeacherService from "../services/teacherService";
import CompanyService from "../services/companyService";
import { useSnackbarContext } from '../providers/SnackbarWrapperProvider';

function Teacher() {
    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    //Token
    const token = useSelector((state) => state.user.token);
    //States
    const [teacherData, setTeacherData] = useState([]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de cargas
    //hardcoded columns.
    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Name', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'surname', headerName: 'Surname', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'email', headerName: 'Email', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'company_name', headerName: 'Company', flex: 1, resizable: true, overflow: 'hidden' },
    ]);
    const navigate = useNavigate();
    const [filterText, setFilterText] = useState('');

    //get teacher data when the page loads
    useEffect(() => {
        if (token) {
            getTeachersData();
        }
    }, [token]);

    //update filter with text change or teacher data
    useEffect(() => {
        filterRows();
    }, [filterText, teacherData]);

    const getTeachersData = async () => {
        try {
            const [teacherResponse, companyResponse] = await Promise.all([
                TeacherService.getAll(token),
                CompanyService.getAll(token)
            ]);

            const companies = companyResponse.data;

            const transformedData = teacherResponse.data.map((teacher) => {
                const company = companies.find(c => c.id === teacher.company_id);
                return {
                    ...teacher,
                    id: teacher._id,
                    company_name: company ? company.name : '' // Añadir el nombre de la compañía
                };
            });

            setTeacherData(transformedData);
            setRows(transformedData);
            //Loading is done
            setLoading(false);
        } catch (error) {
            console.error(error);
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


    //filter in ALL the columns with the text of the filter 
    const filterRows = () => {
        const filteredRows = teacherData.filter((row) => {
            return Object.values(row).some(value =>
                String(value).toLowerCase().includes(filterText.toLowerCase())
            );
        });
        setRows(filteredRows);
    };
    return (
        <ListDataGrid
            rows={rows}
            columns={columns}
            name="Teachers"
            subname="List"
            url="/teacher"
            buttonName="New Teacher"
            loading={loading}
            noClick={false}
            filterComponent={<FilterComponent filterText={filterText} setFilterText={setFilterText} />}
        />

    );
}


export default Teacher;

const FilterComponent = ({ filterText, setFilterText }) => {
    return (
        <TextField
            label="Filter"
            variant="outlined"
            size='small'
            margin='none'
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
        />
    );
}