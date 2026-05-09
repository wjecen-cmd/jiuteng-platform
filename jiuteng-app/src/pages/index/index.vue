<template>
  <view class="page" :class="{ 'show-chat': showChat }">
    <!-- 首页/落地页 -->
    <view class="landing" v-if="!showChat">
      <!-- 顶部 -->
      <view class="landing-header">
        <view class="logo">
          <text class="logo-text">九藤集团</text>
        </view>
      </view>

      <!-- 主标题 -->
      <view class="landing-content">
        <text class="main-title">九藤智能工具平台</text>
        <text class="sub-title">AI驱动的智能解决方案</text>

        <!-- 三个板块 -->
        <view class="sections">
          <view class="section-card" v-for="item in sections" :key="item.title">
            <view class="section-icon">{{ item.icon }}</view>
            <text class="section-title">{{ item.title }}</text>
            <text class="section-desc">{{ item.desc }}</text>
            <view class="section-tags">
              <text class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部上滑按钮 -->
      <view class="scroll-btn" @click="enterChat">
        <text class="scroll-icon">↑</text>
        <text class="scroll-text">开始对话</text>
      </view>
    </view>

    <!-- 对话页 -->
    <view class="chat-page" v-if="showChat">
      <!-- 左侧菜单 -->
      <view class="sidebar" :class="{ open: menuOpen }">
        <view class="sidebar-header">
          <text class="sidebar-title">九藤智能</text>
          <text class="close-btn" @click="menuOpen = false">×</text>
        </view>
        <view class="menu-list">
          <view class="menu-item" :class="{ active: currentMenu === 'monitor' }" @click="switchMenu('monitor')">
            <text class="menu-icon">📊</text>
            <text class="menu-text">数据监测</text>
          </view>
          <view class="menu-item" :class="{ active: currentMenu === 'workflow' }" @click="switchMenu('workflow')">
            <text class="menu-icon">🔄</text>
            <text class="menu-text">工作流自动化</text>
          </view>
          <view class="menu-item" :class="{ active: currentMenu === 'shop' }" @click="switchMenu('shop')">
            <text class="menu-icon">🛒</text>
            <text class="menu-text">商城</text>
          </view>
        </view>
      </view>

      <!-- 遮罩 -->
      <view class="sidebar-mask" v-if="menuOpen" @click="menuOpen = false"></view>

      <!-- 主内容区 -->
      <view class="chat-main">
        <!-- 顶部栏 -->
        <view class="chat-header">
          <view class="hamburger" @click="menuOpen = true">
            <view class="bar"></view>
            <view class="bar"></view>
            <view class="bar"></view>
          </view>
          <view class="agent-info">
            <text class="agent-name">JT</text>
            <text class="agent-tag">绑定 OpenClaw</text>
          </view>
        </view>

        <!-- 聊天区域 -->
        <scroll-view class="chat-area" scroll-y :scroll-top="scrollTop">
          <!-- 欢迎消息 -->
          <view class="welcome" v-if="messages.length === 0">
            <view class="welcome-avatar">JT</view>
            <text class="welcome-text">你好，我是 JT，九藤智能助手。有什么可以帮助你的？</text>
          </view>

          <!-- 提示词卡片 -->
          <view class="prompt-cards" v-if="messages.length === 0">
            <view class="prompt-card" v-for="p in prompts" :key="p" @click="sendPrompt(p)">
              <text class="prompt-text">{{ p }}</text>
            </view>
          </view>

          <!-- 消息列表 -->
          <view class="messages" v-if="messages.length > 0">
            <view 
              class="message" 
              :class="m.role" 
              v-for="(m, i) in messages" 
              :key="i"
            >
              <view class="msg-avatar">{{ m.role === 'user' ? '我' : 'JT' }}</view>
              <view class="msg-content">
                <text class="msg-text">{{ m.content }}</text>
              </view>
            </view>
            
            <!-- 加载中 -->
            <view class="message assistant loading" v-if="isLoading">
              <view class="msg-avatar">JT</view>
              <view class="msg-content">
                <view class="typing">
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 输入区域 -->
        <view class="input-area">
          <input 
            class="input" 
            v-model="inputText" 
            placeholder="输入消息..."
            @confirm="sendMessage"
          />
          <view class="send-btn" @click="sendMessage">
            <text class="send-icon">➤</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

// 页面状态
const showChat = ref(false)
const menuOpen = ref(false)
const currentMenu = ref('chat')

// 三个板块
const sections = ref([
  {
    icon: '🤖',
    title: '九藤文化',
    desc: '智能体服务与Skill商店',
    tags: ['JT智能体', 'Skill商店', 'API服务']
  },
  {
    icon: '⚡',
    title: '九藤商服',
    desc: '工作流自动化部署',
    tags: ['工作流', '一键部署', '自动化']
  },
  {
    icon: '🌐',
    title: '九藤科技',
    desc: '基础设施与硬件',
    tags: ['纯净IP', '云服务器', '龙虾U盘']
  }
])

// 提示词
const prompts = ref([
  '介绍一下九藤文化',
  '如何创建API密钥',
  '查看我的余额'
])

// 聊天相关
const messages = ref<{role: string, content: string}[]>([])
const inputText = ref('')
const isLoading = ref(false)
const scrollTop = ref(0)

// 进入对话
const enterChat = () => {
  showChat.value = true
}

// 切换菜单
const switchMenu = (menu: string) => {
  currentMenu.value = menu
  menuOpen.value = false
  
  // 跳转对应页面
  if (menu === 'monitor') {
    uni.navigateTo({ url: '/pages/monitor/index' })
  } else if (menu === 'workflow') {
    uni.navigateTo({ url: '/pages/workflow/index' })
  } else if (menu === 'shop') {
    uni.navigateTo({ url: '/pages/shop/index' })
  }
}

// 发送提示词
const sendPrompt = (text: string) => {
  inputText.value = text
  sendMessage()
}

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value) return
  
  const text = inputText.value.trim()
  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  
  await scrollToBottom()
  
  isLoading.value = true
  
  // 模拟AI回复
  setTimeout(() => {
    messages.value.push({ 
      role: 'assistant', 
      content: `收到你的问题："${text}"。这是一个模拟回复，实际使用时请连接后端 API。` 
    })
    isLoading.value = false
    scrollToBottom()
  }, 1500)
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  scrollTop.value = scrollTop.value + 1000
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0A0A0A;
}

/* ========== 落地页 ========== */
.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 60rpx 40rpx;
}

.landing-header {
  text-align: center;
  margin-bottom: 80rpx;
}

.logo {
  display: inline-block;
  padding: 20rpx 40rpx;
  border: 2rpx solid rgba(255,255,255,0.3);
  border-radius: 12rpx;
}

.logo-text {
  font-size: 32rpx;
  color: #FFF;
  letter-spacing: 4rpx;
}

.landing-content {
  flex: 1;
  text-align: center;
}

.main-title {
  display: block;
  font-size: 56rpx;
  font-weight: 600;
  color: #FFF;
  margin-bottom: 20rpx;
}

.sub-title {
  display: block;
  font-size: 28rpx;
  color: #888;
  margin-bottom: 80rpx;
}

.sections {
  display: flex;
  gap: 24rpx;
  margin-bottom: 60rpx;
}

.section-card {
  flex: 1;
  background: #111;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
}

.section-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #FFF;
  margin-bottom: 12rpx;
}

.section-desc {
  display: block;
  font-size: 22rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.section-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag {
  font-size: 20rpx;
  color: #22C55E;
  background: rgba(34, 197, 94, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
}

.scroll-btn {
  position: fixed;
  bottom: 80rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 48rpx;
  background: #22C55E;
  border-radius: 40rpx;
}

.scroll-icon {
  font-size: 40rpx;
  color: #FFF;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

.scroll-text {
  font-size: 24rpx;
  color: #FFF;
  margin-top: 8rpx;
}

/* ========== 对话页 ========== */
.chat-page {
  height: 100vh;
  display: flex;
  position: relative;
}

/* 侧边栏 */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 500rpx;
  background: #111;
  z-index: 100;
  transform: translateX(-100%);
  transition: transform 0.3s;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 32rpx;
  border-bottom: 1rpx solid #222;
}

.sidebar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFF;
}

.close-btn {
  font-size: 48rpx;
  color: #666;
}

.menu-list {
  padding: 24rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 24rpx;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.menu-item.active {
  background: #222;
}

.menu-icon {
  font-size: 36rpx;
}

.menu-text {
  font-size: 28rpx;
  color: #FFF;
}

.sidebar-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 99;
}

/* 主内容 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  background: #111;
}

.hamburger {
  width: 48rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.bar {
  height: 4rpx;
  background: #FFF;
  border-radius: 2rpx;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.agent-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFF;
}

.agent-tag {
  font-size: 22rpx;
  color: #22C55E;
  background: rgba(34, 197, 94, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
}

/* 聊天区域 */
.chat-area {
  flex: 1;
  padding: 32rpx;
}

.welcome {
  text-align: center;
  padding: 80rpx 0;
}

.welcome-avatar {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #22C55E, #16A34A);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32rpx;
  font-size: 40rpx;
  color: #FFF;
  font-weight: 600;
}

.welcome-text {
  font-size: 32rpx;
  color: #FFF;
}

.prompt-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 40rpx;
}

.prompt-card {
  background: #1A1A1A;
  border: 1rpx solid #333;
  border-radius: 12rpx;
  padding: 24rpx 32rpx;
}

.prompt-text {
  font-size: 26rpx;
  color: #CCC;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.message {
  display: flex;
  gap: 16rpx;
}

.message.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #FFF;
  flex-shrink: 0;
}

.message.assistant .msg-avatar {
  background: linear-gradient(135deg, #22C55E, #16A34A);
}

.msg-content {
  max-width: 70%;
  padding: 20rpx 28rpx;
  border-radius: 16rpx;
}

.message.user .msg-content {
  background: #22C55E;
}

.message.assistant .msg-content {
  background: #1A1A1A;
}

.msg-text {
  font-size: 28rpx;
  color: #FFF;
  line-height: 1.6;
}

.typing {
  display: flex;
  gap: 8rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  background: #666;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

/* 输入区域 */
.input-area {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  background: #111;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.input {
  flex: 1;
  height: 80rpx;
  background: #1A1A1A;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #FFF;
}

.send-btn {
  width: 80rpx;
  height: 80rpx;
  background: #22C55E;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-icon {
  font-size: 32rpx;
  color: #FFF;
}
</style>