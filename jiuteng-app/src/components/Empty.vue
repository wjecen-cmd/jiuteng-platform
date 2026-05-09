<template>
  <view class="empty-container">
    <view v-if="icon" class="empty-icon">
      <image :src="icon" class="icon-image" />
    </view>
    <text v-if="text" class="empty-text">{{ text }}</text>
  </view>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.empty-icon {
  margin-bottom: 20rpx;
}

.icon-image {
  width: 80rpx;
  height: 80rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>