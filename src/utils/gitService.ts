import { simpleGit, SimpleGit } from 'simple-git'
import type { CommitInfo, BranchInfo } from '@/types'
import { useSettingsStore } from '@/stores/settings'
import dayjs from 'dayjs'

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

  // 清理已删除的远程分支引用
  async pruneRemoteBranches(): Promise<void> {
    try {
      await this.git.raw(['remote', 'prune', 'origin'])
    } catch (error) {
      console.error('清理远程分支引用失败:', error)
      throw error
    }
  }

  // 获取所有分支
  async getBranches(): Promise<BranchInfo[]> {
    try {
      await this.pruneRemoteBranches()
      
      const branchSummary = await this.git.branch()
      const branches: BranchInfo[] = []

      // 本地分支
      Object.keys(branchSummary.branches).forEach(branchName => {
        const branch = branchSummary.branches[branchName]
        branches.push({
          name: branch.name,
          current: branch.current,
          remote: branch.name.startsWith('remotes')
        })
      })

      console.log('所有分支：', branches)
      return branches
    } catch (error) {
      console.error('获取分支失败:', error)
      throw error
    }
  }

  // 获取当前分支提交记录
  async getCommits(branchName: string): Promise<CommitInfo[]> {
    try {
      const option = [
        `--after=${dayjs().subtract(6, 'month')
            .format('YYYY-MM-DD')}`
      ]
      if (branchName) {
          option.push(branchName)
      }
      const log = await this.git.log(option)

      return log.all.map(commit => ({
        ...commit,
        author: commit.author_name
      }))
    } catch (error) {
      console.error('获取提交记录失败:', error)
      throw error
    }
  }

  // 获取最新远程代码
  async fetchOrigin(currentBranch: string, targetBranch: string){
    await this.git.fetch([
        'origin',
        targetBranch.replace('remotes/origin/', ''),
        currentBranch
    ])
  }

  // 获取 Cherry Pick 差异
  async getCherryPickDiff(currentBranch: string, targetBranch: string){
    const { all: commits } = await this.git.log([
        '--cherry-pick',
        '--right-only',
        '--no-merges',
        `${targetBranch}...origin/${currentBranch}`
    ])
    return commits
  }

  // 获取差异
  async gitDiffs(currentBranch: string, targetBranch: string){
    return await this.getCherryPickDiff(currentBranch, targetBranch)
  }

  // 获取分支差异
  async getBranchDiff(currentBranch: string, targetBranch: string): Promise<CommitInfo[]> {
    try {
      // 获取当前分支中不存在于目标分支的提交
      await this.fetchOrigin(currentBranch, targetBranch)
      const data = await this.gitDiffs(currentBranch, targetBranch)

      return data.map(commit => ({
        ...commit,
        author: commit.author_name
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

  async isCleanConfirm(): Promise<boolean> {
    const data = await this.git.status()
    if (data.files.length) {
        return false
    }
    return true
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

  async getReset(branchName: string): Promise<void> {
    await this.git.reset([
      '--hard',
      `origin/${branchName}`
    ])
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