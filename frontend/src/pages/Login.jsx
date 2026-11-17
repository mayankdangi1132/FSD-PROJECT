import { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CalendarDays, Trophy, ShieldCheck } from 'lucide-react';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { getError } from '../api';

// one login page for everyone. After login each role goes to its own dashboard.
const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // page they tried to open before being sent to login
  const from = location.state?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={user.mustChangePassword ? '/settings' : from || dashboardPath(user)} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login(email, password);
      navigate(loggedIn.mustChangePassword ? '/settings' : from || dashboardPath(loggedIn), { replace: true });
    } catch (err) {
      setError(getError(err));
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-side">
        <h2>One portal for every event on campus.</h2>
        <p>Log in with the official college account given to you by the admin office.</p>
        <ul>
          <li>
            <CalendarDays size={18} /> Calendar with every club, department and college event
          </li>
          <li>
            <Trophy size={18} /> Results and winners of all competitions
          </li>
          <li>
            <ShieldCheck size={18} /> Only for students and staff of the college
          </li>
        </ul>
      </div>

      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="muted">Students, clubs, departments and admin all log in here.</p>

        {from && !error && <p className="alert info">Please log in with your college account to continue.</p>}
        {error && <p className="alert error">{error}</p>}

        <label>
          College email
          <div className="input-icon">
            <Mail size={17} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@college.edu"
              autoComplete="username"
              required
            />
          </div>
        </label>
        <label>
          Password
          <div className="input-icon">
            <Lock size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="show-pass"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>

        <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="login-note">
          There is no public sign up. Student, club and department accounts are created by the college admin. If you don't
          have one, please contact the admin office.
        </p>
      </form>
    </div>
  );
};

export default Login;
