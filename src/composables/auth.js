import { ref, reactive } from 'vue';
import api from '../api';
import {jwtDecode} from 'jwt-decode'; // Corrected import

const isLoggedIn = ref(false);
const user = reactive({
  email: '',
  accountId: '',
  linkedinId: '',
  userId: ''
});

export const isTokenExpired = (token) => {
  const isJwt = (token) => token.split('.').length === 3;
  if (!isJwt(token)) {
    return false;
  }

  try {
    const decodedToken = jwtDecode(token);
    const { exp } = decodedToken;
    return Date.now() >= exp * 1000;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
}; //test

const getTokenFromCookies = () => {
  const cookie = document.cookie.split('; ').find((row) => row.startsWith('accessToken='));
  return cookie ? cookie.split('=')[1] : null;
};

const refreshAccessToken = async () => {
  try {
    // Request a new access token; server will set HttpOnly cookie
    await api.post('/refresh-token', {}, { withCredentials: true });
    return true;
  } catch (error) {
    // If 401 or missing refresh token => force login
    console.error('Error refreshing access token:', error);
    return false;
  }
};

export function useAuth() {
  const setAuth = (isAuthenticated) => {
    isLoggedIn.value = isAuthenticated;
  };

  const checkAuthStatus = async () => {
    try {
      // Attempt to get user profile; cookie sent automatically
      const response = await api.get('/user-profile', { withCredentials: true });
      user.email = response.data.email;
      user.accountId = response.data.accountId;
      user.linkedinId = response.data.linkedinId || user.linkedinId;
      user.userId = response.data.userId || user.userId;
      setAuth(true);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Missing/invalid refresh => force login
        setAuth(false);
      } else {
        console.error('Error retrieving user profile:', error);
        setAuth(false);
      }
    }
  };

  const setInitialAuthState = () => {
    checkAuthStatus();
  };

  return {
    isLoggedIn,
    user,
    setAuth,
    checkAuthStatus,
    setInitialAuthState
  };
}
