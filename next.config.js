const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Ensure Turbopack treats this folder as the workspace root.
    root: path.resolve(__dirname)
  }
};

module.exports = nextConfig;
