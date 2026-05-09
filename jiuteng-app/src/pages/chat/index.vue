<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <text class="title">龙虾 AI</text>
    </view>

    <!-- 消息列表 -->
    <scroll-view class="messages" scroll-y :scroll-top="scrollTop">
      <view 
        v-for="(msg, index) in messages" 
        :key="index"
        class="msg-row"
        :class="msg.isAI ? 'ai-row' : 'user-row'"
      >
        <view class="bubble" :class="msg.isAI ? 'ai-bubble' : 'user-bubble'">
          <text class="msg-text" :class="msg.isAI ? '' : 'user-text'">{{ msg.content }}</text>
        </view>
        <text class="msg-time">{{ msg.time }}</text>
      </view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="input-area">
      <input 
        v-model="inputText"
        class="input"
        placeholder="输入消息"
        @confirm="send"
      />
      <view class="send-btn" @click="send">
        <text class="send-text">发送</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const messages = ref([
  { content: '你好，我是龙虾 AI，有什么可以帮你的？', isAI: true, time: '19:00' }
])

const inputText = ref('')
const scrollTop = ref(0)

const send = async () => {
  if (!inputText.value.trim()) return
  
  const text = inputText.value.trim()
  inputText.value = ''
  
  messages.value.push({ content: text, isAI: false, time: '19:01' })
  
  await nextTick()
  scrollTop.value += 1000
  
  setTimeout(() => {
    messages.value.push({ content: '收到，这是一个模拟回复。', isAI: true, time: '19:01' })
    scrollTop.value += 1000
  }, 500)
}
</script>

<style scoped>
.page {
  height: 100vh;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #E5E5EA;
}

.title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1D1D1F;
}

.messages {
  flex: 1;
  padding: 24rpx 32rpx;
}

.msg-row {
  margin-bottom: 24rpx;
}

.ai-row {
  align-items: flex-start;
}

.user-row {
  align-items: flex-end;
}

.bubble {
  max-width: 70%;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
}

.ai-bubble {
  background: #F5F5F7;
}

.user-bubble {
  background: #0071E3;
}

.msg-text {
  font-size: 28rpx;
  color: #1D1D1F;
  line-height: 1.5;
}

.user-text {
  color: #FFFFFF;
}

.msg-time {
  font-size: 22rpx;
  color: #86868B;
  margin-top: 8rpx;
  display: block;
}

.input-area {
  display: flex;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #E5E5EA;
  gap: 16rpx;
}

.input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  background: #F5F5F7;
  border-radius: 12rpx;
}

.send-btn {
  width: 120rpx;
  height: 72rpx;
  background: #0071E3;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 500;
}
</style>