-- 九藤智能工具平台数据库设计 (PostgreSQL/Supabase)

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    nickname VARCHAR(50),
    avatar_url VARCHAR(500),
    balance DECIMAL(10,2) DEFAULT 0.00,
    status INTEGER DEFAULT 1 CHECK (status IN (0, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 充值套餐表
CREATE TABLE IF NOT EXISTS recharge_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    credits BIGINT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1 CHECK (status IN (0, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(32) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    package_id UUID REFERENCES recharge_packages(id),
    amount DECIMAL(10,2) NOT NULL,
    credits BIGINT NOT NULL,
    payment_method VARCHAR(20),
    payment_status INTEGER DEFAULT 0 CHECK (payment_status IN (0, 1, 2, 3)),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);

-- API密钥表
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    api_secret VARCHAR(128) NOT NULL,
    status INTEGER DEFAULT 1 CHECK (status IN (0, 1)),
    rate_limit INTEGER DEFAULT 1000,
    daily_limit BIGINT DEFAULT 10000,
    total_calls BIGINT DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);

-- API调用日志表
CREATE TABLE IF NOT EXISTS api_call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    api_key_id UUID REFERENCES api_keys(id),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_data JSONB,
    response_code INTEGER,
    response_time INTEGER,
    credits_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_call_logs_user_id ON api_call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_created_at ON api_call_logs(created_at);

-- 服务器监控表
CREATE TABLE IF NOT EXISTS monitored_servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER DEFAULT 22,
    monitor_type VARCHAR(10) DEFAULT 'ping' CHECK (monitor_type IN ('ssh', 'ping', 'http', 'tcp')),
    status INTEGER DEFAULT 1 CHECK (status IN (0, 1)),
    alert_enabled INTEGER DEFAULT 1 CHECK (alert_enabled IN (0, 1)),
    last_check_at TIMESTAMPTZ,
    last_status INTEGER DEFAULT 0 CHECK (last_status IN (0, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monitored_servers_user_id ON monitored_servers(user_id);

-- 域名监控表
CREATE TABLE IF NOT EXISTS monitored_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    domain VARCHAR(255) NOT NULL,
    monitor_type VARCHAR(10) DEFAULT 'https' CHECK (monitor_type IN ('dns', 'ssl', 'http', 'https')),
    status INTEGER DEFAULT 1 CHECK (status IN (0, 1)),
    alert_enabled INTEGER DEFAULT 1 CHECK (alert_enabled IN (0, 1)),
    ssl_expiry_threshold INTEGER DEFAULT 7,
    last_check_at TIMESTAMPTZ,
    last_status INTEGER DEFAULT 0 CHECK (last_status IN (0, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monitored_domains_user_id ON monitored_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_monitored_domains_domain ON monitored_domains(domain);

-- U盘绑定表
CREATE TABLE IF NOT EXISTS usb_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    device_serial VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    device_vendor VARCHAR(255),
    fingerprint VARCHAR(255),
    status INTEGER DEFAULT 1 CHECK (status IN (0, 1)),
    bind_ip VARCHAR(45),
    bind_mac VARCHAR(17),
    bind_at TIMESTAMPTZ DEFAULT NOW(),
    unbind_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usb_devices_user_id ON usb_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_usb_devices_device_serial ON usb_devices(device_serial);

-- 验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('register', 'login', 'reset_password', 'bind_phone')),
    status INTEGER DEFAULT 0 CHECK (status IN (0, 1, 2)),
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_target ON verification_codes(target);

-- 操作审计表
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_data JSONB,
    response_data JSONB,
    status INTEGER DEFAULT 1 CHECK (status IN (0, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- 充值套餐初始数据
INSERT INTO recharge_packages (name, price, credits, description, sort_order) VALUES
('入门套餐', 10.00, 100, '适合新手体验', 1),
('标准套餐', 50.00, 600, '性价比之选，多送100积分', 2),
('专业套餐', 100.00, 1300, '专业用户首选，多送300积分', 3),
('企业套餐', 500.00, 7000, '企业级方案，多送2000积分', 4)
ON CONFLICT DO NOTHING;

-- 更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加触发器
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'users_updated_at') THEN
        CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'orders_updated_at') THEN
        CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'api_keys_updated_at') THEN
        CREATE TRIGGER api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END
$$;