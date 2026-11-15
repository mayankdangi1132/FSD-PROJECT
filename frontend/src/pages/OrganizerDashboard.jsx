import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API, { getError } from '../api';
import { useAuth } from '../context/AuthContext';
import EventTable from '../components/EventTable';
import { formatDate } from '../utils/helpers';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  const loadData = () => {
    Promise.all([API.get('/dashboard/organizer'), API.get('/events/mine')])
      .then(([s, e]) => {
        setStats(s.data);
        setEvents(e.data);
      })
      .catch((err) => setError(getError(err)));
  };

  useEffect(loadData, []);

  const deleteEvent = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/events/${event._id}`);
      loadData();
    } catch (err) {
      alert(getError(err));
    }
  };

  return (
    <div className="container page">
      <div className="page-head row">
        <div>
          <h1>{user.name}</h1>
          <p>{user.role === 'club' ? 'Club' : 'Department'} dashboard · {user.email}</p>
        </div>
        <Link to="/events/new" className="btn btn-primary">
          + Create Event
        </Link>
      </div>

      {error && <p className="alert error">{error}</p>}

      {stats && (
        <>
          <div className="stats">
            <div className="stat">
              <b>{stats.totalEvents}</b>Total Events
            </div>
            <div className="stat">
              <b>{stats.upcoming}</b>Upcoming
            </div>
            <div className="stat">
              <b>{stats.completed}</b>Completed
            </div>
            {stats.pending > 0 && (
              <div className="stat highlight">
                <b>{stats.pending}</b>Waiting for Approval
              </div>
            )}
          </div>

          {stats.needWinners.length > 0 && (
            <div className="alert warning">
              <b>These competitions are over. Add the winners:</b>
              <ul>
                {stats.needWinners.map((e) => (
                  <li key={e._id}>
                    <Link to={`/events/${e._id}/winners`}>{e.title}</Link> (ended {formatDate(e.endDate)})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <h2 className="section-title">My Events</h2>
      <EventTable events={events} onDelete={deleteEvent} />
    </div>
  );
};

export default OrganizerDashboard;
