import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Power, Search } from 'lucide-react';
import API, { getError } from '../api';
import { useFeedback } from '../context/FeedbackContext';
import Modal from './Modal';
import { Loader, EmptyState } from './States';
import { makeTempPassword } from '../utils/helpers';

const emptyForm = { name: '', email: '', usn: '', department: '', semester: '', password: '' };
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

// Student accounts are created only here, by the admin. There is no public sign up.
const StudentManager = ({ onChange }) => {
  const { toast, confirm } = useFeedback();

  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () =>
    API.get('/users', { params: { role: 'student' } })
      .then((res) => setStudents(res.data))
      .catch((err) => toast(getError(err), 'error'))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    API.get('/organizers', { params: { role: 'department' } }).then((res) => setDepartments(res.data.map((d) => d.name)));
  }, []);

  const refresh = () => {
    load();
    if (onChange) onChange();
  };

  const openNew = () => {
    setForm({ ...emptyForm, password: makeTempPassword() });
    setFormError('');
    setEditing('new');
  };

  const openEdit = (s) => {
    setForm({ name: s.name, email: s.email, usn: s.usn, department: s.department, semester: s.semester, password: '' });
    setFormError('');
    setEditing(s);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') {
        await API.post('/users', { ...form, role: 'student' });
        toast(`Student account created for ${form.name}`);
      } else {
        const body = { ...form };
        if (!body.password) delete body.password;
        await API.put(`/users/${editing._id}`, body);
        toast(form.password ? 'Student updated and password reset' : 'Student updated');
      }
      setEditing(null);
      refresh();
    } catch (err) {
      setFormError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s) => {
    try {
      await API.put(`/users/${s._id}`, { isActive: !s.isActive });
      toast(`${s.name} ${s.isActive ? 'deactivated' : 'activated'}`);
      refresh();
    } catch (err) {
      toast(getError(err), 'error');
    }
  };

  const remove = async (s) => {
    const ok = await confirm(`The account of ${s.name} (${s.usn}) will be deleted permanently.`, { title: 'Delete student?' });
    if (!ok) return;
    try {
      await API.delete(`/users/${s._id}`);
      toast('Student deleted');
      refresh();
    } catch (err) {
      toast(getError(err), 'error');
    }
  };

  const shown = students.filter((s) => {
    if (deptFilter && s.department !== deptFilter) return false;
    return `${s.name} ${s.email} ${s.usn}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Students</h2>
          <p className="muted">Only students added here can log in to Campus Connect.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search by name, USN or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : shown.length === 0 ? (
        <EmptyState title="No students found" text="Add students with their official college email and USN." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>USN</th>
                <th>Department</th>
                <th>Sem</th>
                <th>Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s._id} className={s.isActive ? '' : 'row-muted'}>
                  <td>
                    <span className="table-title">{s.name}</span>
                    <small>{s.email}</small>
                  </td>
                  <td>{s.usn}</td>
                  <td>{s.department || '-'}</td>
                  <td>{s.semester || '-'}</td>
                  <td>
                    <span className={`pill ${s.isActive ? 'approved' : 'rejected'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                    {s.mustChangePassword && <small className="warn-text">First login pending</small>}
                  </td>
                  <td className="actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(s)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="btn btn-sm btn-outline" onClick={() => toggleActive(s)}>
                      <Power size={14} /> {s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-sm btn-danger-soft" onClick={() => remove(s)} title="Delete">
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
        <Modal title={editing === 'new' ? 'Add Student' : `Edit ${editing.name}`} onClose={() => setEditing(null)} wide>
          <form className="form-grid" onSubmit={handleSubmit}>
            {formError && <p className="alert error full">{formError}</p>}

            <label>
              Student name *
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Official college email *
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@college.edu" required />
            </label>
            <label>
              USN *
              <input name="usn" value={form.usn} onChange={handleChange} placeholder="1XX23CS001" required />
            </label>
            <label>
              Department
              <input name="department" list="dept-list" value={form.department} onChange={handleChange} />
              <datalist id="dept-list">
                {departments.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </label>
            <label>
              Semester
              <select name="semester" value={form.semester} onChange={handleChange}>
                <option value="">Select</option>
                {SEMESTERS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              {editing === 'new' ? 'Temporary password *' : 'Reset password (leave empty to keep)'}
              <div className="input-row">
                <input name="password" value={form.password} onChange={handleChange} minLength={6} required={editing === 'new'} />
                <button type="button" className="btn btn-outline" onClick={() => setForm({ ...form, password: makeTempPassword() })}>
                  Generate
                </button>
              </div>
              <small className="hint">The student must change it after the first login.</small>
            </label>

            <div className="full modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editing === 'new' ? 'Create Account' : 'Save changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StudentManager;
