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
    </div>
    <input
      type="text"
      class="search-input"
      v-model="searchText"
      placeholder="Search log..."
      @input="emitSearchText"
    />
  </div>
</template>

<script>
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
  data() {
    return {
      searchText: '', // Store the search text
      localActiveFilters: [...this.activeFilters], // Local copy of activeFilters
    };
  },
  methods: {
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
      this.searchText = ''; // Clear the search text
      this.emitSearchText(); // Emit the cleared search text
    },
    isActive(filter) {
      return this.localActiveFilters.includes(filter); // Use localActiveFilters for UI updates
    },
    emitSearchText() {
      this.$emit('searchTextUpdated', this.searchText);
    }
  },
  watch: {
    activeFilters: {
      handler(newFilters) {
        this.localActiveFilters = [...newFilters]; // Sync localActiveFilters with prop
      },
      immediate: true,
    },
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
  margin-top: 5px;
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
    margin-top: 5px;
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
