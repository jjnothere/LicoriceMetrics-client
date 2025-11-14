import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/auth';
import { usePostHog } from '../composables/usePostHog';
import IndexView from '../views/IndexView.vue';
import HistoryView from '../views/HistoryView.vue';
import ProfileView from '../views/ProfileView.vue';

const routes = [
  {
    path: '/',
    name: 'Index',
    component: IndexView
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryView
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});


const { posthog } = usePostHog();

// Track route changes
router.afterEach((to) => {
  if (posthog) {
    posthog.capture('$pageview', {
      path: to.fullPath,
      name: to.name,
    });
  }
});

router.beforeEach((to, from, next) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn.value && to.name !== 'Index') {
    next({ name: 'Index' });
  } else {
    next();
  }
});

export default router;