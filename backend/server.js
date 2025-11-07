import express from "express";
import cors from "cors";
import lighthouse from "@lighthouse-web3/sdk";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.LIGHTHOUSE_API_KEY;
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------
// Upload encrypted file
// ----------------------
app.post("/upload", async (req, res) => {
  try {
    const { path: filePath } = req.body;
    const output = await lighthouse.uploadEncrypted(filePath, API_KEY);
    res.json({ cid: output.data.Hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Share access
// ----------------------
app.post("/share", async (req, res) => {
  try {
    const { cid, address } = req.body;
    await lighthouse.shareFile(API_KEY, cid, [address]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Revoke access
// ----------------------
app.post("/revoke", async (req, res) => {
  try {
    const { cid, address } = req.body;
    await lighthouse.revokeFileAccess(API_KEY, cid, [address]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Decrypt & download file
// ----------------------
app.post("/decrypt", async (req, res) => {
  try {
    const { cid } = req.body;
    const response = await lighthouse.decryptFile(cid, API_KEY);

    // Save temporarily
    const outPath = path.join(__dirname, `${cid}.decrypted`);
    fs.writeFileSync(outPath, Buffer.from(response.data));

    res.download(outPath, (err) => {
      if (!err) fs.unlinkSync(outPath); // delete temp file after sending
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Start server
// ----------------------
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
