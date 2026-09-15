const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase JS SDK's "exports" field confuses Metro's package-exports
// resolution and loads the web build of firebase/auth instead of the
// React Native one, which throws "Component auth has not been registered
// yet". Disabling it makes Metro fall back to the main/react-native fields.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
