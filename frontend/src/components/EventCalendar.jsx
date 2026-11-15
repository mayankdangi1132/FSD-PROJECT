import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useNavigate } from 'react-router-dom';
import { TYPE_COLORS, isCompleted } from '../utils/helpers';

// small = the compact version shown on the student dashboard
const EventCalendar = ({ events, small = false }) => {
  const navigate = useNavigate();

  const calendarEvents = events.map((e) => ({
    id: e._id,
    title: e.title,
    start: `${e.startDate}T${e.startTime}`,
    end: `${e.endDate}T${e.endTime}`,
    backgroundColor: TYPE_COLORS[e.organizerType],
    borderColor: TYPE_COLORS[e.organizerType],
    classNames: isCompleted(e) ? ['fc-completed'] : [],
    extendedProps: { venue: e.venue, organizer: e.organizerName },
  }));

  return (
    <div className={small ? 'calendar-box small' : 'calendar-box'}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={
          small
            ? { left: 'prev,next', center: 'title', right: 'today' }
            : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }
        }
        buttonText={{ today: 'Today', month: 'Month', week: 'Week', day: 'Day' }}
        events={calendarEvents}
        eventClick={(info) => navigate(`/events/${info.event.id}`)}
        eventDisplay="block"
        eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
        displayEventTime={!small}
        dayMaxEvents={small ? 2 : 3}
        navLinks={!small}
        height="auto"
        eventDidMount={(info) => {
          // simple hover tooltip
          const { venue, organizer } = info.event.extendedProps;
          info.el.title = `${info.event.title}\n${organizer}\n${venue}`;
        }}
      />
    </div>
  );
};

export default EventCalendar;
