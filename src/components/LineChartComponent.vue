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
    }
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chartInstance = null;

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
          aggregatedMap[key] = { clicks: 0, costInLocalCurrency: 0, rawDate: item.dateRange.start };
        }
        aggregatedMap[key].clicks += (item.clicks || 0);
        aggregatedMap[key].costInLocalCurrency += parseFloat(item.costInLocalCurrency) || 0;
      });

      return Object.entries(aggregatedMap).map(([key, data]) => ({
        key,
        date: data.rawDate,
        clicks: data.clicks,
        costInLocalCurrency: data.costInLocalCurrency
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
      const month = date.getMonth(); // Ensure 1-based month
      const day = date.getDate(); // No leading zero for the day
      const year = date.getFullYear();
      return `${month}/${day}/${year}`; // Format as "M/D/YYYY"
    };

    const fetchChartData = async () => {
      try {
        const startDate = formatDate(props.chartStartDate);
        console.log("🐒 ~ startDate:", startDate)
        const endDate = formatDate(props.chartEndDate);
        console.log("🐒 ~ endDate:", endDate)

        const response = await axios.get('/api/linkedin/chart-data', {
          params: {
            start: startDate,
            end: endDate,
            fields: 'clicks,costInLocalCurrency',
            accountId: props.selectedAdAccountId || 'YOUR_FALLBACK_ID',
            timeGranularity: computedGranularity.value
          },
          withCredentials: true
        });

        const elements = response.data.elements || [];
        const filteredElements = elements.filter(item => {
          const itemDate = new Date(item.dateRange.start.year, item.dateRange.start.month - 1, item.dateRange.start.day);
          return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
        });

        filteredElements.sort((a, b) => {
          const dateA = new Date(a.dateRange.start.year, a.dateRange.start.month - 1, a.dateRange.start.day);
          const dateB = new Date(b.dateRange.start.year, b.dateRange.start.month - 1, b.dateRange.start.day);
          return dateA - dateB;
        });

        const aggregated = groupByInterval(filteredElements, computedGranularity.value);
        const labels = [];
        const clicksData = [];
        const spendData = [];

        aggregated.forEach(item => {
          labels.push(item.key.startsWith('Q') ? item.key : formatDateLabel(item.key.replace(/^./, '')));
          clicksData.push(item.clicks);
          spendData.push(item.costInLocalCurrency);
        });

        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(chartCanvas.value, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Clicks',
                data: clicksData,
                borderColor: '#4caf50',
                fill: false
              },
              {
                label: 'Spend',
                data: spendData,
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
      } catch (error) {
        console.error('Error fetching LinkedIn chart data:', error);
      }
    };

    onMounted(fetchChartData);

    watch(
      () => [props.selectedAdAccountId, props.selectedTimeInterval, props.chartStartDate, props.chartEndDate],
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