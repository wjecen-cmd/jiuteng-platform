<template>
  <view class="page">
    <!-- 顶部状态栏 -->
    <view class="header">
      <view class="header-left">
        <text class="title">九藤监控</text>
        <text class="time">{{ currentTime }}</text>
      </view>
      <view class="header-right">
        <view class="status-badge online">
          <view class="status-dot"></view>
          <text class="status-text">系统正常</text>
        </view>
      </view>
    </view>

    <!-- 核心指标卡片 -->
    <view class="stats-row">
      <view class="stat-card" v-for="(item, index) in stats" :key="index">
        <text class="stat-name">{{ item.name }}</text>
        <text class="stat-value" :class="item.change >= 0 ? 'up' : 'down'">{{ item.value }}</text>
        <view class="stat-footer">
          <text class="stat-change" :class="item.change >= 0 ? 'up' : 'down'">
            {{ item.change >= 0 ? '+' : '' }}{{ item.change }}%
          </text>
        </view>
      </view>
    </view>

    <!-- 趋势图区域（大） -->
    <view class="chart-section">
      <view class="chart-header">
        <text class="chart-title">API 调用量</text>
        <view class="chart-tabs">
          <text class="tab" :class="{ active: period === '1h' }" @click="period = '1h'">1小时</text>
          <text class="tab" :class="{ active: period === '6h' }" @click="period = '6h'">6小时</text>
          <text class="tab" :class="{ active: period === '24h' }" @click="period = '24h'">24小时</text>
          <text class="tab" :class="{ active: period === '7d' }" @click="period = '7d'">7天</text>
        </view>
      </view>
      
      <view class="chart-container">
        <svg class="chart" viewBox="0 0 700 280">
          <!-- 网格 -->
          <line x1="50" y1="20" x2="680" y2="20" stroke="#1E1E1E" stroke-width="1"/>
          <line x1="50" y1="80" x2="680" y2="80" stroke="#1E1E1E" stroke-width="1"/>
          <line x1="50" y1="140" x2="680" y2="140" stroke="#1E1E1E" stroke-width="1"/>
          <line x1="50" y1="200" x2="680" y2="200" stroke="#1E1E1E" stroke-width="1"/>
          <line x1="50" y1="260" x2="680" y2="260" stroke="#1E1E1E" stroke-width="1"/>
          
          <!-- Y轴标签 -->
          <text x="40" y="25" fill="#666" font-size="10" text-anchor="end">10K</text>
          <text x="40" y="85" fill="#666" font-size="10" text-anchor="end">8K</text>
          <text x="40" y="145" fill="#666" font-size="10" text-anchor="end">6K</text>
          <text x="40" y="205" fill="#666" font-size="10" text-anchor="end">4K</text>
          <text x="40" y="265" fill="#666" font-size="10" text-anchor="end">2K</text>
          
          <!-- 趋势线 -->
          <polyline
            :points="chartLine"
            fill="none"
            stroke="#22C55E"
            stroke-width="2"
          />
          
          <!-- 填充区域 -->
          <polygon
            :points="chartArea"
            fill="url(#greenGradient)"
          />
          
          <!-- 渐变定义 -->
          <defs>
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#22C55E;stop-opacity:0.3"/>
              <stop offset="100%" style="stop-color:#22C55E;stop-opacity:0"/>
            </linearGradient>
          </defs>
          
          <!-- 数据点 -->
          <circle v-for="(p, i) in chartData" :key="i"
            :cx="60 + i * 50"
            :cy="260 - p * 0.024"
            r="3"
            fill="#22C55E"
          />
        </svg>
        
        <!-- X轴标签 -->
        <view class="x-axis">
          <text class="x-label" v-for="(t, i) in timeLabels" :key="i">{{ t }}</text>
        </view>
      </view>
      
      <!-- 成交量柱状图 -->
      <view class="volume-section">
        <text class="volume-label">成交量</text>
        <view class="volume-bars">
          <view 
            v-for="(v, i) in volumes" 
            :key="i"
            class="volume-bar"
            :style="{ height: v + 'px', background: v > 50 ? '#22C55E' : '#333' }"
          ></view>
        </view>
      </view>
    </view>

    <!-- 服务器列表 -->
    <view class="list-section">
      <view class="section-header">
        <text class="section-title">服务器状态</text>
        <text class="section-more">查看全部 ›</text>
      </view>
      <view class="server-list">
        <view class="server-item" v-for="s in servers" :key="s.id">
          <view class="server-left">
            <view class="status-indicator" :class="s.status"></view>
            <view class="server-info">
              <text class="server-name">{{ s.name }}</text>
              <text class="server-ip">{{ s.ip }}</text>
            </view>
          </view>
          <view class="server-right">
            <text class="server-days" :class="{ warning: s.daysLeft <= 7 }">{{ s.daysLeft }}天</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 域名列表 -->
    <view class="list-section">
      <view class="section-header">
        <text class="section-title">域名状态</text>
        <text class="section-more">查看全部 ›</text>
      </view>
      <view class="domain-list">
        <view class="domain-item" v-for="d in domains" :key="d.id">
          <view class="domain-left">
            <view class="status-indicator online"></view>
            <view class="domain-info">
              <text class="domain-name">{{ d.domain }}</text>
              <text class="domain-ssl">SSL: {{ d.ssl }}</text>
            </view>
          </view>
          <view class="domain-right">
            <text class="domain-days">{{ d.daysLeft }}天</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('20:04:00')
const period = ref('1h')

// 核心指标
const stats = ref([
  { name: 'API调用', value: '12,345', change: 12.5 },
  { name: '余额', value: '¥99.00', change: -2.3 },
  { name: '服务器', value: '2', change: 0 },
  { name: '域名', value: '3', change: 0 }
])

// 图表数据
const chartData = ref([120, 180, 150, 220, 280, 240, 320, 280, 350, 400, 380, 450, 420])
const volumes = ref([30, 45, 35, 60, 80, 55, 90, 70, 100, 85, 95, 110, 75])
const timeLabels = ref(['19:00', '19:10', '19:20', '19:30', '19:40', '19:50', '20:00'])

const chartLine = ref('')
const chartArea = ref('')

// 服务器
const servers = ref([
  { id: 1, name: '阿里云-生产服', ip: '47.101.142.65', status: 'online', daysLeft: 30 },
  { id: 2, name: '腾讯云-测试服', ip: '192.168.1.100', status: 'offline', daysLeft: 5 }
])

// 域名
const domains = ref([
  { id: 1, domain: 'wjecen.vip', ssl: '有效', daysLeft: 180 },
  { id: 2, domain: 'api.wjecen.vip', ssl: '有效', daysLeft: 180 },
  { id: 3, domain: 'admin.wjecen.vip', ssl: '有效', daysLeft: 180 }
])

// 更新图表路径
const updateChart = () => {
  const pts = chartData.value.map((p, i) => `${60 + i * 50},${260 - p * 0.024}`)
  chartLine.value = pts.join(' ')
  chartArea.value = pts.join(' ') + ',680,260 60,260'
}

let timer: any = null

onMounted(() => {
  updateChart()
  
  // 更新时间
  timer = setInterval(() => {
    const now = new Date()
    currentTime.value = now.toTimeString().slice(0, 8)
    
    // 模拟数据更新
    if (Math.random() > 0.5) {
      chartData.value.shift()
      chartData.value.push(100 + Math.floor(Math.random() * 400))
      updateChart()
      
      // 更新API调用数
      const num = parseInt(stats.value[0].value.replace(/,/g, '')) + Math.floor(Math.random() * 50)
      stats.value[0].value = num.toLocaleString()
    }
  }, 2000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0A0A0A;
  padding-bottom: 140rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #111;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFF;
}

.time {
  font-size: 24rpx;
  color: #666;
  font-family: monospace;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 20rpx;
}

.status-badge.online {
  border: 1rpx solid rgba(34, 197, 94, 0.3);
}

.status-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #22C55E;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.status-text {
  font-size: 22rpx;
  color: #22C55E;
}

.stats-row {
  display: flex;
  padding: 16rpx 24rpx;
  gap: 16rpx;
}

.stat-card {
  flex: 1;
  background: #111;
  border-radius: 12rpx;
  padding: 20rpx 16rpx;
}

.stat-name {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFF;
  font-family: monospace;
  display: block;
}

.stat-value.up {
  color: #22C55E;
}

.stat-value.down {
  color: #EF4444;
}

.stat-footer {
  margin-top: 8rpx;
}

.stat-change {
  font-size: 22rpx;
  font-family: monospace;
}

.stat-change.up {
  color: #22C55E;
}

.stat-change.down {
  color: #EF4444;
}

.chart-section {
  margin: 16rpx 24rpx;
  background: #111;
  border-radius: 12rpx;
  padding: 20rpx;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.chart-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #FFF;
}

.chart-tabs {
  display: flex;
  gap: 16rpx;
}

.tab {
  font-size: 22rpx;
  color: #666;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
}

.tab.active {
  color: #22C55E;
  background: rgba(34, 197, 94, 0.1);
}

.chart-container {
  width: 100%;
}

.chart {
  width: 100%;
  height: 280rpx;
}

.x-axis {
  display: flex;
  justify-content: space-between;
  padding-left: 60rpx;
  padding-right: 20rpx;
  margin-top: 12rpx;
}

.x-label {
  font-size: 18rpx;
  color: #666;
}

.volume-section {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #222;
}

.volume-label {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.volume-bars {
  display: flex;
  align-items: flex-end;
  gap: 8rpx;
  height: 60rpx;
}

.volume-bar {
  flex: 1;
  border-radius: 2rpx;
}

.list-section {
  margin: 16rpx 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #FFF;
}

.section-more {
  font-size: 24rpx;
  color: #666;
}

.server-list, .domain-list {
  background: #111;
  border-radius: 12rpx;
  overflow: hidden;
}

.server-item, .domain-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #1A1A1A;
}

.server-item:last-child, .domain-item:last-child {
  border-bottom: none;
}

.server-left, .domain-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.status-indicator {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
}

.status-indicator.online {
  background: #22C55E;
  box-shadow: 0 0 8rpx rgba(34, 197, 94, 0.5);
}

.status-indicator.offline {
  background: #EF4444;
}

.server-info, .domain-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.server-name, .domain-name {
  font-size: 28rpx;
  color: #FFF;
}

.server-ip, .domain-ssl {
  font-size: 22rpx;
  color: #666;
  font-family: monospace;
}

.server-days, .domain-days {
  font-size: 24rpx;
  color: #666;
  font-family: monospace;
}

.server-days.warning {
  color: #EF4444;
}
</style>