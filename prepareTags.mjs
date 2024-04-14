export function prepareTags(tags, prefix) {
  const pnpmTags = tags.map((tag) => {
    if (isNaN(Number(tag[0]))) {
      return tag;
    }
    return `${pnpmMajor}.${pnpmMinor}-node${tag}`;
  });
  if (pnpmTags.includes("latest")) {
    pnpmTags.push(`${pnpmMajor}`);
    pnpmTags.push(`${pnpmMajor}.${pnpmMinor}`);
    pnpmTags.push(`${pnpmMajor}.${pnpmMinor}.${pnpmPatch}`);
  }

  const prefixedTags = pnpmTags.map((tag) => {
    return `${prefix}${tag}`;
  });

  return prefixedTags.join(",");
}
