import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Power, Search } from 'lucide-react';
import API, { getError } from '../api';
import { useFeedback } from '../context/FeedbackContext';
import Modal from './Modal';
import ImageUpload from './ImageUpload';
import { Loader, EmptyState } from './States';
import { initials, makeTempPassword } from '../utils/helpers';

const emptyForm = { name: '', email: '', password: '', description: '', logo: '', autoApprove: false };

// Club Management / Department Management on the admin dashboard.
// Each club or department is also its organizer login account.
const AccountManager = ({ role, onChange }) => {
  const label = role === 'club' ? 'Club' : 'Department';
  const { toast, confirm } = useFeedback();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState('all');

  const [editing, setEditing] = useState(null); // null = closed, 'new' or the account being edited
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () =>
    API.get('/users', { params: { role } })
      .then((res) => setList(res.data))
      .catch((err) => toast(getError(err), 'error'))
      .finally(() => setLoading(false));

  useEffect(() => {
    setLoading(true);
    load();
  }, [role]);

  const refresh = () => {
    load();
    if (onChange) onChange();
  };

  const openNew = () => {
    setForm({ ...emptyForm, password: makeTempPassword() });
    setFormError('');
    setEditing('new');
  };

  const openEdit = (account) => {
    setForm({
      name: account.name,
      email: account.email,
      password: '',
      description: account.description || '',
      logo: account.logo || '',
      autoApprove: account.autoApprove,
    });
    setFormError('');
    setEditing(account);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') {
        await API.post('/users', { ...form, role });
        toast(`${label} account created. Share the email and temporary password with them.`);
      } else {
        const body = { ...form };
        if (!body.password) delete body.password; // keep the old password
        await API.put(`/users/${editing._id}`, body);
        toast(form.password ? `${label} updated and password reset` : `${label} updated`);
      }
      setEditing(null);
      refresh();
    } catch (err) {
      setFormError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (account) => {
    const action = account.isActive ? 'Deactivate' : 'Activate';
    if (account.isActive) {
      const ok = await confirm(`${account.name} will not be able to log in or publish events until you activate it again.`, {
        title: `Deactivate ${account.name}?`,
        confirmText: 'Deactivate',
      });
      if (!ok) return;
    }
    try {
      await API.put(`/users/${account._id}`, { isActive: !account.isActive });
      toast(`${account.name} ${action.toLowerCase()}d`);
      refresh();
    } catch (err) {
      toast(getError(err), 'error');
    }
  };

  const remove = async (account) => {
    const ok = await confirm(
      `This deletes the ${label.toLowerCase()} account "${account.name}" and all ${account.eventCount} of its events. This cannot be undone.`,
      { title: `Delete ${account.name}?` }
    );
    if (!ok) return;
    try {
      await API.delete(`/users/${account._id}`);
      toast(`${account.name} deleted`);
      refresh();
    } catch (err) {
      toast(getError(err), 'error');
    }
  };

  const shown = list.filter((a) => {
    if (showInactive === 'active' && !a.isActive) return false;
    if (showInactive === 'inactive' && a.isActive) return false;
    const text = `${a.name} ${a.email}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const activeCount = list.filter((a) => a.isActive).length;

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>{label}s</h2>
          <p className="muted">
            {activeCount} active · {list.length - activeCount} inactive
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Add {label}
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder={`Search ${label.toLowerCase()}s...`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={showInactive} onChange={(e) => setShowInactive(e.target.value)}>
          <option value="all">All accounts</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : shown.length === 0 ? (
        <EmptyState title={`No ${label.toLowerCase()}s found`} text={`Add a ${label.toLowerCase()} to give them an organizer login.`} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{label}</th>
                <th>Login email</th>
                <th>Events</th>
                <th>Publishing</th>
                <th>Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((a) => (
                <tr key={a._id} className={a.isActive ? '' : 'row-muted'}>
                  <td>
                    <div className="name-cell">
                      {a.logo ? <img src={a.logo} alt="" className="avatar" /> : <span className="avatar">{initials(a.name)}</span>}
                      <div>
                        <span className="table-title">{a.name}</span>
                        <small className="clamp">{a.description || 'No description'}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {a.email}
                    {a.mustChangePassword && <small className="warn-text">Temporary password not changed yet</small>}
                  </td>
                  <td>{a.eventCount}</td>
                  <td>
                    <small className="plain">{a.autoApprove ? 'Publishes directly' : 'Needs approval'}</small>
                  </td>
                  <td>
                    <span className={`pill ${a.isActive ? 'approved' : 'rejected'}`}>{a.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(a)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="btn btn-sm btn-outline" onClick={() => toggleActive(a)} title={a.isActive ? 'Deactivate' : 'Activate'}>
                      <Power size={14} /> {a.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-sm btn-danger-soft" onClick={() => remove(a)} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? `Add ${label}` : `Edit ${editing.name}`} onClose={() => setEditing(null)} wide>
          <form className="form-grid" onSubmit={handleSubmit}>
            {formError && <p className="alert error full">{formError}</p>}

            <label>
              {label} name *
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Official email (used to log in) *
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>

            <label className="full">
              Description
              <textarea name="description" rows="3" value={form.description} onChange={handleChange} />
            </label>

            <div className="full">
              <span className="label-text">{label} logo</span>
              <ImageUpload small value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} />
            </div>

            <label>
              {editing === 'new' ? 'Temporary password *' : 'Reset password (leave empty to keep)'}
              <div className="input-row">
                <input
                  type="text"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required={editing === 'new'}
                />
                <button type="button" className="btn btn-outline" onClick={() => setForm({ ...form, password: makeTempPassword() })}>
                  Generate
                </button>
              </div>
              <small className="hint">They will be asked to change it after logging in.</small>
            </label>

            <label className="checkbox">
              <input type="checkbox" name="autoApprove" checked={form.autoApprove} onChange={handleChange} />
              Can publish events without admin approval
            </label>

            <div className="full modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editing === 'new' ? `Create ${label}` : 'Save changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AccountManager;
