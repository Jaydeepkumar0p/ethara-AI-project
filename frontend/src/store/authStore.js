import { create } from 'zustand'
import api from '../utils/api'
import toast from 'react-hot-toast'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('taskflow-user') || 'null'),
  token: localStorage.getItem('taskflow-token'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('taskflow-token', data.token)
      localStorage.setItem('taskflow-user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      toast.success(`Welcome back, ${data.user.name}! ⚡`)
      return true
    } catch (err) {
      set({ loading: false })
      toast.error(err.response?.data?.message || 'Login failed')
      return false
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role })
      localStorage.setItem('taskflow-token', data.token)
      localStorage.setItem('taskflow-user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      toast.success('Account created! Welcome to TaskFlow 🚀')
      return true
    } catch (err) {
      set({ loading: false })
      toast.error(err.response?.data?.message || 'Registration failed')
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('taskflow-token')
    localStorage.removeItem('taskflow-user')
    set({ user: null, token: null })
    toast.success('Logged out successfully')
  },

  updateProfile: async (updates) => {
    try {
      const { data } = await api.put('/auth/profile', updates)
      localStorage.setItem('taskflow-user', JSON.stringify(data.user))
      set({ user: data.user })
      toast.success('Profile updated')
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
      return false
    }
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get('/auth/me')
      localStorage.setItem('taskflow-user', JSON.stringify(data.user))
      set({ user: data.user })
    } catch {
      get().logout()
    }
  }
}))

export default useAuthStore
