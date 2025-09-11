<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>仓库设置</span>
        </div>
      </template>

      <el-form :model="form" label-width="120px" class="settings-form">
        <el-form-item label="选择git仓库根目录">
          <div class="repository-selector">
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
            用于访问 GitLab API，获取仓库信息
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSettings" :loading="saving">
            保存设置
          </el-button>
          <el-button @click="resetSettings">
            重置
          </el-button>
          <el-button type="success" @click="testConnection" :loading="testing">
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
    // 检查是否在 Electron 环境中
    if (window.electronAPI?.selectFolder) {
      // 使用 Electron 的文件选择对话框
      const selectedPath = await window.electronAPI.selectFolder()
      if (selectedPath) {
        form.repositoryPath = selectedPath
      }
    }
  } catch (error) {
    // 用户取消
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

// 重置设置
const resetSettings = () => {
  form.repositoryPath = ''
  form.gitlabToken = ''
  settingsStore.resetSettings()
  ElMessage.success('设置已重置')
}

// 测试连接
const testConnection = async () => {
  if (!form.repositoryPath) {
    ElMessage.warning('请先设置仓库路径')
    return
  }

  testing.value = true
  try {
    // 临时更新设置以测试连接
    const originalPath = settingsStore.repositoryPath
    settingsStore.updateRepositoryPath(form.repositoryPath)
    
    const gitService = new GitService()
    const status = await gitService.getStatus()
    const currentBranch = await gitService.getCurrentBranch()
    const branches = await gitService.getBranches()
    
    ElMessage.success(`连接成功！当前分支: ${currentBranch}，共 ${branches.length} 个分支`)
    
    // 恢复原始设置
    settingsStore.updateRepositoryPath(originalPath)
  } catch (error) {
    ElMessage.error(`连接失败: ${error.message || '请检查仓库路径是否为有效的 Git 仓库'}`)
  } finally {
    testing.value = false
  }
}

// 初始化表单
onMounted(() => {
  form.repositoryPath = settingsStore.repositoryPath
  form.gitlabToken = settingsStore.gitlabToken
})
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.repository-selector {
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
