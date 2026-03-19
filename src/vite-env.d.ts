/// <reference types="vite/client" />

interface Window {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => void
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => void
    off: (channel: string, listener: (...args: any[]) => void) => void
    invoke: (channel: string, ...args: any[]) => Promise<any>
    executeCommand: (command: string) => Promise<{success: boolean, stdout?: string, stderr?: string, error?: string}>
    resizeWindow: (width: number, height: number) => Promise<void>
    // New capabilities
    readFile: (path: string) => Promise<{success: boolean, content?: string, error?: string}>
    writeFile: (path: string, content: string) => Promise<{success: boolean, error?: string}>
  }
}
