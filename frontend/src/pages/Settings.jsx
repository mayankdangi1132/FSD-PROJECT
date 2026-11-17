import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldAlert } from 'lucide-react';
import API, { getError } from '../api';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import DashboardLayout from '../components/DashboardLayout';

const ROLE_NAMES = { admin: 'Administrator', club: 'Club organizer', department: 'Department organizer', student: 'Student' };

// account details + change password (for every role)
const Settings = () => {
  const { user, saveUser } = useAuth();
  const { toast } = useFeedback();
  const navigate = useNavigate();

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword.length < 8) return setError('New password must be at least 8 characters');
    if (form.newPassword !== form.confirmPassword) return setError('The new passwords do not match');

    setSaving(true);
    try {
      const { data } = await API.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      const wasTemporary = user.mustChangePassword;
      saveUser(data.user);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast('Password changed');
      if (wasTemporary) navigate(dashboardPath(data.user));
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const details = [
    ['Name', user.name],
    ['Email', user.email],
    ['Account type', ROLE_NAMES[user.role]],
    user.usn && ['USN', user.usn],
    user.department && ['Department', user.department],
    user.semester && ['Semester', user.semester],
  ].filter(Boolean);

  return (
    <DashboardLayout title="Settings" subtitle="Your account details and password.">
      {user.mustChangePassword && (
        <div className="alert warning">
          <ShieldAlert size={18} />
          <div>
            <b>Please set your own password.</b> You logged in with a temporary password given by the admin. Change it to
            continue using Campus Connect.
          </div>
        </div>
      )}

      <div className="dash-grid">
        <section className="panel">
          <h2>Account</h2>
          <dl className="detail-list">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="hint">To change these details, contact the college admin.</p>
        </section>

        <section className="panel">
          <h2>
            <KeyRound size={19} /> Change password
          </h2>
          <form className="stack" onSubmit={handleSubmit}>
            {error && <p className="alert error">{error}</p>}
            <label>
              {user.mustChangePassword ? 'Temporary password' : 'Current password'}
              <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} required />
            </label>
            <label>
              New password
              <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} minLength={8} required />
              <small className="hint">At least 8 characters.</small>
            </label>
            <label>
              Confirm new password
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
            </label>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
