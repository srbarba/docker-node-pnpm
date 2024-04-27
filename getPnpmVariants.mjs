export async function getPnpmVariants() {
  const url = `https://registry.npmjs.org/pnpm`;
  const response = await fetch(url);
  const data = await response.json();
  const tags = data["dist-tags"];
  const versions = getLatestVersions(tags);
  return getVersionVariants(versions);
}

function getVersionVariants(versions) {
  return versions.reduce((acc, version) => {
    if (version.next !== version.latest) {
      acc.push(getNextVersionVariant(version));
      acc.push(getLatestVersionVariant(version));
    } else {
      acc.push(getUnionVersionVariant(version));
    }
    return acc;
  }, []);
}

function getNextVersionVariant(version) {
  const [major, minor, patch] = version.next.split(".");
  const tags = [`${major}.${minor}.${patch}`, `${major}-next`];

  if (version.isNext) {
    tags.push("next");
  }

  return {
    version: version.next,
    latest: false,
    next: version.isNext,
    tags,
  };
}

function getLatestVersionVariant(version) {
  const [major, minor, patch] = version.latest.split(".");
  const tags = [
    major,
    `${major}.${minor}`,
    `${major}.${minor}.${patch}`,
    `${major}-latest`,
  ];

  if (version.isLatest) {
    tags.push("latest");
  }

  return {
    version: version.latest,
    latest: version.isLatest,
    next: false,
    tags,
  };
}

function getUnionVersionVariant(version) {
  const [lMajor, lMinor, lPatch] = version.latest.split(".");
  const tags = [
    lMajor,
    `${lMajor}.${lMinor}`,
    `${lMajor}.${lMinor}.${lPatch}`,
    `${lMajor}-latest`,
  ];

  if (version.isLatest) {
    tags.push("latest");
  }

  if (version.isNext) {
    tags.push("next");
  }

  return {
    version: version.latest,
    latest: version.isLatest,
    next: version.isNext,
    tags,
  };
}

function getLatestVersions(tags) {
  const majors = Object.entries(tags).reduce((versions, [key, version]) => {
    const major = version.split(".")[0];
    const latestOrNext = key.split("-")[0];
    if (!versions[major]) {
      versions[major] = {};
    }
    Object.assign(versions[major], {
      major,
      [latestOrNext]: version,
      isLatest: versions[major].isLatest || key === "latest",
      isNext: false,
    });
    return versions;
  }, {});
  const lastMajorVersions = Object.values(majors)
    .sort((a, b) => b.major - a.major)
    .slice(0, 1);
  lastMajorVersions[0].isNext = true;
  return lastMajorVersions;
}

function getNextAndLatestVersion(tags) {
  const latest = tags.latest;
  const latestMajor = latest.split(".")[0];
  const next = tags[`next-${latestMajor + 1}`] || tags[`next-${latestMajor}`];
  return { latest, next };
}

function getLastMajorVersions(tags, latest) {
  const latestMajor = latest.split(".")[0];
  const lastMajorVersions = tags.filter((tag) => tag.startsWith(latestMajor));
  return lastMajorVersions;
}
