const express = require('express');
const cors = require('cors');
const api = require('./func.js'); 
const { createClient } = require("@supabase/supabase-js");
require('dotenv').config();

// Kết nối Database để đọc dữ liệu cho farm_01
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const app = express();
app.use(cors());
app.use(express.json());
//
// =======================
// MY BATCHES (FARM / USER)
// =======================
app.get("/api/my-batches", async (req, res) => {
  try {
    const wallet = req.query.wallet?.toLowerCase().trim();

    let userId = null;

    if (wallet) {
      const { data: user } = await supabase
        .from("users")
        .select("user_id")
        .ilike("wallet_address", wallet)
        .maybeSingle();

      if (user) userId = user.user_id;
    }

    //  query batches
    let query = supabase
      .from("batches")
      .select(`
        chain_batch_id,
        harvest_date,
        initial_weight,
        status
      `)
      .order("harvest_date", { ascending: false });

    //  nếu có user thì filter theo owner
    if (userId) {
      query = query.eq("owner_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data
    });

  } catch (err) {
    console.error("MY BATCHES ERROR:", err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});
// ==========================================
app.get('/api/my-batches/:wallet', async (req, res) => {
  try {
    const wallet = req.params.wallet.toLowerCase().trim();

    const { data: user } = await supabase
      .from('users')
      .select('user_id')
      .ilike('wallet_address', wallet)
      .maybeSingle();

    if (!user) return res.json({ success: true, data: [] });

    const { data, error } = await supabase
      .from('batches')
      .select('*, farms(chain_farm_id)')
      .eq('owner_id', user.user_id)
      .in('status', ['Processing', 'Processed']); // 

    if (error) throw error;

    res.json({ success: true, data });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
app.post('/api/save-batch', async (req, res) => {
  try {
    let {
      chain_batch_id,
      farm_id,
      initial_weight,
      owner
    } = req.body;

    //  1. Validate tối thiểu
    if (!chain_batch_id || !farm_id || !initial_weight || !owner) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu đầu vào"
      });
    }

    //  2. Chuẩn hoá farm_id (F001 → FARM-001)
    farm_id = farm_id.trim().toUpperCase();
    if (!farm_id.startsWith("FARM-")) {
      farm_id = "FARM-" + farm_id.replace("F", "").padStart(3, "0");
    }

    //  3. Lấy farm thật
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select('farm_id, owner_id')
      .eq('chain_farm_id', farm_id)
      .single();

    if (farmError || !farm) {
      return res.status(400).json({
        success: false,
        message: "Farm không tồn tại"
      });
    }

    //  4. Lấy owner_id từ ví (users table)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .eq('wallet_address', owner.toLowerCase())
      .single();

    if (userError || !user) {
      return res.status(400).json({
        success: false,
        message: "Owner chưa đăng ký hệ thống"
      });
    }

    //  5. Insert đúng schema
    const { data, error } = await supabase
      .from('batches')
      .insert([{
        chain_batch_id,
        farm_id: farm.farm_id,

        //  mapping chuẩn theo DB
        farmer_id: farm.owner_id,     // farm owner
        owner_id: user.user_id,       // người tạo batch

        initial_weight,
        status: 'Created',

        harvest_date: new Date().toISOString().split('T')[0],
        created_at: new Date(),
        updated_at: new Date(),

        //  optional (DB có thì để, không thì null)
        processed_weight: null,
        price: 0,
        qr_code_url: null
      }])
      .select();

    if (error) {
      console.error("DB ERROR:", error);
      throw error;
    }
    // sau khi insert batch
const batch = data[0];

//  insert history
const { error: historyError } = await supabase
  .from('batch_history')
  .insert([{
    batch_id: batch.batch_id,
    old_status: null,
    new_status: 'Created',
    action_type: 'CREATE',
    updated_by: user.user_id,
    tx_hash: "0x" + Math.random().toString(16).slice(2), // fake tx
    timestamp: new Date()
  }]);

if (historyError) {
  console.error("HISTORY ERROR:", historyError);
}
    res.json({ success: true, data });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
//get-history
app.get('/api/batch-history/:id', async (req, res) => {
  try {
    const batchId = req.params.id;

    // lấy batch_id nội bộ
    const { data: batch } = await supabase
      .from('batches')
      .select('batch_id')
      .eq('chain_batch_id', batchId)
      .single();

    if (!batch) throw new Error("Batch không tồn tại");

    const { data, error } = await supabase
      .from('batch_history')
      .select('*')
      .eq('batch_id', batch.batch_id)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});
// 4. post-history
app.post('/api/batch-history', async (req, res) => {
  try {
    const {
      batch_id,
      old_status,
      new_status,
      action_type,
      wallet,
      tx_hash
    } = req.body;

    //  tìm user từ ví
    const { data: user } = await supabase
      .from('users')
      .select('user_id')
      .eq('wallet_address', wallet.toLowerCase())
      .single();

    if (!user) {
      return res.status(400).json({ error: "User không tồn tại" });
    }

    const { error } = await supabase
      .from('batch_history')
      .insert([{
        batch_id,
        old_status,
        new_status,
        action_type,
        updated_by: user.user_id,
        tx_hash: tx_hash || null,
        timestamp: new Date()
      }]);

    if (error) throw error;

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// ==========================================
// 3. API lấy chi tiết một lô hàng cụ thể (dùng cho farm_03.html)
// ==========================================
app.get('/api/lot/:id', async (req, res) => {
  try {
    const batchId = req.params.id; //  giữ string

    const { data: lot, error } = await supabase
      .from('batches')
      .select(`
        *,
        farms (chain_farm_id),
        users!owner_id (wallet_address)
      `)
      .eq('chain_batch_id', batchId)
      .single();

    if (error || !lot) throw new Error("Không tìm thấy batch");

    res.json({ success: true, data: lot });

  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});
//process
app.post('/api/lot/:id/process', async (req, res) => {
  try {
    const batchId = req.params.id;
    const { processedWeight, wallet, txHash } = req.body;

    // ===== USER =====
    const { data: user } = await supabase
      .from('users')
      .select('user_id')
      .ilike('wallet_address', wallet)
      .single();

    if (!user) throw new Error("User không tồn tại");

    // ===== BATCH =====
    const { data: batch } = await supabase
      .from('batches')
      .select('*')
      .eq('chain_batch_id', batchId)
      .single();

    if (!batch) throw new Error("Batch không tồn tại");

    // ===== UPDATE =====
    await supabase
      .from('batches')
      .update({
        processed_weight: processedWeight,
        status: 'Processed',
        updated_at: new Date()
      })
      .eq('chain_batch_id', batchId);

    // ===== HISTORY =====
    await supabase.from('batch_history').insert([{
      batch_id: batch.batch_id,
      old_status: batch.status,
      new_status: 'Processed',
      action_type: 'PROCESS',
      updated_by: user.user_id,
      tx_hash: txHash,
      timestamp: new Date()
    }]);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
});
//update
app.post('/api/lot/:id/update', async (req, res) => {
  try {
    const batchId = req.params.id;
    const { status, wallet } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('user_id')
      .ilike('wallet_address', wallet)
      .single();

    const { data: batch } = await supabase
      .from('batches')
      .select('*')
      .eq('chain_batch_id', batchId)
      .single();

    await supabase
      .from('batches')
      .update({
        status: status,
        updated_at: new Date()
      })
      .eq('chain_batch_id', batchId);

    await supabase.from('batch_history').insert([{
      batch_id: batch.batch_id,
      old_status: batch.status,
      new_status: status,
      action_type: 'UPDATE',
      updated_by: user.user_id,
      timestamp: new Date()
    }]);

    res.json({ success: true });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
// ==========================================
// 5. API Lấy danh sách chứng chỉ (Dành cho cert_01.html)
// ==========================================
app.get('/api/certificates', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('certifications')
            .select(`
                cert_id,
                cert_hash,
                certificate_type,
                issued_date,
                farms ( chain_farm_id, location )
            `)
            .order('issued_date', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// ==========================================
// 6. API Cấp chứng chỉ mới (Dành cho cert_02.html)
// ==========================================
app.post('/api/certify', async (req, res) => {
    try {
        const { chainFarmId, certHash, certificateType, expiryDate } = req.body;

        // 1. Tìm UUID của Farm từ chain_farm_id người dùng nhập
        const { data: farm, error: farmError } = await supabase
            .from('farms')
            .select('farm_id')
            .eq('chain_farm_id', chainFarmId)
            .single();

        if (farmError || !farm) throw new Error("Không tìm thấy Farm ID này trong hệ thống!");

        // 2. Chèn dữ liệu vào bảng certifications
        const { data, error: certError } = await supabase
            .from('certifications')
            .insert([{
                farm_id: farm.farm_id,
                cert_hash: certHash,
                issued_date: new Date().toISOString().split('T')[0], // Ngày hôm nay
                expiry_date: expiryDate,
                certificate_type: certificateType || 'Organic',
                is_valid: true
            }])
            .select();

        if (certError) throw certError;

        // Giả lập trả về TxHash (Sau này em kết nối Web3 thì lấy từ Smart Contract)
        const fakeTxHash = "0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

        res.json({ success: true, txHash: fakeTxHash, data: data });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// GET: AVAILABLE FOR DISTRIBUTOR
app.get("/api/distributor/available", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("batches")
      .select("*, farms(chain_farm_id)")
      .eq("status", "Processed");

    if (error) throw error;

    res.json({ success: true, data });

  } catch (err) {
    console.error("AVAILABLE ERROR:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});
// GET: MY BATCHES (Distributor)
app.get("/api/distributor/my-batches/:wallet", async (req, res) => {
  try {
    const wallet = req.params.wallet.toLowerCase().trim();

    const { data: user } = await supabase
      .from("users")
      .select("user_id")
      .ilike("wallet_address", wallet)
      .maybeSingle();

    if (!user) return res.json({ success: true, data: [] });

    const { data, error } = await supabase
      .from("batches")
      .select("*, farms(chain_farm_id)")
      .eq("owner_id", user.user_id)
      .in("status", ["Shipped"]); //  FIX

    if (error) throw error;

    res.json({ success: true, data });

  } catch (err) {
    console.error("MY BATCH ERROR:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});
// POST: SHIP
app.post("/api/distributor/ship/:id", async (req, res) => {
  console.log(" HIT SHIP API");

  const { id } = req.params;

  try {
    const { data: batch, error: batchError } = await supabase
      .from("batches")
      .select("batch_id, status, owner_id")
      .eq("chain_batch_id", id)
      .maybeSingle();

    if (batchError) throw batchError;
    if (!batch) throw new Error("Batch not found");

    // UPDATE
    const { error } = await supabase
      .from("batches")
      .update({
        status: "Shipped",
        updated_at: new Date()
      })
      .eq("chain_batch_id", id);

    if (error) throw error;

    // HISTORY
    const { error: historyError } = await supabase
      .from("batch_history")
      .insert({
        batch_id: batch.batch_id,
        old_status: batch.status,
        new_status: "Shipped",
        action_type: "SHIP",
        updated_by: batch.owner_id,
        timestamp: new Date()
      });

    if (historyError) throw historyError;

    res.json({ success: true });

  } catch (err) {
    console.error("SHIP ERROR:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});
app.post("/api/distributor/buy/:id", async (req, res) => {
  console.log(" HIT BUY API");

  const { id } = req.params;
  const { wallet, txHash } = req.body;

  try {
    const { data: user } = await supabase
      .from("users")
      .select("user_id")
      .ilike("wallet_address", wallet)
      .maybeSingle();

    if (!user) throw new Error("User not found");

    const { data: batch, error: batchError } = await supabase
      .from("batches")
      .select("batch_id, status")
      .eq("chain_batch_id", id)
      .maybeSingle();

    if (batchError) throw batchError;
    if (!batch) throw new Error("Batch not found");

    // UPDATE
    const { error: updateError } = await supabase
      .from("batches")
      .update({
        owner_id: user.user_id,
        status: "Shipped",
        updated_at: new Date()
      })
      .eq("chain_batch_id", id);

    if (updateError) throw updateError;

    // HISTORY
    const { error: historyError } = await supabase
      .from("batch_history")
      .insert({
        batch_id: batch.batch_id,
        old_status: batch.status,
        new_status: "Shipped",
        action_type: "BUY",
        updated_by: user.user_id,
        tx_hash: txHash,
        timestamp: new Date()
      });

    if (historyError) throw historyError;

    res.json({ success: true });

  } catch (err) {
    console.error("BUY ERROR:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});
// ==========================================
// 7. API DÀNH CHO PROCESSOR (distribution.html)
// ==========================================

// A. Lấy tất cả các Batch đang ở trạng thái 'Created' (Chưa có ai mua)
app.get('/api/available-batches', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('batches')
            .select('*, farms(chain_farm_id)')
            .eq('status', 'Created');
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// ==========================================
// 8. API DÀNH CHO PROCESSOR (process_01.html)
// ==========================================

//buy processor
app.post('/api/lot/:batchId/buy', async (req, res) => {
  try {
    let { batchId } = req.params;
    const { buyer, txHash } = req.body;

    batchId = String(batchId).trim();
    const wallet = String(buyer).toLowerCase().trim();

    // ===== USER =====
    const { data: user } = await supabase
      .from('users')
      .select('user_id')
      .ilike('wallet_address', wallet)
      .maybeSingle();

    if (!user) throw new Error("User chưa đăng ký");

    // ===== BATCH =====
    const { data: batch } = await supabase
      .from('batches')
      .select('*')
      .eq('chain_batch_id', batchId)
      .maybeSingle();

    if (!batch) throw new Error("Batch không tồn tại");

    // ===== UPDATE ( FIX STATUS) =====
    const { data: updated, error } = await supabase
      .from('batches')
      .update({
        owner_id: user.user_id,
        status: 'Processing', //  ĐÚNG
        updated_at: new Date()
      })
      .eq('chain_batch_id', batchId)
      .select();

    if (!updated || updated.length === 0) {
      throw new Error("UPDATE FAILED");
    }

    // ===== HISTORY =====
    await supabase.from('batch_history').insert([{
      batch_id: batch.batch_id,
      old_status: batch.status,
      new_status: 'Processing',
      action_type: 'BUY',
      updated_by: user.user_id,
      tx_hash: txHash,
      timestamp: new Date()
    }]);

    res.json({ success: true });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});
// ==========================================
// 9. API Vận chuyển (Dành cho Processor/Distributor)
// ==========================================
app.post("/api/lot/:id/ship", async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from("lots")
            .update({ status: "Shipped" })
            .eq("chain_batch_id", id);

        if (error) throw error;

        res.json({ success: true });

    } catch (err) {
        console.error("SHIP ERROR:", err);
        res.status(400).json({
            success: false,
            message: "SHIP FAILED"
        });
    }
});
// ==========================================
// 10. API DÀNH CHO RETAILER (retail.html)
// ==========================================

// =======================
// RETAILER AVAILABLE
// =======================
app.get("/api/retailer/available", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("batches")
      .select("*, farms(chain_farm_id)")
      .eq("status", "Shipped");

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error("RETAIL AVAILABLE ERROR:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// =======================
// RETAILER INVENTORY
// =======================
app.get("/api/retailer/my-batches/:wallet", async (req, res) => {
  try {
    const wallet = req.params.wallet?.toLowerCase().trim();

    const { data: user } = await supabase
      .from("users")
      .select("user_id")
      .ilike("wallet_address", wallet)
      .maybeSingle();

    if (!user) return res.json({ success: true, data: [] });

    const { data, error } = await supabase
      .from("batches")
      .select("*, farms(chain_farm_id)")
      .eq("owner_id", user.user_id)
      .in("status", ["InStock", "Sold"]);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error("MY INVENTORY ERROR:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// =======================
// RECEIVE (BUY) - FIX FULL
// =======================
app.post("/api/retailer/receive/:id", async (req, res) => {
  console.log(" RECEIVE");

  const { id } = req.params;
  const { txHash, wallet } = req.body;

  try {
    if (!txHash) throw new Error("Missing txHash");
    if (!wallet) throw new Error("Missing wallet");

    //  tìm user
    const { data: user } = await supabase
      .from("users")
      .select("user_id")
      .ilike("wallet_address", wallet.toLowerCase())
      .maybeSingle();

    if (!user) throw new Error("User not found");

    //  tìm batch
    const { data: batch } = await supabase
      .from("batches")
      .select("batch_id, status, owner_id")
      .eq("chain_batch_id", id)
      .maybeSingle();

    if (!batch) throw new Error("Batch not found");

    //  update ownership + status
    const { error: updateError } = await supabase
      .from("batches")
      .update({
        status: "InStock",
        owner_id: user.user_id, //  QUAN TRỌNG
        updated_at: new Date()
      })
      .eq("chain_batch_id", id);

    if (updateError) throw updateError;

    //  history
    const { error: historyError } = await supabase
      .from("batch_history")
      .insert({
        batch_id: batch.batch_id,
        old_status: batch.status,
        new_status: "InStock",
        action_type: "RECEIVE",
        updated_by: user.user_id,
        tx_hash: txHash,
        timestamp: new Date()
      });

    if (historyError) throw historyError;

    res.json({ success: true });

  } catch (err) {
    console.error("RECEIVE ERROR:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// =======================
// SELL
// =======================
app.post("/api/retailer/sell/:id", async (req, res) => {
  console.log(" SELL");

  const { id } = req.params;
  const { txHash } = req.body;

  try {
    if (!txHash) throw new Error("Missing txHash");

    const { data: batch } = await supabase
      .from("batches")
      .select("batch_id, status, owner_id")
      .eq("chain_batch_id", id)
      .maybeSingle();

    if (!batch) throw new Error("Batch not found");

    const { error } = await supabase
      .from("batches")
      .update({
        status: "Sold",
        updated_at: new Date()
      })
      .eq("chain_batch_id", id);

    if (error) throw error;

    await supabase.from("batch_history").insert({
      batch_id: batch.batch_id,
      old_status: batch.status,
      new_status: "Sold",
      action_type: "SELL",
      updated_by: batch.owner_id,
      tx_hash: txHash,
      timestamp: new Date()
    });

    res.json({ success: true });

  } catch (err) {
    console.error("SELL ERROR:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});
// =======================
// TRACE PRODUCT (STRICT SCHEMA)
// =======================
app.get("/api/trace/:chainId", async (req, res) => {
  const { chainId } = req.params;

  try {
    // 1. lấy batch_id từ chain_batch_id
    const { data: batch, error: batchError } = await supabase
      .from("batches")
      .select("batch_id, chain_batch_id, status, initial_weight, harvest_date")
      .eq("chain_batch_id", chainId)
      .maybeSingle();

    if (batchError) throw batchError;
    if (!batch) throw new Error("Batch not found");

    // 2. lấy history đúng bảng m đưa
    const { data: history, error: historyError } = await supabase
      .from("batch_history")
      .select(`
        history_id,
        batch_id,
        old_status,
        new_status,
        action_type,
        updated_by,
        tx_hash,
        timestamp
      `)
      .eq("batch_id", batch.batch_id)
      .order("timestamp", { ascending: true });

    if (historyError) throw historyError;

    // 3. KHÔNG join, chỉ clean nhẹ
    const cleanedHistory = history
      // bỏ record vô nghĩa (null → null)
      .filter(h => h.old_status !== null || h.new_status !== null)

      // giữ nguyên field gốc
      .map(h => ({
        history_id: h.history_id,
        action_type: h.action_type,
        old_status: h.old_status,
        new_status: h.new_status,
        updated_by: h.updated_by,
        tx_hash: h.tx_hash,
        timestamp: h.timestamp
      }));

    res.json({
      success: true,
      data: {
        batch,
        history: cleanedHistory
      }
    });

  } catch (err) {
    console.error("TRACE ERROR:", err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});
// ==========================================
// KHỞI ĐỘNG MÁY CHỦ
// ==========================================
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 API Server đang chạy tại: http://localhost:${PORT}`);
});