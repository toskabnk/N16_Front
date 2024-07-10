import { Box, Typography } from '@mui/material';

function Home() {
    return (
        <div>
            <Box>
                    <Typography variant="h1" component="div" gutterBottom fontFamily='system-ui'>
                        Welcome to Timetable - N16
                    </Typography>
                    <Typography variant="h5" component="div" gutterBottom fontFamily='system-ui'>
                        A simple timetable for N16
                    </Typography>
                </Box>
        </div>
    )
}

export default Home;