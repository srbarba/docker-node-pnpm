import { downloadTemplate } from "giget";
import { getNodeVariants } from "./getNodeVariants.mjs";
import { getPnpmVariants } from "./getPnpmVariants.mjs";
import fs from "fs";

getVariantsToUpdate();

export async function getVariantsToUpdate() {
  const allNodeVariants = await getAllNodeVariants();
  const allPnpmVariants = await getAllPnpmVariants();
  const { needsToUpdateVariants } = getAllVariants(
    allNodeVariants,
    allPnpmVariants
  );

 return needsToUpdateVariants 
}

function getAllVariants(allNodeVariants, allPnpmVariants) {
  const oldVariants = silentlyReadFile("allVariants.json", []);
  const allVariants = allPnpmVariants.reduce((pnpmAcc, pnpmVariant) => {
    return pnpmAcc.concat(
      ...allNodeVariants.reduce((nodeAcc, nodeVariant) => {
        const tags = pnpmVariant.tags
          .filter((tag) => {
            if (tag === "latest") {
              return pnpmVariant.latest && nodeVariant.latest;
            }
            if (tag === "next") {
              return pnpmVariant.next && nodeVariant.latest;
            }
            if (/^\d+((\.\d+(\.\d+)?)|-(latest|next))?$/.test(tag)) {
              return nodeVariant.latest;
            }
            return true;
          })
          .concat(
            ...pnpmVariant.tags.reduce((tagAcc, tag) => {
              return tagAcc.concat(
                nodeVariant.tags.map((nodeTag) =>
                  /^\d/.test(nodeTag)
                    ? `${tag}-node${nodeTag}`
                    : `${tag}-node-${nodeTag}`
                )
              );
            }, [])
          );
        return nodeAcc.concat({
          version: /^\d/.test(nodeVariant.variant)
            ? `${pnpmVariant.version}-node${nodeVariant.variant}`
            : `${pnpmVariant.version}-node-${nodeVariant.variant}`,
          pnpm: pnpmVariant.version,
          node: nodeVariant.version,
          nodeVariant: nodeVariant.variant,
          pnpmLatest: pnpmVariant.latest,
          pnpmNext: pnpmVariant.next,
          nodeLatest: nodeVariant.latest,
          testTag: `TEST-${tags[0]}`,
          tags,
        });
      }, [])
    );
  }, []);
  fs.writeFileSync("allVariants.json", JSON.stringify(allVariants, null, 2));

  const needsToUpdateVariants = getNeedsToUpdateVariants(
    allVariants,
    oldVariants
  );

  return {
    needsToUpdateVariants,
    allVariants,
  };
}

async function getAllPnpmVariants() {
  const allPnpmVariants = await getPnpmVariants();
  fs.writeFileSync(
    "pnpmVariants.json",
    JSON.stringify(allPnpmVariants, null, 2)
  );
  return allPnpmVariants;
}

async function getAllNodeVariants() {
  const { dir } = await downloadTemplate("github:nodejs/docker-node", {
    forceClean: true,
  });
  const allNodeVariants = await getNodeVariants(dir);
  fs.writeFileSync(
    "nodeVariants.json",
    JSON.stringify(allNodeVariants, null, 2)
  );
  return allNodeVariants;
}

function silentlyReadFile(file, defaultValue) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch (e) {
    return defaultValue;
  }
}

function getNeedsToUpdateVariants(allVariants, oldVariants) {
  return allVariants.reduce((acc, variant) => {
    const oldVariant = oldVariants.find((v) => v.version === variant.version);
    if (!oldVariant || variantNeedsToUpdate(variant, oldVariant)) {
      return [...acc, variant];
    }
    return acc;
  }, []);
}

function variantNeedsToUpdate(variant, oldVariant) {
  return variant.tags.reduce(
    (acc, tag) => acc || !oldVariant.tags.includes(tag),
    false
  );
}
