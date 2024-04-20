# docker-node-pnpm

Non-official Docker Node images with pnpm pre-installed.

# srbarba/pnpm

This Docker image is an extension of the official Node image, designed for developers who wish to use pnpm, a fast and efficient package manager, as an alternative to npm. Like the official Node images, this image provides a robust and reliable environment for running Node.js applications, but with the added benefit of having pnpm already installed and ready to use.

## Why Use This Image?

Improved Efficiency: pnpm offers better storage efficiency and speed compared to npm, which can help reduce build times in both development and production environments.
Compatibility: This image closely follows the updates and configurations of the official Node image, ensuring that any project that works on the official Node image will work just as well here, with the additional advantage of pnpm.
Ready to Use: No additional installations are needed to start managing dependencies with pnpm.
Usage

You can use this image exactly as you would use the base Node image, with the difference being that when you need to manage packages, you should use pnpm instead of npm.

## Configurations and Extensions

Specific configurations, including environment variables, volumes, and command options, are handled in the same way as in the official Node image. For more details on operation and configuration options, refer to the documentation of the official Node image.

## Maintenance and Updates

The maintenance of this image follows the update cycle of the official Node image, with additional updates for pnpm as necessary to take advantage of the latest improvements and security fixes.
