-- 九藤智能工具平台数据库设计
-- 包含10张核心表

-- 用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    salt VARCHAR(32) NOT NULL COMMENT '盐值',
    nickname VARCHAR(50) COMMENT '昵称',
    email VARCHAR(100) COMMENT '邮箱',
    avatar_url VARCHAR(255) COMMENT '头像地址',
    balance DECIMAL(10,2) DEFAULT 0.00 COMMENT '账户余额',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    INDEX idx_phone (phone),
    INDEX idx_created_at (created_at)
);

-- 充值套餐表
CREATE TABLE recharge_packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '套餐名称',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    credits BIGINT NOT NULL COMMENT '积分数量',
    description TEXT COMMENT '描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-下架, 1-上架',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) UNIQUE NOT NULL COMMENT '订单号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    package_id BIGINT NOT NULL COMMENT '充值套餐ID',
    amount DECIMAL(10,2) NOT NULL COMMENT '金额',
    credits BIGINT NOT NULL COMMENT '积分',
    payment_method VARCHAR(20) COMMENT '支付方式',
    payment_status TINYINT DEFAULT 0 COMMENT '支付状态: 0-待支付, 1-已支付, 2-已取消, 3-退款',
    paid_at TIMESTAMP NULL COMMENT '支付时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES recharge_packages(id),
    INDEX idx_user_id (user_id),
    INDEX idx_order_no (order_no),
    INDEX idx_created_at (created_at)
);

-- API密钥表
CREATE TABLE api_keys (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    key_name VARCHAR(100) NOT NULL COMMENT '密钥名称',
    api_key VARCHAR(64) UNIQUE NOT NULL COMMENT 'API密钥',
    encrypted_secret_key VARCHAR(255) NOT NULL COMMENT '加密后的密钥',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    rate_limit INT DEFAULT 1000 COMMENT '每小时调用限制',
    daily_limit BIGINT DEFAULT 10000 COMMENT '每日调用限制',
    total_calls BIGINT DEFAULT 0 COMMENT '总调用次数',
    last_used_at TIMESTAMP NULL COMMENT '最后使用时间',
    expires_at TIMESTAMP NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_api_key (api_key),
    INDEX idx_created_at (created_at)
);

-- API调用日志表
CREATE TABLE api_call_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    api_key_id BIGINT NOT NULL COMMENT 'API密钥ID',
    endpoint VARCHAR(255) NOT NULL COMMENT '接口端点',
    method VARCHAR(10) NOT NULL COMMENT '请求方法',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    request_data JSON COMMENT '请求数据',
    response_code INT COMMENT '响应码',
    response_time INT COMMENT '响应时间(毫秒)',
    credits_used INT DEFAULT 0 COMMENT '消耗积分',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id),
    INDEX idx_user_id (user_id),
    INDEX idx_api_key_id (api_key_id),
    INDEX idx_created_at (created_at),
    INDEX idx_endpoint (endpoint)
);

-- 服务器监控表
CREATE TABLE monitored_servers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    name VARCHAR(100) NOT NULL COMMENT '服务器名称',
    host VARCHAR(255) NOT NULL COMMENT '主机地址',
    port INT DEFAULT 22 COMMENT '端口',
    monitor_type ENUM('ssh', 'ping', 'http', 'tcp') DEFAULT 'ping' COMMENT '监控类型',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    alert_enabled TINYINT DEFAULT 1 COMMENT '是否开启告警',
    last_check_at TIMESTAMP NULL COMMENT '最后检查时间',
    last_status TINYINT DEFAULT 0 COMMENT '最后状态: 0-离线, 1-在线',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_host_port (host, port),
    INDEX idx_created_at (created_at)
);

-- 域名监控表
CREATE TABLE monitored_domains (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    domain VARCHAR(255) NOT NULL COMMENT '域名',
    monitor_type ENUM('dns', 'ssl', 'http', 'https') DEFAULT 'http' COMMENT '监控类型',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    alert_enabled TINYINT DEFAULT 1 COMMENT '是否开启告警',
    ssl_expiry_threshold INT DEFAULT 7 COMMENT 'SSL证书过期提醒天数',
    last_check_at TIMESTAMP NULL COMMENT '最后检查时间',
    last_status TINYINT DEFAULT 0 COMMENT '最后状态: 0-异常, 1-正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_domain (domain),
    INDEX idx_created_at (created_at)
);

-- U盘绑定表
CREATE TABLE usb_devices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    device_serial VARCHAR(255) NOT NULL COMMENT '设备序列号',
    device_name VARCHAR(255) COMMENT '设备名称',
    device_vendor VARCHAR(255) COMMENT '设备厂商',
    fingerprint VARCHAR(255) COMMENT '设备指纹',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-解绑, 1-绑定',
    bind_ip VARCHAR(45) COMMENT '绑定IP',
    bind_mac VARCHAR(17) COMMENT '绑定MAC地址',
    bind_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '绑定时间',
    unbind_at TIMESTAMP NULL COMMENT '解绑时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_device_serial (device_serial),
    INDEX idx_fingerprint (fingerprint)
);

-- 验证码表
CREATE TABLE verification_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    target VARCHAR(100) NOT NULL COMMENT '目标(手机号或邮箱)',
    code VARCHAR(10) NOT NULL COMMENT '验证码',
    type ENUM('register', 'login', 'reset_password', 'bind_phone', 'unbind_phone') NOT NULL COMMENT '验证码类型',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-未使用, 1-已使用, 2-已过期',
    used_at TIMESTAMP NULL COMMENT '使用时间',
    expires_at TIMESTAMP NOT NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_target (target),
    INDEX idx_code (code),
    INDEX idx_created_at (created_at)
);

-- 操作审计表
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NULL COMMENT '用户ID(可为空表示系统操作)',
    action VARCHAR(100) NOT NULL COMMENT '操作行为',
    resource_type VARCHAR(50) NOT NULL COMMENT '资源类型',
    resource_id BIGINT COMMENT '资源ID',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    request_data JSON COMMENT '请求数据',
    response_data JSON COMMENT '响应数据',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-失败, 1-成功',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource_type (resource_type),
    INDEX idx_created_at (created_at)
);