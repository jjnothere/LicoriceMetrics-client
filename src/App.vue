<template>
  <div id="app">
    <HeaderComponent @ad-account-changed="handleAdAccountChange" v-if="isLoggedIn" />
    <router-view />
  </div>
</template>

<script>
import { onMounted } from 'vue'; // Import onMounted
import HeaderComponent from './components/HeaderComponent.vue';
import { useAuth } from './composables/auth';
import { useStore } from 'vuex';

export default {
  name: 'App',
  components: {
    HeaderComponent
  },
  setup() {
    const { isLoggedIn, checkAuthStatus } = useAuth();
    const store = useStore();

    const handleAdAccountChange = (newAdAccount) => {
      store.dispatch('updateSelectedAdAccountId', newAdAccount.id);
    };

    onMounted(() => {
      checkAuthStatus();
    });

    return {
      isLoggedIn,
      handleAdAccountChange
    };
  }
}
</script>

<style>
/* Your existing styles remain the same */
</style>