import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import API, { getError } from '../api';
import { useFeedback } from '../context/FeedbackContext';
import DashboardLayout from '../components/DashboardLayout';
import ImageUpload from '../components/ImageUpload';
import { Loader } from '../components/States';
import { formatDateRange, isCompleted, ordinal } from '../utils/helpers';

const newWinner = (position) => ({
  position,
  name: '',
  teamName: '',
  usn: '',
  department: '',
  semester: '',
  photo: '',
});

const ManageWinners = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useFeedback();

  const [event, setEvent] = useState(null);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data);
        setWinners(res.data.winners.length ? res.data.winners : [newWinner(1), newWinner(2), newWinner(3)]);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const updateWinner = (index, field, value) => {
    const copy = [...winners];
    copy[index] = { ...copy[index], [field]: value };
    setWinners(copy);
  };

  const addRow = () => setWinners([...winners, newWinner(winners.length + 1)]);
  const removeRow = (index) => setWinners(winners.filter((_, i) => i !== index));

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    // rows left completely empty are just ignored
    const filled = winners.filter((w) => w.name.trim() !== '');

    setSaving(true);
    try {
      await API.put(`/events/${id}/winners`, { winners: filled });
      toast(filled.length ? 'Winners published' : 'Winners cleared');
      navigate(`/events/${id}`);
    } catch (err) {
      setError(getError(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const backLink = (
    <Link to={`/events/${id}`} className="btn btn-outline btn-sm">
      <ArrowLeft size={15} /> Back to event
    </Link>
  );

  let content;
  if (loading) content = <Loader />;
  else if (!event) content = <p className="alert error">{error}</p>;
  else if (event.eventType !== 'competitive') {
    content = <p className="alert warning">This is a non-competitive event, so it does not have winners.</p>;
  } else if (!isCompleted(event)) {
    content = (
      <p className="alert warning">
        This event is not over yet ({formatDateRange(event)}). You can add winners once it is completed.
      </p>
    );
  } else {
    content = (
      <form onSubmit={handleSave}>
        {error && <p className="alert error">{error}</p>}

        {winners.map((w, i) => (
          <div key={i} className="panel winner-form">
            <div className="panel-head">
              <h2>{w.position ? `${ordinal(Number(w.position))} place` : 'Position?'}</h2>
              <button type="button" className="btn btn-sm btn-danger-soft" onClick={() => removeRow(i)}>
                <Trash2 size={14} /> Remove
              </button>
            </div>

            <div className="form-grid three">
              <label>
                Position *
                <input type="number" min="1" value={w.position} onChange={(e) => updateWinner(i, 'position', e.target.value)} required />
              </label>
              <label>
                Winner name *
                <input value={w.name} onChange={(e) => updateWinner(i, 'name', e.target.value)} />
              </label>
              <label>
                Team name
                <input value={w.teamName} onChange={(e) => updateWinner(i, 'teamName', e.target.value)} />
              </label>
              <label>
                USN / Student ID
                <input value={w.usn} onChange={(e) => updateWinner(i, 'usn', e.target.value)} />
              </label>
              <label>
                Department
                <input value={w.department} onChange={(e) => updateWinner(i, 'department', e.target.value)} />
              </label>
              <label>
                Semester
                <input value={w.semester} onChange={(e) => updateWinner(i, 'semester', e.target.value)} />
              </label>
              <div className="full">
                <span className="label-text">Photo (optional)</span>
                <ImageUpload small value={w.photo} onChange={(url) => updateWinner(i, 'photo', url)} />
              </div>
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={addRow}>
            <Plus size={16} /> Add another winner
          </button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Winners'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <DashboardLayout
      title={event ? `Winners · ${event.title}` : 'Winners'}
      subtitle="Rows left without a name are ignored."
      actions={backLink}
    >
      {content}
    </DashboardLayout>
  );
};

export default ManageWinners;
