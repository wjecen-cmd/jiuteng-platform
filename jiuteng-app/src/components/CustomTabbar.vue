<template>
  <view class="tab-bar">
    <view 
      v-for="(item, index) in tabs" 
      :key="index"
      class="tab-item"
      :class="{ active: currentIndex === index }"
      @click="handleTabClick(index)"
    >
      <svg 
        class="tab-icon" 
        :class="{ 'icon-active': currentIndex === index }"
        aria-hidden="true"
      >
        <use :xlink:href="`#${item.icon}`"></use>
      </svg>
      <text 
        class="tab-text"
        :style="{ color: currentIndex === index ? '#007AFF' : '#86868B' }"
      >
        {{ item.text }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface TabItem {
  icon: string
  text: string
}

const props = defineProps<{
  current: number
}>()

const emit = defineEmits<{
  change: [index: number]
}>()

const currentIndex = ref(0)

watch(() => props.current, (newVal) => {
  currentIndex.value = newVal
}, { immediate: true })

const tabs: TabItem[] = [
  { icon: 'home-icon', text: '首页' },
  { icon: 'search-icon', text: '搜索' },
  { icon: 'profile-icon', text: '我的' }
]

const handleTabClick = (index: number) => {
  if (currentIndex.value !== index) {
    currentIndex.value = index
    emit('change', index)
  }
}
</script>

<style scoped>
.tab-bar {
  display: flex;
  height: 50px;
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
  cursor: pointer;
}

.tab-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 2px;
  fill: #86868b;
}

.icon-active {
  fill: #007aff;
}

.tab-text {
  font-size: 12px;
  line-height: 14px;
}

.active .tab-text {
  color: #007aff;
}
</style>