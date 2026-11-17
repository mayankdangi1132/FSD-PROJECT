import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid">
      <div>
        <Link to="/" className="logo footer-logo">
          <img src="/favicon.svg" alt="" />
          <span>
            Campus <b>Connect</b>
          </span>
        </Link>
        <p>The official event portal of our college. Every club, department and college event in one calendar.</p>
      </div>
      <div>
        <h4>Explore</h4>
        <Link to="/events">Events</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/clubs">Clubs</Link>
        <Link to="/departments">Departments</Link>
      </div>
      <div>
        <h4>Account</h4>
        <Link to="/login">Login</Link>
        <Link to="/settings">Change password</Link>
        <p className="small">Accounts are created by the college admin office.</p>
      </div>
    </div>
    <p className="copyright">© {new Date().getFullYear()} Campus Connect · College Event Management &amp; Calendar Portal</p>
  </footer>
);

export default Footer;
