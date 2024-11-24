export const parseTags = (tags: string): string[] => {
  return tags ? tags.split(',').map(tag => tag.trim()) : [];
};
