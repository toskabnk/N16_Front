import * as Yup from 'yup';
import eventFormModel from './eventFormModel';
const {
    formField: {
        classroom_id,
        department_id,
        description,
        event_type_id,
        status_id,
        teacher_id,
        start_date,
        end_date,
    },
} = eventFormModel;

export default [
    Yup.object().shape({
        [classroom_id.name]: Yup.string().required(`${classroom_id.requiredErrorMsg}`),
        [teacher_id.name]: Yup.string().required(`${teacher_id.requiredErrorMsg}`),
        [description.name]: Yup.string().required(`${description.requiredErrorMsg}`),
    }),
    Yup.object().shape({
        [event_type_id.name]: Yup.string().required(`${event_type_id.requiredErrorMsg}`),
        [status_id.name]: Yup.string().required(`${status_id.requiredErrorMsg}`),
        [department_id.name]: Yup.string().required(`${department_id.requiredErrorMsg}`),
    }),
];