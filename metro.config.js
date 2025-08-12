const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle native-only modules on web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

config.resolver.alias = {
  ...config.resolver.alias,
  // Alias react-native-maps to empty module for web platform
  'react-native-maps': require.resolve('./web-stubs/react-native-maps.js'),
};

module.exports = config;