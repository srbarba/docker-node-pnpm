import { exec } from "child_process";

export async function getDockerImagePlatforms(dockerImage) {
  const inspect = await getDockerInspect(dockerImage);
  return inspect.manifests.map((manifest) => {
    const platform = `${manifest.platform.os}/${manifest.platform.architecture}`;
    return manifest.platform.variant
      ? `${platform}/${manifest.platform.variant}`
      : platform;
  });
}

function getDockerInspect(dockerImage) {
  return new Promise((resolve, reject) => {
    exec(`docker inspect ${dockerImage}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      if (stderr) {
        reject(stderr);
      }
      const inspect = JSON.parse(stdout);
      resolve(inspect);
    });
  });
}