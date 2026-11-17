import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { useNavigate } from 'react-router-dom';
import { TYPE_COLORS, addDays, isCompleted, nowIST } from '../utils/helpers';

// Turns one of our events into what FullCalendar expects.
// We give FullCalendar the date and time exactly as the organizer typed them (IST, no offset),
// so 10:30 AM is always drawn in the 10:30 AM slot.
const toCalendarEvent = (e) => {
  const color = TYPE_COLORS[e.organizerType];
  const base = {
    id: e._id,
    title: e.title,
    backgroundColor: color,
    borderColor: color,
    classNames: isCompleted(e) ? ['fc-completed'] : [],
    extendedProps: { eventId: e._id, venue: e.venue, organizer: e.organizerName },
  };

  // all-day only when the organizer ticked it (FullCalendar's end date is exclusive, so +1 day)
  if (e.allDay) {
    return { ...base, allDay: true, start: e.startDate, end: addDays(e.endDate, 1) };
  }

  // single day: normal timed event
  if (e.startDate === e.endDate) {
    return { ...base, start: `${e.startDate}T${e.startTime}:00`, end: `${e.endDate}T${e.endTime}:00` };
  }

  // multi-day: the times are the daily timing, so show it on every day in its own time slot
  // instead of one long block that covers the whole day and night
  return {
    ...base,
    groupId: e._id,
    startTime: e.startTime,
    endTime: e.endTime,
    startRecur: e.startDate,
    endRecur: addDays(e.endDate, 1),
  };
};

// small = the compact version on dashboards / home page
const EventCalendar = ({ events, small = false }) => {
  const navigate = useNavigate();
  // on phones the list view is much easier to read than a month grid
  const [isPhone] = useState(() => window.innerWidth < 640);

  return (
    <div className={small ? 'calendar-box small' : 'calendar-box'}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView={isPhone && !small ? 'listWeek' : 'dayGridMonth'}
        headerToolbar={
          small
            ? { left: 'prev,next', center: 'title', right: 'today' }
            : isPhone
            ? { left: 'prev,next', center: 'title', right: 'listWeek,dayGridMonth,timeGridDay' }
            : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }
        }
        buttonText={{ today: 'Today', month: 'Month', week: 'Week', day: 'Day', list: 'List' }}
        events={events.map(toCalendarEvent)}
        eventClick={(info) => navigate(`/events/${info.event.extendedProps.eventId}`)}
        now={nowIST}
        nowIndicator
        firstDay={1}
        scrollTime="07:00:00"
        eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
        slotLabelFormat={{ hour: 'numeric', meridiem: 'short' }}
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
