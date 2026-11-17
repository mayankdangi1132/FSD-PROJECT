const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// One collection for every account in the portal:
//  - admin       : created only by "npm run create-admin" (or the seed), email must match ADMIN_EMAIL
//  - club        : a club and its organizer login, created by the admin
//  - department  : a department and its organizer login, created by the admin
//  - student     : created by the admin (there is no public sign up)
// Events point to their club / department / admin through Event.organizer.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'club', 'department', 'student'], required: true },

    // clubs and departments
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    // permission: events from this organizer are published without waiting for approval
    autoApprove: { type: Boolean, default: false },

    // students
    usn: { type: String, uppercase: true, trim: true },
    department: { type: String, default: '', trim: true },
    semester: { type: String, default: '' },

    // passwords set by the admin are temporary - the user has to change it after logging in
    mustChangePassword: { type: Boolean, default: false },

    // admin can switch this off to block an account from logging in
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// no two students can have the same USN
userSchema.index({ usn: 1 }, { unique: true, partialFilterExpression: { role: 'student' } });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// never send the password hash back in a response
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
