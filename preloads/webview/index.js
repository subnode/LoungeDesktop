import {ipcRenderer} from 'electron';

import cssCode from '!!raw-loader!./style.css';


// set window.invokeNativeShare
// eslint-disable-next-line no-multi-assign
const invokeNativeShare = window[$O('invokeNativeShare')] = strObject => {
  ipcRenderer.sendToHost('@share', strObject);
};

// modify Function.prototype.toString to make window.invokeNativeShare pretend a native code
const toStringString = Function.prototype.toString.toString();
const orgToString = Function.prototype.toString;
// eslint-disable-next-line no-extend-native
Function.prototype.toString = function(...args) {
  switch (this) {
    case invokeNativeShare:
      return $O('function invokeNativeShare() { [native code] }');

    case Function.prototype.toString:
      return toStringString;
  }
  return orgToString.apply(this, ...args);
};


// apply css

let preferences = null;

ipcRenderer.on('@preferences', (event_, newPreferences) => {
  preferences = JSON.parse(newPreferences);
});

Promise.all([
  new Promise(resolve => ipcRenderer.once('@preferences', resolve)),
  new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, {once: true})),
]).then(() => {
  if (!preferences.applyCustomCssToWebview) {
    return;
  }

  const styleSheetTextElement = document.createTextNode(cssCode);

  const styleElement = document.createElement('style');
  styleElement.appendChild(styleSheetTextElement);

  const [headElement] = document.getElementsByTagName('head');
  headElement.appendChild(styleElement);
}).catch(error => {
  console.warn(error);
});

{
  // HACK: request for preferences until received
  // because somehow host cannot send messages to a guest (this) in the beginning
  const func = () => {
    if (preferences) {
      return;
    }
    ipcRenderer.sendToHost('@getPreferences');
    setTimeout(func, 100);
  };
  setTimeout(func, 0);
}

