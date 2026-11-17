import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CalendarSearch } from 'lucide-react';
import API, { getError } from '../api';
import EventCard from '../components/EventCard';
import OrganizerSelect from '../components/OrganizerSelect';
import { Loader, EmptyState } from '../components/States';
import { CATEGORIES } from '../utils/helpers';

const TABS = [
  ['upcoming', 'Upcoming'],
  ['completed', 'Completed & results'],
  ['all', 'All events'],
];

const emptyFilters = { search: '', organizer: '', category: '', date: '', when: 'all' };

const Events = () => {
  const [params] = useSearchParams();

  // filters can come from the URL (student dashboard search, club pages, home page)
  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    organizer: params.get('organizer') || '',
    category: params.get('category') || '',
    date: '',
    when: params.get('when') || (params.get('organizer') || params.get('search') ? 'all' : 'upcoming'),
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

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Events</h1>
        <p>Search and filter events from every club, department and the college.</p>
      </div>

      <div className="tabs">
        {TABS.map(([value, label]) => (
          <button key={value} className={filters.when === value ? 'tab active' : 'tab'} onClick={() => update('when', value)}>
            {label}
          </button>
        ))}
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search by event name..." value={filters.search} onChange={(e) => update('search', e.target.value)} />
        </div>
        <OrganizerSelect value={filters.organizer} onChange={(v) => update('organizer', v)} />
        <select value={filters.category} onChange={(e) => update('category', e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input type="date" value={filters.date} onChange={(e) => update('date', e.target.value)} title="Events on this date" />
        <button className="btn btn-outline" onClick={() => setFilters(emptyFilters)}>
          Clear
        </button>
      </div>

      {error && <p className="alert error">{error}</p>}

      {loading ? (
        <Loader text="Loading events..." />
      ) : events.length === 0 ? (
        <EmptyState icon={CalendarSearch} title="No events found" text="Try changing or clearing the filters." />
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
