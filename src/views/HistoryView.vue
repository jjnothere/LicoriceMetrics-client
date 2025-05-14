<template>
  <div class="history-view">
    <div v-if="loading" class="loading-indicator">Loading...</div>
    <div v-else>
      <!-- controls grid -->
      <div class="controls-grid">
        <div class="control-group control-start-date">
          <label for="start-date">Start Date</label>
          <VueDatePicker
            id="start-date"
            v-model="selectedStartDate"
            :max-date="selectedEndDate"
            type="date"
            format="MM/dd/yyyy"
            :clearable="false"
            :enable-time-picker="false"
          />
        </div>
        <div class="control-group control-end-date">
          <label for="end-date">End Date</label>
          <VueDatePicker
            id="end-date"
            v-model="selectedEndDate"
            :min-date="selectedStartDate"
            type="date"
            format="MM/dd/yyyy"
            :clearable="false"
            :enable-time-picker="false"
          />
        </div>
        <div class="control-group control-interval">
          <label for="interval">Interval</label>
          <select id="interval" v-model="selectedTimeInterval">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
        <div class="control-group control-metric1">
          <label for="metric1">Metric 1</label>
          <select id="metric1" v-model="selectedMetric1">
            <option
              v-for="metric in metricLabels"
              :key="metric.key"
              :value="metric.key"
            >{{ metric.label }}</option>
          </select>
        </div>
        <div class="control-group control-metric2">
          <label for="metric2">Metric 2</label>
          <select id="metric2" v-model="selectedMetric2">
            <option
              v-for="metric in metricLabels"
              :key="metric.key"
              :value="metric.key"
            >{{ metric.label }}</option>
          </select>
        </div>
      </div>

      <!-- chart + rest of page -->
      <div
        class="sticky-chart-container"
        ref="stickyContainer"
      >
        <button class="toggle-chart-button" @click="toggleChart">
          {{ isChartExpanded ? 'Collapse Chart' : 'Expand Chart' }}
          <i :class="isChartExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        </button>
        <!-- Use v-show to keep the chart mounted -->
        <div v-show="isChartExpanded" class="chart-content">
          <LineChartComponent
            :selectedAdAccountId="selectedAdAccountId"
            :selectedTimeInterval="selectedTimeInterval"
            :chartStartDate="dateRange.start"
            :chartEndDate="dateRange.end"
            :metric1="selectedMetric1"
            :metric2="selectedMetric2"
            :selectedCampaignIds="selectedCampaignIds"
            :differences="filteredDifferences"
          />
        </div>
      </div>

      <FilterComponent
        :selectedCampaignIds="selectedCampaignIds"
        :activeFilters="activeFilters"
        @campaignIdsEmitted="logCampaignIds"
        @toggleCreativesFilter="toggleCreativesFilter"
        @toggleBudgetFilter="toggleBudgetFilter"
        @toggleAdTypeFilter="toggleAdTypeFilter"
        @toggleAudienceFilter="toggleAudienceFilter"
        @toggleNameStatusFilter="toggleNameStatusFilter"
        @toggleObjLocLangFilter="toggleObjLocLangFilter"
        @clearAllFilters="clearAllFilters"
        :updateActiveFilters="updateActiveFilters"
        @searchTextUpdated="updateSearchText"
      />
      <HistoryTableComponent
        :differences="filteredDifferences"
        :dateRange="dateRange"
        :selectedAdAccountId="selectedAdAccountId"
        :activeFilters="activeFilters"
        :searchText="searchText"
        :urnInfoMap="urnInfoMap"
      />
    </div>
  </div>
</template>

<script>
import HistoryTableComponent from '../components/HistoryTableComponent.vue';
import LineChartComponent from '../components/LineChartComponent.vue';
import FilterComponent from '../components/FilterComponent.vue';
import { ref, onMounted, watch, computed, reactive } from 'vue';
import { useStore } from 'vuex';
import api from '../api'; // Corrected path
import { useAuth } from '../composables/auth';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { metricMapping } from '../constants/constants'; // Import metricMapping

export default {
  name: 'HistoryView',
  components: {
    HistoryTableComponent,
    LineChartComponent,
    VueDatePicker,
    FilterComponent
  },
  setup() {
    const store = useStore();
    const { isLoggedIn, checkAuthStatus, user } = useAuth();
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const selectedStartDate = ref(firstDayOfMonth);
    const selectedEndDate = ref(today);
    const selectedAdAccountId = computed(() => store.state.selectedAdAccountId); // Get from Vuex store
    const differences = ref([]);
    const urnInfoMap = ref({}); // Define urnInfoMap as a ref
    const campaignsMap = ref({});
    const selectedCampaigns = ref([]);
    const selectedCampaignIds = ref([]);
    const dateRange = ref({ start: selectedStartDate.value, end: selectedEndDate.value });
    const loading = ref(true);
    const selectedTimeInterval = ref('daily');
    const metrics = Object.keys(metricMapping); // Use keys from metricMapping
    const metricLabels = metrics.map(key => ({
      key,
      label: metricMapping[key]
    }));

    const selectedMetric1 = ref('clicks');
    const selectedMetric2 = ref('costInLocalCurrency');
    const campaignGroups = ref([]);
    const showCreativesOnly = ref(false); // State to track if creatives filter is active
    const showBudgetOnly = ref(false); // State to track if budget filter is active
    const showAdTypeOnly = ref(false); // State to track if ad type filter is active
    const showAudienceOnly = ref(false); // State to track if audience filter is active
    const showNameStatusOnly = ref(false); // State to track if name/status filter is active
    const showObjLocLangOnly = ref(false); // State to track if Obj/Loc/Lang filter is active
    const activeFilters = ref(['all']); // State to track active filters
    const searchText = ref(''); // State to track search text

    watch([selectedStartDate, selectedEndDate, selectedMetric1, selectedMetric2], () => {
      dateRange.value = { start: selectedStartDate.value, end: selectedEndDate.value };
    });

    // Removed getTokenFromCookies

    const fetchDifferences = async () => {
      try {
        const response = await api.get('/get-all-changes', {
          params: { adAccountId: selectedAdAccountId.value }
        });
        const { changes, urnInfoMap: fetchedUrnInfoMap } = response.data;
        urnInfoMap.value = fetchedUrnInfoMap || {}; // Initialize urnInfoMap
        differences.value = changes.reverse().map(change =>
          reactive({
            ...change,
            _id: typeof change._id === 'object' && change._id.$oid ? change._id.$oid : change._id,
            expandedChanges: change.expandedChanges || {}, // Initialize expandedChanges
            addingNote: false, // Initialize addingNote
            newNote: '' // Initialize newNote
          })
        );
      } catch (error) {
        console.error('Error fetching differences:', error);
      }
    };

    const checkForChanges = async () => {
      try {
        if (!user.userId) {
          console.error('User ID is not available');
          return;
        }
        await api.post('/check-for-changes', {
          adAccountId: selectedAdAccountId.value,
          userId: user.userId
        });
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
        const isSelectedCampaign = selectedCampaignIds.value.length === 0 || selectedCampaignIds.value.includes(diff.campaignId);

        // Define change types
        const isCreativeChange = diff.changes && Object.keys(diff.changes).some(key => ['creatives', 'creativeSelection', 'creativeRotation'].includes(key));
        const isBudgetChange = diff.changes && Object.keys(diff.changes).some(key => ['dailyBudget', 'unitCost', 'costType', 'pacingStrategy'].includes(key));
        const isAdTypeChange = diff.changes && Object.keys(diff.changes).some(key => ['format', 'type', 'campaignGroup'].includes(key));
        const isAudienceChange = diff.changes && Object.keys(diff.changes).some(key => ['targetingCriteria', 'audienceExpansionEnabled'].includes(key));
        const isNameStatusChange = diff.changes && Object.keys(diff.changes).some(key => ['status', 'name', 'campaignGroup'].includes(key));
        const isObjLocLangChange = diff.changes && Object.keys(diff.changes).some(key => ['objectiveType', 'location', 'language', 'locale'].includes(key));

        // Check if no type filters are active
        const noTypeFiltersActive =
          !showCreativesOnly.value &&
          !showBudgetOnly.value &&
          !showAdTypeOnly.value &&
          !showAudienceOnly.value &&
          !showNameStatusOnly.value &&
          !showObjLocLangOnly.value;

        // If type filters are active, check if diff matches at least one of them.
        const matchesAtLeastOneTypeFilter =
          (showCreativesOnly.value && isCreativeChange) ||
          (showBudgetOnly.value && isBudgetChange) ||
          (showAdTypeOnly.value && isAdTypeChange) ||
          (showAudienceOnly.value && isAudienceChange) ||
          (showNameStatusOnly.value && isNameStatusChange) ||
          (showObjLocLangOnly.value && isObjLocLangChange);

        // If no type filters are active, we treat it as "match all changes".
        const typeFilterCondition = noTypeFiltersActive || matchesAtLeastOneTypeFilter;

        return isWithinDateRange && isSelectedCampaign && typeFilterCondition;
      }).map(diff => {
        if (diff.changes && Array.isArray(diff.changes.creatives)) {
          diff.changes.creatives = diff.changes.creatives.map(creative => {
            return {
              ...creative
            };
          });
        }
        return diff;
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
        await checkForChanges();
        await fetchDifferences();
      }
    });

    const handleAdAccountChange = (newAdAccount) => {
      store.dispatch('updateSelectedAdAccountId', newAdAccount.id);
      fetchDifferences();
    };

    const logCampaignIds = (ids) => {
      selectedCampaignIds.value = ids;
    };

    const toggleCreativesFilter = () => {
      showCreativesOnly.value = !showCreativesOnly.value;
      updateActiveFilters('creatives', showCreativesOnly.value);
    };

    const toggleBudgetFilter = () => {
      showBudgetOnly.value = !showBudgetOnly.value;
      updateActiveFilters('budget', showBudgetOnly.value);
    };

    const toggleAdTypeFilter = () => {
      showAdTypeOnly.value = !showAdTypeOnly.value;
      updateActiveFilters('adType', showAdTypeOnly.value);
    };

    const toggleAudienceFilter = () => {
      showAudienceOnly.value = !showAudienceOnly.value;
      updateActiveFilters('audience', showAudienceOnly.value);
    };

    const toggleNameStatusFilter = () => {
      showNameStatusOnly.value = !showNameStatusOnly.value;
      updateActiveFilters('nameStatus', showNameStatusOnly.value);
    };

    const toggleObjLocLangFilter = () => {
      showObjLocLangOnly.value = !showObjLocLangOnly.value;
      updateActiveFilters('objLocLang', showObjLocLangOnly.value);
    };

    const clearAllFilters = () => {
      showCreativesOnly.value = false;
      showBudgetOnly.value = false;
      showAdTypeOnly.value = false;
      showAudienceOnly.value = false;
      showNameStatusOnly.value = false;
      showObjLocLangOnly.value = false;
      selectedCampaignIds.value = [];
      activeFilters.value = ['all'];
    };

    const updateActiveFilters = (filter, isActive) => {
      if (isActive) {
        activeFilters.value = activeFilters.value.filter(f => f !== 'all');
        if (!activeFilters.value.includes(filter)) {
          activeFilters.value.push(filter);
        }
      } else {
        activeFilters.value = activeFilters.value.filter(f => f !== filter);
        if (activeFilters.value.length === 0) {
          activeFilters.value = ['all'];
        }
      }
    };

    const updateSearchText = (text) => {
      searchText.value = text;
    };

    const stickyContainer = ref(null);

    onMounted(() => {
      window.addEventListener('scroll', () => {
        if (stickyContainer.value) {
          if (window.scrollY > stickyContainer.value.offsetTop) {
            stickyContainer.value.classList.add('scrolled');
          } else {
            stickyContainer.value.classList.remove('scrolled');
          }
        }
      });
    });

    const isChartExpanded = ref(true);

    const toggleChart = () => {
      isChartExpanded.value = !isChartExpanded.value;
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
      selectedTimeInterval,
      metrics,
      selectedMetric1,
      selectedMetric2,
      campaignGroups,
      logCampaignIds,
      selectedCampaignIds,
      toggleCreativesFilter, // Return the toggleCreativesFilter method
      toggleBudgetFilter, // Return the toggleBudgetFilter method
      toggleAdTypeFilter, // Return the toggleAdTypeFilter method
      toggleAudienceFilter, // Return the toggleAudienceFilter method
      toggleNameStatusFilter, // Return the toggleNameStatusFilter method
      toggleObjLocLangFilter, // Return the toggleObjLocLangFilter method
      clearAllFilters, // Return the clearAllFilters method
      activeFilters, // Return the activeFilters state
      updateActiveFilters, // Return the updateActiveFilters method
      searchText, // Return the searchText state
      updateSearchText, // Return the updateSearchText method
      urnInfoMap, // Return the urnInfoMap state
      metricLabels, // Return the metricLabels
      stickyContainer,
      isChartExpanded,
      toggleChart,
    };
  }
}
</script>

<style scoped>
.history-view {
  margin-top: 10px;
  padding: 15px 20px;
  background-color: #F9F9F8;
  border-radius: 20px;
  position: relative;
}
.history-view::before,
.history-view::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 20px;
  pointer-events: none;
}
.history-view::before {
  inset: 5px;
  border: 3px solid #BEBDBF;
}
.history-view::after {
  border: 3px solid #1C1B21;
}

.loading-indicator {
  text-align: center;
  font-size: 1.5em;
  color: #1C1B21;
  margin: 20px 0;
}

/* -------- controls grid -------- */
.controls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  grid-template-areas:
    "start-date end-date interval"
    "metric1    metric2    interval";
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-end;
}

.control-start-date  { grid-area: start-date; }
.control-end-date    { grid-area: end-date; }
.control-metric1     { grid-area: metric1; }
.control-metric2     { grid-area: metric2; }
.control-interval    { grid-area: interval; }

/* stack everything on mobile, interval last */
@media (max-width: 768px) {
  .controls-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      "start-date"
      "end-date"
      "metric1"
      "metric2"
      "interval";
  }
}

/* label + input/select styling */
.control-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
}

/* remove wrapper border, style only inner input */
.control-group .dp__main {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

/* style the actual date-picker <input> */
.control-group .dp__main input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
  box-sizing: border-box;
}

/* selects match same look */
.control-group select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  outline: none;
  box-sizing: border-box;
}

/* subtle focus state */
.control-group select:focus,
.control-group .dp__main input:focus {
  border-color: #888;
  box-shadow: 0 0 0 2px rgba(100,100,100,0.2);
}

/* chart container (unchanged) */
.sticky-chart-container {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: white;
  margin-bottom: 1rem;
}

.sticky-chart-container.scrolled {
  box-shadow: 0 6px 10px -4px rgba(0,0,0,0.25);
  border-bottom: 3px solid #ccc;
  margin-bottom: 1rem;
}

.toggle-chart-button {
  padding: 0.25rem .5rem;
  background-color: #ccc;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.toggle-chart-button:hover {
  background-color: #61bca8;
}
</style>