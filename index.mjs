import { downloadTemplate } from "giget";
import { getNodeVariants } from "./getNodeVariants.mjs";
import fs from 'fs'

export async function getNodeVariantsToUpdate() {
  let oldNodeVariants = []
  try {
    oldNodeVariants = JSON.parse(fs.readFileSync('nodeVariants.json'))
  } catch (e) { /* empty */}

  const { dir } = await downloadTemplate("github:nodejs/docker-node", {
    forceClean: true,
  });
  const newNodeVariants = await getNodeVariants(dir);
  fs.writeFileSync('nodeVariants.json', JSON.stringify(newNodeVariants, null, 2))
  
  const needsToUpdate = getNeedsToUpdateVariants(newNodeVariants, oldNodeVariants)
  
  const variants = needsToUpdate.length > 0 ? needsToUpdate : newNodeVariants 
  return variants
}

function getNeedsToUpdateVariants(newVariants, oldVariants) {
  return newVariants.reduce((acc, newVariant) => {
    const oldVariant = oldVariants.find((variant) => variant.directory === newVariant.directory)
    if (!oldVariant || variantNeedsToUpdate(newVariant, oldVariant)) {
      return [...acc, newVariant]
    }
    return acc
  }, [])
}

function variantNeedsToUpdate(newVariant, oldVariant) {
  return newVariant.tags.reduce((acc, tag) => acc || !oldVariant.tags.includes(tag), false)
}

getNodeVariantsToUpdate();
