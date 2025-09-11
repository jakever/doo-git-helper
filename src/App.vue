<template>
  <div id="app">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>GitLab 版本管理工具</h1>
          <el-menu
            :default-active="$route.path"
            mode="horizontal"
            router
            class="header-menu"
          >
            <el-menu-item index="/">主页</el-menu-item>
            <el-menu-item index="/settings">设置</el-menu-item>
          </el-menu>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

onMounted(() => {
  // 初始化设置
  settingsStore.loadSettings()
})
</script>

<style scoped>
#app {
  height: 100vh;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-content h1 {
  margin: 0;
  color: #409eff;
  font-size: 20px;
}

.header-menu {
  border-bottom: none;
}

.el-header {
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.el-main {
  padding: 20px;
}
</style>
