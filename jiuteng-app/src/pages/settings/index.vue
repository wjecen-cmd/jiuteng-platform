<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <image src="/static/avatar.png" class="avatar" />
      <text class="nickname">用户名</text>
    </view>

    <!-- 设置列表 -->
    <view class="settings-list">
      <!-- 修改昵称 -->
      <view class="setting-item" @click="handleUpdateNickname">
        <text class="label">修改昵称</text>
        <view class="arrow-container">
          <text class="value">{{ nickname || '未设置' }}</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" width="16" height="16">
            <path :d="arrowPath" fill="#ccc"/>
          </svg>
        </view>
      </view>

      <!-- 修改密码 -->
      <view class="setting-item" @click="handleUpdatePassword">
        <text class="label">修改密码</text>
        <view class="arrow-container">
          <text class="value">••••••••</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" width="16" height="16">
            <path :d="arrowPath" fill="#ccc"/>
          </svg>
        </view>
      </view>

      <!-- 绑定手机 -->
      <view class="setting-item" @click="handleBindPhone">
        <text class="label">绑定手机</text>
        <view class="arrow-container">
          <text class="value">{{ phone || '未绑定' }}</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" width="16" height="16">
            <path :d="arrowPath" fill="#ccc"/>
          </svg>
        </view>
      </view>

      <!-- 清除缓存 -->
      <view class="setting-item" @click="handleClearCache">
        <text class="label">清除缓存</text>
        <view class="arrow-container">
          <text class="value">{{ cacheSize }}</text>
          <svg class="arrow-icon" viewBox="0 0 24 24" width="16" height="16">
            <path :d="arrowPath" fill="#ccc"/>
          </svg>
        </view>
      </view>

      <!-- 开关选项 -->
      <view class="setting-item switch-item">
        <text class="label">消息推送</text>
        <switch 
          :checked="isPushEnabled" 
          @change="handlePushChange"
          color="#007AFF"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 响应式数据
const nickname = ref<string>('用户名')
const phone = ref<string>('')
const isPushEnabled = ref<boolean>(true)
const cacheSize = ref<string>('15.2MB')

// 箭头图标路径
const arrowPath = computed(() => {
  return 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z'
})

// 事件处理函数
const handleUpdateNickname = () => {
  uni.$emit('onUpdateNickname', { currentNickname: nickname.value })
}

const handleUpdatePassword = () => {
  uni.$emit('onUpdatePassword')
}

const handleBindPhone = () => {
  uni.$emit('onBindPhone', { currentPhone: phone.value })
}

const handleClearCache = () => {
  uni.$emit('onClearCache')
}

const handlePushChange = (e: any) => {
  isPushEnabled.value = e.detail.value
}
</script>

<style scoped>
.container {
  background-color: #F5F5F7;
  min-height: 100vh;
  padding: 20rpx;
}

.header {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background-color: #FFFFFF;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.nickname {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
}

.settings-list {
  background-color: #FFFFFF;
  border-radius: 12rpx;
  overflow: hidden;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #F5F5F7;
}

.setting-item:last-child {
  border-bottom: none;
}

.switch-item {
  justify-content: space-between;
}

.label {
  font-size: 28rpx;
  color: #333333;
}

.value {
  font-size: 26rpx;
  color: #999999;
  margin-right: 16rpx;
}

.arrow-container {
  display: flex;
  align-items: center;
}

.arrow-icon {
  width: 16rpx;
  height: 16rpx;
}
</style>