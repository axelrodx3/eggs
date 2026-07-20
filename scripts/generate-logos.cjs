/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const https = require("https");

const cdnSlugs = {
  apple: "apple",
  google: "google",
  nvidia: "nvidia",
  amazon: "amazon",
  meta: "meta",
  tesla: "tesla",
  spacex: "spacex",
};

const dir = path.join(__dirname, "..", "public", "assets", "logos");

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`${url} -> ${response.statusCode}`));
          return;
        }
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      })
      .on("error", reject);
  });
}

(async () => {
  for (const [file, slug] of Object.entries(cdnSlugs)) {
    const url = `https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/${slug}.svg`;
    const svg = await fetch(url);
    fs.writeFileSync(path.join(dir, `${file}.svg`), svg);
    console.log(`updated ${file}.svg`);
  }
  console.log("Manual logos preserved: microsoft.svg, sp500.svg, nasdaq100.svg, google.svg");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
