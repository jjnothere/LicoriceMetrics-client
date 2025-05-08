<template>
    <div class="profile">
      <h2>Profile</h2>
      <div class="profile-info">
        <p><strong>First Name:</strong> {{ user.firstName }}</p>
        <p><strong>Last Name:</strong> {{ user.lastName }}</p>
      </div>
      <div class="ad-accounts">
        <p><strong>Ad Accounts:</strong></p>
        <ul>
          <li v-for="account in adAccounts" :key="account.id">
            Id: {{ account.id }} | Name: {{ account.name }}
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import api from '../api';
  import { useAuth } from '../composables/auth';
  
  // Authentication state and user profile details
  const { isLoggedIn, user, checkAuthStatus } = useAuth();
  const adAccounts = ref([]); // Store ad account IDs and names
  
  // Helper function to retrieve the token from cookies
  const getTokenFromCookies = () => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
    return cookie ? cookie.split('=')[1] : null;
  };
  
  // Fetch User Profile and Ad Account Names
  const fetchUserProfile = async () => {
    const token = getTokenFromCookies();
    try {
      const response = await api.get('/user-profile', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
  
      // Update user profile details
      user.firstName = response.data.firstName;
      user.lastName = response.data.lastName;
  
      // Fetch ad account names based on ad account IDs
      const accountsWithNames = await fetchAdAccountNames(response.data.adAccounts);
      adAccounts.value = accountsWithNames;
  
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  
  // Fetch Ad Account Names
  const fetchAdAccountNames = async (adAccounts) => {
    const token = getTokenFromCookies();
    try {
      const response = await api.get('/ad-account-name', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
  
      // Assuming response.data.adAccounts contains all the account data
      const accountNames = response.data.adAccounts.map(account => ({
        id: account.id,
        name: account.name || 'Unknown Account',
      }));
  
      return accountNames;
    } catch (error) {
      console.error('Error fetching ad account names:', error);
      return adAccounts.map(account => ({
        id: account.id,
        name: 'Unknown Account',
      }));
    }
  };
  
  // Lifecycle hook to check auth status and fetch profile if authenticated
  onMounted(() => {
    checkAuthStatus();
    if (isLoggedIn.value) {
      fetchUserProfile();
    }
  });
  </script>