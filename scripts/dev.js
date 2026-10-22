import { spawn } from 'node:child_process';

const commands = [
  ['server', ['--watch-path=server', 'server/server.js']],
  ['client', ['node_modules/vite/bin/vite.js']],
];

const children = commands.map(([name, args]) => {
  const child = spawn(process.execPath, args, { stdio: 'inherit', env: process.env });
  child.on('exit', (code) => {
    if (code && !stopping) {
      console.error(`${name} exited with code ${code}`);
      stop();
    }
  });
  return child;
});

let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => child.kill());
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
