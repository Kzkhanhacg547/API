const router = require("express").Router();
const { readdirSync, readFileSync } = require('fs-extra');
const path = require('path');
const axios = require('axios');
const chalk = require('chalkercli');
const cchalk = require("chalk");
const chalkAnimation = require('chalkercli');
const log = require("./utils/logger");

// ==============================
// Constants and Configuration
// ==============================
const ASCII_ART = {
  loadingBar: String.raw`[▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒]`,
  logo: String.raw`◆━━━━━━━━━━━━━━━◆━━━━━━━━━━━━━━━◆━━━━━━━━━━━━━━━◆
*                                                  *
*      ██╗░░██╗███████╗                            *
*      ██║░██╔╝╚════██║                            *
*      █████═╝░░░███╔═╝                            *
*      ██╔═██╗░██╔══╝░░                            *
*      ██║░╚██╗███████╗                            *
*      ╚═╝░░╚═╝╚══════╝                            *       
*                                                  *
*   → 𝐊𝐳 𝐀𝐏𝐈                                       *
*   → Phiên bản: 1.2.15                            *
*   → Tên: Kz Khánhh - 2007                        *
*   → FB: Kz Khánhh                                *
*                                                  *
◆━━━━━━━━━━━━━━━◆━━━━━━━━━━━━━━━◆━━━━━━━━━━━━━━━◆`
};

// ==============================
// Startup Animation
// ==============================
const initializeAnimation = () => {
  const karaoke = chalkAnimation.karaoke(ASCII_ART.loadingBar);
  const rainbow2 = chalkAnimation.rainbow(ASCII_ART.logo);

  setTimeout(async () => {
    await karaoke.start();
    await rainbow2.start();
    console.clear();
  }, 100);

  setTimeout(() => {
    karaoke.stop();
    rainbow2.stop();
  }, 100);

  const rainbow = chalk.rainbow(`█░▄▀░░▀▀▀█
█▀▄░░░░▄▀░
▀░▀▀░░▀▀▀▀\n`).stop();
  rainbow.render();
};

// ==============================
// Route Loading Functions
// ==============================
const loadBasicRoutes = (srcPath) => {
  const files = readdirSync(srcPath).filter(file => file.endsWith(".js"));
  let count = 0;

  files.forEach(file => {
    const { index, name } = require(path.join(srcPath, file));
    router.get(name, index);
    count++;
    console.log(`\x1b[38;5;33m[ Loading ] \x1b[32m→\x1b[40m\x1b[1m\x1b[38;5;34m Loaded ${file}`);
  });

  return count;
};

const loadNestedRoutes = (srcPath) => {
  const dirs = readdirSync(srcPath).filter(file => !file.endsWith(".js") && !file.endsWith(".json"));
  let count = 0;

  dirs.forEach(dir => {
    const files = readdirSync(path.join(srcPath, dir)).filter(file => file.endsWith(".js"));
    files.forEach(file => {
      const { index, name } = require(path.join(srcPath, dir, file));
      router.get(name, index);
      count++;
      console.log(`\x1b[38;5;220m[ Loading ] \x1b[33m→\x1b[40m\x1b[1m\x1b[38;5;161m Loaded ${dir}/${file}`);
    });
  });

  return count;
};

// ==============================
// Main Route Loading Logic
// ==============================
let totalRoutes = 0;

const loadAPIRoutes = () => {
  try {
    const folders = {
      public: path.join(__dirname, "/public/"),
      edit: path.join(__dirname, "/edit/"),
      kzAPI: path.join(__dirname, "/Kz-API/"),
      post: path.join(__dirname, "/post/")
    };

    // Load routes from each folder
    Object.entries(folders).forEach(([name, path]) => {
      console.log(`\n\x1b[38;5;33m[ Loading ${name} folder ]\x1b[0m`);
      totalRoutes += loadBasicRoutes(path);
      totalRoutes += loadNestedRoutes(path);
    });

    // Special routes
    router.get('/altp_data', (req, res) => {
      const data = JSON.parse(readFileSync('./altp_data.json', "utf-8"));
      res.header("Content-Type", 'application/json');
      res.send(JSON.stringify(data, null, 4));
    });

    console.log(`\x1b[38;5;220m[ COMPLETE ] \x1b[33m→\x1b[38;5;197m Successfully loaded ${totalRoutes} API files\x1b[0m`);
  } catch (error) {
    console.error('\x1b[31m[ ERROR ]\x1b[0m Failed to load routes:', error);
  }
};

// ==============================
// Route Definitions
// ==============================

// Download Routes
const downloadRoutes = {
  facebook: 'facebook',
  mediafire: 'mediafire',
  tiktok: 'tiktok',
  soundcloud: 'soundcloud',
  twitter: 'twitter'
};

Object.entries(downloadRoutes).forEach(([platform, endpoint]) => {
  router.get(`/download/${platform}`, async (req, res) => {
    const url = req.query.url;
    if (!url) return res.json(mess.noturl);

    try {
      const data = await fetchJson(`https://xorizn-downloads.vercel.app/api/downloads/${endpoint}?url=${url}`);
      res.json({
        status: true,
        author: author,
        result: data.result
      });
    } catch (error) {
      res.json({
        status: false,
        error: 'Download failed'
      });
    }
  });
});

// Initialize
initializeAnimation();
loadAPIRoutes();

// Export router
module.exports = router;