import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import API, { getError } from '../api';
import { Loader, EmptyState } from '../components/States';
import { TYPE_COLORS, initials } from '../utils/helpers';

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
            ? 'Student clubs that organise events on campus.'
            : 'Academic departments and the events they conduct.'}
        </p>
      </div>

      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <Loader />
      ) : list.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()} added yet`} />
      ) : (
        <div className="card-grid">
          {list.map((org) => (
            <div key={org._id} className="org-card">
              <div className="org-card-top">
                {org.logo ? (
                  <img src={org.logo} alt="" className="avatar lg" />
                ) : (
                  <span className="avatar lg" style={{ background: TYPE_COLORS[role] }}>
                    {initials(org.name)}
                  </span>
                )}
                <span className="chip">
                  {org.eventCount} event{org.eventCount === 1 ? '' : 's'}
                </span>
              </div>
              <h3>{org.name}</h3>
              <p>{org.description || 'No description added.'}</p>
              <a href={`mailto:${org.email}`} className="meta-link">
                <Mail size={14} /> {org.email}
              </a>
              <Link to={`/events?organizer=${org._id}`} className="btn btn-light-blue btn-block">
                View events <ArrowRight size={15} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Organizers;
