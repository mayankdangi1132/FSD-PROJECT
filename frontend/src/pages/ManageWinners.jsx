import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API, { getError } from '../api';
import ImageUpload from '../components/ImageUpload';
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
      navigate(`/events/${id}`);
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container page"><p className="loading">Loading...</p></div>;
  if (!event) return <div className="container page"><p className="alert error">{error}</p></div>;

  const backLink = (
    <Link to={`/events/${id}`} className="back-link">
      ← Back to event
    </Link>
  );

  if (event.eventType !== 'competitive') {
    return (
      <div className="container page narrow">
        {backLink}
        <p className="alert warning">This is a non-competitive event, so it does not have winners.</p>
      </div>
    );
  }

  if (!isCompleted(event)) {
    return (
      <div className="container page narrow">
        {backLink}
        <h1>Winners - {event.title}</h1>
        <p className="alert warning">
          This event is not over yet ({formatDateRange(event)}). You can add winners once it is completed.
        </p>
      </div>
    );
  }

  return (
    <div className="container page narrow">
      {backLink}
      <h1>Winners - {event.title}</h1>
      <p className="muted">Fill in the winners and press save. They will show up on the event page.</p>

      {error && <p className="alert error">{error}</p>}

      <form onSubmit={handleSave}>
        {winners.map((w, i) => (
          <div key={i} className="box winner-form">
            <div className="winner-form-head">
              <h3>{w.position ? ordinal(Number(w.position)) : '?'} Place</h3>
              <button type="button" className="link-btn danger" onClick={() => removeRow(i)}>
                Remove
              </button>
            </div>

            <div className="form-grid">
              <label>
                Position *
                <input
                  type="number"
                  min="1"
                  value={w.position}
                  onChange={(e) => updateWinner(i, 'position', e.target.value)}
                  required
                />
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
            + Add another winner
          </button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Winners'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageWinners;
