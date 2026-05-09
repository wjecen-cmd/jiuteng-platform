<template>
  <view class="page">
    <!-- Logo -->
    <view class="logo-section">
      <view class="logo">
        <text class="logo-text">JT.</text>
      </view>
      <!-- 打字机动效 -->
      <view class="typewriter-container">
        <text class="typewriter-text">{{ displayText }}</text>
        <text class="cursor">|</text>
      </view>
    </view>

    <!-- 登录表单 -->
    <view class="form">
      <view class="input-row">
        <text class="input-prefix">+86</text>
        <input 
          v-model="phone"
          type="number"
          maxlength="11"
          placeholder="手机号"
          class="input"
        />
      </view>
      <view class="input-row">
        <input 
          v-model="code"
          type="number"
          maxlength="6"
          placeholder="验证码"
          class="input"
        />
        <view class="code-btn" @click="getCode">
          <text class="code-text">{{ codeText }}</text>
        </view>
      </view>
    </view>

    <!-- 登录按钮 -->
    <view class="login-btn" @click="login">
      <text class="login-text">登录</text>
    </view>

    <!-- 第三方登录 -->
    <view class="third-section">
      <text class="third-title">其他登录方式</text>
      <view class="third-btns">
        <view class="third-btn" @click="loginWechat">
          <text class="third-icon">微</text>
        </view>
        <view class="third-btn" @click="loginGoogle">
          <text class="third-icon">G</text>
        </view>
      </view>
    </view>

    <!-- 协议 -->
    <view class="agreement">
      <view class="checkbox" :class="{ checked: agreed }" @click="agreed = !agreed">
        <text v-if="agreed" class="check-mark">✓</text>
      </view>
      <text class="agreement-text">登录即表示同意</text>
      <text class="link">用户协议</text>
      <text class="agreement-text">和</text>
      <text class="link">隐私政策</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 打字机配置
const words = [
  'Smart',
  'Prompt', 
  'Monitor',
  'Shop',
  'Workflow',
  'Culture'
]

const wordMeanings: Record<string, string> = {
  'Smart': '智能平台',
  'Prompt': '提示词优化',
  'Monitor': '监测大屏',
  'Shop': 'API商城',
  'Workflow': '工作流',
  'Culture': '文化服务'
}

const displayText = ref('')
const currentWordIndex = ref(0)
const currentCharIndex = ref(0)
const isDeleting = ref(false)
let typewriterTimer: number | null = null

// 打字机效果
const typeWriter = () => {
  const currentWord = words[currentWordIndex.value]
  
  if (!isDeleting.value) {
    // 打字
    displayText.value = currentWord.substring(0, currentCharIndex.value + 1)
    currentCharIndex.value++
    
    if (currentCharIndex.value === currentWord.length) {
      // 完成一个词，等待后开始删除
      isDeleting.value = true
      typewriterTimer = setTimeout(typeWriter, 1500) as unknown as number
      return
    }
  } else {
    // 删除
    displayText.value = currentWord.substring(0, currentCharIndex.value - 1)
    currentCharIndex.value--
    
    if (currentCharIndex.value === 0) {
      // 删除完成，下一个词
      isDeleting.value = false
      currentWordIndex.value = (currentWordIndex.value + 1) % words.length
    }
  }
  
  const speed = isDeleting.value ? 50 : 100
  typewriterTimer = setTimeout(typeWriter, speed) as unknown as number
}

// 登录表单
const phone = ref('')
const code = ref('')
const agreed = ref(false)
const codeText = ref('获取验证码')
const countdown = ref(0)

const getCode = () => {
  if (countdown.value > 0 || !phone.value) return
  
  uni.showToast({ title: '验证码已发送', icon: 'success' })
  countdown.value = 60
  codeText.value = '60s'
  
  const timer = setInterval(() => {
    countdown.value--
    codeText.value = `${countdown.value}s`
    if (countdown.value <= 0) {
      clearInterval(timer)
      codeText.value = '获取验证码'
    }
  }, 1000)
}

const login = () => {
  if (!agreed.value) {
    uni.showToast({ title: '请同意用户协议', icon: 'none' })
    return
  }
  
  uni.switchTab({ url: '/pages/monitor/index' })
}

const loginWechat = () => {
  uni.showToast({ title: '微信登录开发中', icon: 'none' })
}

const loginGoogle = () => {
  uni.showToast({ title: 'Google登录开发中', icon: 'none' })
}

// 生命周期
onMounted(() => {
  typeWriter()
})

onUnmounted(() => {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer)
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #FFFFFF;
  padding: 96rpx 48rpx;
}

.logo-section {
  text-align: center;
  margin-bottom: 64rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  background: #1D1D1F;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24rpx;
}

.logo-text {
  font-size: 48rpx;
  color: #FFFFFF;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.typewriter-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  height: 60rpx;
}

.typewriter-text {
  font-size: 44rpx;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: 4rpx;
}

.cursor {
  font-size: 44rpx;
  font-weight: 300;
  color: #1D1D1F;
  animation: blink 1s infinite;
  margin-left: 4rpx;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.form {
  margin-bottom: 32rpx;
}

.input-row {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #E5E5EA;
}

.input-prefix {
  font-size: 30rpx;
  color: #1D1D1F;
  margin-right: 16rpx;
  padding-right: 16rpx;
  border-right: 1rpx solid #E5E5EA;
}

.input {
  flex: 1;
  font-size: 30rpx;
  color: #1D1D1F;
}

.code-btn {
  padding: 12rpx 24rpx;
  background: #0071E3;
  border-radius: 8rpx;
}

.code-text {
  font-size: 26rpx;
  color: #FFFFFF;
}

.login-btn {
  height: 88rpx;
  background: #0071E3;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48rpx;
}

.login-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.third-section {
  text-align: center;
  margin-bottom: 48rpx;
}

.third-title {
  font-size: 24rpx;
  color: #86868B;
  display: block;
  margin-bottom: 24rpx;
}

.third-btns {
  display: flex;
  justify-content: center;
  gap: 32rpx;
}

.third-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #F5F5F7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.third-icon {
  font-size: 28rpx;
  color: #1D1D1F;
  font-weight: 500;
}

.agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #C7C7CC;
  border-radius: 50%;
  margin-right: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background: #0071E3;
  border-color: #0071E3;
}

.check-mark {
  font-size: 20rpx;
  color: #FFFFFF;
}

.agreement-text {
  font-size: 24rpx;
  color: #86868B;
}

.link {
  font-size: 24rpx;
  color: #0071E3;
}
</style>