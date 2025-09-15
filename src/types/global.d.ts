// 全局类型声明
declare global {
  const require: NodeRequire
  const __dirname: string
  const __filename: string
  const process: NodeJS.Process
  const global: typeof globalThis
}

export {}
