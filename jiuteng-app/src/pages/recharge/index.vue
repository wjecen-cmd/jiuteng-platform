<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <text class="title">套餐选择</text>
      <text class="subtitle">升级您的服务体验</text>
    </view>

    <!-- 套餐列表 -->
    <view class="packages-container">
      <view 
        v-for="(pkg, index) in packages" 
        :key="index"
        class="package-item"
        :class="{ 'selected': selectedPackageIndex === index }"
        @click="selectPackage(index)"
      >
        <view class="package-content">
          <view class="package-header">
            <text class="package-title">{{ pkg.title }}</text>
            <text class="package-price">¥{{ pkg.price }}</text>
          </view>
          <view class="package-description">
            <text class="description-text">{{ pkg.description }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 购买按钮 -->
    <view class="button-container">
      <button 
        class="purchase-button"
        :class="{ 'disabled': selectedPackageIndex === -1 }"
        @click="handlePurchase"
        :disabled="selectedPackageIndex === -1"
      >
        立即购买
      </button>
    </view>

    <!-- SVG 图标示例 -->
    <view class="svg-icon">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path 
          fill="#007AFF" 
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 套餐数据类型定义
interface Package {
  title: string;
  price: number;
  description: string;
}

// 定义 props
interface Props {
  // 可以根据需要添加 props
}

const props = withDefaults(defineProps<Props>(), {})

// 定义 emits
const emit = defineEmits<{
  loadPackages: [];
  onCreateOrder: [packageInfo: Package];
  onPay: [orderId: string];
}>()

// 响应式数据
const selectedPackageIndex = ref<number>(-1)
const packages = reactive<Package[]>([
  { title: '基础版', price: 9.9, description: '适合个人用户的基础功能' },
  { title: '标准版', price: 29.9, description: '满足日常使用需求' },
  { title: '专业版', price: 99, description: '高级功能，适合专业人士' },
  { title: '企业版', price: 299, description: '全面功能，支持团队协作' }
])

// 方法定义
const selectPackage = (index: number) => {
  selectedPackageIndex.value = index
}

const handlePurchase = async () => {
  if (selectedPackageIndex.value === -1) return
  
  const selectedPackage = packages[selectedPackageIndex.value]
  
  // 触发创建订单事件
  emit('onCreateOrder', selectedPackage)
  
  // 模拟创建订单后触发支付
  setTimeout(() => {
    emit('onPay', `order_${Date.now()}`)
  }, 1000)
}

// 组件挂载时加载套餐数据
const init = () => {
  emit('loadPackages')
}

// 初始化
init()
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #F5F5F7;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #007AFF;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #666;
}

.packages-container {
  margin-bottom: 40rpx;
}

.package-item {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid #e0e0e0;
  transition: all 0.3s ease;
}

.package-item.selected {
  border-color: #007AFF;
  box-shadow: 0 4rpx 20rpx rgba(0, 122, 255, 0.1);
}

.package-content {
  display: flex;
  flex-direction: column;
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.package-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.package-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #007AFF;
}

.package-description {
  color: #666;
  font-size: 28rpx;
}

.button-container {
  padding: 0 20rpx;
}

.purchase-button {
  width: 100%;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 30rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.purchase-button.disabled {
  background-color: #ccc;
}

.svg-icon {
  margin-top: 20rpx;
  text-align: center;
}
</style>