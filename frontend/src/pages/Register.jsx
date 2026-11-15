import { useState } from 'react';
import { Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { getError } from '../api';

// sign up page for students only
const Register = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({
    name: '',
    email: '',
    usn: '',
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={dashboardPath(user)} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // error box is at the top of the form, so scroll up to it
  const showError = (msg) => {
    setError(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) return showError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return showError('Passwords do not match');

    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      const newUser = await register(data);
      navigate(from || dashboardPath(newUser), { replace: true });
    } catch (err) {
      showError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Student Sign Up</h1>
        <p className="muted">Only students with an official college email can sign up.</p>

        {error && <p className="alert error">{error}</p>}

        <label>
          Full name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          College email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="yourname@college.edu"
            required
          />
        </label>
        <div className="two-col">
          <label>
            USN / Student ID
            <input name="usn" value={form.usn} onChange={handleChange} placeholder="1XX23CS001" required />
          </label>
          <label>
            Department
            <input name="department" value={form.department} onChange={handleChange} placeholder="CSE" />
          </label>
        </div>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </label>

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="auth-note">
          Already have an account?{' '}
          <Link to="/login" state={{ from }}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
