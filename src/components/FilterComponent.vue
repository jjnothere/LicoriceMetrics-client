<template>
  <div class="filter-container">
    <div class="filter-buttons">
      <button class="filter-button" :class="{ active: isActive('all') }" @click="clearAll" style="--filter-color: black;">All Changes</button>
      <button class="filter-button" :class="{ active: isActive('budget') }" @click="toggleBudget" style="--filter-color: #32CD32;">Budget/Bids</button>
      <button class="filter-button" :class="{ active: isActive('audience') }" @click="toggleAudience" style="--filter-color: #FFD700;">Audience</button>
      <button class="filter-button" :class="{ active: isActive('objLocLang') }" @click="toggleObjLocLang" style="--filter-color: #800080;">Obj/Loc/Lang</button>
      <button class="filter-button" :class="{ active: isActive('adType') }" @click="toggleAdType" style="--filter-color: #87CEFA;">Ad Type</button>
      <button class="filter-button" :class="{ active: isActive('nameStatus') }" @click="toggleNameStatus" style="--filter-color: #FF4500;">Status/Name</button>
      <button class="filter-button" :class="{ active: isActive('creatives') }" @click="toggleCreatives" style="--filter-color: #1E90FF;">Creatives</button>
      <button class="filter-button" :class="{ active: isActive('select') }" @click="openModal" style="--filter-color: black;">Select</button>
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
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-button {
  padding: 5px 10px;
  background-color: transparent;
  color: var(--filter-color);
  border: 2px solid var(--filter-color);
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  font-size: 16px;
  font-weight: bold;
}

.filter-button.active {
  background-color: var(--filter-color);
  color: white;
}

.filter-button:hover {
  background-color: var(--filter-color);
  color: white;
}

.search-input {
  flex-shrink: 0;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  font-size: 14px;
  width: 200px;
  margin-left: auto;
}

@media (max-width: 1179px) {
  .filter-container {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .filter-buttons {
    gap: 15px;
    width: 100%;
  }

  .filter-button {
    font-size: 14px;
    padding: 5px;
    flex: 1 1 calc(33.33% - 10px); /* Three buttons per row */
    max-width: calc(33.33% - 10px);
  }

  .search-input {
    margin-left: 0;
    margin-top: 10px; /* Add spacing below the buttons */
  }
}
</style>
