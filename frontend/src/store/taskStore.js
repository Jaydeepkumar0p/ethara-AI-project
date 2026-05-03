import { create } from 'zustand'
import api from '../utils/api'
import toast from 'react-hot-toast'

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  dashboardStats: null,

  fetchTasks: async (params = {}) => {
    set({ loading: true })
    try {
      const { data } = await api.get('/tasks', { params })
      set({ tasks: data.tasks, loading: false })
      return data
    } catch (err) {
      set({ loading: false })
      toast.error(err.response?.data?.message || 'Failed to load tasks')
      return null
    }
  },

  createTask: async (taskData) => {
    try {
      const { data } = await api.post('/tasks', taskData)
      set(state => ({ tasks: [data.task, ...state.tasks] }))
      toast.success('Task created ✓')
      return data.task
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
      return null
    }
  },

  updateTask: async (id, updates) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, updates)
      set(state => ({
        tasks: state.tasks.map(t => t._id === id ? data.task : t)
      }))
      return data.task
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
      return null
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`)
      set(state => ({ tasks: state.tasks.filter(t => t._id !== id) }))
      toast.success('Task deleted')
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
      return false
    }
  },

  fetchDashboardStats: async () => {
    try {
      const { data } = await api.get('/tasks/dashboard/stats')
      set({ dashboardStats: data })
      return data
    } catch {
      return null
    }
  },

  addComment: async (taskId, text) => {
    try {
      const { data } = await api.post(`/tasks/${taskId}/comments`, { text })
      set(state => ({
        tasks: state.tasks.map(t =>
          t._id === taskId ? { ...t, comments: data.comments } : t
        )
      }))
      return data.comments
    } catch (err) {
      toast.error('Failed to add comment')
      return null
    }
  }
}))

export default useTaskStore
