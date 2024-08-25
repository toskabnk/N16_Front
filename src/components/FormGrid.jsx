import { LoadingButton } from "@mui/lab";
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Button, Grid, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Link, useNavigate } from "react-router-dom";

const FormGrid = ({ children, formik, name, url, isEdit, loading, loadingDelete, handleDelete, onSubmit, noDelete=false }) => {
    const navigate = useNavigate();
    return (
        <Box sx={{ flexGrow:1 }}>
            <form onSubmit={onSubmit}>
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
                    <Typography variant="h10" >
                    &nbsp;{isEdit ? 'Edit' : 'New'}
                    </Typography>
                    </>
            </Box>
            <Box       
                gap={4}
                p={2}
                sx={{
                    width: {
                      xs: '100%',
                      md: '50%',
                    }
                  }}>
                    <Paper>
                        <Grid container spacing={2} paddingLeft={2} paddingRight={2}>
                            {children}
                            <Grid item xs={12} md={12}>
                                <Box
                                sx={{display: 'flex', paddingBottom: 2}}>
                                    <LoadingButton
                                        type="submit"
                                        variant="contained"
                                        color="success"
                                        sx={{marginRight: 2}}
                                        loading={loading}
                                        disabled={loadingDelete}
                                        onClick={formik.handleSubmit}
                                        loadingPosition="start"
                                        startIcon={<SaveIcon />}
                                    >{isEdit ? 'Edit' : 'Submit'}
                                    </LoadingButton>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{marginRight: 2}}
                                        onClick={e => {
                                            e.preventDefault();
                                            navigate(`${url}`);
                                        }}
                                    >Cancel
                                    </Button>
                                    {isEdit && !noDelete ? (
                                        <LoadingButton
                                            variant="contained"
                                            color="error"
                                            loading={loadingDelete}
                                            onClick={handleDelete}
                                            loadingPosition="start"
                                            startIcon={<DeleteIcon />}
                                        >{'Delete'}</LoadingButton>) : null}
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>  
                </Box>
            </form>
        </Box>
    );
}

export default FormGrid;