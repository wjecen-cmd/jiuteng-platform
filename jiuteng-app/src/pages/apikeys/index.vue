<template>
  <view class="api-key-manager">
    <!-- Header -->
    <view class="header">
      <text class="title">API密钥管理</text>
      <button class="add-btn" @click="showAddModal = true">
        <text class="add-text">+</text>
      </button>
    </view>

    <!-- API Key List -->
    <view class="key-list">
      <view 
        v-for="key in apiKeyList" 
        :key="key.id" 
        class="key-item"
      >
        <view class="key-info">
          <text class="key-name">{{ key.name }}</text>
          <text class="key-value">{{ formatKey(key.value) }}</text>
          <text class="key-created">创建时间: {{ formatDate(key.createdTime) }}</text>
        </view>
        
        <view class="key-actions">
          <button class="action-btn copy-btn" @click="onCopyKey(key)">
            <svg class="icon" viewBox="0 0 24 24">
              <path fill="#007AFF" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
            </svg>
          </button>
          
          <button class="action-btn delete-btn" @click="onDeleteKey(key)">
            <svg class="icon" viewBox="0 0 24 24">
              <path fill="#FF4757" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
            </svg>
          </button>
        </view>
      </view>
      
      <view v-if="apiKeyList.length === 0" class="empty-state">
        <text class="empty-text">暂无API密钥</text>
      </view>
    </view>

    <!-- Add Modal -->
    <view v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加API密钥</text>
          <button class="close-btn" @click="closeModal">
            <text class="close-text">×</text>
          </button>
        </view>
        
        <view class="modal-body">
          <input
            v-model="newKeyName"
            class="input-field"
            placeholder="输入密钥名称 (以jt_开头)"
            maxlength="50"
          />
        </view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeModal">
            <text class="btn-text">取消</text>
          </button>
          <button class="confirm-btn" @click="createNewKey" :disabled="!isValidName">
            <text class="btn-text">确定</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ApiKey {
  id: string
  name: string
  value: string
  createdTime: number
}

const apiKeyList = ref<ApiKey[]>([])
const showAddModal = ref(false)
const newKeyName = ref('')

const isValidName = computed(() => {
  return newKeyName.value.trim().length > 0 && newKeyName.value.startsWith('jt_')
})

const formatKey = (key: string): string => {
  if (key.length <= 8) return key
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const closeModal = () => {
  showAddModal.value = false
  newKeyName.value = ''
}

const createNewKey = () => {
  if (!isValidName.value) return
  
  const newKey: ApiKey = {
    id: `key_${Date.now()}`,
    name: newKeyName.value.trim(),
    value: generateApiKey(),
    createdTime: Date.now()
  }
  
  apiKeyList.value.push(newKey)
  onCreateKey(newKey)
  closeModal()
}

const generateApiKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'jt_'
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const onCopyKey = (key: ApiKey) => {
  // 模拟复制到剪贴板
  uni.setClipboardData({
    data: key.value,
    success: () => {
      uni.showToast({
        title: '已复制到剪贴板',
        icon: 'success'
      })
    }
  })
}

const onDeleteKey = (key: ApiKey) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除密钥 "${key.name}" 吗？`,
    success: (res) => {
      if (res.confirm) {
        const index = apiKeyList.value.findIndex(k => k.id === key.id)
        if (index !== -1) {
          apiKeyList.value.splice(index, 1)
        }
        onDeleteKey(key)
      }
    }
  })
}

const onCreateKey = (key: ApiKey) => {
  console.log('Created key:', key)
  uni.showToast({
    title: '密钥已创建',
    icon: 'success'
  })
}

// 暴露事件方法
defineExpose({
  onCreateKey,
  onDeleteKey,
  onCopyKey
})
</script>

<style scoped>
.api-key-manager {
  padding: 20rpx;
  background-color: #f5f5f7;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.add-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #007aff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-text {
  color: white;
  font-size: 40rpx;
  line-height: 1;
}

.key-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.key-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 24rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.key-info {
  flex: 1;
}

.key-name {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 12rpx;
}

.key-value {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  word-break: break-all;
}

.key-created {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.key-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.copy-btn {
  color: #007aff;
}

.delete-btn {
  color: #ff4757;
}

.icon {
  width: 32rpx;
  height: 32rpx;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 16rpx;
  width: 80%;
  max-width: 600rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  width: 50rpx;
  height: 50rpx;
  border: none;
  background: transparent;
  font-size: 40rpx;
  color: #999;
  padding: 0;
}

.modal-body {
  padding: 30rpx;
}

.input-field {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #eee;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 24rpx;
  border: none;
  font-size: 28rpx;
}

.cancel-btn {
  color: #666;
  background-color: #f5f5f7;
}

.confirm-btn {
  color: white;
  background-color: #007aff;
}

.btn-text {
  font-size: 28rpx;
}
</style>