import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API, { getError } from '../api';
import EventCard from '../components/EventCard';
import OrganizerSelect from '../components/OrganizerSelect';
import { CATEGORIES } from '../utils/helpers';

const Events = () => {
  const [params] = useSearchParams();

  const [filters, setFilters] = useState({
    search: '',
    organizer: params.get('organizer') || '',
    category: params.get('category') || '',
    date: '',
    // coming from a club page we show all their events, otherwise only upcoming
    when: params.get('organizer') ? 'all' : 'upcoming',
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // small delay so we don't call the API on every key press while searching
    const timer = setTimeout(() => {
      setLoading(true);
      const query = { ...filters };
      if (query.when === 'all') delete query.when;

      API.get('/events', { params: query })
        .then((res) => {
          setEvents(res.data);
          setError('');
        })
        .catch((err) => setError(getError(err)))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const update = (field, value) => setFilters({ ...filters, [field]: value });

  const clearFilters = () => setFilters({ search: '', organizer: '', category: '', date: '', when: 'all' });

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Events</h1>
        <p>Search and filter events from all clubs, departments and the college.</p>
      </div>

      <div className="tabs">
        {['upcoming', 'completed', 'all'].map((w) => (
          <button key={w} className={filters.when === w ? 'tab active' : 'tab'} onClick={() => update('when', w)}>
            {w === 'upcoming' ? 'Upcoming' : w === 'completed' ? 'Completed' : 'All Events'}
          </button>
        ))}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by event name..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
        />
        <OrganizerSelect value={filters.organizer} onChange={(v) => update('organizer', v)} />
        <select value={filters.category} onChange={(e) => update('category', e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input type="date" value={filters.date} onChange={(e) => update('date', e.target.value)} title="Events on this date" />
        <button className="btn btn-outline" onClick={clearFilters}>
          Clear
        </button>
      </div>

      {error && <p className="alert error">{error}</p>}

      {loading ? (
        <p className="loading">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="empty">No events match your filters.</p>
      ) : (
        <>
          <p className="result-count">
            {events.length} event{events.length > 1 ? 's' : ''} found
          </p>
          <div className="card-grid">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Events;
