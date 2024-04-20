import { downloadTemplate } from "giget";
import { getNodeVariants } from "./getNodeVariants.mjs";
import fs from "fs";

export async function getNodeVariantsToUpdate() {
  const oldNodeVariants = silentlyReadFile("nodeVariants.json", []);
  const { dir } = await downloadTemplate("github:nodejs/docker-node", {
    forceClean: true,
  });
  const newNodeVariants = await getNodeVariants(dir);
  fs.writeFileSync(
    "nodeVariants.json",
    JSON.stringify(newNodeVariants, null, 2)
  );

  const needsToUpdate = getNeedsToUpdateVariants(
    newNodeVariants,
    oldNodeVariants
  );

  const forceUpdate = process.env.UPDATE_NODE_IMAGES === "true";
  const variants =
    needsToUpdate.length === 0 && forceUpdate ? newNodeVariants : needsToUpdate;
  return variants;
}

function silentlyReadFile(file, defaultValue) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch (e) {
    return defaultValue;
  }
}

function getNeedsToUpdateVariants(newVariants, oldVariants) {
  return newVariants.reduce((acc, newVariant) => {
    const oldVariant = oldVariants.find(
      (variant) => variant.directory === newVariant.directory
    );
    if (!oldVariant || variantNeedsToUpdate(newVariant, oldVariant)) {
      return [...acc, newVariant];
    }
    return acc;
  }, []);
}

function variantNeedsToUpdate(newVariant, oldVariant) {
  return newVariant.tags.reduce(
    (acc, tag) => acc || !oldVariant.tags.includes(tag),
    false
  );
}
