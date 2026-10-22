export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Resize locally before sending. This keeps phone photos quick to upload.
export async function preparePhoto(file) {
  if (!PHOTO_TYPES.includes(file.type)) throw new Error('INVALID_IMAGE');
  if (file.size > 12 * 1024 * 1024) throw new Error('FILE_TOO_LARGE');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 2200 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const preview = canvas.toDataURL('image/jpeg', 0.88);
    const data = preview.split(',')[1];
    if (data.length > Math.ceil(4 * 1024 * 1024 * 4 / 3)) throw new Error('IMAGE_TOO_LARGE');
    return { name: file.name || 'photo.jpg', mimeType: 'image/jpeg', data };
  } catch (error) {
    if (error.message === 'IMAGE_TOO_LARGE') throw error;
    throw new Error('PHOTO_READ');
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function imagePayload(photo) {
  return photo ? { mimeType: photo.mimeType, data: photo.data } : undefined;
}

export function photoUrl(photo) {
  return `data:${photo.mimeType};base64,${photo.data}`;
}
