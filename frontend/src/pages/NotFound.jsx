import { Link } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';
import { EmptyState } from '../components/States';

const NotFound = () => (
  <div className="container page">
    <EmptyState icon={MapPinOff} title="Page not found" text="The page you are looking for does not exist.">
      <Link to="/" className="btn btn-primary">
        Go home
      </Link>
    </EmptyState>
  </div>
);

export default NotFound;
