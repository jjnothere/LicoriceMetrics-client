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
          item.dateRange.start.month,
          item.dateRange.start.day
        );
        const y = date.getFullYear();
        const m = date.getMonth();
        switch (interval) {
          case 'WEEKLY':
            const dayOfWeek = date.getDay();
            const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const monday = new Date(date.getTime());
            monday.setDate(monday.getDate() - offset);
            return `W:${monday.getMonth() + 1}/${monday.getDate()}/${monday.getFullYear()}`;
          case 'MONTHLY':
            return `M:${y}-${m + 1}`;
          case 'QUARTERLY':
            const quarter = Math.floor(m / 3) + 1;
            return `Q${quarter}-${y}`;
          default:
            return `D:${y}-${m + 1}-${date.getDate()}`;
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
        const dateA = new Date(a.date.year, a.date.month - 1, a.date.day);
        const dateB = new Date(b.date.year, b.date.month - 1, b.date.day);
        return dateA - dateB;
      });
    }

    const formatDateLabel = (dateString) => {
      if (dateString.startsWith('Q')) {
        return dateString; // Return the quarterly format as is
      }
      const date = new Date(dateString);
      const month = date.getMonth() + 1; // Ensure 1-based month
      const day = date.getDate(); // No leading zero for the day
      const year = date.getFullYear();
      return `${month}/${day}/${year}`; // Format as "M/D/YYYY"
    };

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

      aggregated.forEach(item => {
        labels.push(item.key.startsWith('Q') ? item.key : formatDateLabel(item.key.replace(/^./, '')));
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
              fill: false
            },
            {
              label: props.metric2,
              data: metric2Data,
              borderColor: '#f44336',
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
</style>