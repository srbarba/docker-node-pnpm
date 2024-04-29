import { exec } from "child_process";

export async function getDockerImagePlatforms(dockerImage) {
  const inspect = await getDockerInspect(dockerImage);
  const isAlpine = dockerImage.includes('alpine')
  return inspect.manifests.reduce((platforms, manifest) => {
    const platform = `${manifest.platform.os}/${manifest.platform.architecture}`;
    if (isAlpine && !["amd64", "arm64"].includes(manifest.platform.architecture)) {
      return platforms
    }

    platforms.push(
      manifest.platform.variant
        ? `${platform}/${manifest.platform.variant}`
        : platform
    );
    return platforms;
  }, []);
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
