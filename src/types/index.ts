// Git 提交记录类型
export interface CommitInfo {
  hash: string
  message: string
  author: string
  date: string
}

// 分支信息类型
export interface BranchInfo {
  name: string
  current: boolean
  remote?: boolean
}

// 仓库设置类型
export interface RepositorySettings {
  repositoryPath: string
  gitlabToken: string
}

// 搜索条件类型
export interface SearchConditions {
  author?: string
  message?: string
  hash?: string
}

// 分页信息类型
export interface PaginationInfo {
  current: number
  pageSize: number
  total: number
}
