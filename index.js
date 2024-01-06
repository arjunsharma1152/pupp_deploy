const mongoose = require('mongoose');
const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const { uploadContests } = require('./uploadContests');
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/api/v1/scrape", (req, res) => {
  scrapeLogic(res);
});

app.get("/api/v1/contests", (req, res) => {
  uploadContests(res);
});

app.get("/api/v1", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

mongoose.connect('mongodb+srv://arjunsk923:ma8nsLywvNwUEYnl@cluster0.bpptzsd.mongodb.net/cpalert?retryWrites=true&w=majority').then(() => console.log("DB connection successful")
);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
