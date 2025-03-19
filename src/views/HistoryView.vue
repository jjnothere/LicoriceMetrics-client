<template>
  <div class="history-view">
    <div v-if="loading" class="loading-indicator">Loading...</div>
    <div v-else>
      <div class="time-interval-dropdown" style="text-align: right;">
        <select v-model="selectedTimeInterval">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>
      <LineChartComponent
        :selectedAdAccountId="selectedAdAccountId"
        :selectedTimeInterval="selectedTimeInterval"
        :chartStartDate="dateRange.start"
        :chartEndDate="dateRange.end"
      />
      <HistoryTableComponent
        :differences="filteredDifferences"
        :campaignsMap="campaignsMap"
        :selectedCampaigns="selectedCampaigns"
        :dateRange="dateRange"
        :selectedAdAccountId="selectedAdAccountId"
      />
    </div>
  </div>
</template>

<script>
import HistoryTableComponent from '../components/HistoryTableComponent.vue';
import LineChartComponent from '../components/LineChartComponent.vue';
import { ref, onMounted, watch, computed } from 'vue';
import { useStore } from 'vuex';
import api from '../api'; // Corrected path
import { useAuth } from '../composables/auth';

export default {
  name: 'HistoryView',
  components: {
    HistoryTableComponent,
    LineChartComponent
  },
  setup() {
    const store = useStore();
    const { isLoggedIn, checkAuthStatus, user } = useAuth();
    const selectedStartDate = ref(new Date(2024, 4, 1)); // Temporarily set to 5-1-2024
    const selectedEndDate = ref(new Date(2025, 5, 1)); // Temporarily set to 8-1-2024
    const selectedAdAccountId = computed(() => store.state.selectedAdAccountId); // Get from Vuex store
    const differences = ref([]);
    const campaignsMap = ref({});
    const selectedCampaigns = ref([]);
    const dateRange = ref({ start: selectedStartDate.value, end: selectedEndDate.value });
    const loading = ref(true);
    const selectedTimeInterval = ref('daily');

    const getTokenFromCookies = () => {
      const cookie = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
      return cookie ? cookie.split('=')[1] : null;
    };


    const fetchDifferences = async () => {
      try {
        const token = getTokenFromCookies();
        if (!token) {
          console.error('No authorization token found');
          return;
        }
        const response = await api.get('/api/get-all-changes', {
          params: { adAccountId: selectedAdAccountId.value },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        differences.value = response.data.reverse().map(change => {
          if (change._id && typeof change._id === 'object' && change._id.$oid) {
            change._id = change._id.$oid;
          } else if (!change._id) {
            change._id = ObjectID().toHexString();
          }
          if (!change.expandedChanges) {
            change.expandedChanges = {};
          }
          return change;
        });
      } catch (error) {
        console.error('Error fetching differences:', error);
      }
    };

    const checkForChanges = async () => {
      try {
        const token = getTokenFromCookies();
        if (!token) {
          console.error('No authorization token found');
          return;
        }
        if (!user.linkedinId || !user.userId) {
          console.error('User LinkedIn ID or User ID is not available');
          return;
        }
        const response = await api.post('/api/check-for-changes', {
          adAccountId: selectedAdAccountId.value,
          linkedinId: user.linkedinId,
          userId: user.userId
        }, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        console.log('Changes checked and saved successfully:', response.data);
      } catch (error) {
        console.error('Error checking for changes:', error);
      }
    };

    const filteredDifferences = computed(() => {
      if (!dateRange.value.start || !dateRange.value.end) {
        console.error("Date range is not properly defined", dateRange.value);
        return differences.value;
      }

      return differences.value.filter(diff => {
        const diffDate = new Date(diff.date);
        const isWithinDateRange = diffDate >= new Date(dateRange.value.start) && diffDate <= new Date(dateRange.value.end);
        const selectedCampaignNames = selectedCampaigns.value.map(id => campaignsMap.value[id]);
        const isSelectedCampaign = selectedCampaigns.value.length === 0 || selectedCampaignNames.includes(diff.campaign);
        return isWithinDateRange && isSelectedCampaign;
      });
    });

    const setDefaultAdAccountId = () => {
      if (store.state.adAccounts && store.state.adAccounts.length > 0) {
        store.dispatch('updateSelectedAdAccountId', store.state.adAccounts[0].id);
      }
    };

    const initializeData = async () => {
      await checkAuthStatus();
      if (isLoggedIn.value) {
        if (!selectedAdAccountId.value) {
          setDefaultAdAccountId();
          await new Promise(resolve => {
            const unwatch = watch(selectedAdAccountId, (newId) => {
              if (newId) {
                unwatch();
                resolve();
              }
            });
          });
        }
        await checkForChanges();
        await fetchDifferences();
      }
      loading.value = false;
    };

    onMounted(initializeData);

    watch(selectedAdAccountId, async (newAdAccountId) => {
      if (newAdAccountId) {
        if (user.value && user.value.accountId) {
          await checkForChanges();
        }
        await fetchDifferences();
      }
    });

    const handleAdAccountChange = (newAdAccount) => {
      store.dispatch('updateSelectedAdAccountId', newAdAccount.id);
      fetchDifferences();
    };

    return {
      selectedStartDate,
      selectedEndDate,
      handleAdAccountChange,
      filteredDifferences,
      campaignsMap,
      selectedCampaigns,
      dateRange,
      selectedAdAccountId,
      loading,
      selectedTimeInterval
    };
  }
}
</script>

<style scoped>
.history-view {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  padding: 5px 20px;
  border-radius: 8px;
  position: relative;
  padding: 15px;
  background-color: #F9F9F8;
  border-radius: 20px;
}

.history-view::before,
.history-view::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  pointer-events: none;
}

.history-view::before {
  border: 3px solid #BEBDBF;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.history-view::after {
  border: 3px solid #1C1B21;
}

.loading-indicator {
  text-align: center;
  font-size: 1.5em;
  color: #1C1B21;
  margin-top: 20px;
}
</style>