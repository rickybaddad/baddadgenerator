import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/config/constants';

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unable to read selected image.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to parse image file.'));
    reader.readAsDataURL(file);
  });
}

export function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) {
    throw new Error('Invalid image data format.');
  }

  return {
    mimeType: match[1],
    data: match[2]
  };
}

export function validateImageFile(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type. Use png/jpg/jpeg/webp.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Image too large. Maximum file size is ${MAX_FILE_SIZE_MB}MB.`);
  }
}

export function downloadBase64Png(base64Data: string, fileName: string) {
  const href = `data:image/png;base64,${base64Data}`;
  const a = document.createElement('a');
  a.href = href;
  a.download = fileName;
  a.click();
}

export function truncateText(value: string, max = 90) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}
