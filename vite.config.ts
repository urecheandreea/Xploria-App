// Importing the `defineConfig` function from Vite.
// This helps to write the Vite configuration in a type-safe and clear manner.
// `defineConfig` ensures that the configuration is validated and offers autocompletion during development.
import { defineConfig } from 'vite';

// Importing the `vite-plugin-node-stdlib-browser` plugin.
// This plugin adds polyfills for Node.js standard library modules that are not natively available in the browser.
// For example, Node.js includes modules like `path`, `fs`, `buffer`, which do not exist in the browser.
// This plugin makes these modules available in the browser environment.
import nodePolyfills from 'vite-plugin-node-stdlib-browser';

// Exporting the Vite configuration using the `defineConfig` function.
// `defineConfig` ensures that the configuration is properly typed and validated.
export default defineConfig({
    // Here, you can add other Vite configuration options, such as:
    // - server: for configuring the development server
    // - build: for build-related settings
    // - optimizeDeps: for optimizing dependencies, etc.

    // Adding the `nodePolyfills` plugin to the Vite plugin array.
    // The `nodePolyfills()` function will add support for polyfills for Node.js modules,
    // so you can use modules like `path`, `fs`, etc., in the browser without errors.
    plugins: [nodePolyfills()],
});
