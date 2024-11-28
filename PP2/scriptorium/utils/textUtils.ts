export const truncateText = (text: string, maxLength: number = 15) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};