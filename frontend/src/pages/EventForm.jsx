import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API, { getError } from '../api';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import { CATEGORIES } from '../utils/helpers';

const emptyEvent = {
  title: '',
  description: '',
  poster: '',
  category: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  venue: '',
  registrationLink: '',
  registrationDeadline: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  eventType: 'non-competitive',
};

// used for both creating (/events/new) and editing (/events/:id/edit)
const EventForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...emptyEvent, contactEmail: user.email });
  const [multiDay, setMultiDay] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    API.get(`/events/${id}`)
      .then((res) => {
        const event = res.data;
        if (user.role !== 'admin' && event.organizer !== user._id) {
          setError('You can only edit events created by your account.');
          return;
        }
        const values = {};
        Object.keys(emptyEvent).forEach((key) => (values[key] = event[key] || ''));
        setForm(values);
        setMultiDay(event.startDate !== event.endDate);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // error box is at the top of the form, so scroll up to it
  const showError = (msg) => {
    setError(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const data = { ...form };
    if (!multiDay) data.endDate = data.startDate;

    // quick checks here, the backend checks everything again
    if (data.endDate < data.startDate) return showError('End date cannot be before the start date.');
    if (data.startDate === data.endDate && data.endTime <= data.startTime) {
      return showError('End time must be after the start time.');
    }
    if (!data.contactEmail && !data.contactPhone) return showError('Please add a contact email or phone number.');

    setSaving(true);
    try {
      const res = isEdit ? await API.put(`/events/${id}`, data) : await API.post('/events', data);
      navigate(`/events/${res.data._id}`);
    } catch (err) {
      showError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container page"><p className="loading">Loading...</p></div>;

  return (
    <div className="container page narrow">
      <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="back-link">
        ← Back to dashboard
      </Link>
      <h1>{isEdit ? 'Edit Event' : 'Create Event'}</h1>
      <p className="muted">
        Organizer: <b>{isEdit ? 'unchanged' : user.role === 'admin' ? 'College Administration' : user.name}</b>
      </p>

      {error && <p className="alert error">{error}</p>}

      <form className="box form-grid" onSubmit={handleSubmit}>
        <label className="full">
          Event title *
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label className="full">
          Description *
          <textarea name="description" rows="6" value={form.description} onChange={handleChange} required />
        </label>

        <div className="full">
          <span className="label-text">Event poster</span>
          <ImageUpload value={form.poster} onChange={(url) => setForm({ ...form, poster: url })} />
        </div>

        <label>
          Category *
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Event type *
          <select name="eventType" value={form.eventType} onChange={handleChange}>
            <option value="non-competitive">Non-Competitive</option>
            <option value="competitive">Competitive (has winners)</option>
          </select>
        </label>

        <label className="checkbox full">
          <input type="checkbox" checked={multiDay} onChange={(e) => setMultiDay(e.target.checked)} />
          This is a multi-day event
        </label>

        <label>
          {multiDay ? 'Start date *' : 'Date *'}
          <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
        </label>

        {multiDay ? (
          <label>
            End date *
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              min={form.startDate}
              onChange={handleChange}
              required
            />
          </label>
        ) : (
          <div className="hide-mobile"></div>
        )}

        <label>
          Start time *
          <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
        </label>
        <label>
          End time *
          <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
        </label>

        <label className="full">
          Venue *
          <input name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Main Auditorium" required />
        </label>

        <label>
          Registration link
          <input
            type="url"
            name="registrationLink"
            value={form.registrationLink}
            onChange={handleChange}
            placeholder="https://forms.gle/..."
          />
        </label>
        <label>
          Registration deadline
          <input type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} />
        </label>

        <label>
          Contact person
          <input name="contactName" value={form.contactName} onChange={handleChange} />
        </label>
        <label>
          Contact email
          <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} />
        </label>
        <label>
          Contact phone
          <input name="contactPhone" value={form.contactPhone} onChange={handleChange} />
        </label>

        <div className="full form-actions">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
