<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>

      <el-form :model="form" label-width="120px" class="settings-form">
        <el-form-item label="仓库路径">
          <div class="repository-input-group">
            <el-input
              v-model="form.repositoryPath"
              placeholder="请选择 Git 仓库根目录"
              readonly
              class="repository-input"
            />
            <el-button type="primary" @click="selectRepository">
              选择git仓库根目录
            </el-button>
          </div>
          <div class="form-tip">
            请选择 Git 仓库的根目录（包含 .git 文件夹的目录）
          </div>
        </el-form-item>

        <el-form-item label="GitLab Token">
          <el-input
            v-model="form.gitlabToken"
            type="password"
            placeholder="请输入 GitLab Access Token"
            show-password
          />
          <div class="form-tip">
            用于访问 GitLab API，获取项目信息和提交详情
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSettings" :loading="saving">
            保存设置
          </el-button>
          <el-button @click="testConnection" :loading="testing">
            测试连接
          </el-button>
        </el-form-item>
      </el-form>
      <el-divider />

      <div class="settings-info">
        <h4>使用说明</h4>
        <ul>
          <li>选择本地 Git 仓库路径，用于进行 Git 操作</li>
          <li>设置 GitLab Access Token，用于访问 GitLab API</li>
          <li>Token 获取方式：GitLab → Settings → Access Tokens</li>
          <li>需要以下权限：read_repository, read_api</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { ElMessage } from 'element-plus'
import { GitService } from '@/utils/gitService'

const settingsStore = useSettingsStore()
const saving = ref(false)
const testing = ref(false)

const form = reactive({
  repositoryPath: '',
  gitlabToken: ''
})

// 选择仓库
const selectRepository = async () => {
  try {
    // 直接使用 Electron 的 IPC 通信
    const { ipcRenderer } = require('electron')
    const selectedPath = await ipcRenderer.invoke('select-folder')
    if (selectedPath) {
      form.repositoryPath = selectedPath
    }
  } catch (error) {
    // 用户取消或出错
    console.log('选择文件夹被取消或出错:', error)
  }
}

// 保存设置
const saveSettings = async () => {
  if (!form.repositoryPath) {
    ElMessage.warning('请选择仓库路径')
    return
  }

  saving.value = true
  try {
    settingsStore.updateRepositoryPath(form.repositoryPath)
    settingsStore.updateGitlabToken(form.gitlabToken)
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

// 测试连接
const testConnection = async () => {
  if (!form.repositoryPath) {
    ElMessage.warning('请先选择仓库路径')
    return
  }

  testing.value = true
  try {
    const originalPath = settingsStore.repositoryPath
    settingsStore.updateRepositoryPath(form.repositoryPath)
    
    const gitService = new GitService()
    const status = await gitService.getStatus()
    const currentBranch = await gitService.getCurrentBranch()
    const branches = await gitService.getBranches()
    
    ElMessage.success(`连接成功！当前分支: ${currentBranch}，共 ${branches.length} 个分支`)
    
    // 恢复原始路径
    if (originalPath) {
      settingsStore.updateRepositoryPath(originalPath)
    }
  } catch (error) {
    ElMessage.error(`连接失败: ${error.message}`)
  } finally {
    testing.value = false
  }
}

// 加载设置
onMounted(() => {
  settingsStore.loadSettings()
  form.repositoryPath = settingsStore.repositoryPath
  form.gitlabToken = settingsStore.gitlabToken
})
</script>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.settings-form {
  margin-top: 20px;
}

.repository-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.repository-input {
  flex: 1;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-button {
  margin-right: 10px;
}

.settings-info {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
}

.settings-info h4 {
  margin-top: 0;
  color: #409eff;
}

.settings-info ul {
  margin: 10px 0;
  padding-left: 20px;
}

.settings-info li {
  margin: 5px 0;
  color: #606266;
}
</style>