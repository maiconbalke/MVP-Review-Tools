const { spawn } = require('child_process');

console.log('Starting API and Worker services...');

const api = spawn('npm', ['--workspace', 'services/api', 'run', 'start'], { stdio: 'inherit', shell: true });
const worker = spawn('npm', ['--workspace', 'services/worker', 'run', 'start'], { stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
    api.kill('SIGINT');
    worker.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    api.kill('SIGTERM');
    worker.kill('SIGTERM');
    process.exit(0);
});
