const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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
        home: data.pageViews?.home || 0,
        gallery: data.pageViews?.gallery || 0
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

function checkAdminPassword(req, res, next) {
  const password = req.headers["x-admin-password"];

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: "Nicht autorisiert"
    });
  }

  next();
}

app.post("/api/count/page", (req, res) => {
  const { page } = req.body;
  const data = readData();

  if (data.pageViews[page] !== undefined) {
    data.pageViews[page]++;
    writeData(data);
  }

  res.json({ success: true });
});

app.post("/api/count/image", (req, res) => {
  const { image } = req.body;
  const data = readData();

  if (data.imageClicks[image] !== undefined) {
    data.imageClicks[image]++;
    writeData(data);
  }

  res.json({ success: true });
});

app.get("/api/stats", checkAdminPassword, (req, res) => {
  res.json(readData());
});

app.post("/api/reset", checkAdminPassword, (req, res) => {
  const resetData = getDefaultData();
  writeData(resetData);

  res.json({
    success: true,
    message: "Zähler wurden zurückgesetzt"
  });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});