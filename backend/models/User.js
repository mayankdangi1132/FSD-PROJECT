const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// admin, club and department accounts are created by the admin.
// students sign up themselves with their college email.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'club', 'department', 'student'], required: true },
    description: { type: String, default: '' },

    // only used for students
    usn: { type: String, default: '', uppercase: true, trim: true },
    department: { type: String, default: '', trim: true },

    // admin can switch this off to block an account from logging in
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

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
