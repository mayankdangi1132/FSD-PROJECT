const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const useCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadsDir = path.join(__dirname, '..', 'uploads');

// Uploads an image and returns its URL.
// If Cloudinary keys are not set we save the file in /uploads instead,
// so the project still works on a local machine without an account.
const uploadImage = (file, req) => {
  if (useCloudinary) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'campus-connect' }, (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      });
      stream.end(file.buffer);
    });
  }

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

  const ext = file.mimetype.split('/')[1];
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  fs.writeFileSync(path.join(uploadsDir, fileName), file.buffer);

  return Promise.resolve(`${req.protocol}://${req.get('host')}/uploads/${fileName}`);
};

module.exports = { uploadImage, useCloudinary };
