#!/usr/bin/env node
/**
 * Minimal static file server for previewing the Codixia site locally.
 */
const http = require("http");
const path = require("path");
const fs = require("fs");

const port = Number(process.env.PORT) || 5173;
const host = process.env.HOST || "127.0.0.1";
const baseDir = process.cwd();

const mimeTypes = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "text/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendError(res, status, message) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=UTF-8" });
  res.end(message);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  let filePath = path.join(baseDir, urlPath);

  if (urlPath.endsWith("/")) {
    filePath = path.join(filePath, "index.html");
  }

  // Security: prevent directory traversal.
  if (!filePath.startsWith(baseDir)) {
    sendError(res, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        sendError(res, 404, "Not Found");
      } else {
        sendError(res, 500, "Internal Server Error");
      }
      return;
    }

    let streamPath = filePath;
    if (stats.isDirectory()) {
      streamPath = path.join(filePath, "index.html");
    }

    const ext = path.extname(streamPath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    const readStream = fs.createReadStream(streamPath);
    readStream.on("error", () => sendError(res, 500, "Internal Server Error"));
    res.writeHead(200, { "Content-Type": contentType });
    readStream.pipe(res);
  });
});

server.listen(port, host, () => {
  console.log(`▶ Codixia site live on http://${host}:${port}`);
  console.log("Press Ctrl+C to stop the server.");
});
