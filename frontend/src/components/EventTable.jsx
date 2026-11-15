import { Link } from 'react-router-dom';
import { formatDateRange, eventStatus, TYPE_LABELS } from '../utils/helpers';

// table of events used on the admin and organizer dashboards
const EventTable = ({ events, onDelete, onStatusChange, showOrganizer = false }) => {
  if (events.length === 0) return <p className="empty">No events here yet.</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Event</th>
            {showOrganizer && <th>Organizer</th>}
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e._id}>
              <td>
                <Link to={`/events/${e._id}`} className="table-title">
                  {e.title}
                </Link>
                <small>
                  {e.category} · {e.eventType === 'competitive' ? 'Competitive' : 'Non-competitive'}
                </small>
              </td>
              {showOrganizer && (
                <td>
                  {e.organizerName}
                  <small>{TYPE_LABELS[e.organizerType]}</small>
                </td>
              )}
              <td>{formatDateRange(e)}</td>
              <td>
                <span className={`pill ${e.status}`}>{e.status}</span>
                <small>{eventStatus(e)}</small>
              </td>
              <td className="actions">
                {onStatusChange && e.status !== 'approved' && (
                  <button className="btn btn-sm btn-success" onClick={() => onStatusChange(e._id, 'approved')}>
                    Approve
                  </button>
                )}
                {onStatusChange && e.status !== 'rejected' && (
                  <button className="btn btn-sm btn-warning" onClick={() => onStatusChange(e._id, 'rejected')}>
                    Reject
                  </button>
                )}
                <Link to={`/events/${e._id}/edit`} className="btn btn-sm btn-outline">
                  Edit
                </Link>
                {e.eventType === 'competitive' && (
                  <Link to={`/events/${e._id}/winners`} className="btn btn-sm btn-outline">
                    Winners
                  </Link>
                )}
                <button className="btn btn-sm btn-danger" onClick={() => onDelete(e)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventTable;
