import { Button, Grid, Paper, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { DataGrid } from "@mui/x-data-grid"
import { Link, useNavigate } from "react-router-dom";

const ListDataGrid = ({rows, columns, name, subname=null, url, buttonName}) => {
    //Hooks
    const navigate = useNavigate();

    //Cuando se hace click en una fila de la tabla se redirige a la página de edicion del tipo de evento
    const handleRowClick = (params) => {
        console.log(params.row);
        navigate(`${url}/${params.id}`, { state: { objectID: params.row } });
    };

    return (
        <Box sx={{ flexGrow:1 }}>
                <Box       
                    display="flex"
                    alignItems="left"
                    p={2}>
                        <>
                        <Typography variant="h10" >
                            <Link to={url} color="blue" underline="hover" style={{textDecoration: "none"}}>
                            {name} /
                            </Link>
                        </Typography>
                        {subname ? 
                            (<Typography variant="h10" >
                                &nbsp;{subname}
                            </Typography>) : null}
                        </>
                </Box>
                <Box
                    gap={4}
                    p={2}>
                        <Paper>
                            <Grid container direction={"column"} spacing={2}>
                                <Grid item xs={12} md={12}>
                                    <Box
                                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                                        gap={4}
                                        p={2}>
                                        <Typography variant="h6">{name}</Typography>
                                        <Button variant="contained" color="primary" onClick={() => navigate(`${url}/new`)}>{buttonName}</Button>
                                    </Box>

                                </Grid>

                                <Grid item xs={12} md={12}>
                                    <Box
                                        gap={4}
                                        p={2}>
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
                                            />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                </Box>
        </Box>
    )
}

export default ListDataGrid