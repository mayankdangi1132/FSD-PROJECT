import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  CalendarX,
  User,
  Mail,
  Phone,
  Pencil,
  Trophy,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import API, { getError } from '../api';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import { PosterPlaceholder } from '../components/EventCard';
import { Loader, EmptyState } from '../components/States';
import {
  TYPE_COLORS,
  TYPE_LABELS,
  formatDate,
  formatDateRange,
  formatEventTime,
  eventStatus,
  isCompleted,
  isMultiDay,
  ordinal,
  todayStr,
} from '../utils/helpers';

const medal = { 1: '🥇', 2: '🥈', 3: '🥉' };

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast, confirm } = useFeedback();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => setError(getError(err)));
  }, [id]);

  if (error) {
    return (
      <div className="container page">
        <EmptyState icon={CalendarX} title="Event not found" text={error}>
          <Link to="/events" className="btn btn-primary">
            Back to events
          </Link>
        </EmptyState>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="container page">
        <Loader text="Loading event..." />
      </div>
    );
  }

  const completed = isCompleted(event);
  const canManage = user.role === 'admin' || user._id === event.organizer;
  const registrationClosed = completed || (event.registrationDeadline && event.registrationDeadline < todayStr());
  const status = eventStatus(event);

  const handleDelete = async () => {
    if (!(await confirm(`"${event.title}" will be deleted permanently.`, { title: 'Delete event?' }))) return;
    try {
      await API.delete(`/events/${event._id}`);
      toast('Event deleted');
      navigate(dashboardPath(user));
    } catch (err) {
      toast(getError(err), 'error');
    }
  };

  return (
    <div className="container page">
      <Link to="/events" className="back-link">
        <ArrowLeft size={16} /> Back to events
      </Link>

      {event.status !== 'approved' && (
        <p className={`alert ${event.status === 'rejected' ? 'error' : 'warning'}`}>
          {event.status === 'pending'
            ? 'This event is waiting for admin approval. Students cannot see it yet.'
            : 'This event was rejected by the admin. Edit it to send it for review again.'}
        </p>
      )}

      <div className="details">
        <div className="details-poster">
          {event.poster ? <img src={event.poster} alt={event.title} /> : <PosterPlaceholder category={event.category} big />}
        </div>

        <div className="details-info">
          <div className="badges">
            <span className="chip">{event.category}</span>
            <span className="chip" style={{ '--chip': TYPE_COLORS[event.organizerType] }}>
              {TYPE_LABELS[event.organizerType]} event
            </span>
            <span className={`pill ${completed ? 'rejected' : 'approved'}`}>{status}</span>
            {event.eventType === 'competitive' && <span className="pill pending">Competitive</span>}
          </div>

          <h1>{event.title}</h1>
          <p className="organizer-name big" style={{ '--dot': TYPE_COLORS[event.organizerType] }}>
            Organised by {event.organizerName}
          </p>

          <ul className="info-list">
            <li>
              <CalendarDays size={18} />
              <div>
                <small>Date</small>
                {formatDateRange(event)}
                {isMultiDay(event) && <em> (multi-day)</em>}
              </div>
            </li>
            <li>
              <Clock size={18} />
              <div>
                <small>Time (IST)</small>
                {formatEventTime(event)}
              </div>
            </li>
            <li>
              <MapPin size={18} />
              <div>
                <small>Venue</small>
                {event.venue}
              </div>
            </li>
            {event.registrationDeadline && (
              <li>
                <CalendarX size={18} />
                <div>
                  <small>Register by</small>
                  {formatDate(event.registrationDeadline, true)}
                </div>
              </li>
            )}
          </ul>

          <div className="contact-box">
            <small>Contact</small>
            {event.contactName && (
              <span>
                <User size={15} /> {event.contactName}
              </span>
            )}
            {event.contactEmail && (
              <a href={`mailto:${event.contactEmail}`}>
                <Mail size={15} /> {event.contactEmail}
              </a>
            )}
            {event.contactPhone && (
              <a href={`tel:${event.contactPhone}`}>
                <Phone size={15} /> {event.contactPhone}
              </a>
            )}
          </div>

          {event.registrationLink &&
            (registrationClosed ? (
              <button className="btn btn-outline btn-block" disabled>
                Registration closed
              </button>
            ) : (
              <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-block">
                Register now <ExternalLink size={16} />
              </a>
            ))}

          {canManage && (
            <div className="owner-actions">
              <Link to={`/events/${event._id}/edit`} className="btn btn-outline btn-sm">
                <Pencil size={14} /> Edit
              </Link>
              {event.eventType === 'competitive' && (
                <Link to={`/events/${event._id}/winners`} className="btn btn-outline btn-sm">
                  <Trophy size={14} /> Manage winners
                </Link>
              )}
              <button className="btn btn-danger-soft btn-sm" onClick={handleDelete}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <section className="panel">
        <h2>About this event</h2>
        <p className="description">{event.description}</p>
      </section>

      {/* the winners section is only for competitive events */}
      {event.eventType === 'competitive' && (
        <section className="panel">
          <h2>
            <Trophy size={20} /> Winners
          </h2>
          {!completed ? (
            <EmptyState icon={Trophy} title="Results will be announced after the event" />
          ) : event.winners.length === 0 ? (
            <EmptyState icon={Trophy} title="Results have not been published yet" />
          ) : (
            <div className="winner-grid">
              {event.winners.map((w) => (
                <div key={w._id} className={`winner-card pos-${w.position}`}>
                  {w.photo ? <img src={w.photo} alt={w.name} /> : <div className="winner-avatar">{w.name.charAt(0).toUpperCase()}</div>}
                  <span className="position">
                    {medal[w.position] || ''} {ordinal(w.position)} Place
                  </span>
                  <h3>{w.name}</h3>
                  {w.teamName && w.teamName !== w.name && <p>Team {w.teamName}</p>}
                  {w.usn && <p>{w.usn}</p>}
                  {(w.department || w.semester) && (
                    <p>
                      {w.department}
                      {w.department && w.semester && ' · '}
                      {w.semester && `Sem ${w.semester}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default EventDetails;
