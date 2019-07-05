# Puppeteer Request

This library provides a simple way to utilize Puppeteer to automate/scrape web pages. It helps create a browser for puppeteer and then provides a way to make a request.
Since this is part of the request-group family, it's trivial to create a group of these request and fire them off to effectively pull data across a number of web pages. Be sure to check out the example below to understand how to utilize this library

## Installing
```bash
npm install request-group-puppeteer
```

## Building
```bash
git clone https://github.com/GabrieleNunez/request-group-puppeteer.git
cd request-group-cheerio
npm install
npm run build
```

## Example ( Making a singular request )


```typescript
import { PuppeteerManager, PuppeteerRequest } from 'request-group-puppeteer';

function puppeteerExample(): Promise<void> {
    return new Promise(
        async (resolve): Promise<void> => {
            // create our puppeteer manager, this can be shared across multiple request no problem
            // you really only need 1. Since 1 manager = 1 puppeteer browser and 1 request = 1 tab in that browser
            console.log('Starting puppeteer up');
            let puppeteerManager: PuppeteerManager = new PuppeteerManager();
            await puppeteerManager.initialize();

            let genericRequest: PuppeteerRequest = new PuppeteerRequest(
                'https://github.com/GabrieleNunez/request-group',
                puppeteerManager,
            );

            console.log('Running request');
            await genericRequest.run();

            // once the request is run at this point its just like any other Puppeteer Page object.
            // do with it whatever you want
            let page = genericRequest.getPage();
            let lines: string[] = await page.evaluate(function(): Promise<string[]> {
                return new Promise((evalResolve): void => {
                    let resultLines: string[] = [];
                    let tableMessages: NodeListOf<Element> = document.querySelectorAll('table.files td.message');
                    for (var i = 0; i < tableMessages.length; i++) {
                        let tableCell = tableMessages[i];
                        let message: string = tableCell.textContent ? (tableCell.textContent as string) : '';
                        resultLines.push(message.trim());
                    }
                    evalResolve(resultLines);
                });
            });

            console.log('Results');
            console.log(lines);

            // make sure to free up up the request. Memory leaks and runaway processes are a thing to watch for
            console.log('Freeing up resources');
            await genericRequest.dispose();
            await puppeteerManager.dispose();

            resolve();
        },
    );
}

// puppeteer
puppeteerExample().then((): void => {
    console.log('Completed');
});


```