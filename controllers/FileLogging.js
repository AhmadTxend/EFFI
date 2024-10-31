
const fs = require('fs');
const path = require('path');


const logToFile = (logFilePath, logEntry) => {
    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) {
        console.error('Error logging entry:', err);
      } else {
        console.log('Entry logged:', logEntry.trim());
      }
    });
};

module.exports={logToFile}