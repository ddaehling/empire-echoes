const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT) || 8777;
const HOST = process.env.HOST || "127.0.0.1";
const TYPES = {
  ".html": "text/html;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".mjs": "text/javascript;charset=utf-8",
  ".css": "text/css;charset=utf-8",
  ".json": "application/json;charset=utf-8",
  ".geojson": "application/json;charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".txt": "text/plain;charset=utf-8",
  ".pdf": "application/pdf",
};
const server = http.createServer((request, response) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(request.url.split("?")[0]);
  } catch {
    response.writeHead(400).end("Invalid URL");
    return;
  }
  if (urlPath === "/") {
    response.writeHead(302, { location: "/app/journey/" }).end();
    return;
  }
  let filename = path.resolve(ROOT, `.${urlPath}`);
  if (filename !== ROOT && !filename.startsWith(ROOT + path.sep)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  fs.stat(filename, (statError, stat) => {
    if (!statError && stat.isDirectory())
      filename = path.join(filename, "index.html");
    fs.readFile(filename, (error, bytes) => {
      if (error) {
        response
          .writeHead(404, { "content-type": "text/plain" })
          .end("Not found");
        return;
      }
      response.writeHead(200, {
        "content-type":
          TYPES[path.extname(filename)] || "application/octet-stream",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      });
      response.end(bytes);
    });
  });
});
server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Port ${PORT} is already in use. Open http://localhost:${PORT}/app/journey/ or choose another port with PORT=8780 npm start.`
      : error.message,
  );
  process.exitCode = 1;
});
server.listen(PORT, HOST, () =>
  console.log(
    `Classroom atlas: http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/app/journey/`,
  ),
);
