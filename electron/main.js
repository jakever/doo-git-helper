const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const { simpleGit } = require('simple-git')
// const isDev = process.env.NODE_ENV === 'development'

let mainWindow

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true, // 允许在渲染进程中使用 Node.js 的 API
			nodeIntegrationInWorker: true, // 允许在渲染进程中的 Web Worker 中使用 Node.js 的 API
			webSecurity: false, // 禁用 Web 安全功能
      contextIsolation: true, // 允许指定的预加载脚本
      enableRemoteModule: true, // 允许在渲染进程中使用 remote 模块
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/vite.svg'),
    title: 'GitLab 版本管理工具'
  })

  // 加载应用
  // if (isDev) {
    mainWindow.loadURL('http://localhost:5173') // 加载应用
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools()
  // } else {
  //   mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  // }

  // 当窗口被关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(createWindow)

// 当所有窗口都被关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 处理选择文件夹的 IPC 消息
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: '选择 Git 仓库根目录',
    message: '请选择包含 .git 文件夹的目录'
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

// 处理显示消息的 IPC 消息
ipcMain.handle('show-message', async (event, options) => {
  const { type, title, message } = options
  const dialogType = type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'
  
  await dialog.showMessageBox(mainWindow, {
    type: dialogType,
    title: title || '提示',
    message: message,
    buttons: ['确定']
  })
})

// Git 操作处理程序
ipcMain.handle('git-get-branches', async (event, repoPath) => {
  try {
    const git = simpleGit(repoPath)
    const branchSummary = await git.branch()
    const branches = []

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
    const remoteBranches = await git.branch(['-r'])
    Object.keys(remoteBranches.branches).forEach(branchName => {
      const branch = remoteBranches.branches[branchName]
      if (!branch.name.includes('HEAD')) {
        const localName = branch.name.replace('origin/', '')
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

    return { success: true, data: branches }
  } catch (error) {
    console.error('获取分支失败:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('git-get-commits', async (event, { repoPath, branchName, limit = 100 }) => {
  try {
    const git = simpleGit(repoPath)
    const log = await git.log({
      from: branchName,
      maxCount: limit
    })

    const commits = log.all.map(commit => ({
      hash: commit.hash,
      message: commit.message,
      author: commit.author_name,
      date: commit.date,
      timestamp: new Date(commit.date).getTime()
    }))

    return { success: true, data: commits }
  } catch (error) {
    console.error('获取提交记录失败:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('git-get-branch-diff', async (event, { repoPath, currentBranch, targetBranch }) => {
  try {
    const git = simpleGit(repoPath)
    const log = await git.log({
      from: targetBranch,
      to: currentBranch
    })

    const commits = log.all.map(commit => ({
      hash: commit.hash,
      message: commit.message,
      author: commit.author_name,
      date: commit.date,
      timestamp: new Date(commit.date).getTime()
    }))

    return { success: true, data: commits }
  } catch (error) {
    console.error('获取分支差异失败:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('git-checkout-branch', async (event, { repoPath, branchName }) => {
  try {
    const git = simpleGit(repoPath)
    await git.checkout(branchName)
    return { success: true }
  } catch (error) {
    console.error('切换分支失败:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('git-cherry-pick', async (event, { repoPath, commitHash }) => {
  try {
    const git = simpleGit(repoPath)
    await git.raw(['cherry-pick', commitHash])
    return { success: true }
  } catch (error) {
    console.error('Cherry Pick 失败:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('git-get-current-branch', async (event, repoPath) => {
  try {
    const git = simpleGit(repoPath)
    const status = await git.status()
    return { success: true, data: status.current || '' }
  } catch (error) {
    console.error('获取当前分支失败:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('git-get-status', async (event, repoPath) => {
  try {
    const git = simpleGit(repoPath)
    const status = await git.status()
    return { success: true, data: status }
  } catch (error) {
    console.error('获取仓库状态失败:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('git-pull', async (event, repoPath) => {
  try {
    const git = simpleGit(repoPath)
    await git.pull()
    return { success: true }
  } catch (error) {
    console.error('拉取远程更新失败:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('git-get-remote-info', async (event, repoPath) => {
  try {
    const git = simpleGit(repoPath)
    const remotes = await git.getRemotes(true)
    return { success: true, data: remotes }
  } catch (error) {
    console.error('获取远程仓库信息失败:', error)
    return { success: false, error: error.message }
  }
})
