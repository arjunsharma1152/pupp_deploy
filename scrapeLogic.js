const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();

    await page.goto('https://www.codechef.com/contests?itm_medium=navmenu');
    
    await page.setViewport({ width: 1080, height: 1024 });

    const codechefItems = [];

    await page.waitForSelector("#root > div > div > div > div > div > div:nth-child(2) > div > div > div > table > tbody > tr > td:nth-child(2) > div > a > span",1200000);

    const codechefName = await page.evaluate(() => { return (Array.from(document.querySelectorAll('#root > div > div > div > div > div > div:nth-child(2) > div > div > div > table > tbody > tr > td:nth-child(2) > div > a > span')).map(x => x.textContent)) });

    const codechefDate = await page.evaluate(() => { return (Array.from(document.querySelectorAll('#root > div > div > div > div > div > div:nth-child(2) > div > div > div > table > tbody > tr > td:nth-child(3) > div > div > div')).map(x => x.textContent)) });

    const codechefDuration = await page.evaluate(() => { return (Array.from(document.querySelectorAll('#root > div > div > div > div > div > div:nth-child(2) > div > div > div > table > tbody > tr > td:nth-child(4) > div > div > p')).map(x => x.textContent)) });

    const codechefStartsIn = await page.evaluate(() => { return (Array.from(document.querySelectorAll('#root > div > div > div > div > div > div:nth-child(2) > div > div > div > table > tbody > tr > td:nth-child(5) > div > div > p:nth-child(1)')).map(x => x.textContent)) });

    for (let i = 0; i < codechefName.length; i++) {

        const obj = {
            name: codechefName[i],
            date: codechefDate[i],
            duration: codechefDuration[i],
            startsIn: codechefStartsIn[i]
        }
        codechefItems.push(obj);
    }

    // CODEFORCES

    await page.goto('https://codeforces.com/contests');

    await page.setViewport({ width: 1080, height: 1024 });

    const codeforcesItems = [];

    const codeforcesName = await page.evaluate(() => { return (Array.from(document.querySelectorAll('#pageContent > div.contestList > div.datatable > div > table > tbody > tr > td.left')).map(x => x.textContent)) });

    const codeforcesDate = await page.evaluate(() => { return (Array.from(document.querySelectorAll('#pageContent > div.contestList > div.datatable > div > table > tbody > tr > td > a:not([class])')).map(x => x.innerHTML)) });

    const codeforcesDuration = await page.evaluate(() => { return (Array.from(document.querySelectorAll('#pageContent > div.contestList > div.datatable > div > table > tbody > tr > td:nth-child(4)')).map(x => x.textContent)) });

    const codeforcesStartsIn = await page.evaluate(() => { return (Array.from(document.querySelectorAll('#pageContent > div.contestList > div.datatable > div > table > tbody > tr > td.state > span > span')).map(x => x.textContent)) });

    await browser.close();

    for (let i = 0; i < codechefName.length; i++) {

        const obj = {
            name: codeforcesName[i].replace(/\n/g, "").trim(),
            date: codeforcesDate[i].replace(/\n/g, "").trim(),
            duration: codeforcesDuration[i].replace(/\n/g, "").trim(),
            startsIn: codeforcesStartsIn[i]
        }
        codeforcesItems.push(obj);
    }

    const fullData = [];

    fullData.push({
        platform: "codechef",
        contests: codechefItems
    });

    fullData.push({
        platform: "codeforces",
        contests: codeforcesItems
    });

    const data = JSON.stringify(fullData);

    res.send(data);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
