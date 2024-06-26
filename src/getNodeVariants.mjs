import fs from "fs";
import path from "path";

export async function getNodeVariants(dir) {
  const versionsTags = [];

  const { default: config } = await import(`${dir}/versions.json`, {
    assert: { type: "json" },
  });

  const versions = Object.keys(config).reverse();

  let midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const now = midnight.getTime();
  const aplineRE = new RegExp(/alpine*/);
  const slimRE = new RegExp(/\*-slim/);
  let foundLTS = false;
  let foundCurrent = false;

  for (const version of versions) {
    let lts = new Date(`${config[version].lts}T00:00:00.00`).getTime();
    let maintenance = new Date(
      `${config[version].maintenance}T00:00:00.00`
    ).getTime();
    let isCurrent = foundCurrent ? false : isNaN(lts) || lts >= now;
    foundCurrent = isCurrent || foundCurrent;
    let isLTS = foundLTS ? false : now >= lts;
    foundLTS = isLTS || foundLTS;
    let codename = config[version].codename;
    let defaultAlpine = config[version]["alpine-default"];
    let defaultDebian = config[version]["debian-default"];
    let variants = config[version].variants;
    let fullversion;
    for (const variant in variants) {
      let isLatest = false
      let dockerfilePath = path.join(dir, version, variant, "Dockerfile");
      let isAlpine = aplineRE.test(variant);
      let isSlim = slimRE.test(variant);
      let isDefaultSlim = new RegExp(`${defaultDebian}-slim`).test(variant);

      // Get full version from the first Dockerfile
      if (!fullversion) {
        let dockerfile = fs.readFileSync(dockerfilePath, "utf-8");
        fullversion = dockerfile.match(
          /ENV NODE_VERSION (?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)/
        );
      }
      let tags = [
        `${fullversion.groups.major}.${fullversion.groups.minor}.${fullversion.groups.patch}-${variant}`,
        `${fullversion.groups.major}.${fullversion.groups.minor}-${variant}`,
        `${fullversion.groups.major}-${variant}`,
      ];

      if (codename) {
        tags.push(`${codename}-${variant}`);
      }

      if (variant === defaultAlpine) {
        tags.push(
          `${fullversion.groups.major}.${fullversion.groups.minor}.${fullversion.groups.patch}-alpine`
        );
        tags.push(
          `${fullversion.groups.major}.${fullversion.groups.minor}-alpine`
        );
        tags.push(`${fullversion.groups.major}-alpine`);
        if (codename) {
          tags.push(`${codename}-alpine`);
        }
      }

      if (variant === defaultDebian) {
        tags.push(
          `${fullversion.groups.major}.${fullversion.groups.minor}.${fullversion.groups.patch}`
        );
        tags.push(`${fullversion.groups.major}.${fullversion.groups.minor}`);
        tags.push(`${fullversion.groups.major}`);
        if (isSlim) {
          tags.push(
            `${fullversion.groups.major}.${fullversion.groups.minor}.${fullversion.groups.patch}-slim`
          );
          tags.push(
            `${fullversion.groups.major}.${fullversion.groups.minor}-slim`
          );
          tags.push(`${fullversion.groups.major}-slim`);
        }
        if (codename) {
          tags.push(`${codename}`);
        }
      }
      if (isDefaultSlim) {
        tags.push(
          `${fullversion.groups.major}.${fullversion.groups.minor}.${fullversion.groups.patch}-slim`
        );
        tags.push(
          `${fullversion.groups.major}.${fullversion.groups.minor}-slim`
        );
        tags.push(`${fullversion.groups.major}-slim`);
        if (codename) {
          tags.push(`${codename}-slim`);
        }
      }

      if (isCurrent) {
        if (variant === defaultAlpine) {
          tags.push(variant);
          tags.push(
            `${fullversion.groups.major}.${fullversion.groups.minor}.${fullversion.groups.patch}-alpine`
          );
          tags.push(
            `${fullversion.groups.major}.${fullversion.groups.minor}-alpine`
          );
          tags.push(`${fullversion.groups.major}-alpine`);
          tags.push("alpine");
          tags.push("current-alpine");
        }
        if (variant === defaultDebian) {
          isLatest = true
          tags.push(variant);
          tags.push("latest");
          tags.push("current");
        }
        if (isAlpine) {
          tags.push(`${variant}`);
          tags.push(`current-${variant}`);
        }
        if (!isAlpine) {
          tags.push(`${variant}`);
          tags.push(`current-${variant}`);
        }
        if (isDefaultSlim) {
          tags.push("slim");
          tags.push("current-slim");
        }
      }

      if (isLTS) {
        tags.push(`lts-${variant}`);
        if (variant === defaultAlpine) {
        }
        if (variant === defaultDebian) {
          tags.push("lts");
          if (codename) {
            tags.push(`lts-${codename}`);
          }
        }
        if (isDefaultSlim) {
          tags.push(`lts-slim`);
        }
        if (variant === defaultAlpine) {
          tags.push(`lts-alpine`);
        }
      }

      // remove duplicates
      tags = tags.filter((x, i, a) => a.indexOf(x) == i);
      tags = tags.sort();
      const mainVariant = tags[0];

      let directory = `${version}/${variant}`;
      versionsTags.push({
        version: `${fullversion.groups.major}.${fullversion.groups.minor}.${fullversion.groups.patch}`,
        variant: mainVariant,
        latest: isLatest,
        tags,
        directory,
      });
    }
  }
  return versionsTags;
}
