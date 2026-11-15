const express = require('express');
const upload = require('../middleware/upload');
const { uploadImage } = require('../config/cloudinary');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

// POST /api/upload  (form-data, field name "image")
// used for event posters and winner photos, returns { url }
router.post('/', protect, allowRoles('admin', 'club', 'department'), upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please choose an image' });

  try {
    const url = await uploadImage(req.file, req);
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

module.exports = router;
