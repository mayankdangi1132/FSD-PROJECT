import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, CalendarClock, CheckCircle2, Hourglass, Plus, Trophy } from 'lucide-react';
import API, { getError } from '../api';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import DashboardLayout from '../components/DashboardLayout';
import EventTable from '../components/EventTable';
import { Loader } from '../components/States';
import { formatDate, isCompleted } from '../utils/helpers';

const OrganizerDashboard = () => {
  const { section = 'overview' } = useParams();
  const { user } = useAuth();
  const { toast, confirm } = useFeedback();

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () =>
    Promise.all([API.get('/dashboard/organizer'), API.get('/events/mine')])
      .then(([s, e]) => {
        setStats(s.data);
        setEvents(e.data);
      })
      .catch((err) => toast(getError(err), 'error'))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadData();
  }, []);

  const deleteEvent = async (event) => {
    if (!(await confirm(`"${event.title}" will be deleted permanently.`, { title: 'Delete event?' }))) return;
    try {
      await API.delete(`/events/${event._id}`);
      toast('Event deleted');
      loadData();
    } catch (err) {
      toast(getError(err), 'error');
    }
  };

  const upcoming = events.filter((e) => !isCompleted(e));
  const typeName = user.role === 'club' ? 'Club' : 'Department';

  return (
    <DashboardLayout
      title={section === 'events' ? 'My Events' : user.name}
      subtitle={section === 'events' ? 'All events published by your account.' : `${typeName} organizer dashboard`}
      actions={
        <Link to="/events/new" className="btn btn-primary">
          <Plus size={16} /> Create Event
        </Link>
      }
    >
      {loading || !stats ? (
        <Loader />
      ) : section === 'events' ? (
        <div className="panel">
          <EventTable events={events} onDelete={deleteEvent} />
        </div>
      ) : (
        <>
          <div className="stats">
            <div className="stat">
              <span className="stat-icon blue">
                <CalendarDays size={20} />
              </span>
              <div>
                <b>{stats.totalEvents}</b>
                <span>Total events</span>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon teal">
                <CalendarClock size={20} />
              </span>
              <div>
                <b>{stats.upcoming}</b>
                <span>Upcoming</span>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon slate">
                <CheckCircle2 size={20} />
              </span>
              <div>
                <b>{stats.completed}</b>
                <span>Completed</span>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon amber">
                <Hourglass size={20} />
              </span>
              <div>
                <b>{stats.pending}</b>
                <span>Waiting for approval</span>
              </div>
            </div>
          </div>

          {stats.needWinners.length > 0 && (
            <div className="alert warning">
              <Trophy size={18} />
              <div>
                <b>These competitions are over. Publish the winners:</b>
                <ul>
                  {stats.needWinners.map((e) => (
                    <li key={e._id}>
                      <Link to={`/events/${e._id}/winners`}>{e.title}</Link> (ended {formatDate(e.endDate)})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="panel">
            <div className="panel-head">
              <h2>Upcoming events</h2>
              <Link to="/dashboard/events">View all</Link>
            </div>
            <EventTable events={upcoming} onDelete={deleteEvent} />
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default OrganizerDashboard;
