const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const isCloudinaryConfigured = () => (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const signParams = (params) => {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(`${sorted}${process.env.CLOUDINARY_API_SECRET}`)
    .digest('hex');
};

const localUploadPath = (file) => {
  const relativePath = path
    .relative(path.join(__dirname, '..'), file.path)
    .replace(/\\/g, '/');

  return `/${relativePath}`;
};

const uploadFile = async (file, folder = 'student-portal') => {
  if (!file) return '';

  if (!isCloudinaryConfigured()) {
    return localUploadPath(file, folder);
  }

  const timestamp = Math.round(Date.now() / 1000);
  const resourceType = file.mimetype && file.mimetype.startsWith('image/')
    ? 'image'
    : 'raw';
  const params = {
    folder,
    timestamp,
  };

  const bytes = await fs.readFile(file.path);
  const formData = new FormData();
  formData.append('file', new Blob([bytes], { type: file.mimetype }), file.originalname || path.basename(file.path));
  formData.append('api_key', process.env.CLOUDINARY_API_KEY);
  formData.append('timestamp', String(timestamp));
  formData.append('folder', folder);
  formData.append('signature', signParams(params));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Cloud upload failed');
  }

  try {
    await fs.unlink(file.path);
  } catch (error) {
    console.warn('Could not remove temporary upload:', error.message);
  }

  return data.secure_url;
};

module.exports = { uploadFile };
