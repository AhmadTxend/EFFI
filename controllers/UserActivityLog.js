require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');
const activeWin = require('active-win');

const {formatTime} = require('../utils/FormatTime');
const {logToFile} = require('../controllers/FileLogging');

const logFilePath = path.resolve(__dirname, '../', process.env.LOG_FILE_PATH);

let lastWindow = null;          // Stores last active window info
let lastSwitchTime = Date.now(); // Stores timestamp when window changed
let lastActivityTime = Date.now(); // Last user input activity time
let isInactive = false;         // Flag to track inactivity


// Function to log user activity
const logUserActivity = async () => {
  const currentTime = Date.now();
  const username = os.userInfo().username;
  const timestamp = new Date().toLocaleString();  
  const window = await activeWin();

  // Log time spent on previous window if it has changed
  if (window && (!lastWindow || window.id !== lastWindow.id)) {
    if (lastWindow) {
      const timeSpent = currentTime - lastSwitchTime;
      const logEntry = `User: ${username}, TimeStamp: ${timestamp} \nApplication: ${lastWindow.owner.name}, Title: ${lastWindow.title}, Duration: ${formatTime(timeSpent)}\n`;

      logToFile(logFilePath, logEntry);
    }

    // Update last window and switch time
    lastWindow = window;
    lastSwitchTime = currentTime;
    isInactive = false; // Reset inactivity flag on window change
  }
};


module.exports = {logUserActivity};
