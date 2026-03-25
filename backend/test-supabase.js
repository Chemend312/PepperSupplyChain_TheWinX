// backend/test-supabase.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_KEY trong file .env!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("⏳ Đang thử kết nối đến Supabase...");
    
    // Thử lấy 1 dòng từ bảng 'batches' (hoặc bất kỳ bảng nào bạn đã tạo)
    const { data, error } = await supabase.from('batches').select('*').limit(1);

    if (error) {
        console.error("❌ KẾT NỐI THẤT BẠI hoặc CÓ LỖI:");
        console.error(error.message);
    } else {
        console.log("✅ KẾT NỐI SUPABASE THÀNH CÔNG!");
        console.log("📦 Dữ liệu test trả về:", data);
        console.log("(Nếu mảng [] rỗng tức là bảng chưa có dữ liệu, nhưng kết nối đã thông!)");
    }
}

testConnection();