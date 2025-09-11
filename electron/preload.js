const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件选择
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  // 显示消息
  showMessage: (options) => ipcRenderer.invoke('show-message', options),
  
  // Git 操作
  git: {
    getBranches: (repoPath) => ipcRenderer.invoke('git-get-branches', repoPath),
    getCommits: (params) => ipcRenderer.invoke('git-get-commits', params),
    getBranchDiff: (params) => ipcRenderer.invoke('git-get-branch-diff', params),
    checkoutBranch: (params) => ipcRenderer.invoke('git-checkout-branch', params),
    cherryPick: (params) => ipcRenderer.invoke('git-cherry-pick', params),
    getCurrentBranch: (repoPath) => ipcRenderer.invoke('git-get-current-branch', repoPath),
    getStatus: (repoPath) => ipcRenderer.invoke('git-get-status', repoPath),
    pull: (repoPath) => ipcRenderer.invoke('git-pull', repoPath),
    getRemoteInfo: (repoPath) => ipcRenderer.invoke('git-get-remote-info', repoPath)
  }
})