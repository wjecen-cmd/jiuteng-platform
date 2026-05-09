<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <text class="title">商城</text>
    </view>

    <!-- 分类标签 -->
    <scroll-view class="categories" scroll-x>
      <view 
        class="category-item" 
        :class="{ active: currentCategory === 'all' }"
        @click="currentCategory = 'all'"
      >
        <text class="category-text">全部</text>
      </view>
      <view 
        class="category-item" 
        :class="{ active: currentCategory === 'server' }"
        @click="currentCategory = 'server'"
      >
        <text class="category-text">云服务器</text>
      </view>
      <view 
        class="category-item" 
        :class="{ active: currentCategory === 'ip' }"
        @click="currentCategory = 'ip'"
      >
        <text class="category-text">纯净IP</text>
      </view>
      <view 
        class="category-item" 
        :class="{ active: currentCategory === 'api' }"
        @click="currentCategory = 'api'"
      >
        <text class="category-text">API服务</text>
      </view>
      <view 
        class="category-item" 
        :class="{ active: currentCategory === 'usb' }"
        @click="currentCategory = 'usb'"
      >
        <text class="category-text">龙虾U盘</text>
      </view>
      <view 
        class="category-item" 
        :class="{ active: currentCategory === 'skill' }"
        @click="currentCategory = 'skill'"
      >
        <text class="category-text">Skill商店</text>
      </view>
    </scroll-view>

    <!-- 商品列表 -->
    <scroll-view class="product-list" scroll-y>
      <view class="product-section" v-if="filteredProducts.length > 0">
        <view 
          class="product-card" 
          v-for="item in filteredProducts" 
          :key="item.id"
          @click="viewProduct(item)"
        >
          <view class="product-left">
            <view class="product-icon">{{ item.icon }}</view>
            <view class="product-info">
              <text class="product-name">{{ item.name }}</text>
              <text class="product-desc">{{ item.desc }}</text>
              <view class="product-tags">
                <text class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</text>
              </view>
            </view>
          </view>
          <view class="product-right">
            <text class="product-price">¥{{ item.price }}</text>
            <text class="product-unit">{{ item.unit }}</text>
            <view class="product-action">
              <text class="buy-btn" @click.stop="buyProduct(item)">购买</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty" v-else>
        <text class="empty-text">暂无商品</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentCategory = ref('all')

// 商品数据
const products = ref([
  // 云服务器
  { 
    id: 1, 
    category: 'server', 
    icon: '🖥️', 
    name: '阿里云ECS-入门版', 
    desc: '2核4G / 1M带宽 / 40G云盘',
    tags: ['阿里云', 'ecs'],
    price: 99, 
    unit: '/月',
    rebate: '10%' 
  },
  { 
    id: 2, 
    category: 'server', 
    icon: '🖥️', 
    name: '阿里云ECS-标准版', 
    desc: '4核8G / 3M带宽 / 80G云盘',
    tags: ['阿里云', 'ecs'],
    price: 299, 
    unit: '/月',
    rebate: '12%' 
  },
  { 
    id: 3, 
    category: 'server', 
    icon: '☁️', 
    name: '腾讯云CVM-入门版', 
    desc: '2核4G / 1M带宽 / 50G云盘',
    tags: ['腾讯云', 'cvm'],
    price: 89, 
    unit: '/月',
    rebate: '15%' 
  },
  { 
    id: 4, 
    category: 'server', 
    icon: '☁️', 
    name: '腾讯云CVM-标准版', 
    desc: '4核8G / 3M带宽 / 100G云盘',
    tags: ['腾讯云', 'cvm'],
    price: 269, 
    unit: '/月',
    rebate: '15%' 
  },
  
  // 纯净IP
  { 
    id: 5, 
    category: 'ip', 
    icon: '🌐', 
    name: '纯净IP-月度版', 
    desc: '独享IP / 不限流量 / 国内节点',
    tags: ['独享', '不限流量'],
    price: 49, 
    unit: '/月',
    rebate: '0%' 
  },
  { 
    id: 6, 
    category: 'ip', 
    icon: '🌐', 
    name: '纯净IP-季度版', 
    desc: '独享IP / 不限流量 / 国内节点',
    tags: ['独享', '不限流量', '优惠'],
    price: 129, 
    unit: '/季度',
    rebate: '10%' 
  },
  { 
    id: 7, 
    category: 'ip', 
    icon: '🌐', 
    name: '纯净IP-年度版', 
    desc: '独享IP / 不限流量 / 多节点可选',
    tags: ['独享', '不限流量', '超值'],
    price: 399, 
    unit: '/年',
    rebate: '20%' 
  },
  
  // API服务
  { 
    id: 8, 
    category: 'api', 
    icon: '🔑', 
    name: 'API调用-体验版', 
    desc: '1000次调用 / 有效期30天',
    tags: ['新手', '体验'],
    price: 9.9, 
    unit: '',
    rebate: '0%' 
  },
  { 
    id: 9, 
    category: 'api', 
    icon: '📊', 
    name: 'API调用-基础版', 
    desc: '10000次调用 / 有效期90天',
    tags: ['基础', '常用'],
    price: 29.9, 
    unit: '',
    rebate: '5%' 
  },
  { 
    id: 10, 
    category: 'api', 
    icon: '📊', 
    name: 'API调用-专业版', 
    desc: '50000次调用 / 有效期180天',
    tags: ['专业', '推荐'],
    price: 99, 
    unit: '',
    rebate: '10%' 
  },
  { 
    id: 11, 
    category: 'api', 
    icon: '📊', 
    name: 'API调用-企业版', 
    desc: '200000次调用 / 有效期365天',
    tags: ['企业', '超值'],
    price: 299, 
    unit: '',
    rebate: '15%' 
  },
  
  // 龙虾U盘
  { 
    id: 12, 
    category: 'usb', 
    icon: '💾', 
    name: '龙虾U盘-基础版', 
    desc: '16GB / 内置AI助手 / 即插即用',
    tags: ['入门', '便携'],
    price: 68, 
    unit: '',
    rebate: '0%' 
  },
  { 
    id: 13, 
    category: 'usb', 
    icon: '💾', 
    name: '龙虾U盘-专业版', 
    desc: '32GB / 内置AI助手 / 离线可用',
    tags: ['专业', '离线'],
    price: 99, 
    unit: '',
    rebate: '0%' 
  },
  { 
    id: 14, 
    category: 'usb', 
    icon: '💾', 
    name: '龙虾U盘-旗舰版', 
    desc: '64GB / 内置AI助手 / 高速传输',
    tags: ['旗舰', '高速'],
    price: 168, 
    unit: '',
    rebate: '0%' 
  },
  
  // Skill商店
  { 
    id: 15, 
    category: 'skill', 
    icon: '🔮', 
    name: 'API监测Skill', 
    desc: '实时监控API状态 / 自动告警',
    tags: ['免费', '监控'],
    price: 0, 
    unit: '',
    rebate: '0%' 
  },
  { 
    id: 16, 
    category: 'skill', 
    icon: '🔧', 
    name: '数据清洗Skill', 
    desc: '自动化数据清洗 / 多格式支持',
    tags: ['数据处理'],
    price: 19.9, 
    unit: '',
    rebate: '0%' 
  },
  { 
    id: 17, 
    category: 'skill', 
    icon: '📝', 
    name: '自动化报告Skill', 
    desc: '生成周报/月报 / 定时发送',
    tags: ['办公', '自动化'],
    price: 29.9, 
    unit: '',
    rebate: '0%' 
  },
])

const filteredProducts = computed(() => {
  if (currentCategory.value === 'all') {
    return products.value
  }
  return products.value.filter(p => p.category === currentCategory.value)
})

const viewProduct = (item: any) => {
  uni.showToast({ title: item.name, icon: 'none' })
}

const buyProduct = (item: any) => {
  uni.showToast({ title: `购买: ${item.name}`, icon: 'none' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0A0A0A;
  padding-bottom: 140rpx;
}

.header {
  padding: 24rpx 32rpx;
  background: #111;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFF;
}

.categories {
  display: flex;
  padding: 16rpx 24rpx;
  white-space: nowrap;
  background: #111;
  border-bottom: 1rpx solid #1A1A1A;
}

.category-item {
  display: inline-block;
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  border-radius: 8rpx;
  background: #1A1A1A;
}

.category-item.active {
  background: #22C55E;
}

.category-text {
  font-size: 26rpx;
  color: #666;
}

.category-item.active .category-text {
  color: #FFF;
}

.product-list {
  height: calc(100vh - 200rpx);
  padding: 16rpx 24rpx;
}

.product-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.product-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #111;
  border-radius: 12rpx;
}

.product-left {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  flex: 1;
}

.product-icon {
  width: 80rpx;
  height: 80rpx;
  background: #1A1A1A;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.product-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #FFF;
}

.product-desc {
  font-size: 24rpx;
  color: #666;
}

.product-tags {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}

.tag {
  font-size: 20rpx;
  color: #22C55E;
  background: rgba(34, 197, 94, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.product-right {
  text-align: right;
  margin-left: 16rpx;
}

.product-price {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #22C55E;
}

.product-unit {
  display: block;
  font-size: 22rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.buy-btn {
  display: inline-block;
  background: #22C55E;
  color: #FFF;
  font-size: 24rpx;
  padding: 12rpx 32rpx;
  border-radius: 8rpx;
}

.empty {
  padding: 100rpx;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
}
</style>