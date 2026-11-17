import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { TYPE_COLORS, formatDateRange, formatEventTime, eventStatus } from '../utils/helpers';

export const CATEGORY_ICONS = {
  Technical: '💻',
  Cultural: '🎭',
  Sports: '🏏',
  Workshop: '🛠️',
  Seminar: '🎤',
  Competition: '🏆',
  Other: '📌',
};

// shown when an event has no poster
export const PosterPlaceholder = ({ category, big = false }) => (
  <div className={`poster-placeholder cat-${category.toLowerCase()}${big ? ' big' : ''}`}>
    <span>{CATEGORY_ICONS[category]}</span>
    {category}
  </div>
);

const EventCard = ({ event }) => {
  const status = eventStatus(event);
  const statusClass = status === 'Completed' ? 'done' : status === 'Upcoming' ? 'soon' : 'live';

  return (
    <article className="event-card">
      <Link to={`/events/${event._id}`} className="event-card-img">
        {event.poster ? (
          <img src={event.poster} alt={event.title} loading="lazy" />
        ) : (
          <PosterPlaceholder category={event.category} />
        )}
        <span className={`status-badge ${statusClass}`}>{status}</span>
      </Link>

      <div className="event-card-body">
        <div className="card-tags">
          <span className="chip">{event.category}</span>
          <span className="organizer-name" style={{ '--dot': TYPE_COLORS[event.organizerType] }}>
            {event.organizerName}
          </span>
        </div>

        <h3>
          <Link to={`/events/${event._id}`}>{event.title}</Link>
        </h3>

        <ul className="meta-list">
          <li>
            <CalendarDays size={15} /> {formatDateRange(event)}
          </li>
          <li>
            <Clock size={15} /> {formatEventTime(event)}
          </li>
          <li>
            <MapPin size={15} /> {event.venue}
          </li>
        </ul>

        <Link to={`/events/${event._id}`} className="btn btn-light-blue btn-block">
          View Details
        </Link>
      </div>
    </article>
  );
};

export default EventCard;
