<!-- LineChart.vue -->
<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import api from '../api';
import { ref, onMounted, watch, computed } from 'vue';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation'; // Import annotation plugin
import { colorMapping, keyMapping, metricMapping } from '../constants/constants'; // Import colorMapping, keyAliasMapping, and metricMapping

Chart.register(...registerables, annotationPlugin); // Register annotation plugin

function buildFields(m1, m2) {
  const fields = new Set();
  [m1, m2].forEach(metric => {
    if (metric === 'clickThroughRate') {
      fields.add('clicks');
      fields.add('impressions');
    } else if (metric === 'costPerClick') {
      fields.add('clicks');
      fields.add('costInLocalCurrency');
    } else if (metric === 'costPerThousandImpressions') {
      fields.add('costInLocalCurrency');
      fields.add('impressions');
    } else if (metric === 'costPerConversion') {
      fields.add('costInLocalCurrency');
      fields.add('externalWebsiteConversions');
    } else if (metric === 'costPerThousandUniqueUsers') {
      fields.add('approximateMemberReach');
      fields.add('costInLocalCurrency');
    } else {
      fields.add(metric);
    }
  });
  return Array.from(fields).join(',');
}

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
    },
    activeFilters: {
      type: Array,
      default: () => []
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

        if (isNaN(date.getTime())) {
          console.error(`Invalid date encountered in groupByInterval: ${JSON.stringify(item.dateRange.start)}`);
          return null; // Skip invalid dates
        }

        const formatter = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });

        switch (interval) {
          case 'WEEKLY':
            const dayOfWeek = date.getDay();
            const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const monday = new Date(date.getTime());
            monday.setDate(monday.getDate() - offset);
            return `W:${formatter.format(monday)}`;
          case 'MONTHLY':
            return `M:${formatter.format(new Date(date.getFullYear(), date.getMonth(), 1))}`;
          case 'QUARTERLY':
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            return `Q${quarter}-${date.getFullYear()}`;
          default:
            return `D:${formatter.format(date)}`;
        }
      };

      const aggregatedMap = {};
      sortedElements.forEach(item => {
        const key = formatKey(item);
        if (!key) return; // Skip invalid dates
        if (!aggregatedMap[key]) {
          aggregatedMap[key] = {
            rawDate: item.dateRange.start,
            metric1: 0, metric2: 0,
            metric1Clicks: 0, metric1Impressions: 0,
            metric2Clicks: 0, metric2Impressions: 0,
            metric1Cost: 0, metric2Cost: 0,
            metric1ExternalWebsiteConversions: 0, metric2ExternalWebsiteConversions: 0
          };
        }
        // If user selected CTR for metric1, accumulate clicks/impressions
        if (props.metric1 === 'clickThroughRate') {
          aggregatedMap[key].metric1Clicks += parseFloat(item.clicks) || 0;
          aggregatedMap[key].metric1Impressions += parseFloat(item.impressions) || 0;
        } else if (props.metric1 === 'costPerClick') {
          aggregatedMap[key].metric1Clicks += parseFloat(item.clicks) || 0;
          aggregatedMap[key].metric1Cost += parseFloat(item.costInLocalCurrency) || 0;
        } else if (props.metric1 === 'costPerThousandImpressions') {
          aggregatedMap[key].metric1Cost += parseFloat(item.costInLocalCurrency) || 0;
          aggregatedMap[key].metric1Impressions += parseFloat(item.impressions) || 0;
        } else if (props.metric1 === 'costPerConversion') {
          aggregatedMap[key].metric1Cost += parseFloat(item.costInLocalCurrency) || 0;
          aggregatedMap[key].metric1ExternalWebsiteConversions += parseFloat(item.externalWebsiteConversions) || 0;
        } else if (props.metric1 === 'costPerThousandUniqueUsers') {
          aggregatedMap[key].metric1Cost += parseFloat(item.costInLocalCurrency) || 0;
          aggregatedMap[key].metric1Reach = (aggregatedMap[key].metric1Reach || 0) + parseFloat(item.approximateMemberReach) || 0;
        } else {
          aggregatedMap[key].metric1 += parseFloat(item[props.metric1]) || 0;
        }

        // Same logic for metric2
        if (props.metric2 === 'clickThroughRate') {
          aggregatedMap[key].metric2Clicks += parseFloat(item.clicks) || 0;
          aggregatedMap[key].metric2Impressions += parseFloat(item.impressions) || 0;
        } else if (props.metric2 === 'costPerClick') {
          aggregatedMap[key].metric2Clicks += parseFloat(item.clicks) || 0;
          aggregatedMap[key].metric2Cost += parseFloat(item.costInLocalCurrency) || 0;
        } else if (props.metric2 === 'costPerThousandImpressions') {
          aggregatedMap[key].metric2Cost += parseFloat(item.costInLocalCurrency) || 0;
          aggregatedMap[key].metric2Impressions += parseFloat(item.impressions) || 0;
        } else if (props.metric2 === 'costPerConversion') {
          aggregatedMap[key].metric2Cost += parseFloat(item.costInLocalCurrency) || 0;
          aggregatedMap[key].metric2ExternalWebsiteConversions += parseFloat(item.externalWebsiteConversions) || 0;
        } else if (props.metric2 === 'costPerThousandUniqueUsers') {
          aggregatedMap[key].metric2Cost += parseFloat(item.costInLocalCurrency) || 0;
          aggregatedMap[key].metric2Reach = (aggregatedMap[key].metric2Reach || 0) + parseFloat(item.approximateMemberReach) || 0;
        } else {
          aggregatedMap[key].metric2 += parseFloat(item[props.metric2]) || 0;
        }
      });

      return Object.entries(aggregatedMap).map(([key, data]) => {
        let m1 = props.metric1 === 'clickThroughRate'
          ? (data.metric1Impressions ? (data.metric1Clicks / data.metric1Impressions) * 100 : 0)
          : props.metric1 === 'costPerClick'
          ? (data.metric1Clicks ? data.metric1Cost / data.metric1Clicks : 0)
          : props.metric1 === 'costPerThousandImpressions'
          ? (data.metric1Impressions ? (data.metric1Cost / data.metric1Impressions) * 1000 : 0)
          : props.metric1 === 'costPerConversion'
          ? (data.metric1ExternalWebsiteConversions ? data.metric1Cost / data.metric1ExternalWebsiteConversions : 0)
          : props.metric1 === 'costPerThousandUniqueUsers'
          ? (data.metric1Reach ? (data.metric1Cost / data.metric1Reach) * 1000 : 0)
          : data.metric1;
        let m2 = props.metric2 === 'clickThroughRate'
          ? (data.metric2Impressions ? (data.metric2Clicks / data.metric2Impressions) * 100 : 0)
          : props.metric2 === 'costPerClick'
          ? (data.metric2Clicks ? data.metric2Cost / data.metric2Clicks : 0)
          : props.metric2 === 'costPerThousandImpressions'
          ? (data.metric2Impressions ? (data.metric2Cost / data.metric2Impressions) * 1000 : 0)
          : props.metric2 === 'costPerConversion'
          ? (data.metric2ExternalWebsiteConversions ? data.metric2Cost / data.metric2ExternalWebsiteConversions : 0)
          : props.metric2 === 'costPerThousandUniqueUsers'
          ? (data.metric2Reach ? (data.metric2Cost / data.metric2Reach) * 1000 : 0)
          : data.metric2;
        return { key, date: data.rawDate, metric1: m1, metric2: m2 };
      }).sort((a, b) => {
        const dateA = new Date(a.date.year, a.date.month - 1, a.date.day); // Correct month
        const dateB = new Date(b.date.year, b.date.month - 1, b.date.day); // Correct month
        return dateA - dateB;
      });
    }

    const formatDateLabel = (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error(`Invalid date encountered in formatDateLabel: ${dateString}`);
        return 'Invalid Date'; // Fallback for invalid dates
      }
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      return formatter.format(date); // Format as "MM/DD/YYYY"
    };

    // --- helpers to normalize labels and build complete bucket lists ---
    function formatMDY(d) {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(d);
    }

    function labelFromKey(key) {
      // keys come back like "D:MM/DD/YYYY", "W:MM/DD/YYYY", "M:MM/DD/YYYY" or "Qn-YYYY"
      return key.startsWith('Q') ? key : key.slice(2);
    }

    function buildBuckets(startDate, endDate, granularity) {
      const buckets = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (granularity === 'QUARTERLY') {
        // Build Qn-YYYY between start and end
        const sY = start.getFullYear();
        const eY = end.getFullYear();
        for (let y = sY; y <= eY; y++) {
          for (let q = 1; q <= 4; q++) {
            const qStartMonth = (q - 1) * 3;
            const qStart = new Date(y, qStartMonth, 1);
            const qEnd = new Date(y, qStartMonth + 3, 0);
            if (qEnd < start || qStart > end) continue;
            buckets.push(`Q${q}-${y}`);
          }
        }
        return buckets;
      }

      if (granularity === 'MONTHLY') {
        const d = new Date(start.getFullYear(), start.getMonth(), 1);
        while (d <= end) {
          buckets.push(formatMDY(new Date(d.getFullYear(), d.getMonth(), 1)));
          d.setMonth(d.getMonth() + 1);
        }
        return buckets;
      }

      if (granularity === 'WEEKLY') {
        const d = new Date(start);
        // roll back to Monday
        const day = d.getDay();
        const offset = day === 0 ? 6 : day - 1;
        d.setDate(d.getDate() - offset);
        while (d <= end) {
          buckets.push(formatMDY(d));
          d.setDate(d.getDate() + 7);
        }
        return buckets;
      }

      // DAILY
      const d = new Date(start);
      while (d <= end) {
        buckets.push(formatMDY(d));
        d.setDate(d.getDate() + 1);
      }
      return buckets;
    }

    // --- Insert groupedChangeKeys computed property ---
    const groupedChangeKeys = computed(() => {
      const map = {};
      props.differences.forEach(diff => {
        const formatted = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date(diff.date));
        if (!map[formatted]) map[formatted] = new Set();
        Object.keys(diff.changes || {}).forEach(key => map[formatted].add(key));
      });
      const result = {};
      for (const [date, set] of Object.entries(map)) {
        result[date] = Array.from(set);
      }
      return result;
    });

    function mapToIntervalDate(dateStr) {
      const d = new Date(dateStr);
      if (computedGranularity.value === 'WEEKLY') {
        // roll back to Monday
        const day = d.getDay(),
              offset = day === 0 ? 6 : day - 1;
        d.setDate(d.getDate() - offset);
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(d);

      } else if (computedGranularity.value === 'MONTHLY') {
        // snap to first of month
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(new Date(d.getFullYear(), d.getMonth(), 1));

      } else if (computedGranularity.value === 'QUARTERLY') {
        // snap to quarter label (e.g. "Q2-2024")
        const quarter = Math.floor(d.getMonth() / 3) + 1;
        return `Q${quarter}-${d.getFullYear()}`;

      } else {
        // DAILY – leave as-is
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(d);
      }
    }

    // --- Replace getChangeDates computed property ---
    const getChangeDates = computed(() => Object.keys(groupedChangeKeys.value));

    // --- Update getCategoryColors function ---
    const getCategoryColors = (date) => {
      const keys = groupedChangeKeys.value[date] || [];
      let filteredKeys;
      if (!props.activeFilters.length || props.activeFilters.includes('all')) {
        filteredKeys = keys;
      } else {
        filteredKeys = keys.filter(key => {
          const mapped = keyMapping[key] || key;
          return props.activeFilters.includes(mapped);
        });
      }
      const colors = filteredKeys.map(key => {
        const mapped = keyMapping[key] || key;
        return colorMapping[mapped] || 'black';
      });
      return colors.length ? colors : ['black'];
    };

    const fetchChartData = async () => {
      try {
        const startDate = formatDate(props.chartStartDate);
        const endDate = formatDate(props.chartEndDate);
        const fieldsParam = buildFields(props.metric1, props.metric2);

        const response = await api.get('/linkedin/chart-data', {
          params: {
            start: startDate,
            end: endDate,
            fields: fieldsParam,
            accountId: props.selectedAdAccountId || 'YOUR_FALLBACK_ID',
            timeGranularity: computedGranularity.value,
            campaigns: props.selectedCampaignIds // Send campaigns as an array
          },
          withCredentials: true
        });
        console.log("🐒 ~ response:", JSON.stringify(response.data.elements))

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
      // --- new block: build labels and metric arrays with 0s for missing buckets ---
      const labels = buildBuckets(props.chartStartDate, props.chartEndDate, computedGranularity.value);
      const aggMap = new Map(aggregated.map(item => [labelFromKey(item.key), { m1: item.metric1, m2: item.metric2 }]));
      const metric1Data = labels.map(l => (aggMap.get(l)?.m1 ?? 0));
      const metric2Data = labels.map(l => (aggMap.get(l)?.m2 ?? 0));
      const changeDates = getChangeDates.value;

      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(chartCanvas.value, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: metricMapping[props.metric1] || props.metric1,
              data: metric1Data,
              borderColor: '#6A9A1F', // Earthy Green
              fill: false,
              pointBackgroundColor: labels.map((label) =>
                getCategoryColors(label).length > 1 ? 'transparent' : getCategoryColors(label)[0]
              ),
              pointRadius: labels.map((label) =>
                changeDates.includes(label) ? 3 : 0
              ),
              borderWidth: 2,
              yAxisID: 'yAxis1'
            },
            {
              label: metricMapping[props.metric2] || props.metric2,
              data: metric2Data,
              borderColor: '#D32F2F', // Warm Red
              fill: false,
              pointBackgroundColor: labels.map((label) =>
                getCategoryColors(label).length > 1 ? 'transparent' : getCategoryColors(label)[0]
              ),
              pointRadius: labels.map((label) =>
                changeDates.includes(label) ? 3 : 0
              ),
              borderWidth: 2,
              yAxisID: 'yAxis2'
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
                  const displayLabel = metricMapping[context.dataset.label] || context.dataset.label;
                  if (changeDates.includes(date)) {
                    return `${displayLabel}: ${context.raw}`;
                  }
                  return `${displayLabel}: ${context.raw}`;
                }
              }
            },
            annotation: {
              annotations: (() => {
                const bucketMap = {};
                Object.entries(groupedChangeKeys.value).forEach(([rawDate, keys]) => {
                  const bucket = mapToIntervalDate(rawDate);
                  if (!bucketMap[bucket]) bucketMap[bucket] = new Set();
                  keys.forEach(k => bucketMap[bucket].add(k));
                });
                // Only annotate dates that exist as categories; otherwise Chart.js appends them to the end
                return Object.entries(bucketMap).flatMap(([bucketDate, keySet]) => {
                  if (!labels.includes(bucketDate)) return [];
                  const colors = Array.from(keySet).map(key => {
                    const mapped = keyMapping[key] || key;
                    return colorMapping[mapped] || 'black';
                  }).filter((c, i, a) => a.indexOf(c) === i);
                  const n = colors.length;
                  const dashLen = 8;
                  return colors.map((color, idx) => ({
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x',
                    value: bucketDate,
                    borderColor: color,
                    borderWidth: 4,
                    borderDash: [dashLen, dashLen * (n - 1)],
                    borderDashOffset: idx * dashLen,
                    label: {
                      content: idx === 0 ? `Changes (${n})` : '',
                      enabled: idx === 0,
                      position: 'top',
                      backgroundColor: color
                    },
                    onClick: () => scrollToTableRow(bucketDate)
                  }));
                });
              })()
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
            yAxis1: {
              type: 'linear',
              display: true,
              position: 'left',
              ticks: {
                color: '#6A9A1F'
              },
              title: {
                display: true,
                text: metricMapping[props.metric1] || props.metric1,
                color: '#6A9A1F'
              },
              grid: {
                drawOnChartArea: true,
                drawBorder: true,
                drawTicks: true
              },
              border: {
                display: true
              }
            },
            yAxis2: {
              type: 'linear',
              display: true,
              position: 'right',
              ticks: {
                color: '#D32F2F'
              },
              title: {
                display: true,
                text: metricMapping[props.metric2] || props.metric2,
                color: '#D32F2F'
              },
              grid: {
                drawOnChartArea: false,
                drawBorder: true,
                drawTicks: false
              },
              border: {
                display: true
              }
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

    // Remove old watch on props.differences and use diffIdList for reactive chart update

    const diffIdList = computed(() =>
      props.differences.map(diff => diff._id).sort().join(',')
    );

    watch(diffIdList, () => {
      updateChart();
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
  height: 300px !important;
}

.flash-row {
  animation: flash 0.5s ease-in-out 6; /* Flash 6 times (3 seconds total) */
  background-color: #1c1c21; /* Add light gray background color */
}

@keyframes flash {
  0%, 100% {
    background-color: #1c1c21; /* Light gray at the start and end */
    opacity: 1;
  }
  50% {
    background-color: transparent; /* Transparent in the middle */
    opacity: 0.5;
  }
}
</style>