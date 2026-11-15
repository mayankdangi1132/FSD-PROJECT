import { useState } from 'react';
import { Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { getError } from '../api';

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // page they tried to open before being sent to login
  const from = location.state?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from || dashboardPath(user)} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login(email, password);
      navigate(from || dashboardPath(loggedIn), { replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <p className="muted">Students, clubs, departments and admin.</p>

        {from && !error && <p className="alert warning">Please log in with your college account to continue.</p>}
        {error && <p className="alert error">{error}</p>}

        <label>
          College email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@college.edu"
            required
          />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="auth-note">
          New student?{' '}
          <Link to="/register" state={{ from }}>
            Create an account
          </Link>{' '}
          with your college email.
          <br />
          Club and department accounts are created by the admin.
        </p>
      </form>
    </div>
  );
};

export default Login;
