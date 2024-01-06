const puppeteer = require("puppeteer");
require("dotenv").config();
const Contest = require('./contestModel');
const axios = require('axios');

const scrapeLogic = async (res) => {
  let browser = await puppeteer.launch({
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
    const fullData = [];
    
    //////////////////////////////// CODECHEF //////////////////////////////////

    const page = await browser.newPage();

    await page.goto('https://www.codechef.com/contests?itm_medium=navmenu');

    await page.setViewport({ width: 1080, height: 1024 });

    const codechefItems = [];

    await page.waitForSelector("#root > div > div > div > div > div > div:nth-child(2) > div > div > div > table > tbody > tr > td:nth-child(2) > div > a > span", 1200000);

    const codechefName = await page.evaluate(() => { return (Array.from(document.querySelectorAll('#root > div > div > div > div > div > div:nth-child(2) > div > div > div > table > tbody > tr > td:nth-child(2) > div > a > span')).map(x => x.textContent)) });

    const codechefDate = await page.evaluate(() => { return (Array.from(document.querySelectorAll('#root > div > div > div > div > div > div:nth-child(2) > div > div > div > table > tbody > tr > td:nth-child(3) > div > div > div')).map(x => x.textContent)) });

    const codechefDuration = await page.evaluate(() => { return (Array.from(document.querySelectorAll('#root > div > div > div > div > div > div:nth-child(2) > div > div > div > table > tbody > tr > td:nth-child(4) > div > div > p')).map(x => x.textContent)) });

    const codechefStartsIn = await page.evaluate(() => { return (Array.from(document.querySelectorAll('#root > div > div > div > div > div > div:nth-child(2) > div > div > div > table > tbody > tr > td:nth-child(5) > div > div > p:nth-child(1)')).map(x => x.textContent)) });

    for (let i = 0; i < codechefName.length; i++) {

      let [day, month, year, time] = codechefDate[i].split(/\s+/);
      weekday = year.slice(-3)
      year = year.slice(0, -3)
      const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;
      const standardizedDateString = `${weekday} ${monthNumber} ${day} ${year} ${time}`;
      const dateObject = new Date(standardizedDateString);

      const formattedDate = dateObject.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      });

      const obj = {
        name: codechefName[i],
        date: formattedDate,
        duration: codechefDuration[i],
        startsIn: codechefStartsIn[i]
      }
      codechefItems.push(obj);
    }

    /////////////////////////////// LEETCODE ////////////////////////////////////

    await page.goto('https://leetcode.com/contest/',{
      waitUntil: 'domcontentloaded'
    });

    const leetcodeItems = [];

    const leetcodeName = await page.evaluate(() => { return (Array.from(document.querySelectorAll('body > div > div > div:nth-child(3) > div > div > div:nth-child(2) > div > div > div > div > div > div > div > a > div:nth-child(2) > div > div > div > span')).map(x => x.textContent)) });

    const leetcodeStartsInTemp = await page.evaluate(() => { return (Array.from(document.querySelectorAll('body > div > div > div:nth-child(3) > div > div > div:nth-child(2) > div > div > div > div > div > div > div > a > div > div:nth-child(3) > div')).map(x => x.textContent)) });

    for (let i = 0; i < leetcodeStartsInTemp.length; i++) {

      const daysMatch = leetcodeStartsInTemp[i].match(/\b(\d+)d\b/);
      const hoursMatch = leetcodeStartsInTemp[i].match(/\b(\d+)h\b/);
      const minutesMatch = leetcodeStartsInTemp[i].match(/\b(\d+)m\b/);

      // Extract numeric values or default to 0 if not found
      const days = daysMatch ? parseInt(daysMatch[1], 10) : 0;
      const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

      // Calculate the total duration in milliseconds
      const totalDuration = (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60) * 1000;

      const currentDate = new Date();
      const targetDate = new Date(currentDate.getTime() + totalDuration).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      });

      const obj = {
        name: leetcodeName[i],
        date: targetDate,
        duration: "1:30 Hrs",
        startsIn: days > 1 ? `${days} Days` : `${days} Day`
      }
      leetcodeItems.push(obj);
    }

    await browser.close();

    fullData.push({
      platform: "codechef",
      contests: codechefItems
    });

    fullData.push({
      platform: "leetcode",
      contests: leetcodeItems
    });

    await Contest.deleteMany();

    await Contest.create(JSON.parse(JSON.stringify(fullData)));

    console.log("DATA LOADED")

    res.send({
      status: "ok",
      message: "Data Loaded",
      data: fullData
    });
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
