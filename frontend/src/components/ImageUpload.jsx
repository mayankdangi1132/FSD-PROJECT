import { useState } from 'react';
import { uploadImage, getError } from '../api';

// picks an image, uploads it right away and gives the url back to the parent
const ImageUpload = ({ value, onChange, small = false }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(getError(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className={small ? 'image-upload small' : 'image-upload'}>
      {value && <img src={value} alt="Preview" className="upload-preview" />}
      <input type="file" accept="image/png, image/jpeg, image/webp, image/gif" onChange={handleFile} disabled={uploading} />
      {uploading && <small>Uploading...</small>}
      {error && <small className="error-text">{error}</small>}
      {value && !uploading && (
        <button type="button" className="link-btn" onClick={() => onChange('')}>
          Remove image
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
