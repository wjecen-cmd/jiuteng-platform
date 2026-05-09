<template>
  <view class="container">
    <!-- Header -->
    <view class="header">
      <text class="header-title">订单管理</text>
      <view class="header-right">
        <text class="search-icon">🔍</text>
      </view>
    </view>

    <!-- Tab Bar -->
    <view class="tab-container">
      <scroll-view scroll-x class="tab-scroll" show-scrollbar={false}>
        <view class="tab-list">
          <view 
            v-for="(tab, index) in tabs" 
            :key="index"
            class="tab-item"
            :class="{ 'tab-active': activeTab === index }"
            @click="switchTab(index)"
          >
            <text class="tab-text">{{ tab.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Order List -->
    <scroll-view 
      class="order-list-container"
      scroll-y
      @scrolltolower="onLoadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-for="(order, index) in orders" :key="order.id" class="order-card">
        <view class="order-header">
          <text class="order-id">订单号: {{ order.orderId }}</text>
          <text class="order-status" :style="{ color: getStatusColor(order.status) }">
            {{ order.statusText }}
          </text>
        </view>
        
        <view class="order-content">
          <view class="order-info">
            <text class="order-date">{{ order.date }}</text>
            <text class="order-amount">¥{{ order.amount }}</text>
          </view>
          
          <view class="order-actions">
            <button class="action-btn primary" @click="handleAction('pay', order)">
              {{ order.status === '待付款' ? '去支付' : '查看详情' }}
            </button>
            <button class="action-btn secondary" @click="handleAction('cancel', order)" v-if="order.status === '待付款'">
              取消订单
            </button>
          </view>
        </view>
      </view>

      <!-- Loading Indicator -->
      <view v-if="loading && !refreshing" class="loading-more">
        <text>加载中...</text>
      </view>

      <!-- Empty State -->
      <view v-if="orders.length === 0 && !loading" class="empty-state">
        <svg-icon name="empty-box" size="80" color="#ccc" />
        <text class="empty-text">暂无订单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// Define types
interface Order {
  id: string
  orderId: string
  status: string
  statusText: string
  date: string
  amount: number
}

interface Tab {
  id: string
  name: string
}

// Reactive data
const activeTab = ref(0)
const refreshing = ref(false)
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)

const tabs: Tab[] = [
  { id: 'all', name: '全部' },
  { id: 'pending', name: '待付款' },
  { id: 'paid', name: '已付款' },
  { id: 'shipped', name: '已发货' },
  { id: 'completed', name: '已完成' }
]

const orders = ref<Order[]>([])

// Methods
const loadOrders = async (reset: boolean = false) => {
  if (reset) {
    page.value = 1
    orders.value = []
  } else {
    loading.value = true
  }

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newOrders: Order[] = Array.from({ length: pageSize.value }, (_, i) => ({
      id: `order_${page.value}_${i + 1}`,
      orderId: `ORD${Date.now() + i}`,
      status: ['待付款', '已付款', '已发货', '已完成'][Math.floor(Math.random() * 4)],
      statusText: ['待付款', '已付款', '已发货', '已完成'][Math.floor(Math.random() * 4)],
      date: new Date().toLocaleDateString(),
      amount: Math.floor(Math.random() * 1000) + 100
    }))

    if (reset) {
      orders.value = newOrders
    } else {
      orders.value.push(...newOrders)
    }
    
    page.value++
  } catch (error) {
    console.error('Failed to load orders:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => {
  refreshing.value = true
  loadOrders(true)
}

const onLoadMore = () => {
  if (!loading.value) {
    loadOrders()
  }
}

const switchTab = (index: number) => {
  activeTab.value = index
  loadOrders(true)
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    '待付款': '#FF9500',
    '已付款': '#34C759',
    '已发货': '#007AFF',
    '已完成': '#8E8E93'
  }
  return colors[status] || '#8E8E93'
}

const handleAction = (action: string, order: Order) => {
  console.log(`${action} action for order:`, order)
  // Handle action logic here
}

// Lifecycle
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.container {
  flex: 1;
  background-color: #f5f5f7;
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #000;
}

.header-right {
  display: flex;
  align-items: center;
}

.search-icon {
  font-size: 36rpx;
}

.tab-container {
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.tab-scroll {
  white-space: nowrap;
  padding: 20rpx 0;
}

.tab-list {
  display: inline-flex;
}

.tab-item {
  padding: 10rpx 30rpx;
  margin: 0 10rpx;
  border-radius: 20rpx;
  transition: all 0.3s ease;
}

.tab-active {
  background-color: #007aff;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
}

.tab-active .tab-text {
  color: #fff;
}

.order-list-container {
  flex: 1;
  padding: 20rpx;
}

.order-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.order-id {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.order-status {
  font-size: 24rpx;
  font-weight: 500;
}

.order-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  flex: 1;
}

.order-date {
  font-size: 24rpx;
  color: #888;
  margin-right: 20rpx;
}

.order-amount {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff3b30;
}

.order-actions {
  display: flex;
  gap: 10rpx;
}

.action-btn {
  padding: 10rpx 20rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
  line-height: 1;
}

.action-btn.primary {
  background-color: #007aff;
  color: #fff;
  border: none;
}

.action-btn.secondary {
  background-color: #f5f5f7;
  color: #666;
  border: 1rpx solid #ddd;
}

.loading-more {
  text-align: center;
  padding: 30rpx;
  color: #888;
  font-size: 28rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  margin-top: 20rpx;
  color: #888;
  font-size: 28rpx;
}
</style>