const {Builder, Key, until, By} = require('selenium-webdriver');
const chai = require('chai');
const { assert } = chai;

chai.should();

async function runTest() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('http://arxemond.ru/reviser-demo/GREdictionary.html?token=true');

        var element = await driver.findElement(By.id('word'));
        var value = await element.getText();
        console.log(">>>" + value);
        assert.equal(value,'');

        // Get today's date in the format "mm/dd/yyyy"
        const today = new Date();
        const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
        const script = `
            const data = localStorage.getItem('${formattedDate}');
            return data;
        `;
        var revisedWordsForToday = await driver.executeScript(script);
        assert.equal(revisedWordsForToday, null);

        const cntName = 'TextToAudioService.cnt';
        cntValue = await driver.executeScript(`return ${cntName};`);
        assert.equal(cntValue, 0);

        await sleep(1000);

        await driver.actions().sendKeys(Key.RIGHT).perform();
        element = await driver.findElement(By.id('word'));
        value = await element.getText();
        console.log(">>>" + value);
        assert.notEqual(value, '');

        revisedWordsForToday = await driver.executeScript(script);
        assert.equal(revisedWordsForToday, 1);

        await driver.actions().sendKeys(Key.LEFT).perform();
        assert.notEqual(value, '');

        cntValue = await driver.executeScript(`return ${cntName};`);
        assert.equal(cntValue, 0);

        const buttonElement = await driver.findElement(By.id('audioTranslate'));
        // imitate 3 clicks very fast. only 1 pronunciation should happen
        await sleep(100);
        for (let i = 0; i < 3; i++) {
            await buttonElement.click();
            await sleep(150);
        }

        await sleep(6000);
        cntValue = await driver.executeScript(`return ${cntName};`);
        console.log(">>>" + cntValue);
        assert.equal(cntValue, 1);

        let maxVal = 1000;
        while (maxVal-- > 0 && await driver.findElement(By.id('token')).getText() === "") {
            if (maxVal === 0) throw new Error("could not find synonyms");

            await driver.actions().sendKeys(Key.RIGHT).perform();
        }

        const title = await driver.getTitle();
        console.log('Page Title:', title);
        await driver.wait(until.titleIs('Selenium - Google Search'), 500000);
    } finally {
        await driver.quit();
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// // Function to determine the content type based on file extension
// function getContentType(filePath) {
//     const extname = path.extname(filePath);
//     switch (extname) {
//         case '.html':
//             return 'text/html';
//         case '.js':
//             return 'application/javascript';
//         case '.css':
//             return 'text/css';
//         // Add more content types as needed
//         default:
//             return 'text/plain';
//     }
// }

runTest();
