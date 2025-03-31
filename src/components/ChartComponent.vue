// Import date-fns for date formatting
import { format, parseISO } from 'date-fns';

export default {
  methods: {
    formatDate(dateString) {
      try {
        // Parse the date string and format it as mm/dd/yyyy
        return format(parseISO(dateString), 'MM/dd/yyyy');
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
      }
    },
  },
  mounted() {
    // Example: Update chart data with formatted dates
    this.chartData.labels = this.chartData.labels.map((dateString) =>
      this.formatDate(dateString)
    );
  },
};