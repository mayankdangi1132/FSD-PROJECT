import { Link } from 'react-router-dom';
import { TYPE_COLORS, formatDateRange, formatTime, eventStatus } from '../utils/helpers';

const EventCard = ({ event }) => {
  const status = eventStatus(event);

  return (
    <Link to={`/events/${event._id}`} className="event-card" style={{ borderTopColor: TYPE_COLORS[event.organizerType] }}>
      <div className="event-card-img">
        {event.poster ? (
          <img src={event.poster} alt={event.title} loading="lazy" />
        ) : (
          <div className={`poster-placeholder cat-${event.category.toLowerCase()}`}>{event.category}</div>
        )}
        <span className={`status-badge ${status === 'Completed' ? 'done' : status === 'Upcoming' ? 'soon' : 'live'}`}>
          {status}
        </span>
      </div>

      <div className="event-card-body">
        <span className="category-tag">{event.category}</span>
        <h3>{event.title}</h3>
        <p className="meta">📅 {formatDateRange(event)}</p>
        <p className="meta">
          🕒 {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </p>
        <p className="meta">📍 {event.venue}</p>
        <p className="organizer" style={{ color: TYPE_COLORS[event.organizerType] }}>
          {event.organizerName}
        </p>
      </div>
    </Link>
  );
};

export default EventCard;
