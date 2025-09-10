import express from "express";
import multer from "multer";
import path from "path";
import { extractText } from "./services/ocr";
import { structureMenu } from "./services/llm";
import fs from "fs";
require("dotenv").config();

const app = express();
const port = 4000;

// File upload config
const upload = multer({ dest: path.join(__dirname, "uploads/") });
app.get("/", (req, res) => {
  res.send("Welocome to Smart Menu Upload API");
});

app.post("/api/menu/upload", upload.single("menu"), async (req, res) => {
  try {
    const filePath = req.file?.path!;
    const ocrText = await extractText(filePath);
    console.log("Extracted OCR Text completed");
    const structured = await structureMenu(ocrText);
    console.log(" Open AI LLM JSON completed");

    fs.writeFileSync(
      "output.json",
      JSON.stringify({ ocrText, structured }, null, 2)
    );

    res.json({ ocrText, structured });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process menu" });
  }
});

app.listen(port, () =>
  console.log(`🚀 Backend running at http://localhost:${port}`)
);
