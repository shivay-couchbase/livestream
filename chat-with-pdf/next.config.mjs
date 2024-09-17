/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.resolve.alias.canvas = false;
      config.resolve.fallback = { fs: false, net: false, tls: false };
      return config;
    },
  };
  
  export default nextConfig;