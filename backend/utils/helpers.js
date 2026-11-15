const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Other'];

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// if COLLEGE_EMAIL_DOMAIN is set (e.g. college.edu) every account must use an email from that domain.
// this is what keeps people outside the college from signing up.
const checkCollegeEmail = (email) => {
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email';
  const domain = process.env.COLLEGE_EMAIL_DOMAIN;
  if (domain && !email.endsWith('@' + domain)) return `Please use an official college email (@${domain})`;
  return null;
};

// today's date as YYYY-MM-DD (server local time)
const todayStr = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

// an event is completed once its last day's end time has passed
const isCompleted = (event) => {
  const end = new Date(`${event.endDate}T${event.endTime || '23:59'}`);
  return end < new Date();
};

const fieldLabels = {
  title: 'Event title',
  description: 'Description',
  category: 'Category',
  startDate: 'Start date',
  endDate: 'End date',
  startTime: 'Start time',
  endTime: 'End time',
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
  if (!TIME_REGEX.test(data.startTime) || !TIME_REGEX.test(data.endTime)) return 'Times must be in HH:mm format';
  if (data.endDate < data.startDate) return 'End date cannot be before the start date';
  if (data.startDate === data.endDate && data.endTime <= data.startTime) return 'End time must be after the start time';

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
  if (err.code === 11000) return res.status(400).json({ message: 'This email is already in use' });

  console.error(err);
  return res.status(500).json({ message: 'Something went wrong on the server' });
};

module.exports = {
  CATEGORIES,
  EMAIL_REGEX,
  checkCollegeEmail,
  todayStr,
  isCompleted,
  validateEvent,
  handleError,
};
