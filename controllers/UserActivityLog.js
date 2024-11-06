require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');
const activeWin = require('active-win');
const puppeteer = require('puppeteer');
const screenshotDir = path.resolve(__dirname, '../', 'screenshots');
const { captureScreenshot } = require('../utils/ScreenShot');
const {formatTime,getFormattedDate,formatTimestamp} = require('../utils/Format');
const {AppCategories} = require('../Enums/Categories');
const {logToFile} = require('../controllers/FileLogging');
const { Monitor } = require("node-screenshots");

const getActivityLogFilePath = () => {
  const formattedDate = getFormattedDate();
  return path.resolve(__dirname, `../Logs/activity_log_${formattedDate}.js`);
};
const logFilePath = getActivityLogFilePath();
 
 
// if (!fs.existsSync(screenshotDir)) {
//     fs.mkdirSync(screenshotDir);
// }
 
let lastWindow = null;  
let lastTabTitle = null;
let lastSwitchTime = Date.now();
 
const getAppCategory = (appName) => {
  for (const [apps, category ] of Object.entries(AppCategories)) {
      if (apps.includes(appName)) {
          return category;
      }
  }
  return "Uncategorized";
};
 
const logUserActivity = async () => {
  const currentTime = Date.now();  // Capture the current time once at the beginning
  const username = os.userInfo().username;
  const timestamp = new Date().toLocaleString();
  const window = await activeWin();
 
  if (window) {
      const currentTabTitle = window.title;
 
      if (!lastWindow || window.id !== lastWindow.id) {
          if (lastWindow) {
              const timeSpent = currentTime - lastSwitchTime;
              const startTime = formatTimestamp(new Date(lastSwitchTime));
              const appCategory = getAppCategory(lastWindow.owner.name);
 
              const logEntry = {
                  user: username,
                  application: lastWindow.owner.name,
                  category: appCategory,
                  title: lastWindow.title,
                  duration: formatTime(timeSpent),
                  startTime: startTime,
                  endTime: formatTimestamp(new Date(currentTime)),
                  createdOn: startTime,
              };
 
              logToFile(logFilePath, logEntry );                
              captureScreenshot(lastWindow.title,screenshotDir);
          }
 
          lastWindow = window;
          lastTabTitle = currentTabTitle;
          lastSwitchTime = currentTime;
      }
    //   Tab Switch in a browser
      else if (currentTabTitle !== lastTabTitle) {
          const timeSpent = currentTime - lastSwitchTime;
          const startTime = formatTimestamp(new Date(lastSwitchTime));
          const appCategory = getAppCategory(lastWindow.owner.name);
 
          const tabLogEntry = {
              user: username,
              timestamp: timestamp,
              application: window.owner.name,
              category: appCategory,
              title: currentTabTitle,
              startTime: startTime,
              endTime: formatTimestamp(new Date(currentTime)),
              duration: formatTime(timeSpent)
          };
 
          logToFile(logFilePath, tabLogEntry );
          captureScreenshot(currentTabTitle,screenshotDir);
 
          lastTabTitle = currentTabTitle;
          lastSwitchTime = currentTime;
      }
  }
};
 
 
// const captureScreenshot = async (context) => {
//     // const timestamp = new Date().toISOString().replace(/:/g, '-');
//     // const screenshotPath = path.join(screenshotDir, `${context}_${timestamp}.png`);
   
//     // screenshot({ filename: screenshotPath })
//     //     .then(() => {
//     //         console.log('Screenshot saved:', screenshotPath);
//     //     })
//     //     .catch((error) => {
//     //         console.error('Error capturing screenshot:', error);
//     //     });
  
//     let monitors = Monitor.all(); // Get all connected monitors

//     monitors.forEach((monitor) => {
//         const timestamp = new Date().toISOString().replace(/:/g, '-');
//         const screenshotPath = path.join(screenshotDir, `${monitor.id}_${timestamp}.png`);
        
//         // Capture asynchronous screenshot and save as JPEG
//         monitor.captureImage().then((imageAsync) => {
//             const jpegPath = path.join(screenshotDir, `${monitor.id}_${timestamp}.jpeg`);
//             fs.writeFileSync(jpegPath, imageAsync.toJpegSync()); // Save JPEG format
//         }).catch(error => {
//             console.error(`Error capturing asynchronous screenshot for monitor ${monitor.id}:`, error);
//         });
//     });

// };
 
module.exports = { logUserActivity,captureScreenshot };