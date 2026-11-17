import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Trophy, Users, Building2, Lock, Clock, MapPin } from 'lucide-react';
import API from '../api';
import { useAuth, dashboardPath } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import EventCalendar from '../components/EventCalendar';
import { EmptyState } from '../components/States';
import { TYPE_COLORS, formatDate, formatEventTime, ordinal, initials } from '../utils/helpers';

// list of clubs or departments (this part is public)
const OrganizerStrip = ({ title, items, link, type }) => (
  <section className="section">
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        <p className="muted">
          {items.length} {type === 'club' ? 'clubs' : 'departments'} publish their events here
        </p>
      </div>
      <Link to={link} className="link-more">
        View all <ArrowRight size={15} />
      </Link>
    </div>
    {items.length === 0 ? (
      <EmptyState title="Nothing added yet" />
    ) : (
      <div className="org-grid">
        {items.slice(0, 4).map((o) => (
          <Link key={o._id} to={link} className="org-tile">
            {o.logo ? (
              <img src={o.logo} alt="" className="avatar lg" />
            ) : (
              <span className="avatar lg" style={{ background: TYPE_COLORS[type] }}>
                {initials(o.name)}
              </span>
            )}
            <div>
              <h4>{o.name}</h4>
              <p className="clamp">{o.description || 'No description yet.'}</p>
            </div>
          </Link>
        ))}
      </div>
    )}
  </section>
);

const Home = () => {
  const { user } = useAuth();
  const [organizers, setOrganizers] = useState([]);
  const [dash, setDash] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [allEvents, setAllEvents] = useState([]);

  // clubs and departments are public
  useEffect(() => {
    API.get('/organizers').then((res) => setOrganizers(res.data));
  }, []);

  // events are only for logged in college members
  useEffect(() => {
    if (!user || user.mustChangePassword) return;
    Promise.all([
      API.get('/dashboard/student'),
      API.get('/events', { params: { when: 'upcoming', organizer: 'college' } }),
      API.get('/events'),
    ])
      .then(([d, f, all]) => {
        setDash(d.data);
        setFeatured(f.data.slice(0, 3));
        setAllEvents(all.data);
      })
      .catch(() => {});
  }, [user]);

  const clubs = organizers.filter((o) => o.role === 'club');
  const departments = organizers.filter((o) => o.role === 'department');
  const nextUp = dash ? dash.upcoming.slice(0, 3) : [];

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-tag">College Event Management &amp; Calendar Portal</span>
            <h1>Every college event, in one calendar.</h1>
            <p>
              Fests, hackathons, workshops, seminars and sports meets from every club and department. See what's on, when
              and where, and check the results of every competition.
            </p>
            <div className="hero-buttons">
              {user ? (
                <>
                  <Link to="/events" className="btn btn-white btn-lg">
                    Explore events
                  </Link>
                  <Link to={dashboardPath(user)} className="btn btn-ghost btn-lg">
                    My dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-white btn-lg">
                    Log in to view events
                  </Link>
                  <a href="#clubs" className="btn btn-ghost btn-lg">
                    Browse clubs
                  </a>
                </>
              )}
            </div>
            <div className="hero-stats">
              <span>
                <b>{clubs.length}</b> clubs
              </span>
              <span>
                <b>{departments.length}</b> departments
              </span>
              <span>
                <b>IST</b> timings
              </span>
            </div>
          </div>

          <div className="hero-card">
            {user && dash ? (
              <>
                <h3>Next up</h3>
                {nextUp.length === 0 && <p className="muted">No upcoming events.</p>}
                <ul className="next-list">
                  {nextUp.map((e) => (
                    <li key={e._id} style={{ '--dot': TYPE_COLORS[e.organizerType] }}>
                      <Link to={`/events/${e._id}`}>{e.title}</Link>
                      <small>
                        <CalendarDays size={13} /> {formatDate(e.startDate)} <Clock size={13} /> {formatEventTime(e)}
                      </small>
                      <small>
                        <MapPin size={13} /> {e.venue}
                      </small>
                    </li>
                  ))}
                </ul>
                <Link to="/calendar" className="link-more">
                  Open the calendar <ArrowRight size={15} />
                </Link>
              </>
            ) : (
              <>
                <h3>What's inside</h3>
                <ul className="feature-list">
                  <li>
                    <span className="stat-icon blue">
                      <CalendarDays size={18} />
                    </span>
                    <div>
                      <b>Event calendar</b>
                      <small>Month, week and day views with exact timings</small>
                    </div>
                  </li>
                  <li>
                    <span className="stat-icon purple">
                      <Trophy size={18} />
                    </span>
                    <div>
                      <b>Competition results</b>
                      <small>Winners published by the organizers</small>
                    </div>
                  </li>
                  <li>
                    <span className="stat-icon teal">
                      <Users size={18} />
                    </span>
                    <div>
                      <b>Official accounts only</b>
                      <small>Created by the college admin office</small>
                    </div>
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="container">
        {user && dash ? (
          <>
            <section className="section">
              <div className="section-head">
                <h2>Upcoming events</h2>
                <Link to="/events" className="link-more">
                  View all <ArrowRight size={15} />
                </Link>
              </div>
              {dash.upcoming.length === 0 ? (
                <EmptyState title="No upcoming events right now" />
              ) : (
                <div className="card-grid">
                  {dash.upcoming.slice(0, 4).map((e) => (
                    <EventCard key={e._id} event={e} />
                  ))}
                </div>
              )}
            </section>

            {featured.length > 0 && (
              <section className="section">
                <div className="section-head">
                  <div>
                    <h2>Featured college events</h2>
                    <p className="muted">Organised by the college administration</p>
                  </div>
                </div>
                <div className="card-grid">
                  {featured.map((e) => (
                    <EventCard key={e._id} event={e} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          !user && (
            <section className="section">
              <div className="locked-box">
                <span className="stat-icon blue">
                  <Lock size={20} />
                </span>
                <h3>Events are only for our college</h3>
                <p>Log in with the account given by the admin office to see upcoming events, the calendar and results.</p>
                <Link to="/login" className="btn btn-primary">
                  Log in
                </Link>
              </div>
            </section>
          )
        )}

        <div id="clubs">
          <OrganizerStrip title="Browse clubs" items={clubs} link="/clubs" type="club" />
        </div>
        <OrganizerStrip title="Browse departments" items={departments} link="/departments" type="department" />

        {user && dash && (
          <div className="dash-grid wide-left section">
            <section className="panel">
              <div className="panel-head">
                <h2>Calendar preview</h2>
                <Link to="/calendar" className="link-more">
                  Full calendar <ArrowRight size={15} />
                </Link>
              </div>
              <EventCalendar events={allEvents} small />
            </section>
            <section className="panel">
              <div className="panel-head">
                <h2>
                  <Trophy size={19} /> Recently announced winners
                </h2>
              </div>
              {dash.recentWinners.length === 0 ? (
                <EmptyState icon={Trophy} title="No results yet" />
              ) : (
                <ul className="winner-list">
                  {dash.recentWinners.map((event) => (
                    <li key={event._id}>
                      <Link to={`/events/${event._id}`}>{event.title}</Link>
                      <small>{event.organizerName}</small>
                      <p>
                        {event.winners.slice(0, 3).map((w) => (
                          <span key={w._id} className={`place p${w.position}`}>
                            {ordinal(w.position)} {w.name}
                          </span>
                        ))}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
