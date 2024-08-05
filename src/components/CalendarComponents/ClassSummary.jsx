import { TextField } from "@mui/material";

 const ClassSummary = ({ event }) => {
  return (
    <div className="class-summary">
      <TextField label="Description" value={event.title} disabled={true} fullWidth margin="normal"/>
        <TextField label="Start Time" value={event.extendedProps.start_date} disabled={true} fullWidth margin="normal"/>
        <TextField label="End Time" value={event.extendedProps.end_date} disabled={true} fullWidth margin="normal"/>
        {event.extendedProps.teacher ? <TextField label="Teacher" value={event.extendedProps.teacher.name} disabled={true} fullWidth margin="normal"/> : <TextField label="Teacher" value={"Not set"} disabled={true} fullWidth margin="normal"/>}
    </div>
  );
} 

export default ClassSummary;