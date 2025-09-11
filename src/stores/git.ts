import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { CommitInfo, BranchInfo, SearchConditions, PaginationInfo } from '@/types'
import { GitService } from '@/utils/gitService'

export const useGitStore = defineStore('git', () => {
  // 状态
  const currentBranch = ref('')
  const targetBranch = ref('')
  const branches = ref<BranchInfo[]>([])
  const commits = ref<CommitInfo[]>([])
  const selectedCommits = ref<string[]>([])
  const loading = ref(false)
  const searchConditions = ref<SearchConditions>({})
  const pagination = ref<PaginationInfo>({
    current: 1,
    pageSize: 20,
    total: 0
  })

  // 计算属性
  const filteredCommits = computed(() => {
    let filtered = commits.value

    if (searchConditions.value.author) {
      filtered = filtered.filter(commit => 
        commit.author.toLowerCase().includes(searchConditions.value.author!.toLowerCase())
      )
    }

    if (searchConditions.value.message) {
      filtered = filtered.filter(commit => 
        commit.message.toLowerCase().includes(searchConditions.value.message!.toLowerCase())
      )
    }

    if (searchConditions.value.hash) {
      filtered = filtered.filter(commit => 
        commit.hash.toLowerCase().includes(searchConditions.value.hash!.toLowerCase())
      )
    }

    // 更新总数
    pagination.value.total = filtered.length

    // 分页
    const start = (pagination.value.current - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filtered.slice(start, end)
  })

  const hasSelectedCommits = computed(() => selectedCommits.value.length > 0)

  // 方法
  const loadBranches = async () => {
    try {
      loading.value = true
      const gitService = new GitService()
      const branchList = await gitService.getBranches()
      branches.value = branchList
      
      // 设置当前分支
      const current = branchList.find(b => b.current)
      if (current) {
        currentBranch.value = current.name
      }
    } catch (error) {
      console.error('加载分支失败:', error)
      ElMessage.error('加载分支失败')
    } finally {
      loading.value = false
    }
  }

  const loadCommits = async (branchName?: string) => {
    try {
      loading.value = true
      const gitService = new GitService()
      const commitList = await gitService.getCommits(branchName || currentBranch.value)
      commits.value = commitList
      pagination.value.total = commitList.length
      pagination.value.current = 1
    } catch (error) {
      console.error('加载提交记录失败:', error)
      ElMessage.error('加载提交记录失败')
    } finally {
      loading.value = false
    }
  }

  const compareBranches = async () => {
    if (!currentBranch.value || !targetBranch.value) {
      ElMessage.warning('请选择当前分支和目标分支')
      return
    }

    try {
      loading.value = true
      const gitService = new GitService()
      const diffCommits = await gitService.getBranchDiff(currentBranch.value, targetBranch.value)
      commits.value = diffCommits
      pagination.value.total = diffCommits.length
      pagination.value.current = 1
      selectedCommits.value = []
    } catch (error) {
      console.error('比较分支失败:', error)
      ElMessage.error('比较分支失败')
    } finally {
      loading.value = false
    }
  }

  const cherryPickCommits = async () => {
    if (selectedCommits.value.length === 0) {
      ElMessage.warning('请选择要 Cherry Pick 的提交')
      return
    }

    try {
      loading.value = true
      const gitService = new GitService()
      
      // 切换到目标分支
      await gitService.checkoutBranch(targetBranch.value)
      
      // 批量 Cherry Pick
      for (const commitHash of selectedCommits.value) {
        await gitService.cherryPick(commitHash)
      }
      
      ElMessage.success(`成功 Cherry Pick ${selectedCommits.value.length} 个提交`)
      selectedCommits.value = []
      
      // 重新加载提交记录
      await loadCommits(targetBranch.value)
    } catch (error) {
      console.error('Cherry Pick 失败:', error)
      ElMessage.error('Cherry Pick 失败')
    } finally {
      loading.value = false
    }
  }

  const updateSearchConditions = (conditions: SearchConditions) => {
    searchConditions.value = conditions
    pagination.value.current = 1
  }

  const updatePagination = (page: number, pageSize?: number) => {
    pagination.value.current = page
    if (pageSize) {
      pagination.value.pageSize = pageSize
    }
  }

  const toggleCommitSelection = (commitHash: string) => {
    const index = selectedCommits.value.indexOf(commitHash)
    if (index > -1) {
      selectedCommits.value.splice(index, 1)
    } else {
      selectedCommits.value.push(commitHash)
    }
  }

  const selectAllCommits = () => {
    selectedCommits.value = filteredCommits.value.map(commit => commit.hash)
  }

  const clearSelection = () => {
    selectedCommits.value = []
  }

  return {
    // 状态
    currentBranch,
    targetBranch,
    branches,
    commits,
    selectedCommits,
    loading,
    searchConditions,
    pagination,
    
    // 计算属性
    filteredCommits,
    hasSelectedCommits,
    
    // 方法
    loadBranches,
    loadCommits,
    compareBranches,
    cherryPickCommits,
    updateSearchConditions,
    updatePagination,
    toggleCommitSelection,
    selectAllCommits,
    clearSelection
  }
})
