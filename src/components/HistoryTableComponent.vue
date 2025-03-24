<template>
  <div class="export-button-container">
    <button class="export-button" @click="exportToCSV">Export to CSV</button>
  </div>
  <table v-if="paginatedDifferences.length > 0">
    <thead>
      <tr>
        <th>Campaign Name</th>
        <th>Date</th>
        <th>Changes</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(difference) in paginatedDifferences" :key="difference._id" :id="`changeRow-${difference._id}`">
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
  <div class="pagination" v-if="filteredDifferences.length > itemsPerPage">
    <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
    <span>Page {{ currentPage }} of {{ totalPages }}</span>
    <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import ObjectID from 'bson-objectid';
import api from '../api'; // Corrected path
import { colorMapping, keyMapping as keyMappingConst } from '../constants/constants'; // Corrected path
import * as XLSX from 'xlsx';

export default {
  name: 'HistoryTableComponent',
  props: {
    differences: Array,
    dateRange: Object,
    selectedAdAccountId: String
  },
  setup(props) {
    const differences = ref([]);
    const keyMapping = ref(keyMappingConst); // Move this line to the top

    const getTokenFromCookies = () => {
      const cookie = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
      return cookie ? cookie.split('=')[1] : null;
    };
    
    watch(() => props.differences, (newDifferences) => {
      differences.value = newDifferences;
    }, { immediate: true });
    
    const filteredDifferences = computed(() => {
      if (!props.dateRange || !props.dateRange.start || !props.dateRange.end) {
        console.error("Date range is not properly defined", props.dateRange);
        return differences.value;
      }
      
      
      const filtered = differences.value.filter(diff => {
        const diffDate = new Date(diff.date);
        const isWithinDateRange = diffDate >= new Date(props.dateRange.start).setHours(0, 0, 0, 0) && diffDate <= new Date(props.dateRange.end).setHours(23, 59, 59, 999);
        return isWithinDateRange;
      });

      return filtered;
    });

    const getColorForChange = (changeKey) => {
      const mappedKey = keyMapping.value[changeKey] || changeKey;
      return colorMapping[mappedKey] || 'black'; // Default to black if no color is defined
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
      const formattedChanges = formatNestedChange(changeValue, '', urnInfoMap);
      return formattedChanges.map(({ key, value }) => ({
        key,
        value // Do not join arrays here, leave them as arrays if they are arrays
      }));
    };

    const formatRunSchedule = (timestamp) => {
      if (!timestamp) return 'Invalid timestamp';
      const date = new Date(parseFloat(timestamp));
      return date.toLocaleString(); // Converts to "MM/DD/YYYY, HH:MM:SS"
    };

    const enableAddNotePrompt = (id) => {
      const difference = differences.value.find(diff => diff._id === id);
      difference.addingNote = true;
    };

    const cancelAddNotePrompt = (differenceId) => {
      const difference = differences.value.find(diff => diff._id === differenceId);
      if (difference) {
        difference.addingNote = false;
        difference.newNote = '';
      }
    };

    const saveNewNotePrompt = async (changeId) => {
      const token = getTokenFromCookies();
      if (!token) {
        console.error('No authorization token found');
        return;
      }
      const difference = differences.value.find(diff => diff._id === changeId);
      if (!difference.newNote) return;

      try {
        await api.post('/api/add-note', {
          accountId: props.selectedAdAccountId,
          campaignId: difference._id,
          newNote: difference.newNote
        }, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        difference.notes.push({
          _id: ObjectID().toHexString(),
          note: difference.newNote,
          timestamp: new Date().toISOString()
        });
        difference.notes = [...difference.notes]; // Reassign to trigger reactivity
        difference.newNote = '';
        difference.addingNote = false;
      } catch (error) {
        console.error('Error adding note:', error);
      }
    };

    const enableEditMode = (changeId, noteId) => {
      const difference = differences.value.find(diff => diff._id === changeId);
      const note = difference.notes.find(note => note._id === noteId);
      note.isEditing = true;
      note.newNote = note.note;
    };

    const saveNotePrompt = async (changeId, noteId) => {
      const token = getTokenFromCookies();
      if (!token) {
        console.error('No authorization token found');
        return;
      }
      const accountId = props.selectedAdAccountId;
      const campaignId = changeId;
      const difference = differences.value.find(diff => diff._id === changeId);
      const note = difference.notes.find(note => note._id === noteId);
      if (note.newNote === undefined || !accountId || !campaignId) return;

      try {
        await api.post('/api/edit-note', {
          accountId,
          campaignId,
          noteId,
          updatedNote: note.newNote
        }, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        note.note = note.newNote;
        note.isEditing = false;
        note.timestamp = new Date().toISOString();
      } catch (error) {
        console.error('Error updating note:', error);
      }
    };

    const cancelEditMode = (differenceId, noteId) => {
      const difference = differences.value.find(diff => diff._id === differenceId);
      if (difference) {
        const note = difference.notes.find(note => note._id === noteId);
        if (note) {
          note.isEditing = false;
          note.newNote = note.note;
        }
      }
    };

    const deleteNotePrompt = async (changeId, noteId) => {
      const token = getTokenFromCookies();
      if (!token) {
        console.error('No authorization token found');
        return;
      }
      const accountId = props.selectedAdAccountId;
      const campaignId = changeId;
      if (!accountId || !campaignId) return;

      try {
        await api.post('/api/delete-note', {
          accountId,
          campaignId,
          noteId
        }, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        const difference = differences.value.find(diff => diff._id === changeId);
        difference.notes = difference.notes.filter(note => note._id !== noteId);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    };

    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString();
    };

    const fetchAllChanges = async () => {
      try {
        const token = getTokenFromCookies();
        if (!token) {
          console.error('No authorization token found');
          return;
        }
        const response = await api.get('/api/get-all-changes', {
          params: { adAccountId: props.selectedAdAccountId },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        differences.value = response.data.reverse().map(change => {
          // Normalize _id to a string
          if (change._id && typeof change._id === 'object' && change._id.$oid) {
            change._id = change._id.$oid;
          } else if (typeof change._id === 'string') {
            // _id is already a string, do nothing
          } else if (!change._id) {
            change._id = ObjectID().toHexString();
          }
          if (!change.expandedChanges) {
            change.expandedChanges = {};
          }
          return change;
        });
      } catch (error) {
        console.error('Error fetching all changes from the database:', error);
      }
    };

    const toggleNotes = (id) => {
      const difference = differences.value.find(diff => diff._id === id);
      if (difference) {
        difference.showAllNotes = !difference.showAllNotes;
      }
    };

    const cleanUpKey = (keyString) => {
      return keyString
        .replace(/urn:li:adTargetingFacet:/gi, '')      // Remove urn:li:adTargetingFacet:
        .replace(/\bAnd\b\s*\d*/gi, '')                // Remove "And 0", "And 1", etc.
        .replace(/\bOr\b\s*\d*/gi, '')                 // Remove "Or 0", "Or 1", etc.
        .replace(/\s+/g, ' ')                          // Normalize excessive spaces
        .trim();
    };

    const formatNestedChange = (nestedObject, prefix = '', urnInfoMap = {}) => {
      const result = [];

      // Handle added/removed keys if present
      if (nestedObject && typeof nestedObject === 'object' &&
        (Array.isArray(nestedObject.added) || Array.isArray(nestedObject.removed))) {

        // Clean the prefix before using it
        let cleanedPrefix = cleanUpKey(prefix);

        if (nestedObject.added && nestedObject.added.length > 0) {
          const addedItems = nestedObject.added.map(item => replaceUrnWithInfo(item, urnInfoMap));
          result.push({ key: `${cleanedPrefix ? cleanedPrefix + ' ' : ''}Added`, value: addedItems });
        }

        if (nestedObject.removed && nestedObject.removed.length > 0) {
          const removedItems = nestedObject.removed.map(item => replaceUrnWithInfo(item, urnInfoMap));
          result.push({ key: `${cleanedPrefix ? cleanedPrefix + ' ' : ''}Removed`, value: removedItems });
        }

        return result;
      }

      if (Array.isArray(nestedObject)) {
        nestedObject.forEach((item) => {
          const nestedResult = formatNestedChange(item, prefix, urnInfoMap);
          result.push(...nestedResult);
        });
      } else if (typeof nestedObject === 'object' && nestedObject !== null) {
        for (const key in nestedObject) {
          // Skip numeric keys but include their values directly in the parent structure
          if (!isNaN(key)) {
            const nestedResult = formatNestedChange(nestedObject[key], prefix, urnInfoMap);
            result.push(...nestedResult);
            continue;
          }

          let formattedKey = prefix ? `${prefix} ${capitalizeFirstLetter(key)}` : capitalizeFirstLetter(key);

          if (typeof nestedObject[key] === 'object' && nestedObject[key] !== null) {
            const nestedResult = formatNestedChange(nestedObject[key], formattedKey, urnInfoMap);
            result.push(...nestedResult);
          } else {
            const value = nestedObject[key];
            const formattedValue = replaceUrnWithInfo(value, urnInfoMap);

            // Clean the key before pushing
            formattedKey = cleanUpKey(formattedKey);

            result.push({ key: formattedKey, value: formattedValue });
          }
        }
      }

      return result;
    };

    const replaceUrnWithInfo = (value, urnInfoMap) => {
      if (typeof value === 'string') {
        return urnInfoMap[value] || value; // Replace URN with mapped info or keep the original
      }
      return value;
    };

    const capitalizeFirstLetter = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const formatChangesForCSV = (changes) => {
      return Object.entries(changes).map(([key, value]) => {
        const formattedChanges = getFormattedChanges(value, {});
        return formattedChanges.map(change => `${change.key}: ${Array.isArray(change.value) ? change.value.join(', ') : change.value}`).join('; ');
      }).join('; ');
    };

    const exportToCSV = () => {
      const data = filteredDifferences.value.map(diff => {
        const changes = formatChangesForCSV(diff.changes);

        return {
          Campaign: diff.campaign,
          Date: diff.date,
          Changes: changes,
          Notes: diff.notes ? diff.notes.map(note => note.note).join('; ') : ''
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Changes');
      XLSX.writeFile(workbook, 'changes.csv');
    };

    const itemsPerPage = 20;
    const currentPage = ref(1);

    const paginatedDifferences = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredDifferences.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredDifferences.value.length / itemsPerPage);
    });

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    onMounted(() => {
      // Ensure chart and table load on page load
      if (props.selectedAdAccountId) {
        fetchAllChanges();
      }
    });

    watch(() => props.selectedAdAccountId, async (newId, oldId) => {
      if (newId !== oldId) {
        await fetchAllChanges();
      }
    }, { immediate: true });

    return {
      filteredDifferences,
      getColorForChange,
      toggleChangeDetail,
      getFormattedChanges,
      formatRunSchedule,
      enableAddNotePrompt,
      cancelAddNotePrompt,
      saveNewNotePrompt,
      enableEditMode,
      saveNotePrompt,
      cancelEditMode,
      deleteNotePrompt,
      formatTimestamp,
      fetchAllChanges,
      keyMapping, // Add this line to return keyMapping
      toggleNotes, // Add this line to return toggleNotes
      exportToCSV, // Add this line to return exportToCSV
      paginatedDifferences,
      currentPage,
      totalPages,
      nextPage,
      prevPage,
      itemsPerPage
    };
  }
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
  padding: 10px 20px;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.pagination button {
  padding: 5px 10px;
  margin: 0 5px;
  background-color: #1C1B21;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background-color: #333;
}
</style>
