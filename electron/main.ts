import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const execAsync = promisify(exec)

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null = null
let isQuitting = false;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  
  win = new BrowserWindow({
    width: 800,
    height: 100,
    x: (width - 800) / 2,
    y: height / 4,
    frame: false,
    transparent: true,
    resizable: false, 
    alwaysOnTop: true,
    skipTaskbar: true,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      win?.hide()
    }
    return false
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.whenReady().then(() => {
  createWindow()

  globalShortcut.register('Alt+Space', () => {
    if (win) {
      if (win.isVisible()) {
        win.hide()
      } else {
        win.show()
        win.focus()
        win.setSize(800, 500)
      }
    }
  })

  ipcMain.handle('hide-window', () => {
    if (win) {
      win.hide()
    }
  })

  ipcMain.handle('minimize-window', () => {
    if (win) {
      win.minimize()
    }
  })

  ipcMain.handle('maximize-window', () => {
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.handle('get-window-state', () => {
    if (win) {
      return {
        isMaximized: win.isMaximized(),
        isMinimized: win.isMinimized(),
        isVisible: win.isVisible()
      }
    }
    return {}
  })

  // IPC Handlers
  ipcMain.handle('execute-command', async (_, command: string) => {
    try {
      console.log(`Executing: ${command}`)
      const { stdout, stderr } = await execAsync(command)
      return { success: true, stdout, stderr }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
  
  ipcMain.handle('resize-window', (_, { width, height }) => {
    if (win) {
      win.setSize(width, height)
    }
  })

  // New File System handlers
  ipcMain.handle('read-file', async (_, filePath: string) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('write-file', async (_, { path: filePath, content }) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
})
