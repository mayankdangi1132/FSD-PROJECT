import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth, dashboardPath } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { CATEGORIES } from '../utils/helpers';

const categoryIcons = {
  Technical: '💻',
  Cultural: '🎭',
  Sports: '🏏',
  Workshop: '🛠️',
  Seminar: '🎤',
  Competition: '🏆',
  Other: '📌',
};

const Home = () => {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  // events are only for logged in college members, so don't even ask the API otherwise
  useEffect(() => {
    if (!user) return;
    API.get('/dashboard/student')
      .then((res) => setUpcoming(res.data.upcoming.slice(0, 3)))
      .catch(() => setUpcoming([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <p className="hero-tag">College Event Management &amp; Calendar Portal</p>
            <h1>
              Every college event,
              <br />
              <span>in one place.</span>
            </h1>
            <p>
              Fests, hackathons, workshops, seminars and sports meets from every club and department. Check the
              calendar, see event details and find out who won.
            </p>
            <div className="hero-buttons">
              {user ? (
                <>
                  <Link to="/events" className="btn btn-accent">
                    Explore Events
                  </Link>
                  <Link to="/calendar" className="btn btn-light">
                    Open Calendar
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-accent">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-light">
                    Student Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hero-card">
            <h3>For Students</h3>
            <p>Sign up with your official college email to see all events, the calendar and results.</p>
            {user ? (
              <Link to={dashboardPath(user)}>Go to my dashboard →</Link>
            ) : (
              <Link to="/register">Create student account →</Link>
            )}
            <hr />
            <h3>For Clubs &amp; Departments</h3>
            <p>Use the official college email given by the admin to publish and manage your events.</p>
            {!user && <Link to="/login">Organizer login →</Link>}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Upcoming Events</h2>
          {user && <Link to="/events">View all</Link>}
        </div>
        {!user ? (
          <div className="locked-box">
            <h3>🔒 Events are only for our college</h3>
            <p>Log in with your college account to see upcoming events, the calendar and results.</p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn btn-outline">
                Student Sign Up
              </Link>
            </div>
          </div>
        ) : loading ? (
          <p className="loading">Loading events...</p>
        ) : upcoming.length === 0 ? (
          <p className="empty">No upcoming events right now. Check back soon!</p>
        ) : (
          <div className="card-grid">
            {upcoming.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Browse by Category</h2>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <Link key={cat} to={`/events?category=${cat}`} className="category-tile">
              <span>{categoryIcons[cat]}</span>
              {cat}
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="info-strip">
          <div>
            <h3>📅 One calendar</h3>
            <p>Month, week and day views with colours for clubs, departments and college events.</p>
          </div>
          <div>
            <h3>🏆 Results</h3>
            <p>Winners of every competition are published right on the event page.</p>
          </div>
          <div>
            <h3>🔒 Official accounts</h3>
            <p>Only admin-approved club and department accounts can post events.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
