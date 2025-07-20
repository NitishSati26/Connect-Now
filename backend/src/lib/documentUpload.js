import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/documents");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// MIME type mapping
const mimeTypes = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
  ".rtf": "application/rtf",
  ".odt": "application/vnd.oasis.opendocument.text",
  ".pages": "application/x-iwork-pages-sffpages",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".csv": "text/csv",
  ".json": "application/json",
  ".xml": "application/xml",
  ".zip": "application/zip",
  ".rar": "application/x-rar-compressed",
  ".7z": "application/x-7z-compressed",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".avi": "video/x-msvideo",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".tiff": "image/tiff",
  ".tif": "image/tiff",
};

export const uploadDocument = async (base64Data, filename) => {
  try {
    // Remove data URL prefix if present
    const base64String = base64Data.replace(/^data:[^;]+;base64,/, "");

    // Decode base64 to buffer
    const buffer = Buffer.from(base64String, "base64");

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = filename
      ? path.extname(filename).toLowerCase()
      : ".pdf";
    const uniqueFilename = `${timestamp}_${
      filename || "document"
    }${fileExtension}`;

    // Full path for the file
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Write file to disk
    fs.writeFileSync(filePath, buffer);

    // Return the URL path (not full URL, just the path)
    const urlPath = `/uploads/documents/${uniqueFilename}`;

    // console.log(`Document uploaded successfully: ${urlPath}`);
    return urlPath;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw new Error("Failed to upload document");
  }
};

export const deleteDocument = async (filePath) => {
  try {
    if (!filePath) return;

    // Extract filename from URL path
    const filename = filePath.split("/").pop();
    const fullPath = path.join(uploadsDir, filename);

    // Check if file exists and delete
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      // console.log(`Document deleted: ${filename}`);
    }
  } catch (error) {
    console.error("Error deleting document:", error);
  }
};

export const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return mimeTypes[ext] || "application/octet-stream";
};

export const getFilePath = (urlPath) => {
  if (!urlPath) return null;
  const filename = urlPath.split("/").pop();
  return path.join(uploadsDir, filename);
};
