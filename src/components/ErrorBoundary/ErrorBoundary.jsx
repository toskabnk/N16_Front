import React, { Component } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import image from '/src/assets/navegador.webp';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    // Verifica si la ubicación ha cambiado
    if (this.props.location.pathname !== prevProps.location.pathname) {
      // Reinicia el estado de ErrorBoundary
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ margin: 'auto', width: '60%' }}
        >
          <Box component="img" 
            src={image}
            alt="Error" 
            margin={2}
            sx={{
              height: 250,
              width: 350,
            }}
          />
          <Box>
            <Typography variant='h3'>Ooops, something went wrong!</Typography>
            <Typography variant='h5'>Sorry! This shouldn't happen.</Typography>
            <Typography variant='h7'>Here are the error details so the developer doesn't get bored. Please send the error and what you were doing to reproduce it so we can fix it as soon as possible!</Typography>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                Error Details
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant='h9'>{this.state.error && this.state.error.toString()}</Typography>
                <Typography variant='h11'>{this.state.errorInfo && this.state.errorInfo.componentStack}</Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Stack>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;