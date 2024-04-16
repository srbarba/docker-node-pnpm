import { exec } from "child_process";

export async function getDockerImagePlatforms(dockerImage) {
  const inspect = await getDockerInspect(dockerImage);
  console.dir(inspect.manifests);
  return inspect.manifests.map((manifest) => {
    const platform = `${manifest.platform.os}/${manifest.platform.architecture}`;
    return manifest.platform.variant
      ? `${platform}/${manifest.platform.variant}`
      : platform;
  });
}

function getDockerInspect(dockerImage) {
  return new Promise((resolve, reject) => {
    exec(`docker manifest inspect ${dockerImage}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      if (stderr) {
        reject(stderr);
      }
      try {
        const inspect = JSON.parse(stdout);
        resolve(inspect);
      } catch (e) {
        console.log(stdout);
        reject(e);
      }
    });
  });
}
