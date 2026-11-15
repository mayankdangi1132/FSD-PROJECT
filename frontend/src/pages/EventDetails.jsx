import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API, { getError } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  TYPE_COLORS,
  TYPE_LABELS,
  formatDate,
  formatDateRange,
  formatTime,
  eventStatus,
  isCompleted,
  ordinal,
  todayStr,
} from '../utils/helpers';

const medal = { 1: '🥇', 2: '🥈', 3: '🥉' };

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container page"><p className="loading">Loading event...</p></div>;
  if (error) {
    return (
      <div className="container page">
        <p className="alert error">{error}</p>
        <Link to="/events">← Back to events</Link>
      </div>
    );
  }

  const completed = isCompleted(event);
  const canManage = user && (user.role === 'admin' || user._id === event.organizer);
  const registrationClosed = completed || (event.registrationDeadline && event.registrationDeadline < todayStr());

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/events/${event._id}`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      alert(getError(err));
    }
  };

  return (
    <div className="container page">
      <Link to="/events" className="back-link">
        ← Back to events
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
          {event.poster ? (
            <img src={event.poster} alt={event.title} />
          ) : (
            <div className={`poster-placeholder big cat-${event.category.toLowerCase()}`}>{event.category}</div>
          )}
        </div>

        <div className="details-info">
          <div className="badges">
            <span className="category-tag">{event.category}</span>
            <span className="type-tag" style={{ background: TYPE_COLORS[event.organizerType] }}>
              {TYPE_LABELS[event.organizerType]} event
            </span>
            <span className={`pill ${completed ? 'rejected' : 'approved'}`}>{eventStatus(event)}</span>
            {event.eventType === 'competitive' && <span className="pill pending">Competitive</span>}
          </div>

          <h1>{event.title}</h1>
          <p className="organizer" style={{ color: TYPE_COLORS[event.organizerType] }}>
            Organized by {event.organizerName}
          </p>

          <ul className="info-list">
            <li>
              <b>Date</b>
              {formatDateRange(event)}
              {event.startDate !== event.endDate && <small> (multi-day event)</small>}
            </li>
            <li>
              <b>Time</b>
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </li>
            <li>
              <b>Venue</b>
              {event.venue}
            </li>
            {event.registrationDeadline && (
              <li>
                <b>Register by</b>
                {formatDate(event.registrationDeadline)}
              </li>
            )}
            <li>
              <b>Contact</b>
              <span>
                {event.contactName && <>{event.contactName}<br /></>}
                {event.contactEmail && (
                  <>
                    <a href={`mailto:${event.contactEmail}`}>{event.contactEmail}</a>
                    <br />
                  </>
                )}
                {event.contactPhone && <a href={`tel:${event.contactPhone}`}>{event.contactPhone}</a>}
              </span>
            </li>
          </ul>

          {event.registrationLink &&
            (registrationClosed ? (
              <button className="btn btn-outline" disabled>
                Registration closed
              </button>
            ) : (
              <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="btn btn-accent">
                Register Now
              </a>
            ))}

          {canManage && (
            <div className="owner-actions">
              <Link to={`/events/${event._id}/edit`} className="btn btn-outline btn-sm">
                Edit Event
              </Link>
              {event.eventType === 'competitive' && (
                <Link to={`/events/${event._id}/winners`} className="btn btn-outline btn-sm">
                  Manage Winners
                </Link>
              )}
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <section className="box">
        <h2>About this event</h2>
        <p className="description">{event.description}</p>
      </section>

      {/* winners section only for competitive events */}
      {event.eventType === 'competitive' && (
        <section className="box">
          <h2>🏆 Winners</h2>
          {!completed ? (
            <p className="empty">Winners will be announced after the event is over.</p>
          ) : event.winners.length === 0 ? (
            <p className="empty">Results have not been published yet.</p>
          ) : (
            <div className="winner-grid">
              {event.winners.map((w) => (
                <div key={w._id} className={`winner-card pos-${w.position}`}>
                  {w.photo ? (
                    <img src={w.photo} alt={w.name} />
                  ) : (
                    <div className="winner-avatar">{w.name.charAt(0).toUpperCase()}</div>
                  )}
                  <span className="position">
                    {medal[w.position] || ''} {ordinal(w.position)} Place
                  </span>
                  <h3>{w.name}</h3>
                  {w.teamName && w.teamName !== w.name && <p>Team: {w.teamName}</p>}
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
