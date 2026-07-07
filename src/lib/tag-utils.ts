export function sortTagsByLength(tags: string[]) {
  return tags
    .map((tag, index) => ({ tag, index }))
    .sort((a, b) => {
      const lengthDiff = Array.from(a.tag).length - Array.from(b.tag).length;
      return lengthDiff || a.index - b.index;
    })
    .map(({ tag }) => tag);
}
