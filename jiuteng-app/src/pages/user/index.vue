<template>
  <view class="page">
    <!-- 用户信息 -->
    <view class="user-section">
      <view class="avatar">
        <text class="avatar-text">{{ userInfo.nickname.charAt(0) }}</text>
      </view>
      <view class="user-info">
        <text class="nickname">{{ userInfo.nickname }}</text>
        <text class="level">Lv.{{ userInfo.level }}</text>
      </view>
    </view>

    <!-- 余额 -->
    <view class="balance-section">
      <text class="balance-label">账户余额</text>
      <text class="balance-num">{{ userInfo.balance }}</text>
      <view class="balance-btns">
        <view class="btn primary" @click="recharge">
          <text class="btn-text white">充值</text>
        </view>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <view class="menu-item" v-for="item in menuItems" :key="item.id" @click="goPage(item.page)">
        <view class="menu-left">
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-name">{{ item.name }}</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出 -->
    <view class="logout" @click="logout">
      <text class="logout-text">退出登录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const userInfo = ref({
  nickname: '开发者',
  level: 3,
  balance: '¥99.00'
})

const menuItems = ref([
  { id: 1, icon: '🛒', name: '商城', page: 'shop' },
  { id: 2, icon: '📋', name: '我的订单', page: 'orders' },
  { id: 3, icon: '🔑', name: 'API密钥', page: 'apikeys' },
  { id: 4, icon: '💾', name: 'U盘绑定', page: 'usb' },
  { id: 5, icon: '⚙️', name: '设置', page: 'settings' }
])

const recharge = () => {
  uni.navigateTo({ url: '/pages/recharge/index' })
}

const goPage = (page: string) => {
  uni.navigateTo({ url: `/pages/${page}/index` })
}

const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定退出登录？',
    success: (res) => {
      if (res.confirm) {
        uni.reLaunch({ url: '/pages/login/index' })
      }
    }
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #FFFFFF;
  padding: 48rpx 32rpx;
}

.user-section {
  display: flex;
  align-items: center;
  margin-bottom: 48rpx;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #0071E3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 36rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.user-info {
  margin-left: 24rpx;
}

.nickname {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #1D1D1F;
}

.level {
  font-size: 24rpx;
  color: #86868B;
  margin-top: 4rpx;
}

.balance-section {
  background: #F5F5F7;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.balance-label {
  font-size: 26rpx;
  color: #86868B;
}

.balance-num {
  display: block;
  font-size: 48rpx;
  font-weight: 600;
  color: #1D1D1F;
  margin: 16rpx 0;
}

.balance-btns {
  display: flex;
  gap: 16rpx;
}

.btn {
  flex: 1;
  height: 72rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary {
  background: #0071E3;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 500;
}

.white {
  color: #FFFFFF;
}

.menu-section {
  margin-bottom: 32rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #E5E5EA;
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.menu-name {
  font-size: 30rpx;
  color: #1D1D1F;
}

.menu-arrow {
  font-size: 32rpx;
  color: #C7C7CC;
}

.logout {
  text-align: center;
  padding: 28rpx;
}

.logout-text {
  font-size: 30rpx;
  color: #FF3B30;
}
</style>