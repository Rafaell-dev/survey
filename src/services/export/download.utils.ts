export function downloadFile(filename: string, content: Blob | string) {
  const isBlob = content instanceof Blob;
  const url = isBlob ? URL.createObjectURL(content) : content;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  if (isBlob) URL.revokeObjectURL(url);
}

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
