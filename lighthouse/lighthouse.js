const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fs = require("fs");
const createHTML = require("create-html");

const DEFAULT_ITERATION = 1

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher
    .launch({ chromeFlags: opts.chromeFlags })
    .then(chrome => {
      opts.port = chrome.port;
      return lighthouse(url, opts, config).then(results => {
        // use results.lhr for the JS-consumeable output
        // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
        return chrome.kill().then(() => results.lhr);
      });
    });
}

const opts = {
  chromeFlags: ["--show-paint-rects"],
  disableNetworkThrottling: false,
  disableCpuThrottling: false,
  disableDeviceEmulation: false
};

const config = {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: ["performance"]
  }
};

const assignOrAdd = (key, value) => key ? key + value : value;

const launchAll = async (url, iterationNumber) => {
  let entries = {};
  const iterations = iterationNumber || DEFAULT_ITERATION

  for (let i = 0; i < iterations; i++) {
    await launchChromeAndRunLighthouse(
      url,
      opts,
      config
    ).then(results => {
      Object.values(results.audits).map(result => {
        entries[result.title] = {
          title: result.title,
          description: result.description,
          score: assignOrAdd(entries[result.title] && entries[result.title]["score"], result.score),
          rawValue: assignOrAdd(entries[result.title] && entries[result.title]["rawValue"], result.rawValue),
          displayValue: result.displayValue,
        };
      });
    });
  }

  let txt = `<h2>${url}</h2>` 
  txt += "<table border='1'>";
  txt += "<tr><th>Title</th><th>Score</th><th>rawValue</th><th>displayValue (last entry)</th><th>Description</th></tr>";
  Object.values(entries).map(entry => {
    txt +=
      "<tr><td>" +
      entry.title +
      "</td><td>" +
      (parseFloat(entry.score) / iterations)  +
      "</td><td>" +
      (parseFloat(entry.rawValue) / iterations)  +
      "</td><td>" +
      entry.displayValue +
      "</td><td>" +
      entry.description +
      "</td></tr>";
  });
  txt += "</table>";
  const html = createHTML({
    title: "Lighthouse performance",
    body: txt
  });

  fs.writeFile("result.html", html, err => {
    if (err) console.log(err);
  });
};

const url = process.argv.slice(2)[0];
const iterationNumber = process.argv.slice(2)[1];

if (!url || !url.length) {
  return console.error('Usage: node lighthouse.js URL [number of iteration]')
}
launchAll(url, iterationNumber);
