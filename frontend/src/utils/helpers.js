export const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Other'];

// one colour per organizer type, used on cards and in the calendar
export const TYPE_COLORS = {
  club: '#2563eb',
  department: '#059669',
  college: '#d97706',
};

export const TYPE_LABELS = {
  club: 'Club',
  department: 'Department',
  college: 'College',
};

// "2026-11-20" -> "20 Nov 2026"
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(`${dateStr}T00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// "14:30" -> "2:30 PM"
export const formatTime = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const formatDateRange = (event) => {
  if (event.startDate === event.endDate) return formatDate(event.startDate);
  return `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`;
};

export const isCompleted = (event) => new Date(`${event.endDate}T${event.endTime || '23:59'}`) < new Date();

export const isOngoing = (event) => !isCompleted(event) && new Date(`${event.startDate}T${event.startTime}`) <= new Date();

export const eventStatus = (event) => {
  if (isCompleted(event)) return 'Completed';
  if (isOngoing(event)) return 'Happening now';
  return 'Upcoming';
};

// 1 -> "1st", 2 -> "2nd" ...
export const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
