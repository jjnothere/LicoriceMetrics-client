<template>
  <div class="header">
    <header>
      <h1 class="selected-ad-account">
        <span @click="toggleDropdown">{{ selectedAdAccount?.name || 'Select Ad Account' }}</span>
        <span class="caret">&#9662;</span>
        <router-link v-if="isProfilePage" to="/history" class="home-link">Home</router-link>
      </h1>
      <div v-if="showDropdown" class="dropdown">
        <ul>
          <li v-for="account in adAccounts" :key="account.id" @click="selectAdAccount(account)">
            {{ account.name }}
          </li>
        </ul>
      </div>
      <nav class="nav-bar">
        <div class="nav-user-actions">
          <router-link to="/profile" class="user-link">Profile</router-link>
          <span class="separator">|</span>
          <div v-if="isLoggedInComputed" class="user-link logout-link" @click="logout">Logout</div>
          <router-link v-else to="/" class="user-link">Login / Signup</router-link>
        </div>
      </nav>
    </header>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, watch } from 'vue';
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

const getTokenFromCookies = () => {
  const cookie = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
  return cookie ? cookie.split('=')[1] : null;
};

const logout = async () => {
  try {
    const token = getTokenFromCookies();
    if (!token) throw new Error("Authorization token is missing");

    await api.post('/api/logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });

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
  if (adAccounts.value.length > 0) {
    selectedAdAccount.value = adAccounts.value[0];
    localStorage.setItem('selectedAdAccountId', selectedAdAccount.value.id);
    store.dispatch('updateSelectedAdAccountId', selectedAdAccount.value.id);
    emit('update:selectedAdAccount', selectedAdAccount.value.id);
  } else {
    console.warn('No ad accounts available.');
  }
};

const fetchAdAccountNames = async () => {
  try {
    const response = await api.get('/api/ad-account-name', { withCredentials: true });
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

watchEffect(() => {
  checkAuthStatus();
  if (isLoggedIn.value) {
    fetchAdAccountNames();
  }
});

watch(isLoggedIn, (newIsLoggedIn) => {
  if (newIsLoggedIn) {
    fetchAdAccountNames();
  }
});
</script>

<style scoped>
/* Your existing styles remain the same */
header {
    display: flex;
}

.header {
  display: flex;
  flex-direction: column;
  padding: 5px 20px;
  border-radius: 8px;
  position: relative;
  padding: 15px;
  background-color: #F9F9F8;
  border-radius: 20px;
}

.header::before,
.header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  pointer-events: none;
}

.header::before {
  border: 3px solid #BEBDBF;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.header::after {
  border: 3px solid #1C1B21;
}

.selected-ad-account {
  font-size: 2em;
  color: #1C1B21;
  display: flex;
  align-items: center;
  margin: 0 0;
}

.selected-ad-account span {
  cursor: pointer;
}

.caret {
  margin-left: 10px;
  font-size: 0.8em;
}

.home-link {
  padding: 5px 10px;
  border: 2px solid #61bca8ff;
  text-decoration: none;
  font-weight: bold;
  color: #1C1B21;
  background-color: #f9f9f9;
  border-radius: 20px;
  margin-left: 10px;
  font-size: .5em;
}

.home-link:hover {
  background-color: #e0e0e0;
}

.dropdown {
  margin-top: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: absolute;
  z-index: 1000;
}

.dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown li {
  padding: 10px;
  cursor: pointer;
}

.dropdown li:hover {
  background-color: #f0f0f0;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.nav-user-actions {
  position: absolute;
  top: 15px;
  right: 20px;
  display: flex;
}

.user-link {
  text-decoration: none;
  font-weight: bold;
  color: #1C1B21;
  font-size: 0.9em;
  cursor: pointer;
}

.user-link:hover {
  text-decoration: underline;
  color: #61bca8ff;
}

.separator {
  margin: 0 10px;
  font-size: 0.9em;
  color: #888;
  font-weight: bold;
}

.logout-link {
  cursor: pointer;
}
</style>
