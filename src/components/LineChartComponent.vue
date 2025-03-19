<!-- LineChart.vue -->
<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'LineChartComponent',
  props: {
    chartData: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      required: true
    },
    chartDataReady: {
      type: Boolean,
      required: true
    }
  },
  emits: ['point-clicked'],
  setup(props, { emit }) {
    const chartCanvas = ref(null);
    let chartInstance = null;

    const handlePointClick = (event) => {
      console.log("Point clicked:", event);
      emit('point-clicked', event);
    };

    const renderChart = () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
      chartInstance = new Chart(chartCanvas.value, {
        type: 'line',
        data: props.chartData,
        options: {
          ...props.options,
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const elementIndex = elements[0].index;
              const dateLabel = props.chartData.labels[elementIndex];
              console.log("🐒 ~ dateLabel:", dateLabel);
              handlePointClick(dateLabel);
            }
          },
          onHover: (event, elements) => {
            if (elements.length > 0) {
              const elementIndex = elements[0].index;
              const pointColor = props.chartData.datasets[0].pointBackgroundColor?.[elementIndex];
              event.native.target.style.cursor = pointColor === 'red' ? 'pointer' : 'default';
            } else {
              event.native.target.style.cursor = 'default';
            }
          }
        }
      });
    };

    onMounted(() => {
      if (props.chartDataReady) {
        renderChart();
      }
    });

    watch(() => props.chartDataReady, (newVal) => {
      if (newVal) {
        renderChart();
      }
    });

    watch(() => props.chartData, (newData) => {
      if (chartInstance) {
        chartInstance.data = newData;
        chartInstance.update();
      }
    });

    watch(() => props.options, (newOptions) => {
      if (chartInstance) {
        chartInstance.options = newOptions;
        chartInstance.update();
      }
    });

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