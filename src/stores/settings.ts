import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RepositorySettings } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const repositoryPath = ref('')
  const gitlabToken = ref('')

  // 计算属性
  const settings = computed<RepositorySettings>(() => ({
    repositoryPath: repositoryPath.value,
    gitlabToken: gitlabToken.value
  }))

  // 方法
  const updateRepositoryPath = (path: string) => {
    repositoryPath.value = path
    saveSettings()
  }

  const updateGitlabToken = (token: string) => {
    gitlabToken.value = token
    saveSettings()
  }

  const saveSettings = () => {
    const settingsData = {
      repositoryPath: repositoryPath.value,
      gitlabToken: gitlabToken.value
    }
    localStorage.setItem('git-helper-settings', JSON.stringify(settingsData))
  }

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('git-helper-settings')
      if (saved) {
        const settingsData = JSON.parse(saved)
        repositoryPath.value = settingsData.repositoryPath || ''
        gitlabToken.value = settingsData.gitlabToken || ''
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  const resetSettings = () => {
    repositoryPath.value = ''
    gitlabToken.value = ''
    localStorage.removeItem('git-helper-settings')
  }

  return {
    repositoryPath,
    gitlabToken,
    settings,
    updateRepositoryPath,
    updateGitlabToken,
    saveSettings,
    loadSettings,
    resetSettings
  }
})
