const Event = require('../models/Event');
const { todayStr, isCompleted, validateEvent, handleError } = require('../utils/helpers');

// fields an organizer is allowed to send. organizer, status and winners are set by us.
const EVENT_FIELDS = [
  'title',
  'description',
  'poster',
  'category',
  'startDate',
  'endDate',
  'startTime',
  'endTime',
  'venue',
  'registrationLink',
  'registrationDeadline',
  'contactName',
  'contactEmail',
  'contactPhone',
  'eventType',
];

const pickEventFields = (body) => {
  const data = {};
  EVENT_FIELDS.forEach((field) => {
    if (body[field] !== undefined && body[field] !== null) {
      data[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
    }
  });
  return data;
};

// admin can manage everything, organizers only their own events
const canManage = (user, event) => user && (user.role === 'admin' || event.organizer.toString() === user._id.toString());

const approvalRequired = () => process.env.REQUIRE_APPROVAL === 'true';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/events  (public)
// query: search, organizer (id or "college"), category, date, when=upcoming|completed
const getEvents = async (req, res) => {
  try {
    // only accept plain strings from the query (ignore things like ?category[$ne]=x)
    const q = (name) => (typeof req.query[name] === 'string' ? req.query[name].trim() : '');
    const search = q('search');
    const organizer = q('organizer');
    const category = q('category');
    const date = /^\d{4}-\d{2}-\d{2}$/.test(q('date')) ? q('date') : '';
    const when = q('when');

    const filter = { status: 'approved' };

    if (search) filter.title = { $regex: escapeRegex(search), $options: 'i' };
    if (organizer === 'college') filter.organizerType = 'college';
    else if (organizer) filter.organizer = organizer;
    if (category) filter.category = category;
    if (date) {
      // events happening on that day (works for multi-day events too)
      filter.startDate = { $lte: date };
      filter.endDate = { $gte: date };
    }

    const today = todayStr();
    if (when === 'upcoming') filter.endDate = { ...filter.endDate, $gte: today };
    if (when === 'completed') filter.endDate = { ...filter.endDate, $lte: today };

    let events = await Event.find(filter).sort({ startDate: when === 'completed' ? -1 : 1, startTime: 1 });

    // the date check above is only day level, this fixes events that end later/earlier today
    if (when === 'upcoming') events = events.filter((e) => !isCompleted(e));
    if (when === 'completed') events = events.filter((e) => isCompleted(e));

    res.json(events);
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/events/:id  (public, but pending/rejected events only visible to owner or admin)
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.status !== 'approved' && !canManage(req.user, event)) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/events/mine  (club / department / admin)
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ startDate: -1 });
    res.json(events);
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/events/admin/all?status=pending  (admin)
const getAllEventsForAdmin = async (req, res) => {
  try {
    const filter = {};
    if (['pending', 'approved', 'rejected'].includes(req.query.status)) filter.status = req.query.status;
    const events = await Event.find(filter).sort({ startDate: -1 });
    res.json(events);
  } catch (err) {
    handleError(res, err);
  }
};

// POST /api/events
const createEvent = async (req, res) => {
  try {
    const data = pickEventFields(req.body);
    const error = validateEvent(data);
    if (error) return res.status(400).json({ message: error });

    const { user } = req;
    const event = await Event.create({
      ...data,
      organizer: user._id,
      organizerName: user.name,
      organizerType: user.role === 'admin' ? 'college' : user.role,
      status: approvalRequired() && user.role !== 'admin' ? 'pending' : 'approved',
    });

    res.status(201).json(event);
  } catch (err) {
    handleError(res, err);
  }
};

// PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!canManage(req.user, event)) {
      return res.status(403).json({ message: 'You can only edit events created by your account' });
    }

    const data = { ...event.toObject(), ...pickEventFields(req.body) };
    const error = validateEvent(data);
    if (error) return res.status(400).json({ message: error });

    EVENT_FIELDS.forEach((field) => {
      if (data[field] !== undefined) event[field] = data[field];
    });

    // winners only make sense for competitive events
    if (event.eventType === 'non-competitive') {
      event.winners = [];
      event.winnersPublishedAt = null;
    }

    // a rejected event goes back for review after the organizer fixes it
    if (approvalRequired() && event.status === 'rejected' && req.user.role !== 'admin') {
      event.status = 'pending';
    }

    await event.save();
    res.json(event);
  } catch (err) {
    handleError(res, err);
  }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!canManage(req.user, event)) {
      return res.status(403).json({ message: 'You can only delete events created by your account' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    handleError(res, err);
  }
};

// PATCH /api/events/:id/status  (admin) body: { status: 'approved' | 'rejected' }
const updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.status = status;
    await event.save();
    res.json(event);
  } catch (err) {
    handleError(res, err);
  }
};

// PUT /api/events/:id/winners  body: { winners: [...] }  - replaces the whole list
const updateWinners = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!canManage(req.user, event)) {
      return res.status(403).json({ message: 'Only the organizer of this event or an admin can update winners' });
    }
    if (event.eventType !== 'competitive') {
      return res.status(400).json({ message: 'Winners can only be added to competitive events' });
    }
    if (!isCompleted(event)) {
      return res.status(400).json({ message: 'Winners can be added only after the event is completed' });
    }

    const winners = Array.isArray(req.body.winners) ? req.body.winners : [];
    const cleaned = [];

    for (const w of winners) {
      const position = Number(w.position);
      if (!w.name || !String(w.name).trim()) return res.status(400).json({ message: 'Every winner needs a name' });
      if (!Number.isInteger(position) || position < 1) {
        return res.status(400).json({ message: 'Position must be a number like 1, 2, 3' });
      }

      cleaned.push({
        position,
        name: String(w.name).trim(),
        teamName: String(w.teamName || '').trim(),
        usn: String(w.usn || '').trim(),
        department: String(w.department || '').trim(),
        semester: String(w.semester || '').trim(),
        photo: String(w.photo || '').trim(),
      });
    }

    cleaned.sort((a, b) => a.position - b.position);
    event.winners = cleaned;
    event.winnersPublishedAt = cleaned.length ? new Date() : null;

    await event.save();
    res.json(event);
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = {
  getEvents,
  getEventById,
  getMyEvents,
  getAllEventsForAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  updateWinners,
};
