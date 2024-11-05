const {logToFile} = require('../controllers/FileLogging');
// const {captureScreenshot} = require('../utils/ScreenShot');
const { uIOhook, UiohookKey } = require('uiohook-napi');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');
const activeWin = require('active-win');
const {formatDuration,formatTimestamp,getFormattedDate} = require('../utils/Format');
const screenshotDir = path.resolve(__dirname, '../', 'UserActivityScreenshots');
const screenshot = require('screenshot-desktop');



const getInactivityLogFilePath = () => {
    const formattedDate = getFormattedDate();
    return path.resolve(__dirname, `../Logs/inactivity_log_${formattedDate}.js`);
};
const inactivityLogFilePath = getInactivityLogFilePath();

const loggedInUser = () => {
    const username = os.userInfo().username;
    return username;
};


const inactivityDuration = 60000; // 1 minute in milliseconds
const LoggingDuration = 60000; // 1 minute in milliseconds
let lastActivityTime = Date.now();
let lastKeyPressTime = Date.now();
let lastMouseMoveTime = Date.now();
let LoggedTime = 0;

// Function to log user activity or inactivity
const logUserActivity = (eventType,screenshot) => {
    const logEntry = {
        user: loggedInUser(),
        event: eventType,
        screenshot:screenshot,
        message: eventType === "UserIdle"
            ? `User idle for ${formatDuration(inactivityDuration)} with no activity.`
            : `User active with ${eventType === "Key Press" ? "Key Press" : "mouse movement"} detected.`,
        createdOn: formatTimestamp(new Date()),
    };
    logToFile(inactivityLogFilePath, logEntry);
};

// Check for inactivity every minute
const checkActivity = async() => {
    const window = await activeWin();
    const currentTime = Date.now();
    const timeSinceLastActivity = currentTime - lastActivityTime;

    //generate log after every specific time
    if (currentTime - LoggedTime >= LoggingDuration)
    {
        if (timeSinceLastActivity >= inactivityDuration) {
            // No activity in the last minute
            const screenshot=Screenshot(window.title);
            logUserActivity("UserIdle",screenshot)
            // logUserActivity("UserIdle")
            LoggedTime = currentTime; // Update last log time
        } else {
            // Activity detected, check which type and log once per minute
            if (currentTime - lastKeyPressTime < inactivityDuration ) {
                const screenshot=Screenshot(window.title);
                logUserActivity("Key Press",screenshot);
                // logUserActivity("Key Press");
                LoggedTime = currentTime; // Update last key log time
            } 
            if (currentTime - lastMouseMoveTime < inactivityDuration ) {
                const screenshot=Screenshot(window.title);
                logUserActivity("Mouse Move",screenshot);
                // logUserActivity("Mouse Move");
                LoggedTime = currentTime; // Update last mouse log time
            }
        }
    }
};


const Screenshot = (windowTitle) => {
    const timestamp = new Date();
    const screenshotPath = path.join(screenshotDir, `${windowTitle}_${formatTimestamp(timestamp)}.png`);
    console.log("Saving ScreenShot...")
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }
        captureScreenshot(windowTitle,screenshotDir);
    
    return screenshotPath;
};

const captureScreenshot = (windowTitle,screenshotDir) => {
    const timestamp = new Date();   
    const screenshotPath = path.join(screenshotDir, `${windowTitle}_${formatTimestamp(timestamp)}.png`);

   
    screenshot({ filename: screenshotPath })
        .then(() => {
            console.log('Screenshot saved:', screenshotPath);
        })
        .catch((error) => {
            console.error('Error capturing screenshot:', error);
        });
};

// Reset the keyboard inactivity timer
const resetKeyInactivityTimer = () => {
    lastKeyPressTime = Date.now();
    lastActivityTime = Date.now();
};

// Reset the mouse inactivity timer
const resetMouseInactivityTimer = () => {
    lastMouseMoveTime = Date.now();
    lastActivityTime = Date.now();
};

// Listen for keydown events
uIOhook.on('keydown', () => {
    resetKeyInactivityTimer(); // Reset inactivity timer on key press
});

// Listen for mouse movement events
uIOhook.on("mousemove", () => {
    resetMouseInactivityTimer(); // Reset inactivity timer on mouse move
});

// Start the hook to listen for events
uIOhook.start();


module.exports = { resetKeyInactivityTimer,resetMouseInactivityTimer,checkActivity};




