import axios from 'axios'
import { useAuth } from './composables/auth'

// Create an axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: true
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error
    const auth = useAuth()

    if (response && response.status === 401) {
      // Avoid infinite loop if we're already on "/"
      if (window.location.pathname !== '/') {
        auth.setAuth(false)
        // Clear cookies
        document.cookie = 'accessToken=; Max-Age=0'
        document.cookie = 'refreshToken=; Max-Age=0'
        // Redirect to login
        window.location.href = '/'
      }
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default api
