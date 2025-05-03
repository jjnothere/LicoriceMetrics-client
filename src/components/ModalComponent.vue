<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="close-button" @click="close">X</button>
      <h2>Campaign Groups</h2>
      <ul>
        <li v-for="group in campaignGroups" :key="group.id">
          <h3>
            <input type="checkbox" @change="toggleGroup(group)" :checked="isGroupChecked(group)" />
            {{ group.name }}
          </h3>
          <ul>
            <li v-for="campaign in group.campaigns" :key="campaign.id">
              <input type="checkbox" :checked="localSelectedCampaigns.includes(campaign.id)" @change="toggleCampaign(campaign.id)" />
              {{ campaign.name }}
            </li>
          </ul>
        </li>
      </ul>
      <div class="modal-buttons">
        <button class="modal-button" @click="close">Close</button>
        <button class="modal-button" @click="ok">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalComponent',
  props: {
    campaignGroups: {
      type: Array,
      required: true
    },
    selectedCampaigns: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      localSelectedCampaigns: [...this.selectedCampaigns] // Use a local data property to manage selected campaigns
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    ok() {
      this.$emit('update:selectedCampaigns', this.localSelectedCampaigns);
      this.$emit('campaignIdsEmitted', this.localSelectedCampaigns); // Emit the selected campaign IDs
      this.close();
    },
    toggleGroup(group) {
      const groupCampaignIds = group.campaigns.map(campaign => campaign.id);
      const allSelected = groupCampaignIds.every(id => this.localSelectedCampaigns.includes(id));
      if (allSelected) {
        this.localSelectedCampaigns = this.localSelectedCampaigns.filter(id => !groupCampaignIds.includes(id));
      } else {
        this.localSelectedCampaigns = [...new Set([...this.localSelectedCampaigns, ...groupCampaignIds])];
      }
    },
    toggleCampaign(campaignId) {
      if (this.localSelectedCampaigns.includes(campaignId)) {
        this.localSelectedCampaigns = this.localSelectedCampaigns.filter(id => id !== campaignId);
      } else {
        this.localSelectedCampaigns.push(campaignId);
      }
    },
    isGroupChecked(group) {
      const groupCampaignIds = group.campaigns.map(campaign => campaign.id);
      return groupCampaignIds.length > 0 && groupCampaignIds.every(id => this.localSelectedCampaigns.includes(id));
    }
  },
  watch: {
    selectedCampaigns: {
      handler(newVal) {
        this.localSelectedCampaigns = [...newVal]; // Sync local data property with prop
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
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
  z-index: 3;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 600px;
  max-height: 80%;
  overflow-y: auto;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal-button {
  padding: 10px 20px;
  background-color: #1C1B21;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
  transition: background-color 0.3s;
}

.modal-button:hover {
  background-color: #333;
}
</style>
