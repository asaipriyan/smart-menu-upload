import express from "express";
import multer from "multer";
import path from "path";
import cors from "cors";
import { extractText } from "./services/ocr";
import { structureMenu } from "./services/llm";
import fs from "fs";
require("dotenv").config();

const app = express();
const port = 4000;

app.use(cors());
// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads/"));
  },
  filename: (req, file, cb) => {
    // Preserve original extension
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

app.post(
  "/api/:storeId/menu/upload",
  upload.array("menu"),
  async (req, res) => {
    try {
      console.log("Files received:", req.files);
      console.log("Body:", req.params.storeId);
      const storeId = req.params.storeId;
      if (!storeId) {
        return res.status(400).json({ error: "Store ID is required" });
      }

      const menuPath = `menus/${storeId}.json`;
      if (fs.existsSync(menuPath)) {
        const data = fs.readFileSync(menuPath, "utf-8");
        return res.status(200).json(JSON.parse(data));
      }

      if (!req.files || !(req.files as Express.Multer.File[]).length) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const results = [];
      for (const file of req.files as Express.Multer.File[]) {
        const filePath = file.path;
        const ocrText = await extractText(filePath);
        console.log("OCR Text completed storeId:", storeId);
        const structured = await structureMenu(ocrText);
        console.log("LLM Structuring completed storeId:", storeId);
        results.push({ fileName: file.originalname, ocrText, structured });
      }

      if (!fs.existsSync("menus")) {
        fs.mkdirSync("menus");
      }
      fs.writeFileSync(
        `menus/${storeId}.json`,
        JSON.stringify(results, null, 2)
      );

      res.status(200).json({ results });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to process menu" });
    }
  }
);

app.get("/api/:storeId/menu", (req, res) => {
  const storeId = req.params.storeId;
  const menuPath = `menus/${storeId}.json`;
  if (fs.existsSync(menuPath)) {
    const data = fs.readFileSync(menuPath, "utf-8");
    return res.status(200).json(JSON.parse(data));
  }
});

app.listen(port, () =>
  console.log(`🚀 Backend running at http://localhost:${port}`)
);
