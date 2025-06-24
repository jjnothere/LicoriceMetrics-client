<template>
  <div class="header">
    <header class="header-content">
      <h1 class="selected-ad-account">
        <span @click="toggleDropdown">
          {{ selectedAdAccount?.name || 'Select Ad Account' }}
        </span>
        <span class="caret">&#9662;</span>
        <router-link
          v-if="isProfilePage"
          to="/history"
          class="home-link"
        >
          Home
        </router-link>
      </h1>

      <nav class="nav-bar">
        <router-link to="/profile" class="user-link">Profile</router-link>
        <span class="separator">|</span>
        <div
          v-if="isLoggedInComputed"
          class="user-link logout-link"
          @click="logout"
        >
          Logout
        </div>
        <router-link v-else to="/" class="user-link">
          Login / Signup
        </router-link>
      </nav>
    </header>

    <div v-if="showDropdown" class="dropdown">
      <ul>
        <li
          v-for="account in adAccounts"
          :key="account.id"
          @click="selectAdAccount(account)"
        >
          {{ account.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../api';
import { useAuth } from '../composables/auth';
import { useStore } from 'vuex';

const store = useStore();
const adAccounts = ref([]);
const selectedAdAccount = ref(null);
const showDropdown = ref(false);
const { isLoggedIn, setAuth, checkAuthStatus, user } = useAuth();
const router = useRouter();
const route = useRoute();

const isLoggedInComputed = computed(() => isLoggedIn.value);
const isProfilePage = computed(() => route.path === '/profile');

const logout = async () => {
  try {
    await api.post('/logout', {}, { withCredentials: true });
    localStorage.removeItem('selectedAdAccountId');
    setAuth(false);
    user.email = '';
    user.accountId = '';
    router.push('/');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

const setDefaultAdAccount = () => {
  const savedId = localStorage.getItem('selectedAdAccountId');
  const found = adAccounts.value.find(acc => acc.id === savedId);

  if (found) {
    selectedAdAccount.value = found;
  } else if (adAccounts.value.length > 0) {
    selectedAdAccount.value = adAccounts.value[0];
  } else {
    console.warn('No ad accounts available.');
    return;
  }

  localStorage.setItem('selectedAdAccountId', selectedAdAccount.value.id);
  store.dispatch('updateSelectedAdAccountId', selectedAdAccount.value.id);
  emit('update:selectedAdAccount', selectedAdAccount.value.id);
};

const fetchAdAccountNames = async () => {
  try {
    const response = await api.get('/ad-account-name', { withCredentials: true });
    adAccounts.value = response.data.adAccounts;

    if (!selectedAdAccount.value) {
      setDefaultAdAccount();
    }
  } catch (error) {
    console.error('Error fetching ad account names:', error);
  }
};

const emit = defineEmits(['update:selectedAdAccount', 'ad-account-changed']); // Declare the events

const selectAdAccount = (account) => {
  if (selectedAdAccount.value?.id !== account.id) {
    selectedAdAccount.value = account;
    showDropdown.value = false;

    const accountId = account.id;
    localStorage.setItem('selectedAdAccountId', accountId);
    store.dispatch('updateSelectedAdAccountId', accountId);
    emit('update:selectedAdAccount', accountId);
    emit('ad-account-changed', account);
  }
};

const handleClickOutside = (event) => {
  const dropdownElement = document.querySelector('.dropdown');
  if (dropdownElement && !dropdownElement.contains(event.target)) {
    showDropdown.value = false;
  }
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
  emit('ad-account-changed', selectedAdAccount.value);
};

watchEffect(() => {
  if (!showDropdown.value) {
    document.removeEventListener('click', handleClickOutside);
  }
});

onMounted(async () => {
  await checkAuthStatus();
  if (isLoggedIn.value) {
    fetchAdAccountNames();
  }
});

</script>

<style scoped>
.header {
  position: relative;
  padding: 15px 20px;
  background-color: #F9F9F8;
  border-radius: 20px;
}

.header::before,
.header::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  pointer-events: none;
}
.header::before {
  inset: 5px;
  border: 3px solid #BEBDBF;
}
.header::after {
  border: 3px solid #1C1B21;
}

/* flex container for title + nav */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

/* Ad account title */
.selected-ad-account {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  font-size: 2em;
  color: #1C1B21;
  margin: 0;
}
.selected-ad-account span {
  cursor: pointer;
}
.caret {
  margin-left: 0.5rem;
  font-size: 0.8em;
}

/* “Home” pill */
.home-link {
  margin-left: 1rem;
  padding: 5px 10px;
  border: 2px solid #61bca8;
  border-radius: 20px;
  font-size: 0.75em;
  font-weight: bold;
  text-decoration: none;
  color: #1C1B21;
}
.home-link:hover {
  background-color: #e0e0e0;
}

/* Nav on the right */
.nav-bar {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}
.user-link {
  font-size: 0.9em;
  font-weight: bold;
  color: #1C1B21;
  text-decoration: none;
  cursor: pointer;
}
.user-link:hover {
  color: #61bca8;
  text-decoration: underline;
}
.separator {
  margin: 0 0.5rem;
  color: #888;
  font-weight: bold;
}

/* Dropdown */
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  margin-top: 0.5rem;
}
.dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.dropdown li {
  padding: 10px;
  cursor: pointer;
}
.dropdown li:hover {
  background: #f0f0f0;
}

/* Mobile: stack title + nav */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .selected-ad-account {
    font-size: 1.5em;
  }
  .nav-bar {
    width: 100%;
    justify-content: flex-start;
    gap: 0.5rem;
  }
}
</style>