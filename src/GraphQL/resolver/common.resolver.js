export const HelperQueryResolver = {
  formatDate(date) {
    if (!date) return "";
    return new Date(date).toISOString();
  },
};
