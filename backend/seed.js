// Fills the database with an admin, a few clubs/departments and sample events.
// Run with: npm run seed   (WARNING: deletes existing users and events)
require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');

// date string relative to today, e.g. day(-3) = 3 days ago
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${date}`;
};

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Event.deleteMany();
  await User.deleteMany();

  const admin = await User.create({
    name: 'College Administration',
    email: process.env.ADMIN_EMAIL || 'admin@college.edu',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: 'admin',
  });

  // User.create one by one so the password hashing hook runs for each
  const coding = await User.create({
    name: 'Coding Club',
    email: 'codingclub@college.edu',
    password: 'club123',
    role: 'club',
    description: 'Competitive programming, hackathons and weekly coding sessions.',
  });
  const cultural = await User.create({
    name: 'Cultural Club',
    email: 'culturalclub@college.edu',
    password: 'club123',
    role: 'club',
    description: 'Music, dance, drama and the annual cultural fest.',
  });
  const sports = await User.create({
    name: 'Sports Club',
    email: 'sportsclub@college.edu',
    password: 'club123',
    role: 'club',
    description: 'Inter-department tournaments and fitness events.',
  });
  const cse = await User.create({
    name: 'Department of CSE',
    email: 'cse@college.edu',
    password: 'dept123',
    role: 'department',
    description: 'Computer Science and Engineering department.',
  });
  const ece = await User.create({
    name: 'Department of ECE',
    email: 'ece@college.edu',
    password: 'dept123',
    role: 'department',
    description: 'Electronics and Communication Engineering department.',
  });

  // sample students (in real use students sign up themselves with their college email)
  await User.create({
    name: 'Priya Sharma',
    email: 'priya@college.edu',
    password: 'student123',
    role: 'student',
    usn: '1XX23CS045',
    department: 'CSE',
  });
  await User.create({
    name: 'Arjun Nair',
    email: 'arjun@college.edu',
    password: 'student123',
    role: 'student',
    usn: '1XX23EC012',
    department: 'ECE',
  });

  const by = (user) => ({
    organizer: user._id,
    organizerName: user.name,
    organizerType: user.role === 'admin' ? 'college' : user.role,
    status: 'approved',
  });

  await Event.create([
    {
      ...by(coding),
      title: 'CodeSprint 2026',
      description: 'A 3 hour competitive programming contest. Solve as many problems as you can.\nTeams of up to 2 members.',
      category: 'Competition',
      startDate: day(-10),
      endDate: day(-10),
      startTime: '10:00',
      endTime: '13:00',
      venue: 'CSE Lab 3',
      contactName: 'Rahul (Coordinator)',
      contactEmail: 'codingclub@college.edu',
      eventType: 'competitive',
      winners: [
        { position: 1, name: 'Ananya Rao', teamName: 'Bit Bandits', usn: '1XX22CS014', department: 'CSE', semester: '5' },
        { position: 2, name: 'Karthik M', teamName: 'NullPointers', usn: '1XX22IS031', department: 'ISE', semester: '5' },
        { position: 3, name: 'Sneha P', teamName: 'Loopers', department: 'CSE', semester: '3' },
      ],
      winnersPublishedAt: new Date(),
    },
    {
      ...by(coding),
      title: '24 Hour Hackathon',
      description: 'Build something useful in 24 hours. Food and wifi provided. Themes will be announced at the start.',
      category: 'Technical',
      startDate: day(6),
      endDate: day(7),
      startTime: '09:00',
      endTime: '09:00',
      venue: 'Main Auditorium',
      registrationLink: 'https://forms.gle/example',
      registrationDeadline: day(4),
      contactEmail: 'codingclub@college.edu',
      contactPhone: '9876543210',
      eventType: 'competitive',
    },
    {
      ...by(coding),
      title: 'Git & GitHub Workshop',
      description: 'Hands-on session on version control. Bring your laptop with git installed.',
      category: 'Workshop',
      startDate: day(2),
      endDate: day(2),
      startTime: '14:00',
      endTime: '16:30',
      venue: 'Seminar Hall 1',
      contactEmail: 'codingclub@college.edu',
      eventType: 'non-competitive',
    },
    {
      ...by(cultural),
      title: 'Battle of Bands',
      description: 'Inter-college band competition. Each band gets 15 minutes on stage.',
      category: 'Cultural',
      startDate: day(-4),
      endDate: day(-4),
      startTime: '17:00',
      endTime: '21:00',
      venue: 'Open Air Theatre',
      contactPhone: '9123456780',
      eventType: 'competitive',
    },
    {
      ...by(cultural),
      title: 'Annual Cultural Fest - Utsav',
      description: 'Three days of music, dance, drama, food stalls and pro-nite.',
      category: 'Cultural',
      startDate: day(12),
      endDate: day(14),
      startTime: '10:00',
      endTime: '22:00',
      venue: 'College Campus',
      registrationLink: 'https://forms.gle/example',
      registrationDeadline: day(10),
      contactEmail: 'culturalclub@college.edu',
      eventType: 'non-competitive',
    },
    {
      ...by(sports),
      title: 'Inter-Department Cricket Tournament',
      description: 'T10 format. Each department can send one team of 11 players + 3 substitutes.',
      category: 'Sports',
      startDate: day(-2),
      endDate: day(3),
      startTime: '07:00',
      endTime: '11:00',
      venue: 'College Ground',
      contactName: 'Sports Secretary',
      contactPhone: '9988776655',
      eventType: 'competitive',
    },
    {
      ...by(sports),
      title: 'Yoga Day Session',
      description: 'Morning yoga session open to all students and staff.',
      category: 'Sports',
      startDate: day(-20),
      endDate: day(-20),
      startTime: '06:30',
      endTime: '08:00',
      venue: 'Indoor Stadium',
      contactEmail: 'sportsclub@college.edu',
      eventType: 'non-competitive',
    },
    {
      ...by(cse),
      title: 'Seminar on Generative AI',
      description: 'Guest lecture by an industry expert on how large language models work and where they are used.',
      category: 'Seminar',
      startDate: day(1),
      endDate: day(1),
      startTime: '11:00',
      endTime: '12:30',
      venue: 'CSE Seminar Hall',
      contactEmail: 'cse@college.edu',
      eventType: 'non-competitive',
    },
    {
      ...by(cse),
      title: 'Project Expo',
      description: 'Final year students present their projects. Best 3 projects get prizes.',
      category: 'Competition',
      startDate: day(-7),
      endDate: day(-7),
      startTime: '10:00',
      endTime: '16:00',
      venue: 'CSE Block Corridor',
      contactEmail: 'cse@college.edu',
      eventType: 'competitive',
      winners: [
        { position: 1, name: 'Team Smart Farm', teamName: 'Smart Farm', department: 'CSE', semester: '7' },
        { position: 2, name: 'Team MediTrack', teamName: 'MediTrack', department: 'CSE', semester: '7' },
      ],
      winnersPublishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      ...by(ece),
      title: 'IoT Hands-on Workshop',
      description: 'Learn to build simple IoT projects using ESP32 and sensors. Kits will be provided.',
      category: 'Workshop',
      startDate: day(8),
      endDate: day(9),
      startTime: '10:00',
      endTime: '16:00',
      venue: 'ECE Lab 2',
      registrationLink: 'https://forms.gle/example',
      registrationDeadline: day(5),
      contactEmail: 'ece@college.edu',
      eventType: 'non-competitive',
    },
    {
      ...by(admin),
      title: 'Orientation Day',
      description: 'Welcome programme for first year students and parents.',
      category: 'Other',
      startDate: day(-15),
      endDate: day(-15),
      startTime: '09:30',
      endTime: '13:00',
      venue: 'Main Auditorium',
      contactEmail: 'admin@college.edu',
      eventType: 'non-competitive',
    },
    {
      ...by(admin),
      title: 'Annual Sports Meet',
      description: 'Track and field events for all departments. Opening ceremony by the Principal.',
      category: 'Sports',
      startDate: day(18),
      endDate: day(19),
      startTime: '08:00',
      endTime: '17:00',
      venue: 'College Ground',
      contactEmail: 'admin@college.edu',
      eventType: 'competitive',
    },
  ]);

  console.log('Sample data added.\n');
  console.log('Login details:');
  console.log(`  Admin       : ${admin.email} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  console.log('  Clubs       : codingclub@college.edu, culturalclub@college.edu, sportsclub@college.edu / club123');
  console.log('  Departments : cse@college.edu, ece@college.edu / dept123');
  console.log('  Students    : priya@college.edu, arjun@college.edu / student123');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
