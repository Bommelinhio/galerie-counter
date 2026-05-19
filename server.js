const express = require("express");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const DATA_FILE = path.join(__dirname, "data.json");

app.use(helmet());
app.use(express.json({ limit: "20kb" }));

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Zu viele Versuche. Bitte später erneut versuchen."
  }
});

function getDefaultData() {
  return {
    pageViews: {
      home: 0,
      gallery: 0
    },
    imageClicks: {
      image1: 0,
      image2: 0,
      image3: 0,
      image4: 0,
      image5: 0,
      image6: 0,
      image7: 0,
      image8: 0
    }
  };
}

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = getDefaultData();
    writeData(defaultData);
    return defaultData;
  }

  try {
    const rawData = fs.readFileSync(DATA_FILE, "utf8");
    const data = JSON.parse(rawData);

    return {
      pageViews: {
        home: Number(data.pageViews?.home) || 0,
        gallery: Number(data.pageViews?.gallery) || 0
      },
      imageClicks: {
        ...getDefaultData().imageClicks,
        ...(data.imageClicks || {})
      }
    };
  } catch (error) {
    console.error("Fehler beim Lesen von data.json:", error);
    const defaultData = getDefaultData();
    writeData(defaultData);
    return defaultData;
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function checkAdminHeader(req, res, next) {
  const password = req.headers["x-admin-password"];

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: "Nicht autorisiert"
    });
  }

  next();
}

function checkBasicAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Adminbereich"');
    return res.status(401).send("Login erforderlich");
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");
  const [user, password] = credentials.split(":");

  if (user !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Adminbereich"');
    return res.status(401).send("Falsche Zugangsdaten");
  }

  next();
}

app.get("/admin.html", adminLimiter, checkBasicAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.use(express.static(path.join(__dirname, "public")));

app.post("/api/count/page", (req, res) => {
  const allowedPages = ["home", "gallery"];
  const { page } = req.body;

  if (!allowedPages.includes(page)) {
    return res.status(400).json({ success: false });
  }

  const data = readData();
  data.pageViews[page]++;
  writeData(data);

  res.json({ success: true });
});

app.post("/api/count/image", (req, res) => {
  const allowedImages = [
    "image1",
    "image2",
    "image3",
    "image4",
    "image5",
    "image6",
    "image7",
    "image8"
  ];

  const { image } = req.body;

  if (!allowedImages.includes(image)) {
    return res.status(400).json({ success: false });
  }

  const data = readData();
  data.imageClicks[image]++;
  writeData(data);

  res.json({ success: true });
});

app.get("/api/stats", adminLimiter, checkAdminHeader, (req, res) => {
  res.json(readData());
});

app.post("/api/reset", adminLimiter, checkAdminHeader, (req, res) => {
  const resetData = getDefaultData();
  writeData(resetData);

  res.json({
    success: true,
    message: "Zähler wurden zurückgesetzt"
  });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});