import { Platform } from 'react-native';

// Reactotron must be imported FIRST (before any other imports)
// But ONLY on native platforms (iOS/Android), NOT on web
if (__DEV__ && Platform.OS !== 'web') {
  require('./reactotron.config');
}

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
