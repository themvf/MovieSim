import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};
http
  .createServer((req, res) => {
    const name = decodeURIComponent(req.url.split("?")[0]);
    const file = path.resolve(
      root,
      "." + (name === "/" ? "/index.html" : name),
    );
    if (!file.startsWith(root + path.sep) || name.includes("/.git")) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404).end("Not found");
        return;
      }
      res.setHeader("Content-Type", types[path.extname(file)] || "text/plain");
      res.end(data);
    });
  })
  .listen(4173, "127.0.0.1", () =>
    console.log("MovieSim: http://127.0.0.1:4173"),
  );
