// backend/test-e2e.js
require('dotenv').config();
const { ethers } = require("ethers");
const { createClient } = require("@supabase/supabase-js");
const { createLot } = require("./func"); // Nhúng hàm của bạn vào đây

// Khởi tạo kết nối
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractArtifact = require("../artifacts/contracts/PepperSupplyChain.sol/PepperSupplyChain.json");
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractArtifact.abi, wallet);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function runE2ETest() {
    console.log("🚀 BẮT ĐẦU KỊCH BẢN TEST THỰC TẾ (E2E TEST)...\n");

    try {
        // --- DATA MẪU (Sinh ngẫu nhiên để test đi test lại không bị trùng) ---
        const timestamp = Date.now();
        const lotId = timestamp; // Dùng thời gian làm ID lô hàng luôn cho khỏi trùng
        const chainFarmId = ethers.id("FARM_DAK_LAK_" + timestamp); // Tạo mã bytes32 chuẩn
        const certHash = ethers.id("CERT_VIETGAP_" + timestamp);
        const myWallet = wallet.address; 

        console.log("🛠️ PHẦN 1: SETUP DỮ LIỆU NỀN TẢNG...");
        
        // 1. Cấp quyền trên Blockchain
        console.log("  👉 Đang cấp quyền FARMER và CERTIFIER cho ví...");
        await (await contract.grantFarmer(myWallet)).wait();
        await (await contract.grantCertifier(myWallet)).wait();

        // 2. Cấp chứng nhận Nông trại trên Blockchain (Hạn 30 ngày)
        console.log("  👉 Đang cấp chứng nhận nông trại...");
        const validUntil = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
        await (await contract.certifyFarm(chainFarmId, certHash, validUntil)).wait();

        // 3. Tạo dữ liệu giả vào Supabase (User và Farm)
        console.log("  👉 Đang thêm Nông dân và Nông trại vào Supabase...");
        
        // Upsert User (Thêm nếu chưa có, có rồi thì cập nhật)
        const { data: user } = await supabase.from('users').upsert(
            { wallet_address: myWallet, role: 'Farmer', name: 'Nông dân Test' },
            { onConflict: 'wallet_address' }
        ).select().single();

        // Thêm Farm
        const { data: farm } = await supabase.from('farms').insert({
            chain_farm_id: chainFarmId,
            owner_id: user.user_id,
            location: 'Đắk Lắk'
        }).select().single();

        console.log("✅ SETUP XONG! BẮT ĐẦU GỌI HÀM CỦA BẠN...\n");

        // --- PHẦN 2: CHẠY HÀM NGHIỆP VỤ ---
        console.log(`📦 Đang gọi func.createLot(lotId: ${lotId}, weight: 500kg)...`);
        const result = await createLot(lotId, chainFarmId, 500, myWallet);
        console.log("✅ createLot THÀNH CÔNG! txHash:", result.txHash, "\n");

        // --- PHẦN 3: ĐỐI CHIẾU SỰ THẬT (KIỂM TRA DỮ LIỆU) ---
        console.log("🔍 PHẦN 3: ĐANG KIỂM TRA DỮ LIỆU ĐÃ LƯU ĐÚNG CHỖ CHƯA...");

        // A. Kiểm tra trên Blockchain
        const onChainLot = await contract.getLot(lotId);
        console.log("  ⛓️ Dữ liệu trên BLOCKCHAIN:");
        console.log(`     - Trạng thái (0=Created): ${onChainLot.status}`);
        console.log(`     - Trọng lượng: ${onChainLot.initialWeight} kg`);
        console.log(`     - Nông dân: ${onChainLot.farmer}`);

        // B. Kiểm tra trên Database (Supabase)
        const { data: dbBatch } = await supabase.from('batches').select('*').eq('chain_batch_id', lotId.toString()).single();
        const { data: dbHistory } = await supabase.from('batch_history').select('*').eq('batch_id', dbBatch.batch_id);

        console.log("  🗄️ Dữ liệu trên SUPABASE:");
        console.log(`     - Bảng 'batches': Lô ${dbBatch.chain_batch_id} | Nặng ${dbBatch.initial_weight}kg | Trạng thái: ${dbBatch.status}`);
        console.log(`     - Bảng 'batch_history': Có ${dbHistory.length} dòng log (Action: ${dbHistory[0].action_type})`);

        if (Number(onChainLot.initialWeight) === dbBatch.initial_weight) {
            console.log("\n🎉 TEST HOÀN HẢO! Dữ liệu Blockchain và Supabase KHỚP NHAU 100%!");
        }

    } catch (error) {
        console.error("\n❌ TEST THẤT BẠI:", error.message);
    }
}

runE2ETest();