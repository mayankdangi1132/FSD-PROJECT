import { useEffect, useState } from 'react';
import API, { getError } from '../api';
import EventCalendar from '../components/EventCalendar';
import OrganizerSelect from '../components/OrganizerSelect';
import { Loader } from '../components/States';
import { CATEGORIES, TYPE_COLORS } from '../utils/helpers';

const CalendarPage = () => {
  const [events, setEvents] = useState(null);
  const [organizer, setOrganizer] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/events')
      .then((res) => setEvents(res.data))
      .catch((err) => setError(getError(err)));
  }, []);

  // filtering on the client since we already have all events
  const filtered = (events || []).filter((e) => {
    if (category && e.category !== category) return false;
    if (organizer === 'college') return e.organizerType === 'college';
    if (organizer) return e.organizer === organizer;
    return true;
  });

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Event Calendar</h1>
        <p>All times are in IST. Click any event to see its full details.</p>
      </div>

      <div className="filters calendar-filters">
        <OrganizerSelect value={organizer} onChange={setOrganizer} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <div className="legend">
          <span>
            <i style={{ background: TYPE_COLORS.club }}></i> Club
          </span>
          <span>
            <i style={{ background: TYPE_COLORS.department }}></i> Department
          </span>
          <span>
            <i style={{ background: TYPE_COLORS.college }}></i> College
          </span>
          <span>
            <i className="faded"></i> Completed
          </span>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}

      {events ? <EventCalendar events={filtered} /> : !error && <Loader text="Loading calendar..." />}
    </div>
  );
};

export default CalendarPage;
