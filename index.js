// const fs = require('fs');
// const path = require('path');
// const os = require('os');
// const activeWin = require('active-win');
 
// const logFilePath = path.join(__dirname, 'activity_log.txt'); 
// const logUserActivity=(async()=>{

//   const username = os.userInfo().username;
//   const timestamp = new Date().toLocaleString();  
//   const window = await activeWin();
//   let appName;
//   let title;
//   if (window) {
//      appName = window.owner.name; // E.g., 'chrome', 'edge'
//      title = window.title; 
//   }

//   const logEntry = `User: ${username}, TimeStamp: ${timestamp} \nActive Application: ${appName} --- Window Title: ${title}\n\n`;
  
//   fs.appendFile(logFilePath, logEntry, (err) => {
//     if (err) {
//       console.error('Error logging activity:', err);
//     } else {
//       console.log('Activity logged:', logEntry.trim());
//     }
//   });
// })

// // Log timestamp every 10 seconds
// setInterval(logUserActivity, 2000);

const fs = require('fs');
const path = require('path');
const os = require('os');
const activeWin = require('active-win');

const logFilePath = path.join(__dirname, 'activity_log.txt'); 
const inactivityLogFilePath = path.join(__dirname, 'inactivity_log.txt');

let lastWindow = null;          // Stores last active window info
let lastSwitchTime = Date.now(); // Stores timestamp when window changed
let lastActivityTime = Date.now(); // Last user input activity time
let isInactive = false;         // Flag to track inactivity

const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const logUserActivity = async () => {
  const currentTime = Date.now();
  const username = os.userInfo().username;
  const timestamp = new Date().toLocaleString();  
  const window = await activeWin();
  
  // Check for inactivity (no mouse/keyboard input for 10 seconds)
  if (currentTime - lastActivityTime >= 5000 && !isInactive) {
    const inactivityStart = new Date(lastActivityTime).toLocaleTimeString();
    const inactivityEnd = new Date(currentTime).toLocaleTimeString();
    const inactivityLogEntry = `User: ${username} was Inactive from ${inactivityStart} to ${inactivityEnd}\n`;

    fs.appendFile(inactivityLogFilePath, inactivityLogEntry, (err) => {
      if (err) console.error('Error logging inactivity:', err);
      else console.log('Inactivity logged:', inactivityLogEntry.trim());
    });
    isInactive = true;
  }

  // Log time spent on previous window if it has changed
  if (window && (!lastWindow || window.id !== lastWindow.id)) {
    if (lastWindow) {
      const timeSpent = currentTime - lastSwitchTime;
      const logEntry = `User: ${username}, TimeStamp: ${timestamp} \nApplication: ${lastWindow.owner.name}, Title: ${lastWindow.title}, Duration: ${formatTime(timeSpent)}\n`;

      fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) console.error('Error logging activity:', err);
        else console.log('Activity logged:', logEntry.trim());
      });
    }

    // Update last window and switch time
    lastWindow = window;
    lastSwitchTime = currentTime;
    isInactive = false; // Reset inactivity flag on window change
  }
};
 
const resetInactivityTimer = () => {
  fs.appendFile(inactivityLogFilePath, 'resetInactivityTimer', (err) => {
    if (err) console.error('Error logging activity:', err);
  });
  
  lastActivityTime = Date.now();
  isInactive = false;
};

// Capture user input to track activity
process.stdin.on('data', resetInactivityTimer); // Keyboard input
// Here, you may also want to add a listener for mouse events (e.g., with the `robotjs` or `iohook` packages)

setInterval(logUserActivity, 1000);
