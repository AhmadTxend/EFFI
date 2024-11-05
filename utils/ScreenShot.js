const screenshot = require('screenshot-desktop');
const {formatTimestamp} = require('./Format');
const path = require('path');



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

module.exports={captureScreenshot}