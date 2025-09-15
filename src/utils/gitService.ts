import { simpleGit, SimpleGit } from 'simple-git'
import type { CommitInfo, BranchInfo } from '@/types'
import { useSettingsStore } from '@/stores/settings'

export class GitService {
  private git: SimpleGit
  private settingsStore = useSettingsStore()

  constructor() {
    const repoPath = this.settingsStore.repositoryPath
    if (!repoPath) {
      throw new Error('请先设置仓库路径')
    }
    this.git = simpleGit(repoPath)
  }

  // 获取所有分支
  async getBranches(): Promise<BranchInfo[]> {
    try {
      const branchSummary = await this.git.branch()
      const branches: BranchInfo[] = []

      // 本地分支
      Object.keys(branchSummary.branches).forEach(branchName => {
        const branch = branchSummary.branches[branchName]
        branches.push({
          name: branch.name,
          current: branch.current,
          remote: false
        })
      })

      // 远程分支
      const remoteBranches = await this.git.branch(['-r'])
      Object.keys(remoteBranches.branches).forEach(branchName => {
        const branch = remoteBranches.branches[branchName]
        // 过滤掉 HEAD 引用
        if (!branch.name.includes('HEAD')) {
          const localName = branch.name.replace('origin/', '')
          // 检查是否已存在本地分支
          const exists = branches.some(b => b.name === localName)
          if (!exists) {
            branches.push({
              name: localName,
              current: false,
              remote: true
            })
          }
        }
      })

      return branches
    } catch (error) {
      console.error('获取分支失败:', error)
      throw error
    }
  }

  // 获取提交记录
  async getCommits(branchName: string, limit: number = 100): Promise<CommitInfo[]> {
    try {
      const log = await this.git.log({
        from: branchName,
        maxCount: limit
      })

      return log.all.map(commit => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        date: commit.date,
        timestamp: new Date(commit.date).getTime()
      }))
    } catch (error) {
      console.error('获取提交记录失败:', error)
      throw error
    }
  }

  // 获取分支差异
  async getBranchDiff(currentBranch: string, targetBranch: string): Promise<CommitInfo[]> {
    try {
      // 获取当前分支中不存在于目标分支的提交
      const log = await this.git.log({
        from: targetBranch,
        to: currentBranch
      })

      return log.all.map(commit => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        date: commit.date,
        timestamp: new Date(commit.date).getTime()
      }))
    } catch (error) {
      console.error('获取分支差异失败:', error)
      throw error
    }
  }

  // 切换分支
  async checkoutBranch(branchName: string): Promise<void> {
    try {
      await this.git.checkout(branchName)
    } catch (error) {
      console.error('切换分支失败:', error)
      throw error
    }
  }

  // Cherry Pick 提交
  async cherryPick(commitHash: string): Promise<void> {
    try {
      await this.git.raw(['cherry-pick', commitHash])
    } catch (error) {
      console.error('Cherry Pick 失败:', error)
      throw error
    }
  }

  // 获取当前分支
  async getCurrentBranch(): Promise<string> {
    try {
      const status = await this.git.status()
      return status.current || ''
    } catch (error) {
      console.error('获取当前分支失败:', error)
      throw error
    }
  }

  // 检查仓库状态
  async getStatus(): Promise<any> {
    try {
      return await this.git.status()
    } catch (error) {
      console.error('获取仓库状态失败:', error)
      throw error
    }
  }

  // 拉取远程更新
  async pull(): Promise<void> {
    try {
      await this.git.pull()
    } catch (error) {
      console.error('拉取远程更新失败:', error)
      throw error
    }
  }

  // 获取远程仓库信息
  async getRemoteInfo(): Promise<any> {
    try {
      const remotes = await this.git.getRemotes(true)
      return remotes
    } catch (error) {
      console.error('获取远程仓库信息失败:', error)
      throw error
    }
  }
}