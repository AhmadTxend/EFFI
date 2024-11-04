require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');
const activeWin = require('active-win');

const {formatTime,getFormattedDate,formatTimestamp} = require('../utils/Format');
const {AppCategories} = require('../Enums/Categories');
const {logToFile} = require('../controllers/FileLogging');

// const logFilePath = path.resolve(__dirname, '../', process.env.LOG_FILE_PATH);
const getActivityLogFilePath = () => {
  const formattedDate = getFormattedDate();
  return path.resolve(__dirname, `../Logs/activity_log_${formattedDate}.js`);
};
const logFilePath = getActivityLogFilePath();


let lastWindow = null;          // Stores last active window info
let lastSwitchTime = Date.now(); // Stores timestamp when window changed
let lastActivityTime = Date.now(); // Last user input activity time
let isInactive = false;         // Flag to track inactivity


const getAppCategory = (appName) => {
  console.log('AppCategories:',AppCategories);
  console.log('appName:',appName);

  for (const [apps, category ] of Object.entries(AppCategories)) {
  console.log('apps:',apps);
      if (apps.includes(appName)) {
          return category;
      }
  }
  return "Uncategorized";
};

/////  Function to log user activity
const logUserActivity = async () => {
  const currentTime = Date.now();
  const username = os.userInfo().username;
  const timestamp = new Date().toLocaleString();  
  const window = await activeWin();

  // Log time spent on previous window if it has changed
  if (window && (!lastWindow || window.id !== lastWindow.id)) {
    if (lastWindow){

      const timeSpent = currentTime - lastSwitchTime;
      const startTime = formatTimestamp(new Date(currentTime - timeSpent));
      const appCategory = getAppCategory(lastWindow.owner.name);


      const logEntry = {
        user: username,
        // timestamp: formatTimestamp(new Date()),
        application: lastWindow.owner.name,
        category: appCategory,
        title: lastWindow.title,
        duration: formatTime(timeSpent),
        startTime: startTime,
        endTime: formatTimestamp(new Date()),
    };
      logToFile(logFilePath, logEntry);
    }

    // Update last window and switch time
    lastWindow = window;
    lastSwitchTime = currentTime;
    isInactive = false; // Reset inactivity flag on window change
  }
};


module.exports = {logUserActivity};
