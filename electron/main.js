const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

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
      contextIsolation: false, // 允许指定的预加载脚本
      enableRemoteModule: false, // 允许在渲染进程中使用 remote 模块
    },
    icon: path.join(__dirname, '../public/vite.svg'),
    title: 'GitLab 版本管理工具'
  })

  // 加载应用
  // if (isDev) {
    mainWindow.loadURL('http://localhost:5174') // 修改为 webpack 的端口
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools()
  // } else {
    // mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
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