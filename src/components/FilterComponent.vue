<template>
  <div class="filter-container">
    <div class="filter-buttons">
      <button class="filter-button" :class="{ active: isActive('all') }" @click="clearAll" style="--filter-color: black;">All Changes</button>
      <button class="filter-button" :class="{ active: isActive('budget') }" @click="toggleBudget" style="--filter-color: #6A9A1F;">Budget/Bids</button>
      <button class="filter-button" :class="{ active: isActive('audience') }" @click="toggleAudience" style="--filter-color: #F4C430;">Audience</button>
      <button class="filter-button" :class="{ active: isActive('objLocLang') }" @click="toggleObjLocLang" style="--filter-color: #8A2BE2;">Obj/Loc/Lang</button>
      <button class="filter-button" :class="{ active: isActive('adType') }" @click="toggleAdType" style="--filter-color: #154360;">Ad Type</button>
      <button class="filter-button" :class="{ active: isActive('nameStatus') }" @click="toggleNameStatus" style="--filter-color: #D32F2F;">Status/Name</button>
      <button class="filter-button" :class="{ active: isActive('creatives') }" @click="toggleCreatives" style="--filter-color: #5DADE2;">Creatives</button>
      <button class="filter-button" :class="{ active: isActive('select') }" @click="openModal" style="--filter-color: black;">Select</button>
      <button class="filter-button" @click="openSavePresetModal" style="--filter-color: green;">Save Preset</button>
      <select class="preset-dropdown" v-model="selectedPreset" @change="applyPreset">
        <option value="" disabled>Select Preset</option>
        <option v-for="preset in presets" :key="preset.name" :value="preset.name">
          {{ preset.name }}
        </option>
      </select>
    </div>
    <input
      type="text"
      class="search-input"
      v-model="searchText"
      placeholder="Search..."
      @input="emitSearchText"
    />
    <ModalComponent v-if="showModal" @close="closeModal" :campaignGroups="campaignGroups" :selectedCampaigns="selectedCampaigns" @update:selectedCampaigns="updateSelectedCampaigns" @campaignIdsEmitted="emitCampaignIds" />
    <!-- Save Preset Modal -->
    <div v-if="showSavePresetModal" class="modal-overlay" @click.self="closeSavePresetModal">
      <div class="modal-content">
        <h3>Save Preset</h3>
        <input
          type="text"
          v-model="newPresetName"
          placeholder="Enter preset name"
          class="preset-name-input"
        />
        <div class="existing-presets">
          <h4>Existing Presets ({{ presets.length }}/5)</h4>
          <ul>
            <li v-for="preset in presets" :key="preset.name">
              {{ preset.name }}
              <button class="icon-button" @click="deletePreset(preset.name)">
                <i class="fas fa-trash"></i>
              </button>
            </li>
          </ul>
        </div>
        <div class="modal-buttons">
          <button class="modal-button cancel" @click="closeSavePresetModal">Cancel</button>
          <button class="modal-button save" @click="savePreset">Save</button>
        </div>
      </div>
    </div>
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
      showSavePresetModal: false, // Control visibility of the save preset modal
      newPresetName: '', // Store the name of the new preset
      campaignGroups: [],
      selectedCampaigns: [], // Store selected campaigns
      searchText: '', // Store the search text
      presets: [], // Store presets
      selectedPreset: '', // Currently selected preset
      localActiveFilters: [...this.activeFilters], // Local copy of activeFilters
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
      this.searchText = ''; // Clear the search text
      this.selectedPreset = ''; // Reset the preset dropdown
      this.$emit('update:selectedCampaigns', this.selectedCampaigns);
      this.$emit('campaignIdsEmitted', this.selectedCampaigns);
      this.emitSearchText(); // Emit the cleared search text
    },
    isActive(filter) {
      return this.localActiveFilters.includes(filter); // Use localActiveFilters for UI updates
    },
    emitSearchText() {
      this.$emit('searchTextUpdated', this.searchText);
    },
    openSavePresetModal() {
      const hasNoFiltersOrOnlyAll =
        this.activeFilters.length === 0 ||
        (this.activeFilters.length === 1 && this.activeFilters.includes('all'));

      if (hasNoFiltersOrOnlyAll && !this.searchText.trim()) {
        alert('Please select your filters and/or enter a search term before saving a preset.');
        return;
      }

      // Allow opening the modal even if there are 5 presets
      this.newPresetName = '';
      this.showSavePresetModal = true;
    },
    closeSavePresetModal() {
      this.showSavePresetModal = false;
    },
    async savePreset() {
      // Prevent saving more than 5 presets
      if (this.presets.length >= 5) {
        alert('You have reached the maximum number of presets (5). Please delete one before saving a new preset.');
        return;
      }

      if (!this.newPresetName.trim()) {
        alert('Preset name cannot be empty.');
        return;
      }

      // Check for duplicate preset name
      if (this.presets.find(p => p.name.toLowerCase() === this.newPresetName.trim().toLowerCase())) {
        alert('A preset with this name already exists. Please use a different name.');
        return;
      }

      const hasNoFiltersOrOnlyAll =
        this.activeFilters.length === 0 ||
        (this.activeFilters.length === 1 && this.activeFilters.includes('all'));

      if (hasNoFiltersOrOnlyAll && !this.searchText.trim()) {
        alert('Please select your filters and/or enter a search term before saving a preset.');
        return;
      }

      try {
        const response = await axios.post('/api/save-preset', {
          name: this.newPresetName,
          filters: this.activeFilters,
          searchText: this.searchText,
          selectedCampaigns: this.selectedCampaigns,
          selectedCampaignIds: this.selectedCampaignIds
        }, { withCredentials: true });

        this.fetchPresets(); // Refresh the presets list
        this.selectedPreset = this.newPresetName;
        this.closeSavePresetModal(); // Close the modal
      } catch (error) {
        console.error('Error saving preset:', error);
        alert('Failed to save preset.');
      }
    },
    async deletePreset(presetName) {
      try {
        await axios.delete('/api/delete-preset', {
          data: { name: presetName },
          withCredentials: true
        });
        this.fetchPresets();
      } catch (error) {
        console.error('Error deleting preset:', error);
        alert('Failed to delete preset.');
      }
    },
    async fetchPresets() {
      try {
        const response = await axios.get('/api/get-presets', { withCredentials: true });
        this.presets = response.data;
      } catch (error) {
        console.error('Error fetching presets:', error);
      }
    },
    async applyPreset() {
      const preset = this.presets.find(p => p.name === this.selectedPreset);
      if (!preset) return;

      // 1) Clear all existing filters as if user clicked "All Changes"
      this.clearAll();

      // 2) Turn on each filter in the preset via its toggle method
      if (preset.filters.includes('budget')) {
        this.toggleBudget();
      }
      if (preset.filters.includes('audience')) {
        this.toggleAudience();
      }
      if (preset.filters.includes('objLocLang')) {
        this.toggleObjLocLang();
      }
      if (preset.filters.includes('adType')) {
        this.toggleAdType();
      }
      if (preset.filters.includes('nameStatus')) {
        this.toggleNameStatus();
      }
      if (preset.filters.includes('creatives')) {
        this.toggleCreatives();
      }

      // 3) Restore search text
      this.searchText = preset.searchText || '';
      this.emitSearchText();

      // 4) Restore campaign selection
      this.selectedCampaigns = preset.selectedCampaigns || [];
      this.$emit('update:selectedCampaigns', this.selectedCampaigns);
      this.$emit('campaignIdsEmitted', preset.selectedCampaignIds || []);

      // 5) Ensure the dropdown shows the correct preset
      this.selectedPreset = preset.name;
    },
  },
  watch: {
    activeFilters: {
      handler(newFilters) {
        this.localActiveFilters = [...newFilters]; // Sync localActiveFilters with prop
      },
      immediate: true,
    },
  },
  mounted() {
    this.fetchPresets(); // Fetch presets when the component is mounted
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

.preset-dropdown {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  font-size: 14px;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  text-align: center;
  box-sizing: border-box; /* Ensure padding is included in the width */
}

.preset-name-input {
  width: calc(100% - 0px); /* Adjust width to fit within the modal padding */
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box; /* Ensure padding is included in the width */
}

.existing-presets {
  margin-top: 20px;
  text-align: left;
}

.existing-presets h4 {
  margin-bottom: 10px;
}

.existing-presets ul {
  list-style: none;
  padding: 0;
}

.existing-presets li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #61bca8ff;
}

.icon-button:hover {
  color: #fff;
  background-color: #61bca8ff;
  border-radius: 5px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end; /* Align buttons to the lower right */
  margin-top: 20px;
}

.modal-button {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  border: 2px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

.modal-button.cancel {
  background-color: transparent;
  color: #333;
  border-color: #ccc;
  margin-right: 10px;
}

.modal-button.cancel:hover {
  background-color: #ccc;
  color: white;
}

.modal-button.save {
  background-color: #61bca8;
  color: white;
  border-color: #61bca8;
}

.modal-button.save:hover {
  background-color: white;
  color: #61bca8;
}
</style>
