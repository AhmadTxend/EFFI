const { logToFile } = require('../controllers/FileLogging');
const { captureScreenshot } = require('../utils/ScreenShot');
const { uIOhook } = require('uiohook-napi');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const screenshot = require('screenshot-desktop');
const os = require('os');
const activeWin = require('active-win');
const { formatDuration, formatTimestamp, getFormattedDate } = require('../utils/Format');
 
const screenshotDir = path.resolve(__dirname, '../', 'UserActivityScreenshots');

 
const getInactivityLogFilePath = () => {
    const formattedDate = getFormattedDate();
    return path.resolve(__dirname, `../Logs/inactivity_log_${formattedDate}.js`);
};
const inactivityLogFilePath = getInactivityLogFilePath();
 
const loggedInUser = () => os.userInfo().username;
 
const inactivityDuration = 10000;
const loggingDuration = 10000;
let lastActivityTime = Date.now();
let lastKeyPressTime = Date.now();
let lastMouseMoveTime = Date.now();
let loggedTime = 0;
let ScreenShot_Path;
 
const logUserActivity = (eventType) => {
    const logEntry = {
        user: loggedInUser(),
        event: eventType,
        screenshot: ScreenShot_Path,
        message: eventType === "UserIdle"
            ? `User idle for ${formatDuration(inactivityDuration)} with no activity.`
            : `User active with ${eventType === "Key Press" ? "Key Press" : "mouse movement"} detected.`,
        createdOn: formatTimestamp(new Date()),
    };
    logToFile(inactivityLogFilePath, logEntry);
};
 
// Check for inactivity every minute
const checkActivity = async () => {
    const window = await activeWin();
    const currentTime = Date.now();
    const timeSinceLastActivity = currentTime - lastActivityTime;
 
    // Generate log after every specific time
    if (currentTime - loggedTime >= loggingDuration) {
        if (timeSinceLastActivity >= inactivityDuration) {
                // No activity in the last minute
                captureScreenshot(window.title,screenshotDir); 
                logUserActivity("UserIdle");
                loggedTime = currentTime; // Update last log time
        } else {
            // Activity detected, check which type and log once per minute
            if (currentTime - lastKeyPressTime < inactivityDuration) {
                captureScreenshot(window.title,screenshotDir); 
                logUserActivity("Key Press");
                loggedTime = currentTime; // Update last key log time
            }
            if (currentTime - lastMouseMoveTime < inactivityDuration) {
                captureScreenshot(window.title,screenshotDir); 
                logUserActivity("Mouse Move");
                loggedTime = currentTime; // Update last mouse log time
            }
        }
    }
};
 
 
 
// const captureScreenshot = async (context) => {
    
//     if (!fs.existsSync(screenshotDir)) {
//         fs.mkdirSync(screenshotDir);
//     }
//     const timestamp = new Date().toISOString().replace(/:/g, '-');
//     const screenshotPath = path.join(screenshotDir, `${context}_${timestamp}.png`);
//     ScreenShot_Path=screenshotPath;
//     screenshot({ filename: screenshotPath })
//     .then(() => {
//         console.log('Screenshot saved:', screenshotPath);
//     })
//     .catch((error) => {
//         console.error('Error capturing screenshot:', error);
//     });
// };
 
// Reset the keyboard inactivity timer

const resetKeyInactivityTimer = () => {
    lastKeyPressTime = Date.now();
    lastActivityTime = Date.now();
};
 

const resetMouseInactivityTimer = () => {
    lastMouseMoveTime = Date.now();
    lastActivityTime = Date.now();
};
 

uIOhook.on('keydown', resetKeyInactivityTimer);
 

uIOhook.on("mousemove", resetMouseInactivityTimer);
 
// Start the hook to listen for events
uIOhook.start();
 
module.exports = { resetKeyInactivityTimer, resetMouseInactivityTimer, checkActivity };