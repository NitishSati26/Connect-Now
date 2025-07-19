import express from "express";
import fs from "fs";
import path from "path";
import { getMimeType, getFilePath } from "../lib/documentUpload.js";

const router = express.Router();

// Serve documents with proper headers
router.get("/documents/:filename", (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }

    const filePath = getFilePath(`/uploads/documents/${filename}`);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Get MIME type
    const mimeType = getMimeType(filename);

    // Set proper headers
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", fileSize);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "Range");

    // Handle range requests for large files
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Length", chunksize);

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      // Send entire file
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    }
  } catch (error) {
    console.error("Error serving document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Download document with attachment disposition
router.get("/download/:filename", (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }

    const filePath = getFilePath(`/uploads/documents/${filename}`);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Get MIME type
    const mimeType = getMimeType(filename);

    // Extract original filename (remove timestamp prefix)
    const originalFilename = filename.replace(/^\d+_/, "");

    // Set headers for download
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", fileSize);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${originalFilename}"`
    );
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Send file
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
