<template>
  <div class="history-view">
    <div v-if="loading" class="loading-indicator">Loading...</div>
    <div v-else>
      <LineChartComponent :chart-data="chartData" :options="chartOptions" :chart-data-ready="chartDataReady" @point-clicked="scrollToChange" />
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
import LineChartComponent from '../components/LineChartComponent.vue';
import HistoryTableComponent from '../components/HistoryTableComponent.vue';
import { ref, onMounted, watch, computed } from 'vue';
import { useStore } from 'vuex';
import api from '../api'; // Corrected path
import { useAuth } from '../composables/auth';

export default {
  name: 'HistoryView',
  components: {
    LineChartComponent,
    HistoryTableComponent
  },
  setup() {
    const store = useStore();
    const { isLoggedIn, checkAuthStatus, user } = useAuth();
    const chartData = ref({});
    const chartOptions = ref({});
    const chartDataReady = ref(false);
    const selectedStartDate = ref(new Date(2024, 4, 1)); // Temporarily set to 5-1-2024
    const selectedEndDate = ref(new Date(2025, 5, 1)); // Temporarily set to 8-1-2024
    const selectedAdAccountId = computed(() => store.state.selectedAdAccountId); // Get from Vuex store
    const differences = ref([]);
    const campaignsMap = ref({});
    const selectedCampaigns = ref([]);
    const dateRange = ref({ start: selectedStartDate.value, end: selectedEndDate.value });
    const loading = ref(true);

    const getTokenFromCookies = () => {
      const cookie = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
      return cookie ? cookie.split('=')[1] : null;
    };

    const formatDate = (date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
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

    const aggregateData = (data, interval) => {
      const aggregatedData = {};

      data.forEach(item => {
        const date = new Date(item.dateRange.start.year, item.dateRange.start.month - 1, item.dateRange.start.day);
        let key;

        switch (interval) {
          case 'weekly':
            key = `${date.getFullYear()}-W${Math.ceil((date.getDate() - 1) / 7)}`;
            break;
          case 'monthly':
            key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            break;
          case 'quarterly':
            key = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
            break;
          case 'daily':
          default:
            key = formatDate(date);
            break;
        }

        if (!aggregatedData[key]) {
          aggregatedData[key] = {
            conversions: 0,
            clicks: 0,
            impressions: 0,
            spend: 0
          };
        }

        aggregatedData[key].conversions += item.externalWebsiteConversions || 0;
        aggregatedData[key].clicks += item.landingPageClicks || 0;
        aggregatedData[key].impressions += item.impressions || 0;
        aggregatedData[key].spend += parseFloat(item.costInLocalCurrency) || 0;
      });

      return aggregatedData;
    };

    const fetchMetrics = async (startDate, endDate) => {
      if (!isLoggedIn.value || !selectedAdAccountId.value) {
        console.error('User is not logged in or no ad account is selected');
        return;
      }

      try {
        const token = getTokenFromCookies();
        if (!token) throw new Error("No authorization token found");

        const params = {
          start: formatDate(startDate),
          end: formatDate(endDate),
          accountId: selectedAdAccountId.value,
          fields: 'clicks,impressions,externalWebsiteConversions,landingPageClicks,costInLocalCurrency'
        };

        const response = await api.get('/api/linkedin/chart-data', {
          params,
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });

        const data = response.data.elements.filter(item => {
          const itemStartDate = new Date(item.dateRange.start.year, item.dateRange.start.month - 1, item.dateRange.start.day);
          const itemEndDate = new Date(item.dateRange.end.year, item.dateRange.end.month - 1, item.dateRange.end.day);
          return (itemStartDate >= startDate && itemEndDate <= endDate);
        });

        const aggregatedData = aggregateData(data); // Define aggregatedData here

        const sortedDates = Object.keys(aggregatedData).sort((a, b) => new Date(a) - new Date(b));

        const pointBackgroundColors = sortedDates.map(date => {
          return filteredDifferences.value.some(diff => new Date(diff.date).toLocaleDateString() === new Date(date).toLocaleDateString()) ? 'red' : 'black';
        });

        chartData.value = {
          labels: sortedDates,
          datasets: [
            {
              label: 'Conversions',
              data: sortedDates.map(date => aggregatedData[date].conversions),
              borderColor: '#61bca8ff',
              fill: false,
              pointBackgroundColor: pointBackgroundColors
            },
            {
              label: 'Clicks',
              data: sortedDates.map(date => aggregatedData[date].clicks),
              borderColor: '#F3D287',
              fill: false,
              pointBackgroundColor: pointBackgroundColors
            },
            {
              label: 'Impressions',
              data: sortedDates.map(date => aggregatedData[date].impressions),
              borderColor: '#888',
              fill: false,
              pointBackgroundColor: pointBackgroundColors
            },
            {
              label: 'Spend',
              data: sortedDates.map(date => aggregatedData[date].spend),
              borderColor: '#1C1B21',
              fill: false,
              pointBackgroundColor: pointBackgroundColors
            }
          ]
        };

        chartOptions.value = {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              position: 'right',
              title: {
                display: true,
                text: 'Value'
              }
            }
          },
          plugins: {
            datalabels: false
          }
        };

        chartDataReady.value = true;
      } catch (error) {
        console.error('Error fetching metrics:', error);
        if (error.response && error.response.status === 404) {
          console.error('API endpoint not found:', error.response.config.url);
        }
      }
    };

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
        await fetchMetrics(selectedStartDate.value, selectedEndDate.value);
        await fetchDifferences();
      }
      loading.value = false;
    };

    onMounted(initializeData);

    watch([selectedStartDate, selectedEndDate], async ([newStartDate, newEndDate]) => {
      if (newStartDate > newEndDate) {
        alert('Start date cannot be later than end date. Please select a valid date range.');
      } else {
        await fetchMetrics(newStartDate, newEndDate);
      }
    });

    watch(selectedAdAccountId, async (newAdAccountId) => {
      if (newAdAccountId) {
        if (user.value && user.value.accountId) {
          await checkForChanges();
        }
        await fetchMetrics(selectedStartDate.value, selectedEndDate.value);
        await fetchDifferences();
      }
    });

    watch(filteredDifferences, async () => {
      await fetchMetrics(selectedStartDate.value, selectedEndDate.value);
    });


    const scrollToChange = (dateLabel) => {
      console.log("scrollToChange called with dateLabel:", dateLabel); // Add this log statement
      console.log("🐒 ~ dateLabel:", dateLabel);
      
      const adjustedDate = new Date(dateLabel);
      const adjustedLabelDate = adjustedDate.toISOString().split('T')[0];

      const matchingDifference = filteredDifferences.value.find(diff => {
        const diffDate = new Date(diff.date).toISOString().split('T')[0];
        return diffDate === adjustedLabelDate;
      });

      if (matchingDifference) {
        const changeRow = document.getElementById(`changeRow-${matchingDifference._id}`);
        if (changeRow) {
          changeRow.scrollIntoView({ behavior: 'smooth' });
          changeRow.classList.add('flash-row');
          setTimeout(() => {
            changeRow.classList.remove('flash-row');
          }, 3000);
        } else {
          console.error(`Element changeRow-${matchingDifference._id} not found`);
        }
      } else {
        console.warn('No matching difference found for adjusted date:', adjustedLabelDate);
      }
    };

    const handleAdAccountChange = (newAdAccount) => {
      store.dispatch('updateSelectedAdAccountId', newAdAccount.id);
      fetchMetrics(selectedStartDate.value, selectedEndDate.value);
      fetchDifferences();
    };

    return {
      chartData,
      chartOptions,
      chartDataReady,
      scrollToChange,
      selectedStartDate,
      selectedEndDate,
      handleAdAccountChange,
      filteredDifferences,
      campaignsMap,
      selectedCampaigns,
      dateRange,
      selectedAdAccountId,
      loading
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