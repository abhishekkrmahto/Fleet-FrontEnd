export function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File read failed"));
  });
}

export function downloadBase64File(base64Data, filename) {
  if (!base64Data || !base64Data.includes(";base64,")) {
    throw new Error("Invalid file data");
  }

  const [meta, encoded] = base64Data.split(";base64,");
  const contentType = meta.replace("data:", "") || "application/octet-stream";
  const raw = window.atob(encoded);
  const bytes = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }

  const cleanName = ensureExtension(sanitizeFilename(filename), contentType);
  const blob = new Blob([bytes], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = cleanName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function sanitizeFilename(value) {
  return String(value || "document")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_")
    .slice(0, 120);
}

function ensureExtension(filename, contentType) {
  if (/\.[a-z0-9]+$/i.test(filename)) return filename;

  if (contentType === "application/pdf") return `${filename}.pdf`;
  if (contentType === "image/png") return `${filename}.png`;
  if (contentType === "image/jpeg") return `${filename}.jpg`;
  if (contentType === "image/webp") return `${filename}.webp`;

  return filename;
}
