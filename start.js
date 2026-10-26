// Runs the website and the backend API in one container.
// Website: public, on $PORT (all interfaces), in a child process. Backend: private, on 127.0.0.1:$BACKEND_PORT,
// loaded into this process (one Node runtime fewer = less memory).
// If the website exits or the backend fails to start, the container exits, so the platform restarts it.
const { spawn } = require("node:child_process");
const path = require("node:path");

const PORT = process.env.PORT || "3000";
const BACKEND_PORT = process.env.BACKEND_PORT || "5000";
// V8 heap cap (MB) for the website. Without one, V8 sizes the heap from the container's memory limit
// (several GB on Railway) and lets garbage pile up long before it collects it.
const WEB_HEAP_MB = process.env.WEB_HEAP_MB || "256";

let stopping = false;
let exitCode = 0;

const backend = require("./backend/server.js");
backend
  .listen(Number(BACKEND_PORT), "127.0.0.1", () => console.log(`[start] backend listening on 127.0.0.1:${BACKEND_PORT}`))
  .on("error", (err) => {
    console.error(`[start] backend failed: ${err.message}`);
    shutdown(1);
  });

const web = spawn(process.execPath, [`--max-old-space-size=${WEB_HEAP_MB}`, "server.js"], {
  cwd: path.join(__dirname, "web"),
  // HOSTNAME "::" = every interface, IPv4 and IPv6 (the platform overrides HOSTNAME otherwise)
  env: { ...process.env, PORT, HOSTNAME: "::" },
  stdio: ["ignore", "inherit", "inherit"],
});
console.log(`[start] web started (pid ${web.pid})`);
web.on("exit", (code, signal) => {
  console.log(`[start] web exited (${signal || code})`);
  if (stopping) process.exit(exitCode);
  shutdown(code ?? 1);
});

function shutdown(code) {
  if (stopping) return;
  stopping = true;
  exitCode = code;
  if (web.exitCode !== null || web.signalCode !== null) process.exit(code);
  web.kill("SIGTERM");
  setTimeout(() => process.exit(code), 5000).unref();
}
process.on("SIGTERM", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));
