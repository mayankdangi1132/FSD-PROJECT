import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Shapes,
  Building2,
  GraduationCap,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  Hourglass,
  UserX,
  Plus,
  Search,
} from 'lucide-react';
import API, { getError } from '../api';
import { useFeedback } from '../context/FeedbackContext';
import DashboardLayout from '../components/DashboardLayout';
import EventTable from '../components/EventTable';
import AccountManager from '../components/AccountManager';
import StudentManager from '../components/StudentManager';
import { Loader } from '../components/States';

const TITLES = {
  overview: ['Admin Dashboard', 'Everything happening on Campus Connect at a glance.'],
  events: ['All Events', 'Approve, edit or remove any event on the portal.'],
  clubs: ['Club Management', 'Add clubs and manage their organizer logins.'],
  departments: ['Department Management', 'Add departments and manage their organizer logins.'],
  students: ['Student Accounts', 'Create and manage student logins.'],
};

const StatCard = ({ icon: Icon, label, value, tone = 'blue', to }) => {
  const content = (
    <>
      <span className={`stat-icon ${tone}`}>
        <Icon size={20} />
      </span>
      <div>
        <b>{value}</b>
        <span>{label}</span>
      </div>
    </>
  );
  return to ? (
    <Link to={to} className="stat">
      {content}
    </Link>
  ) : (
    <div className="stat">{content}</div>
  );
};

const AdminDashboard = () => {
  const { section = 'overview' } = useParams();
  const { toast, confirm } = useFeedback();

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadStats = () => API.get('/dashboard/admin').then((res) => setStats(res.data));
  const loadEvents = () => API.get('/events/admin/all').then((res) => setEvents(res.data));

  useEffect(() => {
    Promise.all([loadStats(), loadEvents()])
      .catch((err) => toast(getError(err), 'error'))
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    loadStats();
    loadEvents();
  };

  const deleteEvent = async (event) => {
    if (!(await confirm(`"${event.title}" and its winners will be deleted permanently.`, { title: 'Delete event?' }))) return;
    try {
      await API.delete(`/events/${event._id}`);
      toast('Event deleted');
      refresh();
    } catch (err) {
      toast(getError(err), 'error');
    }
  };

  const changeStatus = async (event, status) => {
    try {
      await API.patch(`/events/${event._id}/status`, { status });
      toast(status === 'approved' ? `"${event.title}" is now published` : `"${event.title}" was rejected`);
      refresh();
    } catch (err) {
      toast(getError(err), 'error');
    }
  };

  const pending = events.filter((e) => e.status === 'pending');
  const shownEvents = events.filter(
    (e) => (!statusFilter || e.status === statusFilter) && e.title.toLowerCase().includes(search.toLowerCase())
  );

  const [title, subtitle] = TITLES[section] || TITLES.overview;

  return (
    <DashboardLayout
      title={title}
      subtitle={subtitle}
      actions={
        (section === 'overview' || section === 'events') && (
          <Link to="/events/new" className="btn btn-primary">
            <Plus size={16} /> Create Event
          </Link>
        )
      }
    >
      {section === 'overview' &&
        (loading || !stats ? (
          <Loader />
        ) : (
          <>
            <div className="stats">
              <StatCard icon={Shapes} label="Clubs" value={stats.totalClubs} to="/admin/clubs" />
              <StatCard icon={Building2} label="Departments" value={stats.totalDepartments} tone="teal" to="/admin/departments" />
              <StatCard icon={GraduationCap} label="Students" value={stats.totalStudents} tone="purple" to="/admin/students" />
              <StatCard icon={CalendarDays} label="Total events" value={stats.totalEvents} to="/admin/events" />
              <StatCard icon={CalendarClock} label="Upcoming" value={stats.upcoming} tone="teal" />
              <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} tone="slate" />
              <StatCard icon={Hourglass} label="Waiting for approval" value={stats.pending} tone="amber" />
              <StatCard icon={UserX} label="Inactive accounts" value={stats.inactiveAccounts} tone="red" />
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Waiting for approval</h2>
                  <p className="muted">Events submitted by clubs and departments. Only approved events are visible to students.</p>
                </div>
              </div>
              <EventTable events={pending} onDelete={deleteEvent} onStatusChange={changeStatus} showOrganizer />
            </div>
          </>
        ))}

      {section === 'events' && (
        <div className="panel">
          <div className="toolbar">
            <div className="search-box">
              <Search size={16} />
              <input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending ({pending.length})</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <EventTable events={shownEvents} onDelete={deleteEvent} onStatusChange={changeStatus} showOrganizer />
          )}
        </div>
      )}

      {section === 'clubs' && <AccountManager role="club" onChange={refresh} />}
      {section === 'departments' && <AccountManager role="department" onChange={refresh} />}
      {section === 'students' && <StudentManager onChange={loadStats} />}
    </DashboardLayout>
  );
};

export default AdminDashboard;
