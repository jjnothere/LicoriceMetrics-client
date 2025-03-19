<!-- LineChart.vue -->
<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'LineChartComponent',
  props: {
    selectedAdAccountId: {
      type: String,
      required: false
    }
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chartInstance = null;

    const fetchChartData = async () => {
      try {
        const response = await axios.get('/api/linkedin/chart-data', {
          params: {
            start: '2024-06-01',
            end: '2024-08-01',
            fields: 'clicks,costInLocalCurrency',
            accountId: props.selectedAdAccountId || 'YOUR_FALLBACK_ID'
          },
          withCredentials: true
        });

        const elements = response.data.elements || [];
        const labels = [];
        const clicksData = [];
        const spendData = [];

        elements.forEach(item => {
          const { year, month, day } = item.dateRange.start;
          const dateLabel = `${month}/${day}/${year}`;
          labels.push(dateLabel);
          clicksData.push(item.clicks || 0);
          spendData.push(item.costInLocalCurrency || 0);
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
              y: { title: { display: true, text: 'Value' } }
            }
          }
        });
      } catch (error) {
        console.error('Error fetching LinkedIn chart data:', error);
      }
    };

    onMounted(fetchChartData);

    watch(
      () => props.selectedAdAccountId,
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