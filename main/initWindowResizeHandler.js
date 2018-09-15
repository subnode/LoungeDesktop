import {app} from 'electron';

import storePreferences from './stores/storePreferences';


app.on('browser-window-created', (appEvent_, window) => {
  window.on('resize', () => {
    if (!storePreferences.firstLoadCompleted) {
      return;
    }

    if (!storePreferences.preferences.saveWindowSize) {
      return;
    }

    if (window.isMaximized()) {
      return;
    }

    const [width, height] = window.getContentSize();
    storePreferences.preferences.windowSize = {
      width,
      height,
    };
    storePreferences.$$onMutate();
  });
});
