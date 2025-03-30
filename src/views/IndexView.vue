<template>
  <div class="index-view">
    <h1>Welcome to Licorice Metrics</h1>
    <p>Please log in to access your account.</p>
    <div class="auth-container">
      <div class="form-container">
        <h2>Login with LinkedIn</h2>
        <button @click="loginWithLinkedIn">Login with LinkedIn</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/auth';

const errorMessage = ref('');
const router = useRouter();
const { checkAuthStatus, isLoggedIn } = useAuth();


const loginWithLinkedIn = () => {
  const linkedInUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/linkedin`;
  window.location.href = linkedInUrl;
  console.log("🐒 ~ aalinkedInUrl:", linkedInUrl)
};

onMounted(async () => {
  await checkAuthStatus(); // Verifies authentication based on cookies

  if (isLoggedIn.value) {
    router.push('/history'); // Redirect if authenticated
  }
});
</script>

<script>
export default {
  name: 'IndexView',
}
</script>

<style scoped>
.index-view {
  text-align: center;
  margin-top: 50px;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.form-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
  text-align: center;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #61bca8ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: rgb(61, 120, 107);
}

.error-message {
  margin-top: 10px;
  border-radius: 8px;
  color: #ff4a4a;
  padding: 3px 0;
  cursor: default;
}

.error-message:hover {
  text-decoration: none;
}
</style>