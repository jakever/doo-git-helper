<template>
  <div class="home-container">
    <!-- 分支管理区域 -->
    <el-card class="branch-card" v-loading="gitStore.loading">
      <template #header>
        <div class="card-header">
          <span>分支管理</span>
          <el-button type="primary" @click="refreshBranches">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <div class="branch-selectors">
        <div class="branch-item">
          <label>当前分支:</label>
          <el-select
            v-model="gitStore.currentBranch"
            placeholder="选择当前分支"
            @change="onCurrentBranchChange"
            style="width: 200px"
          >
            <el-option
              v-for="branch in localBranches"
              :key="branch.name"
              :label="branch.name"
              :value="branch.name"
            />
          </el-select>
        </div>

        <div class="branch-item">
          <label>目标分支:</label>
          <el-select
            v-model="gitStore.targetBranch"
            placeholder="选择目标分支"
            style="width: 200px"
          >
            <el-option
              v-for="branch in allBranches"
              :key="branch.name"
              :label="branch.name"
              :value="branch.name"
            />
          </el-select>
        </div>

        <el-button
          type="success"
          @click="compareBranches"
          :disabled="!gitStore.currentBranch || !gitStore.targetBranch"
        >
          <el-icon><Search /></el-icon>
          比较差异
        </el-button>
      </div>
    </el-card>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span>搜索条件</span>
        </div>
      </template>

      <div class="search-form">
        <el-input
          v-model="searchForm.author"
          placeholder="按作者搜索"
          style="width: 200px"
          clearable
        />
        <el-input
          v-model="searchForm.message"
          placeholder="按提交信息搜索"
          style="width: 200px"
          clearable
        />
        <el-input
          v-model="searchForm.hash"
          placeholder="按 Hash 搜索"
          style="width: 200px"
          clearable
        />
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="clearSearch">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </div>
    </el-card>

    <!-- 提交记录列表 -->
    <el-card class="commits-card">
      <template #header>
        <div class="card-header">
          <span>提交记录</span>
          <div class="header-actions">
            <el-button
              type="warning"
              @click="gitStore.selectAllCommits"
              :disabled="gitStore.filteredCommits.length === 0"
            >
              全选
            </el-button>
            <el-button
              type="info"
              @click="gitStore.clearSelection"
              :disabled="!gitStore.hasSelectedCommits"
            >
              清空选择
            </el-button>
            <el-button
              type="success"
              @click="cherryPickSelected"
              :disabled="!gitStore.hasSelectedCommits"
              :loading="gitStore.loading"
            >
              Cherry Pick ({{ gitStore.selectedCommits.length }})
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="gitStore.filteredCommits"
        v-loading="gitStore.loading"
        @selection-change="handleSelectionChange"
        row-key="hash"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="hash" label="Hash" width="120">
          <template #default="{ row }">
            <el-button
              type="text"
              @click="copyHash(row.hash)"
              class="hash-button"
            >
              {{ row.hash.substring(0, 8) }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="提交信息" min-width="300" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="date" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="gitStore.pagination.current"
          v-model:page-size="gitStore.pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="gitStore.pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useGitStore } from '@/stores/git'
import { useSettingsStore } from '@/stores/settings'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, Delete } from '@element-plus/icons-vue'
import { GitService } from '@/utils/gitService'
import type { SearchConditions } from '@/types'

const gitStore = useGitStore()
const settingsStore = useSettingsStore()

const searchForm = reactive<SearchConditions>({
  author: '',
  message: '',
  hash: ''
})

// 计算属性
const localBranches = computed(() => 
  gitStore.branches.filter(branch => !branch.remote)
)

const remoteBranches = computed(() => 
gitStore.branches.filter(branch => branch.remote)
  )

const allBranches = computed(() => gitStore.branches)

// 方法
const refreshBranches = async () => {
  try {
    await gitStore.loadBranches()
    ElMessage.success('分支列表已刷新')
  } catch (error) {
    ElMessage.error('刷新分支失败')
  }
}

const onCurrentBranchChange = async () => {
  if (gitStore.currentBranch) {
    await gitStore.loadCommits(gitStore.currentBranch)
  }
}

const compareBranches = async () => {
  await gitStore.compareBranches()
}

const handleSearch = () => {
  gitStore.updateSearchConditions(searchForm)
}

const clearSearch = () => {
  searchForm.author = ''
  searchForm.message = ''
  searchForm.hash = ''
  gitStore.updateSearchConditions(searchForm)
}

const handleSelectionChange = (selection: any[]) => {
  gitStore.selectedCommits = selection.map(item => item.hash)
}

const handleSizeChange = (size: number) => {
  gitStore.updatePagination(1, size)
}

const handleCurrentChange = (page: number) => {
  gitStore.updatePagination(page)
}

const cherryPickSelected = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${gitStore.selectedCommits.length} 个提交 Cherry Pick 到目标分支吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await gitStore.cherryPickCommits()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Cherry Pick 操作失败')
    }
  }
}

const copyHash = async (hash: string) => {
  try {
    await navigator.clipboard.writeText(hash)
    ElMessage.success('Hash 已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 初始化
onMounted(async () => {
  if (!settingsStore.repositoryPath) {
    ElMessage.warning('请先在设置页面配置仓库路径')
    return
  }

  try {
    // 加载分支列表
    await gitStore.loadBranches()
    
    // 自动获取并设置当前分支
    const gitService = new GitService()
    const currentBranch = await gitService.getCurrentBranch()
    if (currentBranch) {
      gitStore.currentBranch = currentBranch
      // 加载当前分支的提交记录
      await gitStore.loadCommits(currentBranch)
    }
  } catch (error) {
    ElMessage.error(`初始化失败: ${error.message || '请检查仓库配置'}`)
  }
})
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.branch-card,
.search-card,
.commits-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.branch-selectors {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.branch-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.branch-item label {
  font-weight: 500;
  min-width: 80px;
}

.search-form {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.hash-button {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .branch-selectors {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
  }
}
</style>
