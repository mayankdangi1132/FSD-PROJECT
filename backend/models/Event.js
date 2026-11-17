const mongoose = require('mongoose');
const { CATEGORIES, eventStart, eventEnd } = require('../utils/helpers');

const winnerSchema = new mongoose.Schema({
  position: { type: Number, required: true, min: 1 },
  name: { type: String, required: true, trim: true },
  teamName: { type: String, default: '' },
  usn: { type: String, default: '' },
  department: { type: String, default: '' },
  semester: { type: String, default: '' },
  photo: { type: String, default: '' },
});

// The organizer types the date ("YYYY-MM-DD") and time ("HH:mm") in IST and we keep those
// strings exactly as typed, so the time shown is always the time that was entered.
// From them we also save startAt / endAt as real Date objects (IST converted to UTC by MongoDB),
// which we use for sorting and for checking upcoming / completed.
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true },
    poster: { type: String, default: '' },
    category: { type: String, enum: CATEGORIES, required: true },

    // the club / department / admin account the event belongs to
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizerName: { type: String, required: true },
    organizerType: { type: String, enum: ['club', 'department', 'college'], required: true },
    // who actually filled the form (the admin can post on behalf of a club)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    startDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    endDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    // for multi-day events these are the daily timings (e.g. 10:00 - 17:00 every day)
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    // only true if the organizer ticks "All-day event"
    allDay: { type: Boolean, default: false },

    startAt: { type: Date, index: true },
    endAt: { type: Date, index: true },

    venue: { type: String, required: true, trim: true },

    registrationLink: { type: String, default: '' },
    registrationDeadline: { type: String, default: '' },

    contactName: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },

    eventType: { type: String, enum: ['competitive', 'non-competitive'], required: true },

    // pending / rejected are only used when the approval workflow is on (REQUIRE_APPROVAL=true)
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },

    winners: [winnerSchema],
    winnersPublishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// keep startAt / endAt in sync every time an event is saved
eventSchema.pre('validate', function () {
  if (this.allDay) {
    this.startTime = '';
    this.endTime = '';
  }
  this.startAt = eventStart(this);
  this.endAt = eventEnd(this);
});

module.exports = mongoose.model('Event', eventSchema);
