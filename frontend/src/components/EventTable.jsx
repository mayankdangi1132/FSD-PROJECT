import { Link } from 'react-router-dom';
import { Pencil, Trophy, Trash2, Check, X } from 'lucide-react';
import { formatDateRange, formatEventTime, eventStatus, TYPE_LABELS, TYPE_COLORS } from '../utils/helpers';
import { EmptyState } from './States';

// table of events used on the admin and organizer dashboards
const EventTable = ({ events, onDelete, onStatusChange, showOrganizer = false }) => {
  if (events.length === 0) {
    return <EmptyState title="No events here" text="Events you create will show up in this list." />;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Event</th>
            {showOrganizer && <th>Organizer</th>}
            <th>Date &amp; time</th>
            <th>Status</th>
            <th className="right">Actions</th>
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
                  <span className="organizer-name" style={{ '--dot': TYPE_COLORS[e.organizerType] }}>
                    {e.organizerName}
                  </span>
                  <small>{TYPE_LABELS[e.organizerType]}</small>
                </td>
              )}
              <td>
                {formatDateRange(e)}
                <small>{formatEventTime(e)}</small>
              </td>
              <td>
                <span className={`pill ${e.status}`}>{e.status}</span>
                <small>{eventStatus(e)}</small>
              </td>
              <td className="actions">
                {onStatusChange && e.status !== 'approved' && (
                  <button className="btn btn-sm btn-success" onClick={() => onStatusChange(e, 'approved')}>
                    <Check size={14} /> Approve
                  </button>
                )}
                {onStatusChange && e.status === 'pending' && (
                  <button className="btn btn-sm btn-warning" onClick={() => onStatusChange(e, 'rejected')}>
                    <X size={14} /> Reject
                  </button>
                )}
                <Link to={`/events/${e._id}/edit`} className="btn btn-sm btn-outline" title="Edit">
                  <Pencil size={14} /> Edit
                </Link>
                {e.eventType === 'competitive' && (
                  <Link to={`/events/${e._id}/winners`} className="btn btn-sm btn-outline" title="Winners">
                    <Trophy size={14} /> Winners
                  </Link>
                )}
                <button className="btn btn-sm btn-danger-soft" onClick={() => onDelete(e)} title="Delete">
                  <Trash2 size={14} />
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
