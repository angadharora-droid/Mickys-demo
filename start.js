// Runs the website and the backend API in one container.
// Website: public, on $PORT (all interfaces). Backend: private, on 127.0.0.1:$BACKEND_PORT.
// If either process exits, the other is stopped and the container exits, so the platform restarts it.
const { spawn } = require("node:child_process");
const path = require("node:path");

const PORT = process.env.PORT || "3000";
const BACKEND_PORT = process.env.BACKEND_PORT || "5000";

const procs = [
  {
    name: "backend",
    cwd: path.join(__dirname, "backend"),
    cmd: ["server.js"],
    env: { ...process.env, PORT: BACKEND_PORT },
  },
  {
    name: "web",
    cwd: path.join(__dirname, "web"),
    cmd: ["server.js"],
    // HOSTNAME "::" = every interface, IPv4 and IPv6 (the platform overrides HOSTNAME otherwise)
    env: { ...process.env, PORT, HOSTNAME: "::" },
  },
];

let stopping = false;
const children = procs.map((p) => {
  const child = spawn(process.execPath, p.cmd, { cwd: p.cwd, env: p.env, stdio: ["ignore", "inherit", "inherit"] });
  console.log(`[start] ${p.name} started (pid ${child.pid})`);
  child.on("exit", (code, signal) => {
    console.log(`[start] ${p.name} exited (${signal || code})`);
    shutdown(code ?? 1);
  });
  return child;
});

function shutdown(code) {
  if (stopping) return;
  stopping = true;
  for (const c of children) if (c.exitCode === null) c.kill("SIGTERM");
  setTimeout(() => process.exit(code), 5000).unref();
}
process.on("SIGTERM", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));
