// 检查表是否存在
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hidmcbxqjoecvzlumxiy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZG1jYnhxam9lY3Z6bHVteGl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzgzNDYzMSwiZXhwIjoyMDg5NDEwNjMxfQ.dX3RQR04n6Jv81GADnpwI6ggxQ3wAGHScCbkTtPyUt8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('检查数据库表...\n');
    
    // 尝试直接查询
    const { data, error, status, statusText } = await supabase
        .from('recharge_packages')
        .select('*')
        .limit(1);
    
    console.log('Status:', status);
    console.log('StatusText:', statusText);
    console.log('Error:', error);
    console.log('Data:', data);
    
    // 尝试 RPC
    console.log('\n尝试 RPC 调用...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_packages');
    console.log('RPC Error:', rpcError);
    console.log('RPC Data:', rpcData);
}

test();