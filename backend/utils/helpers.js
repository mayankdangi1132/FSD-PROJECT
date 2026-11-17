const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Other'];

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- dates and times ----------
// The whole project uses Indian Standard Time (Asia/Kolkata, UTC+05:30).
// Organizers type dates and times in IST, so we always attach the +05:30 offset when we
// turn them into real Date objects. That way nothing shifts even if the server runs in UTC
// (which is what most hosting services use).
const TIMEZONE = 'Asia/Kolkata';
const IST_OFFSET = '+05:30';

// "2026-11-20" + "10:30" -> Date object for 10:30 AM IST
const istDate = (date, time = '00:00') => new Date(`${date}T${time}:00${IST_OFFSET}`);

// today's date in IST as YYYY-MM-DD ("en-CA" happens to format dates exactly like that)
const todayStr = () => new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date());

// "2026-11-20" + 3 days -> "2026-11-23"
const addDays = (date, days) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

// real start / end moments of an event. all-day events cover the full day(s).
const eventStart = (e) => istDate(e.startDate, e.allDay ? '00:00' : e.startTime);
const eventEnd = (e) => istDate(e.endDate, e.allDay ? '23:59' : e.endTime);

const isCompleted = (event) => eventEnd(event) < new Date();

// ---------- validation ----------
// if COLLEGE_EMAIL_DOMAIN is set (e.g. college.edu) every account must use an email from that domain.
// this is only an extra check - the real protection is that only the admin can create accounts.
const checkCollegeEmail = (email) => {
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email';
  const domain = process.env.COLLEGE_EMAIL_DOMAIN;
  if (domain && !email.endsWith('@' + domain)) return `Please use an official college email (@${domain})`;
  return null;
};

const fieldLabels = {
  title: 'Event title',
  description: 'Description',
  category: 'Category',
  startDate: 'Start date',
  endDate: 'End date',
  venue: 'Venue',
  eventType: 'Event type',
};

// returns an error message, or null if everything is fine
const validateEvent = (data) => {
  for (const field of Object.keys(fieldLabels)) {
    if (!data[field] || String(data[field]).trim() === '') {
      return `${fieldLabels[field]} is required`;
    }
  }

  if (!CATEGORIES.includes(data.category)) return 'Please choose a valid category';
  if (!['competitive', 'non-competitive'].includes(data.eventType)) return 'Event type must be competitive or non-competitive';

  if (!DATE_REGEX.test(data.startDate) || !DATE_REGEX.test(data.endDate)) return 'Dates must be in YYYY-MM-DD format';
  if (data.endDate < data.startDate) return 'End date cannot be before the start date';

  // timed events need both times. for multi-day events the times are the daily timing,
  // e.g. 10:00 - 17:00 on every day of the event.
  if (!data.allDay) {
    if (!data.startTime || !data.endTime) return 'Start time and end time are required (or mark it as an all-day event)';
    if (!TIME_REGEX.test(data.startTime) || !TIME_REGEX.test(data.endTime)) return 'Times must be in HH:mm format';
    if (data.endTime <= data.startTime) {
      return data.startDate === data.endDate
        ? 'End time must be after the start time'
        : 'For multi-day events the time is the daily timing, so the end time must be after the start time';
    }
  }

  if (data.registrationLink && !/^https?:\/\//i.test(data.registrationLink)) {
    return 'Registration link must start with http:// or https://';
  }
  if (data.registrationDeadline) {
    if (!DATE_REGEX.test(data.registrationDeadline)) return 'Registration deadline must be a valid date';
    if (data.registrationDeadline > data.endDate) return 'Registration deadline cannot be after the event ends';
  }

  if (!data.contactEmail && !data.contactPhone) return 'Please add a contact email or phone number';
  if (data.contactEmail && !EMAIL_REGEX.test(data.contactEmail)) return 'Contact email is not valid';
  if (data.contactPhone && !/^[0-9+\-\s]{7,15}$/.test(data.contactPhone)) return 'Contact phone is not valid';

  return null;
};

// common error responses so every controller doesn't repeat the same checks
const handleError = (res, err) => {
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ message: first ? first.message : 'Invalid data' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return res.status(400).json({ message: field === 'usn' ? 'This USN is already registered' : 'This email is already in use' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Something went wrong on the server' });
};

module.exports = {
  CATEGORIES,
  EMAIL_REGEX,
  TIMEZONE,
  istDate,
  todayStr,
  addDays,
  eventStart,
  eventEnd,
  isCompleted,
  checkCollegeEmail,
  validateEvent,
  handleError,
};
