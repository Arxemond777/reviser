// const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
//
// (async function example() {
//     let driver = await new Builder().forBrowser(Browser.CHROME).build();
//     try {
//         await driver.get('http://localhost:63342/reviser/GREdictionary.html');
//         // await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
//         await driver.wait(until.titleIs('webdriver - Google Search'), 10000);
//     } finally {
//         await driver.quit();
//     }
// })();
/*const { Builder, By, Key, until } = require('selenium-webdriver');

async function runTest() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('http://localhost:63342/reviser/GREdictionary.html');
        // await driver.findElement(By.name('q')).sendKeys('Selenium', Key.RETURN);
        await driver.wait(until.titleIs('Selenium - Google Search'), 500000);
    } finally {
        await driver.quit();
    }
}

runTest();*/

const { Builder, By, Key, until } = require('selenium-webdriver');
const http = require('http');
const fs = require('fs');
const path = require('path');

// // Get the directory where this script is located
// const scriptDirectory = __dirname;
//
// // Create a simple HTTP server to serve the HTML file
// const server = http.createServer((req, res) => {
//     console.log(req.url)
//
//     // Normalize the file path to avoid directory traversal vulnerabilities
//     filePath = path.normalize(req.url);
//
//     // Construct the absolute path to the requested file
//     const absoluteFilePath = path.join(scriptDirectory, filePath);
//     console.log(absoluteFilePath);
//
//     // Get the content type based on the file extension
//     const contentType = getContentType(absoluteFilePath);
//
//     // Read and serve the file
//     fs.readFile(absoluteFilePath, 'utf8', (err, data) => {
//         if (err) {
//             // console.log(err);
//             res.writeHead(404);
//             res.end('File not found');
//         } else {
//
//             res.writeHead(200, { 'Content-Type': contentType });
//             res.end(data);
//         }
//     });
//     // if (req.url === '/GREdictionary.html') {
//     //     fs.readFile('GREdictionary.html', 'utf8', (err, data) => {
//     //         if (err) {
//     //             res.writeHead(404);
//     //             res.end('File not found');
//     //         } else {
//     //             res.writeHead(200, { 'Content-Type': 'text/html' });
//     //             res.end(data);
//     //         }
//     //     });
//     // } else {
//     //     res.writeHead(404);
//     //     res.end('Page not found');
//     // }
// });

// server.listen(8080, 'localhost', () => {
//     console.log('Server is running at http://localhost:8080');
// });

// Selenium WebDriver test
async function runTest() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('http://arxemond.ru/reviser-demo/GREdictionary.html');
        // Perform Selenium actions on the loaded HTML file
        // For example, you can find elements and interact with them here
        // For demonstration, let's get the title of the page
        // await driver.wait(until.elementLocated(By.css('link[href="css/css.css"]')), 10000);

        const title = await driver.getTitle();
        console.log('Page Title:', title);
        await driver.wait(until.titleIs('Selenium - Google Search'), 500000);
    } finally {
        await driver.quit();
        // Close the HTTP server when done
        server.close(() => {
            console.log('Server closed.');
        });
    }
}

// Function to determine the content type based on file extension
function getContentType(filePath) {
    const extname = path.extname(filePath);
    switch (extname) {
        case '.html':
            return 'text/html';
        case '.js':
            return 'application/javascript';
        case '.css':
            return 'text/css';
        // Add more content types as needed
        default:
            return 'text/plain';
    }
}

runTest();
