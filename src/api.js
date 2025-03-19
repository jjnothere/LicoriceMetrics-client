import axios from 'axios'
import { useAuth } from './composables/auth'

// Create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true // important for sending cookies
})

// Flag to indicate if a refresh is in progress
let isRefreshing = false
// Queue requests while refreshing token
let refreshSubscribers = []

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb())
  refreshSubscribers = []
}

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error
    const auth = useAuth()

    if (response && response.status === 401) {
      const originalRequest = error.config

      // If a refresh is already in progress, subscribe and wait
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(api(originalRequest))
          })
        })
      }

      // No refresh in progress, attempt to refresh
      isRefreshing = true
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/refresh-token`,
          {},
          { withCredentials: true }
        )

        isRefreshing = false
        onRefreshed() // notify all subscribers that refresh is done

        // Retry the original request now that we (hopefully) have a fresh token
        return api(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        console.error('Refresh token failed:', refreshError)

        // Refresh failed, log the user out
        auth.setAuth(false)
        // Clear cookies
        document.cookie = 'accessToken=; Max-Age=0'
        document.cookie = 'refreshToken=; Max-Age=0'
        // Optionally redirect to login
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
