import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API, { getError } from '../api';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import DashboardLayout from '../components/DashboardLayout';
import ImageUpload from '../components/ImageUpload';
import { Loader } from '../components/States';
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
  allDay: false,
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
  const { toast } = useFeedback();
  const navigate = useNavigate();
  const isAdmin = user.role === 'admin';

  const [form, setForm] = useState({ ...emptyEvent, contactEmail: user.email });
  const [organizerId, setOrganizerId] = useState('college'); // only used by the admin
  const [organizers, setOrganizers] = useState([]);
  const [multiDay, setMultiDay] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // the admin can publish for the college or for any club / department
  useEffect(() => {
    if (isAdmin) API.get('/organizers').then((res) => setOrganizers(res.data));
  }, [isAdmin]);

  useEffect(() => {
    if (!isEdit) return;
    API.get(`/events/${id}`)
      .then((res) => {
        const event = res.data;
        if (!isAdmin && event.organizer !== user._id) {
          setError('You can only edit events created by your account.');
          return;
        }
        const values = {};
        Object.keys(emptyEvent).forEach((key) => (values[key] = event[key] ?? emptyEvent[key]));
        setForm(values);
        setMultiDay(event.startDate !== event.endDate);
        setOrganizerId(event.organizerType === 'college' ? 'college' : event.organizer);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

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
    if (data.allDay) {
      data.startTime = '';
      data.endTime = '';
    }
    if (isAdmin) data.organizerId = organizerId;

    // quick checks here, the backend checks everything again
    if (data.endDate < data.startDate) return showError('End date cannot be before the start date.');
    if (!data.allDay && data.endTime <= data.startTime) {
      return showError(multiDay ? 'The daily end time must be after the start time.' : 'End time must be after the start time.');
    }
    if (!data.contactEmail && !data.contactPhone) return showError('Please add a contact email or phone number.');

    setSaving(true);
    try {
      const res = isEdit ? await API.put(`/events/${id}`, data) : await API.post('/events', data);
      toast(
        res.data.status === 'pending'
          ? 'Event submitted. It will be visible to students after the admin approves it.'
          : isEdit
          ? 'Event updated'
          : 'Event published'
      );
      navigate(`/events/${res.data._id}`);
    } catch (err) {
      showError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const clubs = organizers.filter((o) => o.role === 'club');
  const departments = organizers.filter((o) => o.role === 'department');

  return (
    <DashboardLayout
      title={isEdit ? 'Edit Event' : 'Create Event'}
      subtitle="All times are in Indian Standard Time (IST)."
    >
      {loading ? (
        <Loader />
      ) : (
        <form className="panel form-sections" onSubmit={handleSubmit}>
          {error && <p className="alert error">{error}</p>}

          <fieldset>
            <legend>Basic details</legend>
            <div className="form-grid">
              <label className="full">
                Event title *
                <input name="title" value={form.title} onChange={handleChange} maxLength={150} required />
              </label>

              <label className="full">
                Description *
                <textarea name="description" rows="5" value={form.description} onChange={handleChange} required />
              </label>

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
                  <option value="non-competitive">Non-competitive</option>
                  <option value="competitive">Competitive (has winners)</option>
                </select>
              </label>

              <label className="full">
                Organizer
                {isAdmin ? (
                  <select value={organizerId} onChange={(e) => setOrganizerId(e.target.value)}>
                    <option value="college">College Administration</option>
                    <optgroup label="Clubs">
                      {clubs.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Departments">
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                ) : (
                  <input value={user.name} disabled />
                )}
              </label>

              <div className="full">
                <span className="label-text">Event poster</span>
                <ImageUpload value={form.poster} onChange={(url) => setForm({ ...form, poster: url })} />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Date &amp; time</legend>
            <div className="form-grid">
              <div className="full check-row">
                <label className="checkbox">
                  <input type="checkbox" checked={multiDay} onChange={(e) => setMultiDay(e.target.checked)} />
                  Multi-day event
                </label>
                <label className="checkbox">
                  <input type="checkbox" name="allDay" checked={form.allDay} onChange={handleChange} />
                  All-day event (no fixed timing)
                </label>
              </div>

              <label>
                {multiDay ? 'Start date *' : 'Date *'}
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
              </label>
              {multiDay ? (
                <label>
                  End date *
                  <input type="date" name="endDate" value={form.endDate} min={form.startDate} onChange={handleChange} required />
                </label>
              ) : (
                <div className="hide-mobile" />
              )}

              {!form.allDay && (
                <>
                  <label>
                    {multiDay ? 'Daily start time *' : 'Start time *'}
                    <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
                  </label>
                  <label>
                    {multiDay ? 'Daily end time *' : 'End time *'}
                    <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
                  </label>
                  {multiDay && (
                    <p className="hint full">
                      For multi-day events the timing applies to every day, e.g. 10:00 AM - 5:00 PM on each day.
                    </p>
                  )}
                </>
              )}

              <label className="full">
                Venue *
                <input name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Main Auditorium" required />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Registration &amp; contact</legend>
            <div className="form-grid">
              <label>
                Registration link
                <input type="url" name="registrationLink" value={form.registrationLink} onChange={handleChange} placeholder="https://forms.gle/..." />
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
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : isAdmin ? 'Publish Event' : 'Submit Event'}
            </button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
};

export default EventForm;
