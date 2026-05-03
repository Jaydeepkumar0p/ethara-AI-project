import { create } from 'zustand'
import api from '../utils/api'
import toast from 'react-hot-toast'

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,

  fetchProjects: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get('/projects')
      set({ projects: data.projects, loading: false })
      return data.projects
    } catch (err) {
      set({ loading: false })
      toast.error('Failed to load projects')
      return []
    }
  },

  fetchProject: async (id) => {
    try {
      const { data } = await api.get(`/projects/${id}`)
      set({ currentProject: data.project })
      return data.project
    } catch (err) {
      toast.error('Project not found')
      return null
    }
  },

  createProject: async (projectData) => {
    try {
      const { data } = await api.post('/projects', projectData)
      set(state => ({ projects: [data.project, ...state.projects] }))
      toast.success('Project created! 🎯')
      return data.project
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project')
      return null
    }
  },

  updateProject: async (id, updates) => {
    try {
      const { data } = await api.put(`/projects/${id}`, updates)
      set(state => ({
        projects: state.projects.map(p => p._id === id ? data.project : p),
        currentProject: state.currentProject?._id === id ? data.project : state.currentProject
      }))
      toast.success('Project updated')
      return data.project
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
      return null
    }
  },

  deleteProject: async (id) => {
    try {
      await api.delete(`/projects/${id}`)
      set(state => ({
        projects: state.projects.filter(p => p._id !== id),
        currentProject: state.currentProject?._id === id ? null : state.currentProject
      }))
      toast.success('Project deleted')
      return true
    } catch (err) {
      toast.error('Delete failed')
      return false
    }
  },

  addMember: async (projectId, email, role = 'member') => {
    try {
      const { data } = await api.post(`/projects/${projectId}/members`, { email, role })
      set(state => ({
        projects: state.projects.map(p => p._id === projectId ? data.project : p),
        currentProject: state.currentProject?._id === projectId ? data.project : state.currentProject
      }))
      toast.success('Member added!')
      return data.project
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
      return null
    }
  },

  removeMember: async (projectId, userId) => {
    try {
      const { data } = await api.delete(`/projects/${projectId}/members/${userId}`)
      set(state => ({
        projects: state.projects.map(p => p._id === projectId ? data.project : p),
        currentProject: state.currentProject?._id === projectId ? data.project : state.currentProject
      }))
      toast.success('Member removed')
      return true
    } catch (err) {
      toast.error('Failed to remove member')
      return false
    }
  }
}))

export default useProjectStore
