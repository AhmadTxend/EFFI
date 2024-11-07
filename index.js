const { spawn } = require('child_process');

const runCommand = (command, args = []) => {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, { stdio: 'inherit', shell: true });

        process.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        process.on('error', (error) => {
            reject(error);
        });
    });
};

(async () => {
    try {
        // Check if pm2 is installed
        await runCommand('pm2', ['-v']);

    } catch (error) {
        // Install pm2 if it's not found 
        await runCommand('npm', ['install', 'pm2', '-g']);
        await runCommand('npm', ['install', 'pm2-windows-startup', '-g']);
        await runCommand('pm2-startup', ['install']);
    }

    // Start your app as a pm2 service
    await runCommand('pm2', ['start', 'index.js']);
    await runCommand('pm2', ['save']);
})();

const { logUserActivity } = require('./controllers/UserActivityLog');
const { resetKeyInactivityTimer,resetMouseInactivityTimer,checkActivity } = require('./controllers/UserInActivityLog');

resetKeyInactivityTimer();
resetMouseInactivityTimer();
setInterval(checkActivity, 1000);   

// Logging the user window switching 
setInterval(logUserActivity, 1000);
