<template>
  <div class="filter-container">
    <div class="filter-buttons">
      <button class="filter-button" :class="{ active: isActive('all') }" @click="clearAll">All Changes</button>
      <button class="filter-button" :class="{ active: isActive('budget') }" @click="toggleBudget">Budget/Bids</button>
      <button class="filter-button" :class="{ active: isActive('audience') }" @click="toggleAudience">Audience</button>
      <button class="filter-button" :class="{ active: isActive('objLocLang') }" @click="toggleObjLocLang">Obj/Loc/Lang</button>
      <button class="filter-button" :class="{ active: isActive('adType') }" @click="toggleAdType">Ad Type</button>
      <button class="filter-button" :class="{ active: isActive('nameStatus') }" @click="toggleNameStatus">Status/Name</button>
      <button class="filter-button" :class="{ active: isActive('creatives') }" @click="toggleCreatives">Creatives</button>
      <button class="filter-button" :class="{ active: isActive('select') }" @click="openModal">Select</button>
    </div>
    <input
      type="text"
      class="search-input"
      v-model="searchText"
      placeholder="Search..."
      @input="emitSearchText"
    />
    <ModalComponent v-if="showModal" @close="closeModal" :campaignGroups="campaignGroups" :selectedCampaigns="selectedCampaigns" @update:selectedCampaigns="updateSelectedCampaigns" @campaignIdsEmitted="emitCampaignIds" />
  </div>
</template>

<script>
import axios from 'axios';
import ModalComponent from './ModalComponent.vue';

export default {
  name: 'FilterComponent',
  props: {
    selectedCampaignIds: {
      type: Array,
      required: true
    },
    activeFilters: {
      type: Array,
      required: true
    },
    updateActiveFilters: {
      type: Function,
      required: true
    }
  },
  components: {
    ModalComponent
  },
  data() {
    return {
      showModal: false,
      campaignGroups: [],
      selectedCampaigns: [], // Store selected campaigns
      searchText: '' // Store the search text
    };
  },
  methods: {
    async openModal() {
      try {
        const response = await axios.get('/api/linkedin/linkedin-ad-campaign-groups', {
          params: { accountId: this.$store.state.selectedAdAccountId },
          withCredentials: true
        });
        this.campaignGroups = response.data;
        this.showModal = true;
        this.updateActiveFilters('select', true);
      } catch (error) {
        console.error('Error fetching campaign groups:', error);
      }
    },
    closeModal() {
      this.showModal = false;
      this.updateActiveFilters('select', this.selectedCampaigns.length > 0);
    },
    updateSelectedCampaigns(newSelectedCampaigns) {
      this.selectedCampaigns = newSelectedCampaigns;
      this.updateActiveFilters('select', this.selectedCampaigns.length > 0);
    },
    emitCampaignIds(ids) {
      this.$emit('campaignIdsEmitted', ids);
    },
    toggleCreatives() {
      this.$emit('toggleCreativesFilter');
    },
    toggleBudget() {
      this.$emit('toggleBudgetFilter');
    },
    toggleAdType() {
      this.$emit('toggleAdTypeFilter');
    },
    toggleAudience() {
      this.$emit('toggleAudienceFilter');
    },
    toggleNameStatus() {
      this.$emit('toggleNameStatusFilter');
    },
    toggleObjLocLang() {
      this.$emit('toggleObjLocLangFilter');
    },
    clearAll() {
      this.$emit('clearAllFilters');
      this.selectedCampaigns = [];
      this.$emit('update:selectedCampaigns', this.selectedCampaigns);
      this.$emit('campaignIdsEmitted', this.selectedCampaigns);
    },
    isActive(filter) {
      return this.activeFilters?.includes(filter); // Safely check if activeFilters includes the filter
    },
    emitSearchText() {
      this.$emit('searchTextUpdated', this.searchText);
    }
  }
};
</script>

<style scoped>
.filter-container {
  display: flex;
  justify-content: space-between; /* Align buttons to the left and search input to the right */
  align-items: center;
  gap: 10px; /* Add spacing between buttons and search input */
}

.filter-buttons {
  display: flex;
  flex-wrap: nowrap; /* Prevent buttons from wrapping to a new row */
}

.filter-button {
  padding: 5px 10px;
  background-color: #F9F9F8; /* Match table header color */
  color: #1C1B21;
  border: 2px solid #1C1B21;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
}

.filter-button.active {
  background-color: #61bca8ff; /* Highlight active filters */
  color: white;
}

.filter-button:hover {
  background-color: #E0E0E0; /* Slightly darker shade for hover effect */
}

.search-input {
  flex-shrink: 0; /* Prevent the search input from shrinking */
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  font-size: 14px;
  width: 200px;
  margin-left: auto; /* Push the search input to the right */
}
</style>
