require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { useCloudinary } = require('./config/cloudinary');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing in .env');
  process.exit(1);
}

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// local image uploads (only used when Cloudinary is not configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Campus Connect API is running');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/organizers', require('./routes/organizerRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// catches multer errors (file too big, wrong type) and bad JSON bodies
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Image must be smaller than 5 MB' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON in request body' });
  if (err.message) return res.status(400).json({ message: err.message });
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(useCloudinary ? 'Images: Cloudinary' : 'Images: saving to /uploads (Cloudinary keys not set)');
});
