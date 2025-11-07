import express from "express";
import cors from "cors";
import lighthouse from "@lighthouse-web3/sdk";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.LIGHTHOUSE_API_KEY;

// Upload encrypted file
app.post("/upload", async (req, res) => {
  try {
    const { path } = req.body;
    const output = await lighthouse.uploadEncrypted(path, API_KEY);
    res.json({ cid: output.data.Hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Share access
app.post("/share", async (req, res) => {
  try {
    const { cid, address } = req.body;
    await lighthouse.shareFile(API_KEY, cid, [address]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Revoke access
app.post("/revoke", async (req, res) => {
  try {
    const { cid, address } = req.body;
    await lighthouse.revokeFileAccess(API_KEY, cid, [address]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
