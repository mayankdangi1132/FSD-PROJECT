import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-inner">
      <div>
        <h4>Campus Connect</h4>
        <p>One place for every club, department and college event.</p>
      </div>
      <div className="footer-links">
        <Link to="/events">Events</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/clubs">Clubs</Link>
        <Link to="/departments">Departments</Link>
      </div>
    </div>
    <p className="copyright">© {new Date().getFullYear()} Campus Connect - College Event Management Portal</p>
  </footer>
);

export default Footer;
