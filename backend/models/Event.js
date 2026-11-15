const mongoose = require('mongoose');
const { CATEGORIES } = require('../utils/helpers');

const winnerSchema = new mongoose.Schema({
  position: { type: Number, required: true, min: 1 },
  name: { type: String, required: true, trim: true },
  teamName: { type: String, default: '' },
  usn: { type: String, default: '' },
  department: { type: String, default: '' },
  semester: { type: String, default: '' },
  photo: { type: String, default: '' },
});

// Dates are saved as "YYYY-MM-DD" and times as "HH:mm".
// Keeping them as plain strings avoids timezone problems and they still sort correctly.
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    poster: { type: String, default: '' },
    category: { type: String, enum: CATEGORIES, required: true },

    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizerName: { type: String, required: true },
    organizerType: { type: String, enum: ['club', 'department', 'college'], required: true },

    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    venue: { type: String, required: true, trim: true },

    registrationLink: { type: String, default: '' },
    registrationDeadline: { type: String, default: '' },

    contactName: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },

    eventType: { type: String, enum: ['competitive', 'non-competitive'], required: true },

    // pending/rejected is only used when REQUIRE_APPROVAL=true in .env
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },

    winners: [winnerSchema],
    winnersPublishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
