<template>
  <div class="campaign-filter-container">
    <button
      class="filter-button"
      :class="{ active: selectedCampaigns.length > 0 }"
      @click="openModal"
      style="--filter-color: #61bca8;"
    >
      Campaign Filter
    </button>
    <select class="preset-dropdown" v-model="selectedPreset" @change="applyPreset">
      <option value="" disabled>Saved Campaign Filters</option>
      <option v-for="preset in presets" :key="preset.name" :value="preset.name">
        {{ preset.name }}
      </option>
    </select>

    <!-- Campaign Selection Modal -->
    <ModalComponent
      v-if="showModal"
      @close="closeModal"
      :campaignGroups="campaignGroups"
      :selectedCampaigns="selectedCampaigns"
      @update:selectedCampaigns="updateSelectedCampaigns"
      @campaignIdsEmitted="emitCampaignIds"
      @openSavePresetModal="openSavePresetModal"
    />

    <!-- Save Preset Modal -->
    <div v-if="showSavePresetModal" class="modal-overlay" @click.self="closeSavePresetModal">
      <div class="modal-content">
        <h3>Save Campaign Filter</h3>
        <input
          type="text"
          v-model="newPresetName"
          placeholder="Enter filter name"
          class="preset-name-input"
        />
        <div class="existing-presets">
          <h4>Existing Filters ({{ presets.length }}/5)</h4>
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
import api from '../api';
import ModalComponent from './ModalComponent.vue';

export default {
  name: 'CampaignFilterComponent',
  components: {
    ModalComponent
  },
  data() {
    return {
      showModal: false,
      showSavePresetModal: false,
      newPresetName: '',
      campaignGroups: [],
      selectedCampaigns: [],
      presets: [],
      selectedPreset: ''
    };
  },
  methods: {
    async openModal() {
      try {
        const response = await api.get('/linkedin/linkedin-ad-campaign-groups', {
          params: { accountId: this.$store.state.selectedAdAccountId },
          withCredentials: true
        });
        this.campaignGroups = response.data;
        this.showModal = true;
      } catch (error) {
        console.error('Error fetching campaign groups:', error);
      }
    },
    closeModal() {
      this.showModal = false;
    },
    updateSelectedCampaigns(newSelectedCampaigns) {
      this.selectedCampaigns = newSelectedCampaigns;
    },
    emitCampaignIds(ids) {
      this.$emit('campaignIdsEmitted', ids);
    },
    openSavePresetModal() {
      // Allow any existing selection to be saved
      this.newPresetName = '';
      this.showSavePresetModal = true;
    },
    closeSavePresetModal() {
      this.showSavePresetModal = false;
    },
    async savePreset() {
      // Example limit: 5 presets
      if (this.presets.length >= 5) {
        alert('You have reached the maximum number of filters (5). Please delete one before saving a new filter.');
        return;
      }

      if (!this.newPresetName.trim()) {
        alert('Preset name cannot be empty.');
        return;
      }

      // Check for duplicates
      if (this.presets.find(p => p.name.toLowerCase() === this.newPresetName.trim().toLowerCase())) {
        alert('A filter with this name already exists. Please use a different name.');
        return;
      }

      try {
        await api.post(
          '/save-preset',
          {
            name: this.newPresetName,
            selectedCampaigns: this.selectedCampaigns
          },
          { withCredentials: true }
        );

        await this.fetchPresets();
        this.selectedPreset = this.newPresetName;
        this.closeSavePresetModal();
      } catch (error) {
        console.error('Error saving filter:', error);
        alert('Failed to save filter.');
      }
    },
    async deletePreset(presetName) {
      try {
        await api.delete('/delete-preset', {
          data: { name: presetName },
          withCredentials: true
        });
        this.fetchPresets();
      } catch (error) {
        console.error('Error deleting filter:', error);
        alert('Failed to delete filter.');
      }
    },
    async fetchPresets() {
      try {
        const response = await api.get('/get-presets', { withCredentials: true });
        this.presets = response.data;
      } catch (error) {
        console.error('Error fetching presets:', error);
      }
    },
    applyPreset() {
      const preset = this.presets.find(p => p.name === this.selectedPreset);
      if (!preset) return;
      this.selectedCampaigns = preset.selectedCampaigns || [];
      const finalIds = (preset.selectedCampaignIds && preset.selectedCampaignIds.length)
        ? preset.selectedCampaignIds
        : this.selectedCampaigns;

      this.$emit('update:selectedCampaigns', this.selectedCampaigns);
      this.$emit('campaignIdsEmitted', finalIds);
      this.selectedPreset = preset.name;
    }
  },
  mounted() {
    this.fetchPresets();
  }
};
</script>

<style scoped>
.campaign-filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
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

.filter-button.active,
.filter-button:hover {
  background-color: var(--filter-color);
  color: white;
}

.preset-dropdown {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  font-size: 14px;
  background-color: white;
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
  box-sizing: border-box;
  text-align: center;
}

.preset-name-input {
  width: calc(100% - 0px);
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
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
  justify-content: flex-end;
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
