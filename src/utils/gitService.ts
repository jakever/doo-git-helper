import type { CommitInfo, BranchInfo } from '@/types'
import { useSettingsStore } from '@/stores/settings'

export class GitService {
  private settingsStore = useSettingsStore()

  constructor() {
    const repoPath = this.settingsStore.repositoryPath
    if (!repoPath) {
      throw new Error('请先设置仓库路径')
    }
    
    // 检查是否在 Electron 环境中
    if (!window.electronAPI) {
      throw new Error('GitService 只能在 Electron 环境中使用')
    }
  }

  private get repoPath(): string {
    return this.settingsStore.repositoryPath
  }

  // 获取所有分支
  async getBranches(): Promise<BranchInfo[]> {
    try {
      const result = await window.electronAPI.git.getBranches(this.repoPath)
      if (!result.success) {
        throw new Error(result.error || '获取分支失败')
      }
      return result.data
    } catch (error) {
      console.error('获取分支失败:', error)
      throw error
    }
  }

  // 获取提交记录
  async getCommits(branchName: string, limit: number = 100): Promise<CommitInfo[]> {
    try {
      const result = await window.electronAPI.git.getCommits({
        repoPath: this.repoPath,
        branchName,
        limit
      })
      if (!result.success) {
        throw new Error(result.error || '获取提交记录失败')
      }
      return result.data
    } catch (error) {
      console.error('获取提交记录失败:', error)
      throw error
    }
  }

  // 获取分支差异
  async getBranchDiff(currentBranch: string, targetBranch: string): Promise<CommitInfo[]> {
    try {
      const result = await window.electronAPI.git.getBranchDiff({
        repoPath: this.repoPath,
        currentBranch,
        targetBranch
      })
      if (!result.success) {
        throw new Error(result.error || '获取分支差异失败')
      }
      return result.data
    } catch (error) {
      console.error('获取分支差异失败:', error)
      throw error
    }
  }

  // 切换分支
  async checkoutBranch(branchName: string): Promise<void> {
    try {
      const result = await window.electronAPI.git.checkoutBranch({
        repoPath: this.repoPath,
        branchName
      })
      if (!result.success) {
        throw new Error(result.error || '切换分支失败')
      }
    } catch (error) {
      console.error('切换分支失败:', error)
      throw error
    }
  }

  // Cherry Pick 提交
  async cherryPick(commitHash: string): Promise<void> {
    try {
      const result = await window.electronAPI.git.cherryPick({
        repoPath: this.repoPath,
        commitHash
      })
      if (!result.success) {
        throw new Error(result.error || 'Cherry Pick 失败')
      }
    } catch (error) {
      console.error('Cherry Pick 失败:', error)
      throw error
    }
  }

  // 获取当前分支
  async getCurrentBranch(): Promise<string> {
    try {
      const result = await window.electronAPI.git.getCurrentBranch(this.repoPath)
      if (!result.success) {
        throw new Error(result.error || '获取当前分支失败')
      }
      return result.data || ''
    } catch (error) {
      console.error('获取当前分支失败:', error)
      throw error
    }
  }

  // 检查仓库状态
  async getStatus(): Promise<any> {
    try {
      const result = await window.electronAPI.git.getStatus(this.repoPath)
      if (!result.success) {
        throw new Error(result.error || '获取仓库状态失败')
      }
      return result.data
    } catch (error) {
      console.error('获取仓库状态失败:', error)
      throw error
    }
  }

  // 拉取远程更新
  async pull(): Promise<void> {
    try {
      const result = await window.electronAPI.git.pull(this.repoPath)
      if (!result.success) {
        throw new Error(result.error || '拉取远程更新失败')
      }
    } catch (error) {
      console.error('拉取远程更新失败:', error)
      throw error
    }
  }

  // 获取远程仓库信息
  async getRemoteInfo(): Promise<any> {
    try {
      const result = await window.electronAPI.git.getRemoteInfo(this.repoPath)
      if (!result.success) {
        throw new Error(result.error || '获取远程仓库信息失败')
      }
      return result.data
    } catch (error) {
      console.error('获取远程仓库信息失败:', error)
      throw error
    }
  }
}
