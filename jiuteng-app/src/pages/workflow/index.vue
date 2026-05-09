<template>
  <div class="n8n-workflow-designer">
    <!-- 顶部工具栏 -->
    <header class="toolbar">
      <div class="workflow-controls">
        <button @click="createNewWorkflow" class="btn-primary">新建工作流</button>
        <button @click="saveWorkflow" class="btn-secondary">保存</button>
        <button @click="executeWorkflow" class="btn-success">执行</button>
      </div>
      <div class="workflow-info">
        <input v-model="workflowName" placeholder="工作流名称" />
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧节点面板 -->
      <aside class="node-panel">
        <div class="panel-section">
          <h3>触发器</h3>
          <div 
            v-for="trigger in triggers" 
            :key="trigger.id"
            draggable
            @dragstart="onDragStart($event, trigger)"
            class="node-item trigger-node"
          >
            <i :class="trigger.icon"></i>
            {{ trigger.name }}
          </div>
        </div>

        <div class="panel-section">
          <h3>核心节点</h3>
          <div 
            v-for="coreNode in coreNodes" 
            :key="coreNode.id"
            draggable
            @dragstart="onDragStart($event, coreNode)"
            class="node-item core-node"
          >
            <i :class="coreNode.icon"></i>
            {{ coreNode.name }}
          </div>
        </div>

        <div class="panel-section">
          <h3>数据处理</h3>
          <div 
            v-for="dataNode in dataNodes" 
            :key="dataNode.id"
            draggable
            @dragstart="onDragStart($event, dataNode)"
            class="node-item data-node"
          >
            <i :class="dataNode.icon"></i>
            {{ dataNode.name }}
          </div>
        </div>

        <div class="panel-section">
          <h3>AI 节点</h3>
          <div 
            v-for="aiNode in aiNodes" 
            :key="aiNode.id"
            draggable
            @dragstart="onDragStart($event, aiNode)"
            class="node-item ai-node"
          >
            <i :class="aiNode.icon"></i>
            {{ aiNode.name }}
          </div>
        </div>
      </aside>

      <!-- 画布区域 -->
      <main class="canvas-area">
        <div 
          class="canvas"
          @drop="onDrop"
          @dragover.prevent
          @click="selectCanvas"
        >
          <div 
            v-for="node in workflowNodes" 
            :key="node.id"
            :style="{ left: node.position.x + 'px', top: node.position.y + 'px' }"
            :class="['workflow-node', { selected: selectedNode?.id === node.id }]"
            @click.stop="selectNode(node)"
          >
            <div class="node-header" :class="getNodeClass(node)">
              <i :class="node.icon"></i>
              <span class="node-name">{{ node.name }}</span>
              <button @click.stop="deleteNode(node)" class="delete-btn">×</button>
            </div>
            <div class="node-content">
              <component 
                :is="getNodeConfigComponent(node.type)" 
                :node="node"
                @update="updateNodeConfig"
              />
            </div>
            <div class="connection-points">
              <div class="output-point" @mousedown="startConnection(node, 'output')"></div>
              <div class="input-point" @mousedown="startConnection(node, 'input')"></div>
            </div>
          </div>

          <!-- 连接线 -->
          <svg class="connections-svg" ref="svgRef">
            <path 
              v-for="connection in connections" 
              :key="`${connection.from}-${connection.to}`"
              :d="getConnectionPath(connection)"
              stroke="#666"
              stroke-width="2"
              fill="none"
            />
          </svg>
        </div>
      </main>

      <!-- 右侧面板 -->
      <aside class="config-panel">
        <div v-if="selectedNode" class="node-config">
          <h3>{{ selectedNode.name }} 配置</h3>
          <component 
            :is="getNodeConfigComponent(selectedNode.type)"
            :node="selectedNode"
            @update="updateNodeConfig"
          />
        </div>
        <div v-else class="workflow-config">
          <h3>工作流配置</h3>
          <div class="config-item">
            <label>激活状态</label>
            <input type="checkbox" v-model="workflowActive" />
          </div>
          <div class="config-item">
            <label>描述</label>
            <textarea v-model="workflowDescription"></textarea>
          </div>
        </div>
      </aside>
    </div>

    <!-- 底部状态栏 -->
    <footer class="status-bar">
      <div class="status-info">
        <span>节点数: {{ workflowNodes.length }}</span>
        <span>连接数: {{ connections.length }}</span>
        <span>状态: {{ workflowStatus }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// 响应式数据
const workflowName = ref('新工作流')
const workflowDescription = ref('')
const workflowActive = ref(false)
const workflowStatus = ref('未执行')

// 节点面板数据
const triggers = [
  { id: 'webhook', name: 'Webhook 触发器', icon: 'fas fa-plug', type: 'trigger' },
  { id: 'http', name: 'HTTP 请求', icon: 'fas fa-globe', type: 'trigger' },
  { id: 'schedule', name: '定时任务', icon: 'fas fa-clock', type: 'trigger' }
]

const coreNodes = [
  { id: 'function', name: '函数', icon: 'fas fa-code', type: 'core' },
  { id: 'switch', name: '条件判断', icon: 'fas fa-random', type: 'core' },
  { id: 'loop', name: '循环', icon: 'fas fa-redo', type: 'core' }
]

const dataNodes = [
  { id: 'database', name: '数据库', icon: 'fas fa-database', type: 'data' },
  { id: 'excel', name: 'Excel', icon: 'fas fa-file-excel', type: 'data' },
  { id: 'api', name: 'API调用', icon: 'fas fa-cloud', type: 'data' }
]

const aiNodes = [
  { id: 'jt-ai', name: 'JT AI助手', icon: 'fas fa-robot', type: 'ai' },
  { id: 'text-analysis', name: '文本分析', icon: 'fas fa-comment', type: 'ai' },
  { id: 'image-recognition', name: '图像识别', icon: 'fas fa-image', type: 'ai' }
]

// 工作流数据
const workflowNodes = ref([])
const connections = ref([])
const selectedNode = ref(null)
const connectionStart = ref(null)

// SVG 引用
const svgRef = ref(null)

// 创建新工作流
const createNewWorkflow = () => {
  workflowNodes.value = []
  connections.value = []
  workflowName.value = '新工作流'
  selectedNode.value = null
}

// 保存工作流
const saveWorkflow = () => {
  console.log('保存工作流:', {
    name: workflowName.value,
    nodes: workflowNodes.value,
    connections: connections.value
  })
}

// 执行工作流
const executeWorkflow = () => {
  workflowStatus.value = '执行中...'
  // 模拟执行逻辑
  setTimeout(() => {
    workflowStatus.value = '执行完成'
  }, 2000)
}

// 拖拽开始
const onDragStart = (event, nodeType) => {
  event.dataTransfer.setData('application/node-type', JSON.stringify(nodeType))
}

// 拖拽放置
const onDrop = (event) => {
  event.preventDefault()
  const nodeType = JSON.parse(event.dataTransfer.getData('application/node-type'))
  
  const newNode = {
    id: `node_${Date.now()}`,
    ...nodeType,
    position: {
      x: event.offsetX - 60,
      y: event.offsetY - 30
    },
    config: {}
  }
  
  workflowNodes.value.push(newNode)
}

// 选择节点
const selectNode = (node) => {
  selectedNode.value = node
}

// 选择画布
const selectCanvas = () => {
  selectedNode.value = null
}

// 删除节点
const deleteNode = (node) => {
  // 删除节点
  workflowNodes.value = workflowNodes.value.filter(n => n.id !== node.id)
  // 删除相关连接
  connections.value = connections.value.filter(
    conn => conn.from !== node.id && conn.to !== node.id
  )
  if (selectedNode.value?.id === node.id) {
    selectedNode.value = null
  }
}

// 获取节点样式类
const getNodeClass = (node) => {
  return `${node.type}-node`
}

// 开始连接
const startConnection = (node, pointType) => {
  connectionStart.value = { node, pointType }
}

// 获取连接路径
const getConnectionPath = (connection) => {
  // 简化的贝塞尔曲线路径计算
  const fromNode = workflowNodes.value.find(n => n.id === connection.from)
  const toNode = workflowNodes.value.find(n => n.id === connection.to)
  
  if (!fromNode || !toNode) return ''
  
  const startX = fromNode.position.x + 120
  const startY = fromNode.position.y + 30
  const endX = toNode.position.x
  const endY = toNode.position.y + 30
  
  const midX = (startX + endX) / 2
  
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`
}

// 更新节点配置
const updateNodeConfig = (nodeId, config) => {
  const node = workflowNodes.value.find(n => n.id === nodeId)
  if (node) {
    node.config = { ...node.config, ...config }
  }
}

// 获取节点配置组件
const getNodeConfigComponent = (type) => {
  // 根据类型返回对应的配置组件
  switch(type) {
    case 'trigger':
      return 'TriggerConfig'
    case 'core':
      return 'CoreNodeConfig'
    case 'data':
      return 'DataNodeConfig'
    case 'ai':
      return 'AINodeConfig'
    default:
      return 'DefaultConfig'
  }
}

// 模拟配置组件
const TriggerConfig = {
  props: ['node'],
  emits: ['update'],
  template: `
    <div class="trigger-config">
      <div class="form-group">
        <label>触发方式</label>
        <select v-model="localConfig.triggerMethod">
          <option value="webhook">Webhook</option>
          <option value="schedule">定时</option>
        </select>
      </div>
      <div class="form-group" v-if="localConfig.triggerMethod === 'webhook'">
        <label>Webhook URL</label>
        <input v-model="localConfig.webhookUrl" readonly />
      </div>
    </div>
  `,
  data() {
    return {
      localConfig: { ...this.node.config }
    }
  },
  watch: {
    localConfig: {
      handler() {
        this.$emit('update', this.node.id, this.localConfig)
      },
      deep: true
    }
  }
}

const CoreNodeConfig = {
  props: ['node'],
  emits: ['update'],
  template: `
    <div class="core-config">
      <div class="form-group">
        <label>函数代码</label>
        <textarea v-model="localConfig.code" rows="10" placeholder="请输入JavaScript代码"></textarea>
      </div>
    </div>
  `,
  data() {
    return {
      localConfig: { ...this.node.config }
    }
  },
  watch: {
    localConfig: {
      handler() {
        this.$emit('update', this.node.id, this.localConfig)
      },
      deep: true
    }
  }
}

const DataNodeConfig = {
  props: ['node'],
  emits: ['update'],
  template: `
    <div class="data-config">
      <div class="form-group">
        <label>数据库连接</label>
        <select v-model="localConfig.connection">
          <option value="">请选择连接</option>
          <option value="mysql">MySQL</option>
          <option value="postgresql">PostgreSQL</option>
        </select>
      </div>
      <div class="form-group">
        <label>SQL查询</label>
        <textarea v-model="localConfig.query" rows="5" placeholder="请输入SQL查询"></textarea>
      </div>
    </div>
  `,
  data() {
    return {
      localConfig: { ...this.node.config }
    }
  },
  watch: {
    localConfig: {
      handler() {
        this.$emit('update', this.node.id, this.localConfig)
      },
      deep: true
    }
  }
}

const AINodeConfig = {
  props: ['node'],
  emits: ['update'],
  template: `
    <div class="ai-config">
      <div class="form-group">
        <label>AI模型</label>
        <select v-model="localConfig.model">
          <option value="gpt-3.5">GPT-3.5</option>
          <option value="gpt-4">GPT-4</option>
          <option value="claude">Claude</option>
        </select>
      </div>
      <div class="form-group">
        <label>提示词</label>
        <textarea v-model="localConfig.prompt" rows="5" placeholder="请输入AI提示词"></textarea>
      </div>
    </div>
  `,
  data() {
    return {
      localConfig: { ...this.node.config }
    }
  },
  watch: {
    localConfig: {
      handler() {
        this.$emit('update', this.node.id, this.localConfig)
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.n8n-workflow-designer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.toolbar {
  padding: 10px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.workflow-controls button {
  margin-right: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-success { background: #28a745; color: white; }

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.node-panel {
  width: 250px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  overflow-y: auto;
}

.panel-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.node-item {
  padding: 10px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  cursor: move;
  border: 1px solid #e9ecef;
}

.node-item:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.canvas {
  width: 100%;
  height: 100%;
  position: relative;
  background: #fafafa;
  background-image: 
    radial-gradient(circle, #e0e0e0 1px, transparent 1px);
  background-size: 20px 20px;
}

.workflow-node {
  position: absolute;
  min-width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 2px solid transparent;
}

.workflow-node.selected {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.node-header {
  padding: 12px;
  border-radius: 6px 6px 0 0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.trigger-node .node-header { background: #ff6b6b; }
.core-node .node-header { background: #4ecdc4; }
.data-node .node-header { background: #45b7d1; }
.ai-node .node-header { background: #96ceb4; }

.node-name {
  flex: 1;
  font-weight: bold;
}

.delete-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-content {
  padding: 15px;
}

.connection-points {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.output-point {
  right: -8px;
  width: 12px;
  height: 12px;
  background: #007bff;
  border-radius: 50%;
  cursor: crosshair;
}

.input-point {
  left: -8px;
  width: 12px;
  height: 12px;
  background: #28a745;
  border-radius: 50%;
  cursor: crosshair;
}

.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.config-panel {
  width: 350px;
  background: white;
  border-left: 1px solid #e0e0e0;
  padding: 20px;
  overflow-y: auto;
}

.config-item {
  margin-bottom: 15px;
}

.config-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.config-item input,
.config-item textarea,
.config-item select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.status-bar {
  padding: 8px 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #666;
}

.status-info span {
  margin-right: 20px;
}
</style>