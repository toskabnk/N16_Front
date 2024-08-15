import { Box, TextField, Paper, Grid, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector } from "react-redux";
import React, { useEffect, useState, useRef, } from "react";
import { useNavigate } from 'react-router-dom';
import TeacherService from "../services/teacherService";

import CompanyService from "../services/companyService";
import SnackbarComponent from "../components/SnackbarComponent";

function Teacher() {
    const token = useSelector((state) => state.user.token);
    const [teacherData, setTeacherData] = useState([]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga
    //hardcoded columns.
    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Name', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'surname', headerName: 'Surname', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'email', headerName: 'Email', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'company_name', headerName: 'Company', flex: 1, resizable: true, overflow: 'hidden' },
    ]);
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [severity, setSeverity] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const snackbarRef = useRef();
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
            console.log(transformedData);
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Something went wrong, please try again later');
            setSeverity('error');
            setShowSnackBar(true);
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
    //when clicking in a row, navigate to the edition page with the row params
    const handleRowClick = (params) => {
        console.log(params.row);
        navigate(`/teacher/${params.id}`, { state: { teacher: params.row } });
    };
    //boton para usuario nuevo
    const handleCreateTeacher = () => {
        navigate('/teacher/new');
    }
    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container direction={"column"} spacing={2}>
                <Grid item xs={12} md={12}>
                    <Box
                        gap={4}
                        p={2}>
                        <Paper
                            elevation={3}>
                            <Box spacing={{ xs: 1, sm: 2, md: 2 }}
                                p={2}
                                sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <TextField
                                    label="Filter"
                                    variant="outlined"
                                    size='small'
                                    margin='none'
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleCreateTeacher}
                                    sx={{ ml: 2 }}
                                >New Teacher</Button>
                            </Box>
                        </Paper>
                    </Box>
                </Grid>
                <Grid item >
                    <Box gap={4}
                        p={3} sx={{ flex: 1, overflow: 'hidden' }}>

                            <DataGrid
                                autoHeight={true}
                                rows={rows}
                                columns={columns}
                                initialState={{
                                    pagination: {
                                        paginationModel: { page: 0, pageSize: 10 },
                                    },
                                }}
                                pageSizeOptions={[5, 10, 20, 50]}
                                onRowClick={handleRowClick}
                                loading={loading}
                                slotProps={{
                                    loadingOverlay: {
                                        variant: 'linear-progress',
                                        noRowsVariant: 'linear-progress',
                                    },
                                }}
                            />

                        
                    </Box>
                </Grid>
            </Grid>
            <SnackbarComponent
                ref={snackbarRef}
                open={showSnackBar}
                severity={severity}
                message={snackbarMessage}
                onClose={() => setShowSnackBar(false)}
            />
        </Box>
    );
}


export default Teacher;
