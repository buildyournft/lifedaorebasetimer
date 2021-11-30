require("dotenv").config();

const http = require("http");
const https = require("https");

const { Client, Intents } = require("discord.js");

const token = process.env.TOKEN;

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Interval to update the timer, default 1 minute
const UPDATE_INTERVAL_MS = process.env.UPDATE_INTERVAL_MS || 60 * 1000;

const EPOCH_INTERVAL = process.env.EPOCH_INTERVAL || 33100;
const BLOCK_RATE_SECONDS = process.env.BLOCK_RATE_SECONDS || 0.87;

// Extracted from website source code
const getRebaseBlock = (currentBlock) => {
  // Not sure what this is, I'm guessing it's the first
  //  epoch block number?
  const t = 20909100;
  const n = currentBlock - t;
  return t + Math.ceil(n / EPOCH_INTERVAL) * EPOCH_INTERVAL;
}

// Copied from the ohm-frontend
const secondsUntilBlock = (startBlock, endBlock) => {
  const blocksAway = endBlock - startBlock;
  const secondsAway = blocksAway * BLOCK_RATE_SECONDS;

  return secondsAway;
};

const prettifySeconds = (seconds, resolution) => {
  if (seconds !== 0 && !seconds) {
    return "";
  }

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  if (resolution === "day") {
    return d + (d == 1 ? " day" : " days");
  }

  const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  const hDisplay = h > 0 ? h + (h == 1 ? " hr, " : " hrs, ") : "";
  const mDisplay = m > 0 ? m + (m == 1 ? " min" : " mins") : "";

  let result = dDisplay + hDisplay + mDisplay;
  if (mDisplay === "") {
    result = result.slice(0, result.length - 2);
  }

  return result;
};

// Get current block number from the spartacus thegraph api endpoint
const getBlockNumber = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query: "{ _meta { block { number } } }",
    });

    const req = https.request(
      {
        hostname: "api.thegraph.com",
        port: 443,
        path: "/subgraphs/name/spartacus-finance/ftm3",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: 0,
        },
      },
      (res) => {
        res.on("data", (data) => {
          try {
            const parsedData = JSON.parse(data.toString());
            // {"data":{"_meta":{"block":{"number":22090292}}}}
            resolve(parsedData.data._meta.block.number);
          } catch (err) {
            reject(err);
          }
        });
        res.on("error", (error) => {
          reject(error);
        });
      }
    );

    req.on("error", (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

const updateRebaseTimer = () => {
  getBlockNumber()
    .then((blockNo) => {
      console.log("Retrieved currentblock: " + blockNo);
      const rebaseBlock = getRebaseBlock(blockNo);
      const seconds = secondsUntilBlock(blockNo, rebaseBlock);
      const prettified = prettifySeconds(seconds);

      const displayString =
        prettified !== "" ? prettified : "Less than a minute";

      console.log("Updating rebase time to " + displayString);
      client.guilds.cache.forEach((guild) => {
        guild.me.setNickname(displayString);
      });
    })
    .catch((error) => console.error(error.message || error));
};

client.once("ready", () => {
  console.log("Ready");
  client.user.setActivity("Rebase Timer", {
    type: "WATCHING",
  });

  updateRebaseTimer();

  setInterval(() => {
    updateRebaseTimer();
  }, UPDATE_INTERVAL_MS);
});


client.login(token);
