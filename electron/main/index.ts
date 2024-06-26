import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import path from "node:path"
import os from "node:os"
import fs from "node:fs"
import ffmpeg from "fluent-ffmpeg"
import ffmpegPath from "ffmpeg-static"
import fsPromises from "node:fs/promises"
import { BrowserWindow, app, ipcMain, shell, Menu, dialog } from "electron"

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..")

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron")
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist")
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT, "public")
    : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1"))
    app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === "win32")
    app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, "../preload/index.mjs")
const indexHtml = path.join(RENDERER_DIST, "index.html")

async function createWindow() {
    Menu.setApplicationMenu(null)
    win = new BrowserWindow({
        title: "视频转音频",
        icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
        webPreferences: {
            preload,
            // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
            // nodeIntegration: true,

            // Consider using contextBridge.exposeInMainWorld
            // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
            // contextIsolation: false,
        },
    })

    if (VITE_DEV_SERVER_URL) { // #298
        win.loadURL(VITE_DEV_SERVER_URL)
        // Open devTool if the app is not packaged
        win.webContents.openDevTools()
    }
    else {
        win.loadFile(indexHtml)
    }

    // Test actively push message to the Electron-Renderer
    win.webContents.on("did-finish-load", () => {
        win?.webContents.send("main-process-message", new Date().toLocaleString())
    })

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith("https:"))
            shell.openExternal(url)
        return { action: "deny" }
    })
    // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
    win = null
    if (process.platform !== "darwin")
        app.quit()
})

app.on("second-instance", () => {
    if (win) {
    // Focus on the main window if the user tried to open another
        if (win.isMinimized())
            win.restore()
        win.focus()
    }
})

app.on("activate", () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
        allWindows[0].focus()
    }
    else {
        createWindow()
    }
})

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    if (VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
    }
    else {
        childWindow.loadFile(indexHtml, { hash: arg })
    }
})

let inputPath, outputPath, files
// Select file input path
ipcMain.handle("select-file-input-path", async (_, arg) => {
    const result = await dialog.showOpenDialog(win, {
        properties: ["openFile", "multiSelections", "showHiddenFiles", "createDirectory"],
        filters: [
            { name: "Movies", extensions: ["mkv", "avi", "mp4"] },
        ]
    })
    if (!result.canceled) {
        files = result.filePaths
        return result.filePaths.map((item) => {
            const pathArray = item.replace(/\\/g, "/").split("/")
            const list = {
                name: pathArray.pop(),
                path: pathArray.join("/")
            }
            if (!inputPath) {
                inputPath = list.path
            }
            return list
        })
    }
})

// Select folder input path
ipcMain.handle("select-folder-input-path", async (_, arg) => {
    const result = await dialog.showOpenDialog(win, {
        properties: ["openDirectory", "showHiddenFiles", "createDirectory"],
    })
    if (!result.canceled) {
        try {
            const path = result.filePaths[0]
            inputPath = path
            const list = await fsPromises.readdir(path)
            files = list
            return { 
                path, 
                files: list.map((name) => {
                    return { name }
                })
            }
        } catch (error) {
            return error
        }
    }
})

// Select file output path
ipcMain.handle("select-output-path", async (_, arg) => {
    const result = await dialog.showOpenDialog(win, {
        properties: ["openDirectory", "showHiddenFiles", "createDirectory"],
    })
    if (!result.canceled) {
        outputPath = result.filePaths[0]
        return result.filePaths[0]
    }
})

// Video to Audio
ipcMain.on("video2audio", async (event, arg) => {
    // 确保 ffmpeg 可执行文件路径设置正确
    ffmpeg.setFfmpegPath(ffmpegPath)
    // 没设置输出路径，默认使用输入路径
    if (!outputPath) {
        outputPath = inputPath
    }
    // 创建输出目录（如果不存在）
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true })
    }

    Promise.all(files.map((file: string) => formatConversion(file, event)))
        .then(() => {
            event.reply("video2audio-finished", true)
        })
        .catch((error) => {
            event.reply("video2audio-finished", false)
        })
})

function formatConversion(file: string, event: Electron.IpcMainEvent) {
    return new Promise((resolve) => {
        const baseName = path.basename(file) // 带扩展名 a.mp4
        const extension = path.extname(file) // 扩展名 .mp4
        const fileName = path.basename(baseName, extension) // 不带扩展名 a
        ffmpeg(inputPath + "/" + file)
            .toFormat("mp3")
            .on("end", () => {
                event.reply('video2audio-progress', baseName)
                resolve(true)
            })
            .save(`${outputPath}/${fileName}.mp3`)
    })
}
