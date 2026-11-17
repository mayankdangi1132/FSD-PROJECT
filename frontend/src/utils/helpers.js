export const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Other'];

// one colour per organizer type, used on cards, tables and in the calendar
export const TYPE_COLORS = {
  club: '#2563eb',
  department: '#0d9488',
  college: '#7c3aed',
};

export const TYPE_LABELS = {
  club: 'Club',
  department: 'Department',
  college: 'College',
};

// ---------- dates and times ----------
// Everything is in Indian Standard Time. Dates come from the API as "YYYY-MM-DD"
// and times as "HH:mm" (exactly what the organizer typed), so we format them as plain
// text and only build real Date objects (with +05:30) when we need to compare with "now".
const TIMEZONE = 'Asia/Kolkata';

export const istDate = (date, time = '00:00') => new Date(`${date}T${time}:00+05:30`);

// today in IST as YYYY-MM-DD
export const todayStr = () => new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date());

// current IST time as "YYYY-MM-DDTHH:mm:ss" (FullCalendar uses it for today / the now-line)
export const nowIST = () => {
  const parts = {};
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(new Date())
    .forEach((p) => (parts[p.type] = p.value));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
};

export const addDays = (date, days) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

// "2026-11-20" -> "20 Nov 2026" (done in UTC so the day can never shift)
export const formatDate = (dateStr, withWeekday = false) => {
  if (!dateStr) return '';
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    weekday: withWeekday ? 'short' : undefined,
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

export const isMultiDay = (event) => event.startDate !== event.endDate;

export const formatDateRange = (event) => {
  if (!isMultiDay(event)) return formatDate(event.startDate, true);
  return `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`;
};

// "10:30 AM - 1:30 PM", "All day", or "10:00 AM - 5:00 PM daily" for multi-day events
export const formatEventTime = (event) => {
  if (event.allDay) return 'All day';
  const text = `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
  return isMultiDay(event) ? `${text} daily` : text;
};

const eventStart = (e) => istDate(e.startDate, e.allDay ? '00:00' : e.startTime);
const eventEnd = (e) => istDate(e.endDate, e.allDay ? '23:59' : e.endTime);

export const isCompleted = (event) => eventEnd(event) < new Date();
export const isOngoing = (event) => !isCompleted(event) && eventStart(event) <= new Date();

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

// random temporary password the admin can give to a new account
export const makeTempPassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pass = '';
  for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
};

// "Department of CSE" -> "DC", "Coding Club" -> "CC"
export const initials = (name = '') => {
  const letters = name
    .split(' ')
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  return letters || name.charAt(0).toUpperCase();
};
