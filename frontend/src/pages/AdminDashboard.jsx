import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API, { getError } from '../api';
import EventTable from '../components/EventTable';

const emptyForm = { name: '', email: '', password: '', role: 'club', description: '' };

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState('organizers');
  const [statusFilter, setStatusFilter] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadStats = () => API.get('/dashboard/admin').then((res) => setStats(res.data));
  const loadOrganizers = () => API.get('/users').then((res) => setOrganizers(res.data));
  const loadEvents = () => API.get('/events/admin/all').then((res) => setEvents(res.data));

  useEffect(() => {
    Promise.all([loadStats(), loadOrganizers(), loadEvents()]).catch((err) =>
      setMessage({ type: 'error', text: getError(err) })
    );
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      if (editingId) {
        const body = { ...form };
        if (!body.password) delete body.password; // keep old password
        await API.put(`/users/${editingId}`, body);
        setMessage({ type: 'success', text: 'Account updated' });
      } else {
        await API.post('/users', form);
        setMessage({ type: 'success', text: `Account created for ${form.name}` });
      }
      resetForm();
      loadOrganizers();
      loadStats();
      loadEvents(); // organizer name may have changed on events
    } catch (err) {
      setMessage({ type: 'error', text: getError(err) });
    }
  };

  const startEdit = (org) => {
    setEditingId(org._id);
    setForm({ name: org.name, email: org.email, password: '', role: org.role, description: org.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleActive = async (org) => {
    try {
      await API.put(`/users/${org._id}`, { isActive: !org.isActive });
      loadOrganizers();
    } catch (err) {
      alert(getError(err));
    }
  };

  const deleteOrganizer = async (org) => {
    if (!window.confirm(`Delete ${org.name}? All of their events will also be deleted.`)) return;
    try {
      await API.delete(`/users/${org._id}`);
      loadOrganizers();
      loadEvents();
      loadStats();
    } catch (err) {
      alert(getError(err));
    }
  };

  const deleteEvent = async (event) => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    try {
      await API.delete(`/events/${event._id}`);
      loadEvents();
      loadStats();
    } catch (err) {
      alert(getError(err));
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await API.patch(`/events/${id}/status`, { status });
      loadEvents();
      loadStats();
    } catch (err) {
      alert(getError(err));
    }
  };

  const shownEvents = statusFilter ? events.filter((e) => e.status === statusFilter) : events;

  return (
    <div className="container page">
      <div className="page-head row">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage organizer accounts and every event on the portal.</p>
        </div>
        <Link to="/events/new" className="btn btn-primary">
          + Create College Event
        </Link>
      </div>

      {stats && (
        <div className="stats">
          <div className="stat">
            <b>{stats.totalClubs}</b>Clubs
          </div>
          <div className="stat">
            <b>{stats.totalDepartments}</b>Departments
          </div>
          <div className="stat">
            <b>{stats.totalEvents}</b>Total Events
          </div>
          <div className="stat">
            <b>{stats.upcoming}</b>Upcoming
          </div>
          <div className="stat">
            <b>{stats.completed}</b>Completed
          </div>
          <div className={stats.pending > 0 ? 'stat highlight' : 'stat'}>
            <b>{stats.pending}</b>Pending Approval
          </div>
        </div>
      )}

      {message.text && <p className={`alert ${message.type}`}>{message.text}</p>}

      <div className="tabs">
        <button className={tab === 'organizers' ? 'tab active' : 'tab'} onClick={() => setTab('organizers')}>
          Organizer Accounts
        </button>
        <button className={tab === 'events' ? 'tab active' : 'tab'} onClick={() => setTab('events')}>
          All Events {stats?.pending > 0 && <span className="count">{stats.pending}</span>}
        </button>
      </div>

      {tab === 'organizers' && (
        <>
          <form className="box form-grid" onSubmit={handleSubmit}>
            <h2 className="full">{editingId ? 'Edit Account' : 'Add Club / Department Account'}</h2>
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Robotics Club" required />
            </label>
            <label>
              Official email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="robotics@college.edu"
                required
              />
            </label>
            <label>
              {editingId ? 'New password (leave empty to keep)' : 'Password'}
              <input
                name="password"
                type="text"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required={!editingId}
              />
            </label>
            <label>
              Type
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="club">Club</option>
                <option value="department">Department</option>
              </select>
            </label>
            <label className="full">
              Short description
              <input name="description" value={form.description} onChange={handleChange} />
            </label>
            <div className="full form-actions">
              <button className="btn btn-primary">{editingId ? 'Update Account' : 'Create Account'}</button>
              {editingId && (
                <button type="button" className="btn btn-outline" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Events</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizers.map((org) => (
                  <tr key={org._id}>
                    <td className="table-title">{org.name}</td>
                    <td>{org.email}</td>
                    <td style={{ textTransform: 'capitalize' }}>{org.role}</td>
                    <td>{org.eventCount}</td>
                    <td>
                      <span className={`pill ${org.isActive ? 'approved' : 'rejected'}`}>
                        {org.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn btn-sm btn-outline" onClick={() => startEdit(org)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-warning" onClick={() => toggleActive(org)}>
                        {org.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteOrganizer(org)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {organizers.length === 0 && <p className="empty">No organizer accounts yet.</p>}
          </div>
        </>
      )}

      {tab === 'events' && (
        <>
          <div className="filters small">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <EventTable events={shownEvents} onDelete={deleteEvent} onStatusChange={changeStatus} showOrganizer />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
