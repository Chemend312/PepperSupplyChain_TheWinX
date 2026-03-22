import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";
import contractArtifact from "./PepperSupplyChain.json" assert { type: "json" };

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối blockchain
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractArtifact.abi,
  wallet
);

// ================== Certification Authority ==================
app.post("/certify", async (req, res) => {
  try {
    const { farmId, certHash, validUntil } = req.body;
    const tx = await contract.certifyFarm(farmId, certHash, validUntil);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/update-cert", async (req, res) => {
  try {
    const { farmId, newHash, newValid } = req.body;
    const tx = await contract.updateFarmCertification(farmId, newHash, newValid);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/farm/:id", async (req, res) => {
  try {
    const farm = await contract.farms(req.params.id);
    res.json(farm);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================== Role Management ==================
app.post("/role/farmer", async (req, res) => {
  try { const tx = await contract.grantFarmer(req.body.address); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post("/role/distributor", async (req, res) => {
  try { const tx = await contract.grantDistributor(req.body.address); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post("/role/processor", async (req, res) => {
  try { const tx = await contract.grantProcessor(req.body.address); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post("/role/retailer", async (req, res) => {
  try { const tx = await contract.grantRetailer(req.body.address); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post("/role/certifier", async (req, res) => {
  try { const tx = await contract.grantCertifier(req.body.address); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Revoke role
app.post("/role/revoke/farmer", async (req, res) => { try { const tx = await contract.revokeFarmer(req.body.address); await tx.wait(); res.json({ success: true, txHash: tx.hash }); } catch (err) { res.status(500).json({ error: err.message }); } });
app.post("/role/revoke/distributor", async (req, res) => { try { const tx = await contract.revokeDistributor(req.body.address); await tx.wait(); res.json({ success: true, txHash: tx.hash }); } catch (err) { res.status(500).json({ error: err.message }); } });
app.post("/role/revoke/processor", async (req, res) => { try { const tx = await contract.revokeProcessor(req.body.address); await tx.wait(); res.json({ success: true, txHash: tx.hash }); } catch (err) { res.status(500).json({ error: err.message }); } });
app.post("/role/revoke/retailer", async (req, res) => { try { const tx = await contract.revokeRetailer(req.body.address); await tx.wait(); res.json({ success: true, txHash: tx.hash }); } catch (err) { res.status(500).json({ error: err.message }); } });

// ================== Lot Management ==================
app.post("/lot", async (req, res) => {
  try {
    const { id, farmId, weight } = req.body;
    const tx = await contract.createLot(id, farmId, weight);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/lot/:id", async (req, res) => {
  try { const lot = await contract.getLot(req.params.id); res.json(lot); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/lot/:id/set-price", async (req, res) => {
  try { const tx = await contract.setPrice(req.params.id, req.body.price); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/lot/:id/process", async (req, res) => {
  try { const tx = await contract.processLot(req.params.id, req.body.processedWeight); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/lot/:id/ship", async (req, res) => {
  try { const tx = await contract.markShipped(req.params.id); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/lot/:id/sell", async (req, res) => {
  try { const tx = await contract.markSold(req.params.id); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/lot/:id/flag", async (req, res) => {
  try { const tx = await contract.flagLot(req.params.id); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/lot/:id/recall", async (req, res) => {
  try { const tx = await contract.recallLot(req.params.id); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/lot/:id/refund", async (req, res) => {
  try { const tx = await contract.refundEscrow(req.params.id); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/lot/:id/confirm", async (req, res) => {
  try { const tx = await contract.confirmReceived(req.params.id); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/lot/merge", async (req, res) => {
  try { const tx = await contract.mergeLots(req.body.newId, req.body.source); await tx.wait(); res.json({ success: true, txHash: tx.hash }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ================== Lot Purchase ==================
app.post("/lot/:id/buy", async (req, res) => {
  try {
    const tx = await contract.buyLot(req.params.id, { value: req.body.value });
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================== Server ==================
app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});