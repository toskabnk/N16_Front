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
  }
} = eventFormModel;

export default {
    [classroom_id.value]: '',
    [teacher_id.value]: '',
    [description.value]: '',
    [event_type_id.value]: '',
    [status_id.value]: '',
    [department_id.value]: '',
    [start_date.value]: '',
    [end_date.value]: '',
};