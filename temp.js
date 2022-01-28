const fs = require('fs');


const scraperObject = {
    url: 'https://arbetsformedlingen.se/platsbanken/annonser?q=devops',
    async scraper(browser){
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        // Navigate to the selected page
        await page.goto(this.url);
        let scrapedData = [];
        // Wait for the required DOM to be rendered
        async function scrapeCurrentPage(){
            await page.waitForSelector('.result-container');
            // Get the link to all the required books
            let urls = await page.$$eval('.header-container h3 a', links => {
                links = links.map(el => el.href)
                return links;
            });
            // Loop through each of those links, open a new page instance and get the relevant data from them
            let pagePromise = (link) => new Promise(async(resolve, reject) => {
                let dataObj = {};
                let newPage = await browser.newPage();
                await newPage.goto(link);

                await newPage.waitForSelector('.jobb-container');

                dataObj['title'] = await newPage.$eval('h1.spacing.break-title', text => text.textContent);
                dataObj['company'] = await newPage.$eval('#pb-company-name', text => text.textContent);
                dataObj['county'] = await newPage.$eval('#pb-job-location', text => text.textContent);
                dataObj['description'] = await newPage.$eval('div.section.job-description', text => text.textContent);
                // dataObj['link'] = this.window.location.href;

                // dataObj['bookTitle'] = await newPage.$eval('.product_main > h1', text => text.textContent);
                // dataObj['bookPrice'] = await newPage.$eval('.price_color', text => text.textContent);
                // dataObj['noAvailable'] = await newPage.$eval('.instock.availability', text => {
                //     // Strip new line and tab spaces
                //     text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "");
                //     // Get the number of stock available
                //     let regexp = /^.*\((.*)\).*$/i;
                //     let stockAvailable = regexp.exec(text)[1].split(' ')[0];
                //     return stockAvailable;
                // });
                // dataObj['imageUrl'] = await newPage.$eval('#product_gallery img', img => img.src);
                // dataObj['bookDescription'] = await newPage.$eval('#product_description', div => div.nextSibling.nextSibling.textContent);
                // dataObj['upc'] = await newPage.$eval('.table.table-striped > tbody > tr > td', table => table.textContent);
                resolve(dataObj);
                await newPage.close();
            });

            for(link in urls){
                let currentPageData = await pagePromise(urls[link]);
                scrapedData.push(currentPageData);
                // console.log(currentPageData);
            }
            // When all the data on this page is done, click the next button and start the scraping of the next page
            // You are going to check if this button exist first, so you know if there really is a next page.


            //Gets all the job pages, about 140 of them, but my computer did die

            // let nextButtonExist = false;
            // try{
            //     const nextButton = await page.$eval('.sc-digi-navigation-pagination', btn => btn.textContent);
            //     nextButtonExist = true;
            // }
            // catch(err){
            //     nextButtonExist = false;
            // }
            // if(nextButtonExist){
            //     await page.click('.sc-digi-navigation-pagination');   
            //     return scrapeCurrentPage(); // Call this function recursively
            // }
            // await page.close();
            // return scrapedData;
        }
        let data = await scrapeCurrentPage();
        console.log(data);

        await fs.writeFile('./data.json', data, err => {
        if (err) {
            console.error(err)
            return
        }
        //file written successfully
        })

        return data;
    }
}

module.exports = scraperObject;