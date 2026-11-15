import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container page center">
    <h1>404</h1>
    <p>We couldn't find that page.</p>
    <Link to="/" className="btn btn-primary">
      Go Home
    </Link>
  </div>
);

export default NotFound;
