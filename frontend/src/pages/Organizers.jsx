import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API, { getError } from '../api';
import { TYPE_COLORS } from '../utils/helpers';

// same page is used for /clubs and /departments
const Organizers = ({ role }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const title = role === 'club' ? 'Clubs' : 'Departments';

  useEffect(() => {
    setLoading(true);
    API.get('/organizers', { params: { role } })
      .then((res) => setList(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [role]);

  return (
    <div className="container page">
      <div className="page-head">
        <h1>{title}</h1>
        <p>
          {role === 'club'
            ? 'Student clubs that organize events on campus.'
            : 'Academic departments and the events they conduct.'}
        </p>
      </div>

      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <p className="loading">Loading...</p>
      ) : list.length === 0 ? (
        <p className="empty">No {title.toLowerCase()} added yet.</p>
      ) : (
        <div className="card-grid">
          {list.map((org) => (
            <div key={org._id} className="org-card" style={{ borderLeftColor: TYPE_COLORS[role] }}>
              <div className="org-avatar" style={{ background: TYPE_COLORS[role] }}>
                {org.name.charAt(0)}
              </div>
              <h3>{org.name}</h3>
              <p>{org.description || 'No description added.'}</p>
              <p className="meta">✉️ {org.email}</p>
              <div className="org-footer">
                <span>
                  {org.eventCount} event{org.eventCount === 1 ? '' : 's'}
                </span>
                <Link to={`/events?organizer=${org._id}`}>View events →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Organizers;
