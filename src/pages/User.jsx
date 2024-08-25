import { Box, TextField, Paper, Grid, Button } from '@mui/material';
import ListDataGrid from "../components/ListDataGrid";
import { useSelector } from "react-redux";
import React, { useEffect, useState, Fragment, } from "react";
import { useNavigate } from 'react-router-dom';
import UserService from "../services/userService";
import { useSnackbarContext } from '../providers/SnackbarWrapperProvider';

function User() {
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    const token = useSelector((state) => state.user.token);
    const [userData, setUserData] = useState([]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga
    //hardcoded columns.
    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Name', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'surname', headerName: 'Surname', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'email', headerName: 'Email', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'company', headerName: 'Company', flex: 1, resizable: true, overflow: 'hidden' },
    ]);
    const navigate = useNavigate();
    const [filterText, setFilterText] = useState('');

    //get user data when the page loads
    useEffect(() => {
        if (token) {
            getUsersData();
        }
    }, [token]);

    //update filter with text change or user data
    useEffect(() => {
        filterRows();
    }, [filterText, userData]);

    const getUsersData = async () => {
        try {
            const response = await UserService.getAll(token);

            const transformedData = response.data.map((user) => ({
                ...user,
                company: user.company ? user.company.name : 'N/A', // get company name from <User><Company>
                id: user._id,
            }));
            setUserData(transformedData);
            setRows(transformedData);
            setLoading(false);
            //Loading is done
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
        const filteredRows = userData.filter((row) => {
            return Object.values(row).some(value =>
                String(value).toLowerCase().includes(filterText.toLowerCase())
            );
        });
        setRows(filteredRows);
    };

    return (

        <Box sx={{ flexGrow: 1, minWidth: 0 }} gap={4} p={2}>
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
                </Box>
            </Paper>

            <ListDataGrid
                rows={rows}
                columns={columns}
                name="Users"
                subname="List"
                url="/user"
                buttonName="New User"
                loading={loading}
                noClick={false}
            />
        </Box>
    );
}


export default User;