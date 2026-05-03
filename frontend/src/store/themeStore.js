import { create } from 'zustand'

const useThemeStore = create((set) => ({
  theme: localStorage.getItem('taskflow-theme') || 'dark',
  
  toggle: () => set(state => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('taskflow-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme === 'dark' ? 'taskflow' : 'taskflow_light')
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return { theme: newTheme }
  })
}))

export default useThemeStore
