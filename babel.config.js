module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel', 
      'react-native-reanimated/plugin' // Keep this for your animations
    ],
  };
};