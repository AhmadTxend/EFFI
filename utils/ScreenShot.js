const fs = require('fs');
const path = require('path');
const { Monitor } = require("node-screenshots");

const captureScreenshot = (windowTitle,screenshotDir) => {
    
    if (!fs.existsSync(screenshotDir)) 
    {
        fs.mkdirSync(screenshotDir);
    }

    let monitors = Monitor.all(); 

    monitors.forEach((monitor) => {
        const timestamp = new Date().toISOString().replace(/:/g, '-'); 

        monitor.captureImage().then((imageAsync) => {
            const jpegPath = path.join(screenshotDir, `${monitor.id}_${timestamp}.jpeg`);
            fs.writeFileSync(jpegPath, imageAsync.toJpegSync()); // Save JPEG format
        }).catch(error => {
            console.error(`Error capturing asynchronous screenshot for monitor ${monitor.id}:`, error);
        });
    });

};

module.exports={captureScreenshot}