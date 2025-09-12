const path = require("path");
const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ["nativewind"],
      },
    },
    argv
  );
  config.module.rules.push({
    test: /\.css$/i,
    use: ["postcss-loader"],
  });
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve("expo-crypto"),
  };
  config.resolve.alias = {
    ...config.resolve.alias,
    "@": path.resolve(__dirname, "src"),
  };
  return config;
};
