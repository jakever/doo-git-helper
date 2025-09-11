// Electron API 类型定义
export interface ElectronAPI {
  selectFolder: () => Promise<string | null>
  showMessage: (options: { type: 'info' | 'warning' | 'error', title?: string, message: string }) => Promise<void>
  git: {
    getBranches: (repoPath: string) => Promise<{ success: boolean, data?: any, error?: string }>
    getCommits: (params: { repoPath: string, branchName: string, limit?: number }) => Promise<{ success: boolean, data?: any, error?: string }>
    getBranchDiff: (params: { repoPath: string, currentBranch: string, targetBranch: string }) => Promise<{ success: boolean, data?: any, error?: string }>
    checkoutBranch: (params: { repoPath: string, branchName: string }) => Promise<{ success: boolean, error?: string }>
    cherryPick: (params: { repoPath: string, commitHash: string }) => Promise<{ success: boolean, error?: string }>
    getCurrentBranch: (repoPath: string) => Promise<{ success: boolean, data?: string, error?: string }>
    getStatus: (repoPath: string) => Promise<{ success: boolean, data?: any, error?: string }>
    pull: (repoPath: string) => Promise<{ success: boolean, error?: string }>
    getRemoteInfo: (repoPath: string) => Promise<{ success: boolean, data?: any, error?: string }>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}