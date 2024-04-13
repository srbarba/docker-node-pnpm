import fs from "fs";
import path from "path";

const pnpmVersion = "8.15.6";
const [pnpmMajor, pnpmMinor, pnpmPatch] = pnpmVersion.split(".");

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
      tags = tags.map((tag) => {
        if (isNaN(Number(tag[0]))) {
          return tag;
        }
        return `${pnpmMajor}.${pnpmMinor}-node${tag}`;
      });
      if (tags.includes("latest")) {
        tags.push(`${pnpmMajor}`);
        tags.push(`${pnpmMajor}.${pnpmMinor}`);
        tags.push(`${pnpmMajor}.${pnpmMinor}.${pnpmPatch}`);
      }

      let directory = `${version}/${variant}`;
      versionsTags.push({
        nodeVersion: `${fullversion.groups.major}.${fullversion.groups.minor}.${fullversion.groups.patch}`,
        variant: tags[0],
        tags,
        architectures: config[version].variants[variant],
        directory,
      });
    }
  }
  return versionsTags;
}
