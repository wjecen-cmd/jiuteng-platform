// 测试 Supabase 连接
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hidmcbxqjoecvzlumxiy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZG1jYnhxam9lY3Z6bHVteGl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzgzNDYzMSwiZXhwIjoyMDg5NDEwNjMxfQ.dX3RQR04n6Jv81GADnpwI6ggxQ3wAGHScCbkTtPyUt8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('测试 Supabase 连接...\n');
    
    // 测试充值套餐
    console.log('1. 测试 recharge_packages 表:');
    const { data: packages, error: pkgError } = await supabase
        .from('recharge_packages')
        .select('*');
    
    if (pkgError) {
        console.log('错误:', pkgError.message);
    } else {
        console.log('✅ 成功! 找到', packages?.length || 0, '个套餐');
        packages?.forEach(p => console.log('   -', p.name, ':', p.price, '元'));
    }
    
    // 测试用户表
    console.log('\n2. 测试 users 表:');
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
    
    if (userError) {
        console.log('错误:', userError.message);
    } else {
        console.log('✅ 用户表正常');
    }
}

test();