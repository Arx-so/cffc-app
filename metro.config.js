const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const baseResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === "web" &&
    (moduleName === "zustand" || moduleName.startsWith("zustand/"))
  ) {
    return {
      type: "sourceFile",
      filePath: require.resolve(moduleName, { paths: [__dirname] }),
    };
  }

  const resolve = baseResolveRequest ?? context.resolveRequest;
  return resolve(context, moduleName, platform);
};

module.exports = config;
