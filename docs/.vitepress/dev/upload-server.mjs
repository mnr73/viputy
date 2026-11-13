// Tiny multipart sink for trying ViUpload for real: `node docs/.vitepress/dev/upload-server.mjs` (port 5198).
// POST /upload      -> reads the body slowly (so progress is visible), answers { id, url, name, size }
// POST /upload-batch-> the same for several files, answers an array
// POST /fail        -> 422 { message, errors }
// POST /noprogress  -> chunked response without a length (the browser still reports upload progress)
import { createServer } from "node:http";

let n = 0;
const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "content-type": "application/json"
};
createServer((req, res) => {
    if (req.method === "OPTIONS") return res.writeHead(204, cors).end();
    let bytes = 0;
    const names = [];
    let head = "";
    req.on("data", (c) => {
        bytes += c.length;
        if (head.length < 20000) head += c.toString("latin1");
        // ~1.5 MB/s so a few MB take a couple of seconds
        req.pause();
        setTimeout(() => req.resume(), Math.min(200, c.length / 8000));
    });
    req.on("end", () => {
        for (const m of head.matchAll(/filename="([^"]*)"/g)) names.push(m[1]);
        if (req.url === "/fail")
            return res.writeHead(422, cors).end(
                JSON.stringify({
                    message: "The given data was invalid.",
                    errors: { file: ["The file is infected."] }
                })
            );
        const one = (name) => ({
            id: ++n,
            name,
            size: bytes,
            url: `http://localhost:5198/files/${n}/${encodeURIComponent(name)}`
        });
        if (req.url === "/upload-batch")
            return res.writeHead(200, cors).end(JSON.stringify(names.map(one)));
        res.writeHead(200, cors).end(JSON.stringify(one(names[0] ?? "file")));
    });
}).listen(5198, () => console.log("upload server on http://localhost:5198"));
