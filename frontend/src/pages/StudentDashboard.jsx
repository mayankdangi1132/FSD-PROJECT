import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API, { getError } from '../api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import EventCalendar from '../components/EventCalendar';
import { formatDate, ordinal } from '../utils/helpers';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ upcoming: [], recent: [], recentWinners: [] });
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([API.get('/dashboard/student'), API.get('/events')])
      .then(([dash, events]) => {
        setData(dash.data);
        setAllEvents(events.data);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container page"><p className="loading">Loading dashboard...</p></div>;

  return (
    <div className="container page">
      <div className="page-head">
        <h1>{user.role === 'student' ? `Hi, ${user.name.split(' ')[0]}` : 'Student Dashboard'}</h1>
        <p>What's coming up on campus and the latest results.</p>
      </div>

      {error && <p className="alert error">{error}</p>}

      <div className="dash-grid">
        <section className="box">
          <div className="section-head">
            <h2>Calendar</h2>
            <Link to="/calendar">Full calendar</Link>
          </div>
          <EventCalendar events={allEvents} small />
        </section>

        <section className="box">
          <h2>🏆 Recently Published Winners</h2>
          {data.recentWinners.length === 0 ? (
            <p className="empty">No results published yet.</p>
          ) : (
            <ul className="winner-list">
              {data.recentWinners.map((event) => (
                <li key={event._id}>
                  <Link to={`/events/${event._id}`}>{event.title}</Link>
                  <small>
                    {event.organizerName} · {formatDate(event.endDate)}
                  </small>
                  <p>
                    {event.winners.slice(0, 3).map((w) => (
                      <span key={w._id}>
                        {ordinal(w.position)}: <b>{w.name}</b>
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Upcoming Events</h2>
          <Link to="/events">See all</Link>
        </div>
        {data.upcoming.length === 0 ? (
          <p className="empty">No upcoming events.</p>
        ) : (
          <div className="card-grid">
            {data.upcoming.map((e) => (
              <EventCard key={e._id} event={e} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Recently Announced</h2>
        </div>
        <div className="card-grid">
          {data.recent.map((e) => (
            <EventCard key={e._id} event={e} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
