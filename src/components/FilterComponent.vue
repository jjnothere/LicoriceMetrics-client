<template>
  <div class="filter-container">
    <button class="filter-button">Budget/Bids</button>
    <button class="filter-button">Audience</button>
    <button class="filter-button">Obj/Loc/Lang</button>
    <button class="filter-button">Ad Type</button>
    <button class="filter-button">Status/Name</button>
    <button class="filter-button">Creatives</button>
    <button class="filter-button" @click="openModal">Select</button>
    <ModalComponent v-if="showModal" @close="closeModal" :campaignGroups="campaignGroups" :selectedCampaigns="selectedCampaigns" @update:selectedCampaigns="updateSelectedCampaigns" />
  </div>
</template>

<script>
import axios from 'axios';
import ModalComponent from './ModalComponent.vue';

export default {
  name: 'FilterComponent',
  components: {
    ModalComponent
  },
  data() {
    return {
      showModal: false,
      campaignGroups: [],
      selectedCampaigns: [] // Store selected campaigns
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
      } catch (error) {
        console.error('Error fetching campaign groups:', error);
      }
    },
    closeModal() {
      this.showModal = false;
    },
    updateSelectedCampaigns(newSelectedCampaigns) {
      this.selectedCampaigns = newSelectedCampaigns;
    }
  }
};
</script>

<style scoped>
.filter-container {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.filter-button {
  padding: 10px 20px;
  background-color: #F9F9F8; /* Match table header color */
  color: #1C1B21;
  border: 2px solid #1C1B21;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 16px;
  font-weight: bold;
}

.filter-button:hover {
  background-color: #E0E0E0; /* Slightly darker shade for hover effect */
}
</style>
