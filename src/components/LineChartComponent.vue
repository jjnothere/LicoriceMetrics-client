<!-- LineChart.vue -->
<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, watch, computed } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'LineChartComponent',
  props: {
    selectedAdAccountId: {
      type: String,
      required: false
    },
    selectedTimeInterval: {
      type: String,
      required: false
    },
    chartStartDate: {
      type: Date,
      required: true
    },
    chartEndDate: {
      type: Date,
      required: true
    },
    metric1: {
      type: String,
      required: true
    },
    metric2: {
      type: String,
      required: true
    },
    selectedCampaignIds: {
      type: Array,
      required: false
    },
    differences: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chartInstance = null;
    const allData = ref([]);

    const computedGranularity = computed(() => {
      switch (props.selectedTimeInterval) {
        case 'weekly':
          return 'WEEKLY';
        case 'monthly':
          return 'MONTHLY';
        case 'quarterly':
          return 'QUARTERLY';
        case 'daily':
        default:
          return 'DAILY';
      }
    });

    const formatDate = (date) => date.toISOString().split('T')[0];

    function groupByInterval(sortedElements, interval) {
      const formatKey = (item) => {
        const date = new Date(
          item.dateRange.start.year,
          item.dateRange.start.month - 1, // Subtract 1 to handle zero-based month index
          item.dateRange.start.day
        );
        const y = date.getFullYear();
        const m = date.getMonth(); // Zero-based month
        switch (interval) {
          case 'WEEKLY':
            const dayOfWeek = date.getDay();
            const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const monday = new Date(date.getTime());
            monday.setDate(monday.getDate() - offset);
            return `W:${monday.getMonth() + 1}/${monday.getDate()}/${monday.getFullYear()}`; // Correct month
          case 'MONTHLY':
            return `M:${y}-${m + 1}`; // Correct month
          case 'QUARTERLY':
            const quarter = Math.floor(m / 3) + 1;
            return `Q${quarter}-${y}`;
          default:
            return `D:${y}-${m + 1}-${date.getDate()}`; // Correct month
        }
      };

      const aggregatedMap = {};
      sortedElements.forEach(item => {
        const key = formatKey(item);
        if (!aggregatedMap[key]) {
          aggregatedMap[key] = { metric1: 0, metric2: 0, rawDate: item.dateRange.start };
        }
        aggregatedMap[key].metric1 += parseFloat(item[props.metric1]) || 0;
        aggregatedMap[key].metric2 += parseFloat(item[props.metric2]) || 0;
      });

      return Object.entries(aggregatedMap).map(([key, data]) => ({
        key,
        date: data.rawDate,
        metric1: data.metric1,
        metric2: data.metric2
      })).sort((a, b) => {
        const dateA = new Date(a.date.year, a.date.month - 1, a.date.day); // Correct month
        const dateB = new Date(b.date.year, b.date.month - 1, b.date.day); // Correct month
        return dateA - dateB;
      });
    }

    const formatDateLabel = (dateString) => {
      const date = new Date(dateString);
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      return formatter.format(date); // Format as "MM/DD/YYYY"
    };

    const getChangeDates = computed(() => {
      // Format dates as MM/DD/YYYY to match chart labels
      return props.differences.map((diff) => {
        const date = new Date(diff.date);
        const formatter = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        return formatter.format(date); // Format as "MM/DD/YYYY"
      });
    });

    const fetchChartData = async () => {
      try {
        const startDate = formatDate(props.chartStartDate);
        const endDate = formatDate(props.chartEndDate);

        const response = await axios.get('/api/linkedin/chart-data', {
          params: {
            start: startDate,
            end: endDate,
            fields: `${props.metric1},${props.metric2}`,
            accountId: props.selectedAdAccountId || 'YOUR_FALLBACK_ID',
            timeGranularity: computedGranularity.value,
            campaigns: props.selectedCampaignIds // Send campaigns as an array
          },
          withCredentials: true
        });

        allData.value = response.data.elements || [];
        updateChart();
      } catch (error) {
        console.error('Error fetching LinkedIn chart data:', error);
      }
    };

    const updateChart = () => {
      const filteredElements = allData.value.filter(item => {
        const itemDate = new Date(item.dateRange.start.year, item.dateRange.start.month - 1, item.dateRange.start.day);
        return itemDate >= new Date(props.chartStartDate) && itemDate <= new Date(props.chartEndDate);
      });

      filteredElements.sort((a, b) => {
        const dateA = new Date(a.dateRange.start.year, a.dateRange.start.month - 1, a.dateRange.start.day);
        const dateB = new Date(b.dateRange.start.year, b.dateRange.start.month - 1, b.dateRange.start.day);
        return dateA - dateB;
      });

      const aggregated = groupByInterval(filteredElements, computedGranularity.value);
      const labels = [];
      const metric1Data = [];
      const metric2Data = [];
      const changeDates = getChangeDates.value;

      aggregated.forEach(item => {
        const formattedDate = item.key.startsWith('Q') ? item.key : formatDateLabel(item.key.replace(/^./, ''));
        labels.push(formattedDate);
        metric1Data.push(item.metric1);
        metric2Data.push(item.metric2);
      });

      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(chartCanvas.value, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: props.metric1,
              data: metric1Data,
              borderColor: '#4caf50',
              fill: false,
              pointBackgroundColor: labels.map((label) =>
                changeDates.includes(label) ? 'red' : '#4caf50'
              ),
              pointRadius: labels.map((label) =>
                changeDates.includes(label) ? 6 : 3
              )
            },
            {
              label: props.metric2,
              data: metric2Data,
              borderColor: '#f44336',
              fill: false,
              pointBackgroundColor: labels.map((label) =>
                changeDates.includes(label) ? 'red' : '#f44336'
              ),
              pointRadius: labels.map((label) =>
                changeDates.includes(label) ? 6 : 3
              )
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const date = context.label;
                  if (changeDates.includes(date)) {
                    return `${context.dataset.label}: ${context.raw} (Change)`;
                  }
                  return `${context.dataset.label}: ${context.raw}`;
                }
              }
            }
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const clickedDate = labels[index];
              if (changeDates.includes(clickedDate)) {
                scrollToTableRow(clickedDate);
              }
            }
          },
          scales: {
            x: { type: 'category' },
            y: {
              position: 'right',
              title: { display: true, text: 'Value' }
            }
          }
        }
      });
    };

    const scrollToTableRow = (date) => {
      // Convert the displayed date (MM/DD/YYYY) back to the original format (YYYY-MM-DD)
      const [month, day, year] = date.split('/');
      const originalDateFormat = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      const matchingRow = document.querySelector(`[id="changeRow-${originalDateFormat}"]`);
      if (matchingRow) {
        matchingRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        matchingRow.classList.remove('flash-row'); // Remove the class to restart the animation
        void matchingRow.offsetWidth; // Trigger reflow to reapply the animation
        matchingRow.classList.add('flash-row');
        setTimeout(() => matchingRow.classList.remove('flash-row'), 3000); // Ensure the class is removed after the animation
      }
    };

    onMounted(fetchChartData);

    watch(
      () => [props.selectedAdAccountId, props.selectedTimeInterval, props.chartStartDate, props.chartEndDate, props.metric1, props.metric2, props.selectedCampaignIds],
      () => {
        fetchChartData();
      }
    );

    return {
      chartCanvas
    };
  }
};
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 400px !important;
}

.flash-row {
  animation: flash 0.5s ease-in-out 6; /* Flash 6 times (3 seconds total) */
  background-color: yellow;
}

@keyframes flash {
  0%, 100% {
    background-color: yellow;
    opacity: 1;
  }
  50% {
    background-color: transparent;
    opacity: 0.5;
  }
}
</style>