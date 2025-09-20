<template>
  <div>
    <div class="table-container">
      <table v-if="filteredAndSearchedDifferences.length > 0">
        <thead>
          <tr>
            <th>Campaign Name</th>
            <th>Date</th>
            <th>Changes</th>
            <th>
              Notes
              <button class="export-button" style="float: right;" @click="exportToCSV">
                Export to CSV
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(difference) in filteredAndSearchedDifferences" :key="difference._id" :id="`changeRow-${formatDateForId(difference.date)}`">
            <td class="campaign-name" v-html="highlight(difference.campaign)"></td>
            <td>{{ difference.date }}</td>
            <td>
              <div v-for="(changeValue, changeKey) in difference.changes" :key="difference._id + '-' + changeKey" class="change-item">
                <div class="change-header" @click="toggleChangeDetail(difference._id, changeKey)">
                  <strong
                    :style="{ color: getColorForChange(changeKey) }"
                    v-html="highlight(keyMapping[changeKey] || changeKey)"
                  ></strong>
                  <i :class="difference.expandedChanges?.[changeKey] ? 'fas fa-chevron-down' : 'fas fa-chevron-up'" class="chevron-icon"></i>
                </div>
                <div v-if="difference.expandedChanges?.[changeKey]" class="change-details">
                  <div v-for="(entry) in getFormattedChanges(changeValue, difference.urnInfoMap)" :key="difference._id + '-' + changeKey + '-' + entry.key">
                    <span class="nested-key">
                      {{
                        entry.key
                          .replace(/([a-z])([A-Z])/g, '$1 $2')
                          .split(' ')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(' ')
                          .replace(/\b(Include|Exclude)\b/g, '$1:')
                      }}<template v-if="entry.key !== ''">:<br /></template>
                    </span>
                    
                    <span class="nested-value">
                      <!-- If runSchedule and value is a string, format as a date -->
                      <template v-if="changeKey === 'runSchedule'">
                        <template v-if="Array.isArray(entry.value)">
                          <div v-for="(item, idx) in entry.value" :key="idx" v-html="highlight(formatRunSchedule(item))"></div>
                        </template>
                        <template v-else>
                          <span v-html="highlight(formatRunSchedule(entry.value))"></span>
                        </template>
                      </template>
                      <!-- For non-runSchedule keys -->
                      <template v-else>
                        <template v-if="Array.isArray(entry.value)">
                          <!-- Print each array item on its own line -->
                          <ul class="list-container">
                            <li v-for="(item, idx) in entry.value" :key="idx" class="list-item" v-html="highlight(item)"></li>
                          </ul>
                        </template>
                        <template v-else>
                          <span v-html="highlight(entry.value)"></span>
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
              <div v-if="editingNotes[difference._id]?.addingNote" class="note-input">
                <input
                  :ref="el => addNoteRefs[difference._id] = el"
                  v-model="editingNotes[difference._id].newNote"
                  placeholder="Add a new note"
                  @keyup.enter="saveNewNotePrompt(difference._id)"
                  @keyup.esc="cancelAddNotePrompt(difference._id)"
                />
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
                  <div v-if="editingNotes[difference._id]?.[note._id]?.isEditing" class="note-input">
                    <input
                      :ref="el => {
                        if (!editNoteRefs[difference._id]) {
                          editNoteRefs[difference._id] = {};
                        }
                        editNoteRefs[difference._id][note._id] = el;
                      }"
                      v-model="editingNotes[difference._id][note._id].newNote"
                      @keyup.enter="saveNotePrompt(difference._id, note._id)"
                      @keyup.esc="cancelEditMode(difference._id, note._id)"
                    />
                    <button class="icon-button" @click="saveNotePrompt(difference._id, note._id)">
                      <i class="fas fa-save"></i>
                    </button>
                    <button class="icon-button" @click="cancelEditMode(difference._id, note._id)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <!-- Display Note Text and Action Buttons -->
                  <div v-else>
                    <span v-html="highlight(note.note)"></span>
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
                  <div v-if="editingNotes[difference._id]?.[difference.notes[difference.notes.length - 1]._id]?.isEditing" class="note-input">
                    <input
                      :ref="el => {
                        if (!editNoteRefs[difference._id]) {
                          editNoteRefs[difference._id] = {};
                        }
                        editNoteRefs[difference._id][difference.notes[difference.notes.length - 1]._id] = el;
                      }"
                      v-model="editingNotes[difference._id][difference.notes[difference.notes.length - 1]._id].newNote"
                      @keyup.enter="saveNotePrompt(difference._id, difference.notes[difference.notes.length - 1]._id)"
                      @keyup.esc="cancelEditMode(difference._id, difference.notes[difference.notes.length - 1]._id)"
                    />
                    <button class="icon-button" @click="saveNotePrompt(difference._id, difference.notes[difference.notes.length - 1]._id)">
                      <i class="fas fa-save"></i>
                    </button>
                    <button class="icon-button" @click="cancelEditMode(difference._id, difference.notes[difference.notes.length - 1]._id)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <!-- Display Note Text and Action Buttons -->
                  <div v-else>
                    <span v-html="highlight(difference.notes[difference.notes.length - 1].note)"></span>
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
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue';
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
    searchText: String,
    urnInfoMap: Object // Add urnInfoMap as a prop
  },
  setup(props) {
    const differences = ref([]);
    const editingNotes = ref({}); // Separate state for managing note edits
    const keyMapping = ref(keyMappingConst);
    const addNoteRefs = ref({});
    const editNoteRefs = ref({});
    const expansionsMap = ref({});

    // Ensure differences are reactive and initialize necessary properties
    const initializeDifferences = (newDifferences) => {
      return newDifferences.map((diff) => ({
        ...diff,
        expandedChanges: diff.expandedChanges || {}, // Initialize expandedChanges
        addingNote: false, // Initialize addingNote
        newNote: '', // Initialize newNote
      }));
    };

    // Merge expansions on updated differences
    watch(
      () => props.differences,
      (newDifferences) => {
        differences.value = initializeDifferences(newDifferences).map(diff => {
          const saved = expansionsMap.value[diff._id] || {};
          return {
            ...diff,
            expandedChanges: { ...saved, ...diff.expandedChanges }
          };
        });
      },
      { immediate: true }
    );

    const enableAddNotePrompt = async (id) => {
      editingNotes.value[id] = { addingNote: true, newNote: '' };
      await nextTick();
      if (addNoteRefs.value[id]) {
        addNoteRefs.value[id].focus();
      }
    };

    const cancelAddNotePrompt = (id) => {
      if (editingNotes.value[id]) {
        delete editingNotes.value[id];
      }
    };

    const saveNewNotePrompt = (id) => {
      const noteState = editingNotes.value[id];
      if (!noteState || !noteState.newNote) return;

      // Find the difference object (change entry)
      const change = differences.value.find(diff => diff._id === id);
      if (!change) return;

      // Optimistic UI update: create a temporary note and push immediately
      const tempId = ObjectID().toHexString();
      const tempTimestamp = new Date().toISOString();
      const tempNote = { _id: tempId, note: noteState.newNote, timestamp: tempTimestamp, temp: true };
      if (change.notes) {
        change.notes.push(tempNote);
      }

      // Clear the editing state immediately
      delete editingNotes.value[id];

      // Fire the API call without awaiting UI update
      api.post(
        '/add-note',
        {
          campaignId: change.campaignId,
          adAccountId: props.selectedAdAccountId,
          changeId: change._id,
          note: noteState.newNote
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )
        .then(({ data }) => {
          // Replace tempId with real ID from server
          const idx = change.notes.findIndex(n => n._id === tempId);
          if (idx !== -1) {
            change.notes[idx]._id = data.noteId;
            change.notes[idx].timestamp = data.timestamp;
            delete change.notes[idx].temp;
          }
        })
        .catch(error => {
          console.error('Error adding note:', error);
          // Optionally remove the temp note on failure
          change.notes = change.notes.filter(n => n._id !== tempId);
        });
    };

    const enableEditMode = async (differenceId, noteId) => {
      if (!editingNotes.value[differenceId]) {
        editingNotes.value[differenceId] = {};
      }
      const difference = differences.value.find((diff) => diff._id === differenceId);
      if (difference) {
        const note = difference.notes.find((n) => n._id === noteId);
        if (note) {
          editingNotes.value[differenceId][noteId] = { isEditing: true, newNote: note.note };
          await nextTick();
          if (editNoteRefs.value[differenceId]?.[noteId]) {
            editNoteRefs.value[differenceId][noteId].focus();
          }
        }
      }
    };

    const cancelEditMode = (differenceId, noteId) => {
      if (editingNotes.value[differenceId] && editingNotes.value[differenceId][noteId]) {
        delete editingNotes.value[differenceId][noteId];
      }
    };

    const saveNotePrompt = async (differenceId, noteId) => {
      const noteState = editingNotes.value[differenceId]?.[noteId];
      if (!noteState || !noteState.newNote) return;

      // If this is a temp note that hasn't been saved yet, update locally without API call
      const change = differences.value.find(diff => diff._id === differenceId);
      const note = change?.notes.find(n => n._id === noteId);
      if (note?.temp) {
        note.note = noteState.newNote;
        note.timestamp = new Date().toISOString();
        delete editingNotes.value[differenceId][noteId];
        return;
      }

      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('accessToken='))
        ?.split('=')[1];

      try {
        if (!change) {
          console.error('Difference not found');
          return;
        }

        if (!note) {
          console.error('Note not found');
          return;
        }

        // Use the correct API endpoint and payload field names to match backend
        await api.post(
          '/edit-note',
          {
            accountId: props.selectedAdAccountId,
            campaignId: change.campaignId, // actual campaign ID
            changeId: differenceId,            // the _id of the change entry
            noteId: noteId,
            newText: noteState.newNote
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        );

        // Update the note locally
        note.note = noteState.newNote;
        note.timestamp = new Date().toISOString(); // Update the timestamp

        delete editingNotes.value[differenceId][noteId];
      } catch (error) {
        console.error('Error editing note:', error);
      }
    };

    const deleteNotePrompt = async (differenceId, noteId) => {
      // Find the difference and note at the top
      const difference = differences.value.find(diff => diff._id === differenceId);
      const note = difference?.notes.find(n => n._id === noteId);
      // If note is a temp note, just remove it locally
      if (note?.temp) {
        difference.notes = difference.notes.filter(n => n._id !== noteId);
        return;
      }

      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('accessToken='))
        ?.split('=')[1];

      try {
        await api.post(
          '/delete-note',
          {
            accountId: props.selectedAdAccountId,
            campaignId: differenceId,
            noteId: String(noteId) // Ensure noteId is sent as a string
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (difference) {
          difference.notes = difference.notes.filter((note) => note._id !== noteId);
        }
      } catch (error) {
        console.error('Error deleting note:', error);
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

      // Sort by date (newest to oldest)
      return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    const searchNestedValues = (value, searchTextLower) => {
      if (value == null) {
        // Handle null or undefined values
        return false;
      }

      if (Array.isArray(value)) {
        // Recursively search each item in the array
        return value.some((item) => searchNestedValues(item, searchTextLower));
      } else if (typeof value === 'object') {
        // Handle objects with `added` and `removed` keys (e.g., targetingCriteria)
        if (value.added || value.removed) {
          const addedMatches = Array.isArray(value.added) && value.added.some((item) =>
            searchNestedValues(replaceUrnWithInfo(item), searchTextLower)
          );
          const removedMatches = Array.isArray(value.removed) && value.removed.some((item) =>
            searchNestedValues(replaceUrnWithInfo(item), searchTextLower)
          );
          return addedMatches || removedMatches;
        }

        // Recursively search each value in the object
        return Object.values(value).some((nestedValue) =>
          searchNestedValues(nestedValue, searchTextLower)
        );
      } else {
        // Replace URNs with their mapped values before searching
        const mappedValue = replaceUrnWithInfo(value);
        return mappedValue.toString().toLowerCase().includes(searchTextLower);
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
      const difference = differences.value.find(diff => diff._id === differenceId);
      if (difference) {
        difference.expandedChanges[changeKey] = !difference.expandedChanges[changeKey];
        expansionsMap.value[differenceId] = difference.expandedChanges;
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

    const getFormattedChanges = (changeValue) => {
      const formatNestedChange = (nestedObject, prefix = '') => {
        const result = [];

        if (nestedObject && typeof nestedObject === 'object' &&
          (Array.isArray(nestedObject.added) || Array.isArray(nestedObject.removed))) {
          const cleanedPrefix = cleanUpKey(prefix);

          if (nestedObject.added && nestedObject.added.length > 0) {
            const addedItems = nestedObject.added.map(item => replaceUrnWithInfo(item));
            result.push({ key: `${cleanedPrefix} Added`, value: addedItems });
          }

          if (nestedObject.removed && nestedObject.removed.length > 0) {
            const removedItems = nestedObject.removed.map(item => replaceUrnWithInfo(item));
            result.push({ key: `${cleanedPrefix} Removed`, value: removedItems });
          }

          return result;
        }

        if (Array.isArray(nestedObject)) {
          nestedObject.forEach((item) => {
            const nestedResult = formatNestedChange(item, prefix);
            result.push(...nestedResult);
          });
        } else if (typeof nestedObject === 'object' && nestedObject !== null) {
          for (const key in nestedObject) {
            if (!isNaN(key)) {
              const nestedResult = formatNestedChange(nestedObject[key], prefix);
              result.push(...nestedResult);
              continue;
            }

            let formattedKey = prefix ? `${prefix} ${capitalizeFirstLetter(key)}` : capitalizeFirstLetter(key);

            if (typeof nestedObject[key] === 'object' && nestedObject[key] !== null) {
              const nestedResult = formatNestedChange(nestedObject[key], formattedKey);
              result.push(...nestedResult);
            } else {
              const value = nestedObject[key];
              const formattedValue = replaceUrnWithInfo(value);
              formattedKey = cleanUpKey(formattedKey);
              result.push({ key: formattedKey, value: formattedValue });
            }
          }
        } else {
          result.push({ key: prefix, value: nestedObject });
        }

        return result;
      };

      return formatNestedChange(changeValue);
    };

    const replaceUrnWithInfo = (value) => {
      if (typeof value === 'string') {
        return props.urnInfoMap[value] || value; // Replace URN with mapped info or keep the original
      }
      return value;
    };

    const formatRunSchedule = (timestamp) => {
      if (!timestamp) return 'Invalid timestamp';
      const date = new Date(parseFloat(timestamp));
      return date.toLocaleString(); // Converts to "MM/DD/YYYY, HH:MM:SS"
    };

    const capitalizeFirstLetter = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString(); // Format the timestamp as a readable string
    };

    const formatDateForId = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Updated exportToCSV to match the frontend table structure and formatting
    const exportToCSV = () => {
      const data = filteredAndSearchedDifferences.value.map((diff) => {
        // Format changes to match the table format
        const formattedChanges = Object.entries(diff.changes)
          .map(([key, value]) => {
            const formattedChange = getFormattedChanges(value)
              .map(change => `${change.key}: ${Array.isArray(change.value) ? change.value.join(', ') : change.value}`)
              .join('; ');
            return `${keyMapping.value[key] || key}: ${formattedChange}`;
          })
          .join('; ');

        return {
          Campaign: diff.campaign,
          Date: diff.date,
          Changes: formattedChanges,
          Notes: diff.notes ? diff.notes.map((note) => `${note.note} (${formatTimestamp(note.timestamp)})`).join('; ') : '',
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Changes');
      XLSX.writeFile(workbook, 'changes.csv');
    };

    const toggleNotes = (differenceId) => {
      const difference = differences.value.find((diff) => diff._id === differenceId);
      if (difference) {
        difference.showAllNotes = !difference.showAllNotes;
      }
    };

    // Escape HTML to avoid XSS
    const escapeHtml = (unsafe) => {
      return String(unsafe).replace(/[&<>"']/g, (m) => {
        switch (m) {
          case '&': return '&amp;';
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '"': return '&quot;';
          case "'": return '&#039;';
        }
      });
    };

    // Highlight occurrences of searchText
    const highlight = (text) => {
      if (!props.searchText) return escapeHtml(text);
      const escaped = escapeHtml(text);
      const pattern = props.searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${pattern})`, 'gi');
      return escaped.replace(regex, '<mark>$1</mark>');
    };

    return {
      filteredAndSearchedDifferences,
      getColorForChange,
      toggleChangeDetail,
      cleanUpKey, // Ensure cleanUpKey is returned
      getFormattedChanges, // Ensure getFormattedChanges is returned
      exportToCSV,
      keyMapping,
      formatTimestamp,
      formatDateForId, // Ensure this function is returned
      enableAddNotePrompt, // Ensure enableAddNotePrompt is returned
      cancelAddNotePrompt, // Ensure cancelAddNotePrompt is returned
      saveNewNotePrompt, // Ensure saveNewNotePrompt is returned
      enableEditMode,
      cancelEditMode,
      saveNotePrompt,
      deleteNotePrompt,
      editingNotes, // Expose editingNotes for template usage
      toggleNotes, // Ensure toggleNotes is returned
      addNoteRefs,
      editNoteRefs,
      formatRunSchedule,
      highlight
    };
  }
};
</script>

<style scoped>
/* Allocate column widths for Campaign Name, Date, Changes, and Notes */
table {
  margin-top: 10px;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 20px;
  overflow: hidden;
  color: #1C1B21;
  min-width: 600px; /* Ensure table doesn't shrink too much on small screens */
  table-layout: fixed; /* Enable fixed layout for percentage widths */
}

th:nth-child(1),
td:nth-child(1) {
  width: 35%;    /* Campaign Name */
}

th:nth-child(2),
td:nth-child(2) {
  width: 75px;  /* Fixed width for Date column */
  white-space: nowrap;
}

th:nth-child(3),
td:nth-child(3) {
  width: 32.5%;  /* Changes */
  word-wrap: break-word;
}

th:nth-child(4),
td:nth-child(4) {
  width: 32.5%;  /* Notes */
  word-wrap: break-word;
}

.table-container {
  overflow-x: auto; /* Enable horizontal scrolling for the table */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling for mobile devices */
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

.campaign-name {
  word-break: break-word; /* Break long words to fit within the box */
  overflow-wrap: break-word; /* Ensure long strings wrap to the next line */
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
  margin-top: 5px;
}

.export-button {
  padding: 5px 10px; /* Adjust padding to match FilterComponent */
  background-color: #ccc;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.export-button:hover {
  background-color: #61bca8;
}

.filter-and-export-container {
  display: flex;
  justify-content: space-between; /* Align FilterComponent and export button */
  align-items: center;
  margin-bottom: 10px;
}
</style>
