const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'node_modules/react-native-web-maps/lib/index.js'),
    };
  }
  // Fallback to the default resolver for other modules or platforms
  return originalResolveRequest(context, moduleName, platform);
};

module.exports = config;