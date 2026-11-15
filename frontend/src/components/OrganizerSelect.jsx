import { useEffect, useState } from 'react';
import API from '../api';

// dropdown with every organizer grouped as College / Clubs / Departments
const OrganizerSelect = ({ value, onChange }) => {
  const [organizers, setOrganizers] = useState([]);

  useEffect(() => {
    API.get('/organizers')
      .then((res) => setOrganizers(res.data))
      .catch(() => setOrganizers([]));
  }, []);

  const clubs = organizers.filter((o) => o.role === 'club');
  const departments = organizers.filter((o) => o.role === 'department');

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">All organizers</option>
      <optgroup label="College">
        <option value="college">College Administration</option>
      </optgroup>
      <optgroup label="Clubs">
        {clubs.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </optgroup>
      <optgroup label="Departments">
        {departments.map((d) => (
          <option key={d._id} value={d._id}>
            {d.name}
          </option>
        ))}
      </optgroup>
    </select>
  );
};

export default OrganizerSelect;
