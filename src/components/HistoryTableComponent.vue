<template>
  <div>
    <div class="export-button-container">
      <button class="export-button" @click="exportToCSV">Export to CSV</button>
    </div>
    <table v-if="filteredAndSearchedDifferences.length > 0">
      <thead>
        <tr>
          <th>Campaign Name</th>
          <th>Date</th>
          <th>Changes</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(difference) in filteredAndSearchedDifferences" :key="difference._id" :id="`changeRow-${formatDateForId(difference.date)}`">
          <td class="campaign-name">{{ difference.campaign }}</td>
          <td>{{ difference.date }}</td>
          <td>
            <div v-for="(changeValue, changeKey) in difference.changes" :key="difference._id + '-' + changeKey" class="change-item">
              <div class="change-header" @click="toggleChangeDetail(difference._id, changeKey)">
                <strong :style="{ color: getColorForChange(changeKey) }">
                  {{ keyMapping[changeKey] || changeKey }}
                </strong>
                <i :class="difference.expandedChanges?.[changeKey] ? 'fas fa-chevron-down' : 'fas fa-chevron-up'" class="chevron-icon"></i>
              </div>
              <div v-if="difference.expandedChanges?.[changeKey]" class="change-details">
                <div v-for="(entry) in getFormattedChanges(changeValue, difference.urnInfoMap)" :key="difference._id + '-' + changeKey + '-' + entry.key">
                  <span class="nested-key">{{ entry.key }}:</span>
                  <br />
                  <span class="nested-value">
                    <!-- If runSchedule and value is a string, format as a date -->
                    <template v-if="changeKey === 'runSchedule'">
                      <template v-if="Array.isArray(entry.value)">
                        <div v-for="(item, idx) in entry.value" :key="idx">
                          {{ formatRunSchedule(item) }}
                        </div>
                      </template>
                      <template v-else>
                        {{ formatRunSchedule(entry.value) }}
                      </template>
                    </template>
                    <!-- For non-runSchedule keys -->
                    <template v-else>
                      <template v-if="Array.isArray(entry.value)">
                        <!-- Print each array item on its own line -->
                        <ul class="list-container">
                          <li v-for="(item, idx) in entry.value" :key="idx" class="list-item">
                            {{ item }}
                          </li>
                        </ul>
                      </template>
                      <template v-else>
                        {{ entry.value }}
                      </template>
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </td>
          <!-- Notes Column in Table -->
          <td class="campaign-notes">
            <!-- Add Note Section -->
            <div v-if="difference.addingNote" class="note-input">
              <input v-model="difference.newNote" placeholder="Add a new note" @keyup.enter="saveNewNotePrompt(difference._id)" @keyup.esc="cancelAddNotePrompt(difference._id)" />
              <button class="icon-button" @click="saveNewNotePrompt(difference._id)">
                <i class="fas fa-save"></i>
              </button>
              <button class="icon-button" @click="cancelAddNotePrompt(difference._id)">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button v-else class="icon-button" @click="enableAddNotePrompt(difference._id)">
              <i class="fas fa-plus"></i> Add Note
            </button>
            <!-- Toggle button to expand/collapse notes -->
            <div v-if="difference.notes && difference.notes.length > 1">
              <button class="icon-button toggle-notes" @click="toggleNotes(difference._id)">
                <i :class="difference.showAllNotes ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                {{ difference.showAllNotes ? 'Show Less' : 'Show All Notes' }}
              </button>
            </div>
            <!-- Display Notes -->
            <div v-if="difference.showAllNotes">
              <div v-for="note in difference.notes.slice().reverse()" :key="difference._id + '-' + note._id" class="note">
                <small class="note-timestamp">{{ formatTimestamp(note.timestamp) }}</small>
                <!-- Edit Note Input -->
                <div v-if="note.isEditing" class="note-input">
                  <input v-model="note.newNote" @keyup.enter="saveNotePrompt(difference._id, note._id)" @keyup.esc="cancelEditMode(difference._id, note._id)" />
                  <button class="icon-button" @click="saveNotePrompt(difference._id, note._id)">
                    <i class="fas fa-save"></i>
                  </button>
                  <button class="icon-button" @click="cancelEditMode(difference._id, note._id)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <!-- Display Note Text and Action Buttons -->
                <div v-else>
                  <span>{{ note.note }}</span>
                  <div class="icon-buttons">
                    <button class="icon-button" @click="enableEditMode(difference._id, note._id)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-button" @click="deleteNotePrompt(difference._id, note._id)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="note-separator"></div>
              </div>
            </div>
            <div v-else>
              <!-- Show only the newest note with edit/delete buttons -->
              <div class="note" v-if="difference.notes && difference.notes.length > 0">
                <small class="note-timestamp">
                  {{ formatTimestamp(difference.notes[difference.notes.length - 1].timestamp) }}
                </small>
                <!-- Edit Note Input -->
                <div v-if="difference.notes[difference.notes.length - 1].isEditing" class="note-input">
                  <input v-model="difference.notes[difference.notes.length - 1].newNote" @keyup.enter="saveNotePrompt(difference._id, difference.notes[difference.notes.length - 1]._id)" @keyup.esc="cancelEditMode(difference._id, difference.notes[difference.notes.length - 1]._id)" />
                  <button class="icon-button" @click="saveNotePrompt(difference._id, difference.notes[difference.notes.length - 1]._id)">
                    <i class="fas fa-save"></i>
                  </button>
                  <button class="icon-button" @click="cancelEditMode(difference._id, difference.notes[difference.notes.length - 1]._id)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <!-- Display Note Text and Action Buttons -->
                <div v-else>
                  <span>{{ difference.notes[difference.notes.length - 1].note }}</span>
                  <div class="icon-buttons">
                    <button class="icon-button" @click="enableEditMode(difference._id, difference.notes[difference.notes.length - 1]._id)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-button" @click="deleteNotePrompt(difference._id, difference.notes[difference.notes.length - 1]._id)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>
      No changes found for the selected filters.
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import ObjectID from 'bson-objectid';
import api from '../api';
import { colorMapping, keyMapping as keyMappingConst } from '../constants/constants';
import * as XLSX from 'xlsx';

export default {
  name: 'HistoryTableComponent',
  props: {
    differences: Array,
    dateRange: Object,
    selectedAdAccountId: String,
    activeFilters: Array,
    searchText: String
  },
  setup(props) {
    const differences = ref([]);
    const keyMapping = ref(keyMappingConst);

    // Ensure differences are reactive and initialize necessary properties
    const initializeDifferences = (newDifferences) => {
      return newDifferences.map((diff) => ({
        ...diff,
        expandedChanges: diff.expandedChanges || {}, // Initialize expandedChanges
        addingNote: false, // Initialize addingNote
        newNote: '', // Initialize newNote
      }));
    };

    watch(
      () => props.differences,
      (newDifferences) => {
        differences.value = initializeDifferences(newDifferences);
      },
      { immediate: true }
    );

    const enableAddNotePrompt = (id) => {
      const difference = differences.value.find((diff) => diff._id === id);
      if (difference) {
        difference.addingNote = true;
      }
    };

    const cancelAddNotePrompt = (id) => {
      const difference = differences.value.find((diff) => diff._id === id);
      if (difference) {
        difference.addingNote = false;
        difference.newNote = '';
      }
    };

    const saveNewNotePrompt = async (id) => {
      const difference = differences.value.find((diff) => diff._id === id);
      if (!difference || !difference.newNote) return;

      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('accessToken='))
        ?.split('=')[1];

      if (!token) {
        console.error('No authorization token found');
        return;
      }

      try {
        await api.post(
          '/api/add-note',
          {
            accountId: props.selectedAdAccountId,
            campaignId: id,
            newNote: difference.newNote
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        );

        difference.notes.push({
          _id: ObjectID().toHexString(),
          note: difference.newNote,
          timestamp: new Date().toISOString()
        });

        difference.newNote = '';
        difference.addingNote = false;
      } catch (error) {
        console.error('Error adding note:', error);
      }
    };

    const filteredDifferences = computed(() => {
      if (!props.dateRange || !props.dateRange.start || !props.dateRange.end) {
        console.error("Date range is not properly defined", props.dateRange);
        return differences.value;
      }

      const filtered = differences.value.filter((diff) => {
        const diffDate = new Date(diff.date);
        const isWithinDateRange =
          diffDate >= new Date(props.dateRange.start).setHours(0, 0, 0, 0) &&
          diffDate <= new Date(props.dateRange.end).setHours(23, 59, 59, 999);
        return isWithinDateRange;
      });

      return filtered;
    });

    const searchNestedValues = (value, searchTextLower) => {
      if (Array.isArray(value)) {
        return value.some((item) => searchNestedValues(item, searchTextLower));
      } else if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((nestedValue) =>
          searchNestedValues(nestedValue, searchTextLower)
        );
      } else {
        return value.toString().toLowerCase().includes(searchTextLower);
      }
    };

    const filteredAndSearchedDifferences = computed(() => {
      if (!props.searchText.trim()) {
        return filteredDifferences.value;
      }
      return filteredDifferences.value.filter((diff) => {
        const searchTextLower = props.searchText.toLowerCase();

        const matchesCampaign = diff.campaign.toLowerCase().includes(searchTextLower);
        const matchesNotes = diff.notes.some((note) =>
          note.note.toLowerCase().includes(searchTextLower)
        );
        const matchesDate = diff.date.toLowerCase().includes(searchTextLower);
        const matchesChanges = Object.entries(diff.changes).some(([key, value]) => {
          const keyMatches = key.toLowerCase().includes(searchTextLower);
          const valueMatches = searchNestedValues(value, searchTextLower);
          return keyMatches || valueMatches;
        });

        return matchesCampaign || matchesNotes || matchesDate || matchesChanges;
      });
    });

    const getColorForChange = (changeKey) => {
      const mappedKey = keyMapping.value[changeKey] || changeKey;
      return colorMapping[mappedKey] || 'black';
    };

    const toggleChangeDetail = (differenceId, changeKey) => {
      const difference = differences.value.find((diff) => diff._id === differenceId);
      if (difference) {
        if (!difference.expandedChanges) {
          difference.expandedChanges = {};
        }
        difference.expandedChanges[changeKey] = !difference.expandedChanges[changeKey];
      }
    };

    const getFormattedChanges = (changeValue, urnInfoMap) => {
      const formatNestedChange = (nestedObject, prefix = '') => {
        const result = [];

        if (Array.isArray(nestedObject)) {
          nestedObject.forEach((item) => {
            const nestedResult = formatNestedChange(item, prefix);
            result.push(...nestedResult);
          });
        } else if (typeof nestedObject === 'object' && nestedObject !== null) {
          for (const key in nestedObject) {
            const formattedKey = prefix ? `${prefix} ${key}` : key;

            if (typeof nestedObject[key] === 'object' && nestedObject[key] !== null) {
              const nestedResult = formatNestedChange(nestedObject[key], formattedKey);
              result.push(...nestedResult);
            } else {
              result.push({ key: formattedKey, value: nestedObject[key] });
            }
          }
        } else {
          result.push({ key: prefix, value: nestedObject });
        }

        return result;
      };

      return formatNestedChange(changeValue);
    };

    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString(); // Format the timestamp as a readable string
    };

    const formatDateForId = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const exportToCSV = () => {
      const data = filteredDifferences.value.map((diff) => {
        const changes = Object.entries(diff.changes)
          .map(([key, value]) => {
            return `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
          })
          .join('; ');

        return {
          Campaign: diff.campaign,
          Date: diff.date,
          Changes: changes,
          Notes: diff.notes ? diff.notes.map((note) => note.note).join('; ') : '',
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Changes');
      XLSX.writeFile(workbook, 'changes.csv');
    };

    return {
      filteredAndSearchedDifferences,
      getColorForChange,
      toggleChangeDetail,
      getFormattedChanges, // Ensure getFormattedChanges is returned so it can be used in the template
      exportToCSV,
      keyMapping,
      formatTimestamp,
      formatDateForId, // Ensure this function is returned
      enableAddNotePrompt, // Ensure enableAddNotePrompt is returned
      cancelAddNotePrompt, // Ensure cancelAddNotePrompt is returned
      saveNewNotePrompt, // Ensure saveNewNotePrompt is returned
    };
  },
};
</script>

<style scoped>
/* Your existing styles for the table remain the same */
table {
  margin-top: 10px;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 20px;
  overflow: hidden;
  color: #1C1B21;
}

th:first-child {
  border-top-left-radius: 20px;
}

th:last-child {
  border-top-right-radius: 20px;
}

tr:last-child td:first-child {
  border-bottom-left-radius: 20px;
}

tr:last-child td:last-child {
  border-bottom-right-radius: 20px;
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

td {
  background-color: #fff;
}

.change-key {
  display: block;
}

.icon-buttons {
  display: inline-flex;
  gap: 5px;
  margin-left: 5px;
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

.note-input {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
}

.note {
  position: relative;
  padding-bottom: 5px;
  margin-bottom: 5px;
}

.note:not(:last-child) .note-separator {
  content: "";
  display: block;
  height: 1px;
  background-color: #ccc;
  margin-top: 5px;
}

.note-timestamp {
  display: block;
  font-size: 0.8em;
  color: #888;
  margin-bottom: 5px;
}

.add-note-button {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.add-note-button .icon-button {
  margin-left: 5px;
}

@keyframes flash {
  0% {
    background-color: yellow;
    opacity: 1;
  }

  50% {
    background-color: transparent;
    opacity: 0.5;
  }

  100% {
    background-color: yellow;
    opacity: 1;
  }
}

.flash-row {
  animation: flash 1s ease-in-out 3;
}

.campaign-name .campaign-notes {
  white-space: normal;
  word-wrap: break-word;
}

.toggle-notes {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #61bca8ff;
}

.toggle-notes:hover {
  color: #fff;
  background-color: #61bca8ff;
  border-radius: 4px;
}

.change-item {
  margin-bottom: 10px;
}

.change-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.change-header strong {
  flex-grow: 1;
}

.chevron-icon {
  margin-left: 10px;
  color: #61bca8ff
}

.change-details {
  margin-left: 15px;
  margin-top: 5px;
  transition: max-height 0.3s ease;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.nested-key {
  font-weight: bold;
}

.list-container {
  list-style-type: disc;
  /* Adds bullets to the list */
  margin: 5px 0 5px 20px;
  /* Space between items and indentation */
  padding: 0;
}

.list-item {
  margin-bottom: 5px;
}

.export-button-container {
  text-align: right;
  margin-bottom: 10px;
}

.export-button {
  padding: 5px 10px; /* Adjust padding to match FilterComponent */
  background-color: #1C1B21;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.export-button:hover {
  background-color: #333;
}

.filter-and-export-container {
  display: flex;
  justify-content: space-between; /* Align FilterComponent and export button */
  align-items: center;
  margin-bottom: 10px;
}
</style>
