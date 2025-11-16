import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { useAuth } from './composables/auth';
import store from './store'; // Assuming you have a Vuex store
import '@fortawesome/fontawesome-free/css/all.css'; // Import Font Awesome CSS

import posthog from 'posthog-js';

posthog.init('phc_NJi27xac5RdyUSUjCxdEvDiTDhMk1VFBe9LbL6ynRQs', {
  api_host: 'https://us.i.posthog.com',
  person_profiles: 'identified_only',
  defaults: '2025-05-24'
});

const { checkAuthStatus } = useAuth();

async function init() {
  await checkAuthStatus(); // Ensure auth status is checked before creating the app

  const app = createApp(App);
  app.use(router);
  app.use(store); // Assuming you have a Vuex store
  app.mount('#app');
}

init();
