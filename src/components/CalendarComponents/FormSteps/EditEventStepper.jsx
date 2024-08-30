import React, { Fragment, useState } from 'react';
import { Stepper, Step, StepLabel, Button} from '@mui/material';
import { Formik, Form } from 'formik';
import DataForm from './DataForm';
import EventForm from './EventForm';
import validationSchema from './FormModel/validationSchema';
import eventFormModel from './FormModel/eventFormModel';
import formInitialValues from './FormModel/formInitialValues';
import { Box } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import eventService from '../../../services/eventService';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import { useSnackbarContext } from '../../../providers/SnackbarWrapperProvider';

//Pasos del formulario y sus nombres
const steps = ['Step 1', 'Finish'];
//Id y campos del formulario
const { formId, formField } = eventFormModel;

const EditEventStepper = (props) => {
    //Hooks
    const { showSnackbar, closeSnackbarGlobal } = useSnackbarContext();
    //Paso activo
    const [activeStep, setActiveStep] = useState(0);
    //Estado para saber si se está enviando el formulario
    const [isSubmitting, setIsSubmitting] = useState(false);
    //Estado para saber si se está borrando el evento
    const [isDeleting, setIsDeleting] = useState(false);
    //Valores del formulario
    const currentValidationSchema = validationSchema[activeStep];
    //Calcula cual es el último paso segun el número de pasos
    const isLastStep = activeStep === steps.length - 1;

    /**
     * Consigue el contenido del paso actual
     * @param {*} step Paso actual
     * @returns Contenido del paso actual
     */
    function getStepContent(step) {
        switch (step) {
            case 0:
                return <DataForm formField={formField} {...props} />;
            case 1:
                return <EventForm formField={formField} {...props} />;
            default:
                return <div>Not Found</div>;
        }
    }

    /**
     * Maneja el submit del formulario. Si es el último paso, actualiza el evento, si no, pasa al siguiente paso
     * @param {*} values Valores del formulario
     * @param {*} actions Acciones del formulario
     */
    function handleSubmit(values, actions) {
        if (isLastStep) {
            setIsSubmitting(true);
            console.log(values);
            //Copia los valores del formulario y elimina el campo vacío
            let copyValues = {...values};
            delete copyValues[""];
            updateEvent(props.token, props.event.id, copyValues);
        } else {
            setActiveStep(activeStep + 1);
            actions.setTouched({});
            actions.setSubmitting(false);
        }
    }

    /**
     * Maneja el paso atrás del formulario
     */
    function handleBack() {
        setActiveStep(activeStep - 1);
    }

    /**
     * Muestra el diálogo de confirmación para borrar un evento o todos los eventos de un grupo
     */
    function handleDelete() {
        Swal.fire({
            title: "Delete all events for this group?",
            text: "You won't be able to revert this!",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Yes, all from this date",
            denyButtonText: `No, just this one`,
            icon: "warning",
        }).then((result) => {
            if (result.isConfirmed) {
                deleteEventGroup(props.token, props.event.groupId);
            } else if (result.isDenied) {
                deleteEvent(props.token, props.event.id);
            }
        });
        
    }

    /**
     * Actualiza el evento que se le pasa por parámetro con los valores del formulario
     * @param {*} token Token de autenticación
     * @param {*} id Id del evento
     * @param {*} values Valores del formulario
     */
    const updateEvent = async (token, id, values) => {
        try {
            const response = await eventService.update(token, id, values);
            console.log(response);
            setIsSubmitting(false);
            props.closeDialog(false);
            showSnackbar('Event updated successfully', {
                variant: 'success',
                autoHideDuration: 6000,
                action: (key) => (
                    <Fragment>
                        <Button size='small' onClick={() => closeSnackbarGlobal(key)}>
                            Dismiss
                        </Button>
                    </Fragment>
                ),
            });
            //Eliminamos el evento de la lista de eventos
            props.setEvents(props.events.filter(event => event.id !== id));
            //Añadimos el evento actualizado a la lista de eventos
            props.setEvents([...props.events, response.data]);
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
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

    /**
     * Borra el evento que se le pasa por parámetro
     * @param {*} token Token de autenticación
     * @param {*} id Id del evento
     */
    const deleteEvent = async (token, id) => {
        try {
            Swal.fire({
                title: 'Deleting event...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            })
            const response = await eventService.delete(token, id);
            //Eliminamos el evento de la litsta de eventos
            props.setEvents(props.events.filter(event => event.id !== id));
            Swal.close();
            setIsDeleting(false);
            console.log(response);
            props.closeDialog(false);
            showSnackbar('Event deleted successfully', {
                variant: 'success',
                autoHideDuration: 6000,
                action: (key) => (
                    <Fragment>
                        <Button size='small' onClick={() => closeSnackbarGlobal(key)}>
                            Dismiss
                        </Button>
                    </Fragment>
                ),
            });
        }
        catch (error) {
            Swal.close();
            console.error(error);
            setIsDeleting(false);
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

    /**
     * Borra todos los eventos de un grupo
     * @param {*} token Token de autenticación
     * @param {*} id Id del grupo
     */
    const deleteEventGroup = async (token, id) => {
        try {
            Swal.fire({
                title: 'Deleting event group...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            })
            const response = await eventService.deleteEventsGroup(token, id, values);
            Swal.close();
            setIsDeleting(false);
            console.log(response);
            props.closeDialog(false);
            showSnackbar('Event group deleted successfully', {
                variant: 'success',
                autoHideDuration: 6000,
                action: (key) => (
                    <Fragment>
                        <Button size='small' onClick={() => closeSnackbarGlobal(key)}>
                            Dismiss
                        </Button>
                    </Fragment>
                ),
            });
        }
        catch (error) {
            Swal.close();
            console.error(error);
            setIsDeleting(false);
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
        <Formik
            initialValues={formInitialValues}
            validationSchema={currentValidationSchema}
            onSubmit={handleSubmit}
        >
            <Form id={formId}>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    {getStepContent(activeStep)}
                    <Box
                        sx= {{display: 'flex', justifyContent:'space-between'}}>
                        {activeStep !== 0 && (
                            <Button variant="contained" onClick={handleBack}>Back</Button>
                        )}
                        <LoadingButton
                            variant="contained"
                            loading={isSubmitting}
                            disabled={isSubmitting || isDeleting}
                            {...(isLastStep ? { loadingPosition:"start"} : {})}
                            {...(isLastStep ? {startIcon:<SaveIcon />} : {})}
                            type="submit"
                            color= {isLastStep ? 'success' : 'primary'}
                        >
                            {isLastStep ? 'Update' : 'Continue'}
                        </LoadingButton>
                        {isLastStep ? 
                            <LoadingButton
                                variant="contained"
                                loading={isDeleting}
                                disabled={isSubmitting || isDeleting}
                                loadingPosition="start"
                                startIcon={<DeleteIcon />}
                                onClick={handleDelete}
                                color= 'error'
                            >Delete</LoadingButton> : null
                        }
                    </Box>
                </Form>
        </Formik>
    );
}

export default EditEventStepper;