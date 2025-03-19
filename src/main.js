import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { useAuth } from './composables/auth';
import store from './store'; // Assuming you have a Vuex store
import '@fortawesome/fontawesome-free/css/all.css'; // Import Font Awesome CSS

const { checkAuthStatus } = useAuth();

async function init() {
  await checkAuthStatus(); // Ensure auth status is checked before creating the app

  const app = createApp(App);
  app.use(router);
  app.use(store); // Assuming you have a Vuex store
  app.mount('#app');
}

init();
