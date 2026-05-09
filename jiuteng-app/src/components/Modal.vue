<template>
  <view v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <view class="modal-container" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ title }}</text>
        <view class="modal-close-btn" @click="handleClose">
          <text class="close-icon">×</text>
        </view>
      </view>
      <view class="modal-content">
        <text class="content-text">{{ content }}</text>
      </view>
      <view class="modal-footer">
        <button class="btn-cancel" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button class="btn-confirm" @click="handleConfirm">
          {{ confirmText }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Props {
  visible: boolean
  title: string
  content: string
  confirmText?: string
  cancelText?: string
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '确定',
  cancelText: '取消'
})

const emit = defineEmits<Emits>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  handleClose()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-container {
  background-color: #ffffff;
  border-radius: 8px;
  width: 300px;
  max-width: 80vw;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 16px;
  font-weight: bold;
  color: #333333;
}

.modal-close-btn {
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-icon {
  font-size: 20px;
  color: #999999;
  line-height: 1;
}

.modal-content {
  padding: 16px;
}

.content-text {
  font-size: 14px;
  color: #666666;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  border-top: 1px solid #f0f0f0;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 44px;
  line-height: 44px;
  text-align: center;
  font-size: 16px;
  border: none;
  outline: none;
  cursor: pointer;
}

.btn-cancel {
  color: #333333;
  background-color: #f8f8f8;
}

.btn-confirm {
  color: #ffffff;
  background-color: #007aff;
}
</style>