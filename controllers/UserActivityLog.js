// const fs = require('fs');
// const path = require('path');
// const os = require('os');
// const activeWin = require('active-win');
// const screenshotDir = path.resolve(__dirname, '../', 'screenshots');
// const { captureScreenshot } = require('../utils/ScreenShot');
// const {formatTime,getFormattedDate,formatTimestamp} = require('../utils/Format');
// const {AppCategories} = require('../Enums/Categories');
// const {logToFile} = require('../controllers/FileLogging');

// const getActivityLogFilePath = () => {
//   const formattedDate = getFormattedDate();
//   return path.resolve(__dirname, `../Logs/activity_log_${formattedDate}.js`);
// };
// const logFilePath = getActivityLogFilePath();
 
 
 
// let lastWindow = null;  
// let lastTabTitle = null;
// let lastSwitchTime = Date.now();
 
// const getAppCategory = (appName) => {
//   for (const [apps, category ] of Object.entries(AppCategories)) {
//       if (apps.includes(appName)) {
//           return category;
//       }
//   }
//   return "Uncategorized";
// };
 
// const logUserActivity = async () => {
//   const currentTime = Date.now();  // Capture the current time once at the beginning
//   const username = os.userInfo().username;
//   const timestamp = new Date().toLocaleString();
//   const window = await activeWin();
 
//   if (window) {
//       const currentTabTitle = window.title;
 
//       if (!lastWindow || window.id !== lastWindow.id) {
//           if (lastWindow) {
//               const timeSpent = currentTime - lastSwitchTime;
//               const startTime = formatTimestamp(new Date(lastSwitchTime));
//               const appCategory = getAppCategory(lastWindow.owner.name);
 
//               const logEntry = {
//                   user: username,
//                   application: lastWindow.owner.name,
//                   category: appCategory,
//                   title: lastWindow.title,
//                   duration: formatTime(timeSpent),
//                   startTime: startTime,
//                   endTime: formatTimestamp(new Date(currentTime)),
//                   createdOn: startTime,
//               };
 
//               logToFile(logFilePath, logEntry );                
//               captureScreenshot(lastWindow.title,screenshotDir);
//           }
 
//           lastWindow = window;
//           lastTabTitle = currentTabTitle;
//           lastSwitchTime = currentTime;
//       }
//     //   Tab Switch in a browser
//       else if (currentTabTitle !== lastTabTitle) {
//           const timeSpent = currentTime - lastSwitchTime;
//           const startTime = formatTimestamp(new Date(lastSwitchTime));
//           const appCategory = getAppCategory(lastWindow.owner.name);
 
//           const tabLogEntry = {
//               user: username,
//               timestamp: timestamp,
//               application: window.owner.name,
//               category: appCategory,
//               title: currentTabTitle,
//               startTime: startTime,
//               endTime: formatTimestamp(new Date(currentTime)),
//               duration: formatTime(timeSpent)
//           };
 
//           logToFile(logFilePath, tabLogEntry );
//           captureScreenshot(currentTabTitle,screenshotDir);
 
//           lastTabTitle = currentTabTitle;
//           lastSwitchTime = currentTime;
//       }
//   }
// };
 
// module.exports = { logUserActivity,captureScreenshot };