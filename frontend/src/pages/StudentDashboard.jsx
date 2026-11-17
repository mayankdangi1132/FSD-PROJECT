import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, CalendarCheck, CalendarRange, Trophy, ArrowRight } from 'lucide-react';
import API, { getError } from '../api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import EventCard from '../components/EventCard';
import EventCalendar from '../components/EventCalendar';
import OrganizerSelect from '../components/OrganizerSelect';
import { Loader, EmptyState } from '../components/States';
import { CATEGORIES, formatDate, formatEventTime, ordinal, TYPE_COLORS } from '../utils/helpers';

// one horizontal section of event cards
const EventSection = ({ title, events, link, emptyText }) => (
  <section className="panel">
    <div className="panel-head">
      <h2>{title}</h2>
      {link && (
        <Link to={link} className="link-more">
          See all <ArrowRight size={15} />
        </Link>
      )}
    </div>
    {events.length === 0 ? (
      <EmptyState title={emptyText} />
    ) : (
      <div className="card-grid">
        {events.map((e) => (
          <EventCard key={e._id} event={e} />
        ))}
      </div>
    )}
  </section>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', organizer: '', category: '' });

  useEffect(() => {
    Promise.all([API.get('/dashboard/student'), API.get('/events')])
      .then(([dash, events]) => {
        setData(dash.data);
        setAllEvents(events.data);
      })
      .catch((err) => setError(getError(err)));
  }, []);

  // search goes to the Events page with the filters in the URL
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
    navigate(`/events?${params.toString()}`);
  };

  const firstName = user.name.split(' ')[0];

  return (
    <DashboardLayout
      title={`Welcome, ${firstName}`}
      subtitle={[user.usn, user.department, user.semester && `Semester ${user.semester}`].filter(Boolean).join(' · ')}
    >
      <form className="search-panel" onSubmit={handleSearch}>
        <div className="search-box big">
          <Search size={18} />
          <input
            placeholder="Search events by name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <OrganizerSelect value={filters.organizer} onChange={(v) => setFilters({ ...filters, organizer: v })} />
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button className="btn btn-primary">Search</button>
      </form>

      {error && <p className="alert error">{error}</p>}

      {!data ? (
        <Loader text="Loading your dashboard..." />
      ) : (
        <>
          <div className="dash-grid">
            <section className="panel">
              <div className="panel-head">
                <h2>
                  <CalendarCheck size={19} /> Happening today
                </h2>
                <span className="count-badge">{data.today.length}</span>
              </div>
              {data.today.length === 0 ? (
                <EmptyState title="Nothing scheduled today" />
              ) : (
                <ul className="mini-list">
                  {data.today.map((e) => (
                    <li key={e._id} style={{ '--dot': TYPE_COLORS[e.organizerType] }}>
                      <Link to={`/events/${e._id}`}>{e.title}</Link>
                      <small>
                        {formatEventTime(e)} · {e.venue}
                      </small>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>
                  <CalendarRange size={19} /> This week
                </h2>
                <span className="count-badge">{data.thisWeek.length}</span>
              </div>
              {data.thisWeek.length === 0 ? (
                <EmptyState title="No events in the next 7 days" />
              ) : (
                <ul className="mini-list">
                  {data.thisWeek.slice(0, 6).map((e) => (
                    <li key={e._id} style={{ '--dot': TYPE_COLORS[e.organizerType] }}>
                      <Link to={`/events/${e._id}`}>{e.title}</Link>
                      <small>
                        {formatDate(e.startDate, true)} · {formatEventTime(e)}
                      </small>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <EventSection title="Upcoming events" events={data.upcoming} link="/events" emptyText="No upcoming events" />

          <div className="dash-grid wide-left">
            <section className="panel">
              <div className="panel-head">
                <h2>Calendar</h2>
                <Link to="/calendar" className="link-more">
                  Full calendar <ArrowRight size={15} />
                </Link>
              </div>
              <EventCalendar events={allEvents} small />
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>
                  <Trophy size={19} /> Latest winners
                </h2>
              </div>
              {data.recentWinners.length === 0 ? (
                <EmptyState icon={Trophy} title="No results yet" />
              ) : (
                <ul className="winner-list">
                  {data.recentWinners.map((event) => (
                    <li key={event._id}>
                      <Link to={`/events/${event._id}`}>{event.title}</Link>
                      <small>
                        {event.organizerName} · {formatDate(event.endDate)}
                      </small>
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

          <EventSection title="Recently added" events={data.recent} emptyText="No events yet" />
          <EventSection title="Completed events" events={data.completed} link="/events?when=completed" emptyText="No completed events yet" />
        </>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
