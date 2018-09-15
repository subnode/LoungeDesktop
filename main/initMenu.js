import {BrowserWindow, Menu, app} from 'electron';
import createWindow from './createWindow';
import ssInitialization from './lib/ssInitialization';
import {appProtocol} from '../common/config';


const isProduction = process.env.NODE_ENV === 'production';

const initCallback = ssInitialization.registerInitialization('menu');



/**
 * @param {string} url
 * @return {boolean}
 */
function isSafeUrl(url) {
  const _scheme = url.match(/^[\w-]+:/);
  const scheme = _scheme ? _scheme.toString() : null;

  if (scheme && scheme !== `${appProtocol}:`) {
    return false;
  }

  return true;
}


/**
 * @param {Object[]} template
 * @returns {Object[]}
 */
function addInspectMenuItem(template, contents, x, y) {
  if (!isProduction) {
    return template.concat([
      template.length && {
        type: 'separator',
      },
      {
        label: 'Inspect(&I)',
        accelerator: 'CommandOrControl+Shift+I',
        click() {
          contents.inspectElement(x, y);
        },
      },
    ]);
  }
  return template;
}

/**
 * @param {webContents} contents
 * @param {boolean} isWebview
 * @param {BrowserWindow} window
 * @param {Object} event
 * @param {Object} params
 * @returns {Menu}
 */
function createMenu(contents, isWebview, window, event, params) {
  const topContents = window.webContents;
  const {selectionText, isEditable, editFlags, linkURL, x, y} = params;

  /**
   * @param {Object[]} template
   * @returns {Menu}
   */
  const processTemplate = template => Menu.buildFromTemplate(addInspectMenuItem(template, contents, x, y).filter(x => x));

  if (linkURL && isSafeUrl(linkURL)) {
    return processTemplate([
      !isWebview && {
        label: 'Open in new window(&W)',
        click() {
          createWindow(linkURL, window);
        },
      },
    ]);
  }

  if (isEditable) {
    return processTemplate([
      {
        role: 'undo',
        accelerator: 'CommandOrControl+Z',
        enabled: editFlags.canUndo,
      },
      {
        role: 'redo',
        accelerator: 'CommandOrControl+Y',
        enabled: editFlags.canRedo,
      },
      {
        type: 'separator',
      },
      {
        role: 'cut',
        accelerator: 'CommandOrControl+X',
        enabled: editFlags.canCut,
      },
      {
        role: 'copy',
        accelerator: 'CommandOrControl+C',
        enabled: editFlags.canCopy,
      },
      {
        role: 'paste',
        accelerator: 'CommandOrControl+V',
        enabled: editFlags.canPaste,
      },
      {
        role: 'delete',
        enabled: editFlags.canDelete,
      },
      {
        type: 'separator',
      },
      {
        role: 'selectall',
        accelerator: 'CommandOrControl+A',
        enabled: editFlags.canSelectAll,
      },
    ]);
  }

  if (selectionText && selectionText.trim()) {
    return processTemplate([
      {
        role: 'copy',
        accelerator: 'CommandOrControl+C',
        enabled: editFlags.canCopy,
      },
      {
        type: 'separator',
      },
      {
        role: 'selectall',
        accelerator: 'CommandOrControl+A',
        enabled: editFlags.canSelectAll,
      },
    ]);
  }

  // default
  return processTemplate([
    {
      label: 'Go Back(&B)',
      accelerator: 'CommandOrControl+Left',
      enabled: contents.canGoBack(),
      click() {
        if (contents.canGoBack()) {
          contents.goBack();
        }
      },
    },
    {
      label: 'Go Forward(&F)',
      accelerator: 'CommandOrControl+Right',
      enabled: contents.canGoForward(),
      click() {
        if (contents.canGoForward()) {
          contents.goForward();
        }
      },
    },
    {
      label: 'Reload(&R)',
      accelerator: 'CommandOrControl+R',
      click() {
        // to deal with <webview>
        contents.reload();
      },
    },
    isWebview && {
      type: 'separator',
    },
    isWebview && {
      label: 'Go Back in Host',
      enabled: topContents.canGoBack(),
      click() {
        if (topContents.canGoBack()) {
          topContents.goBack();
        }
      },
    },
    isWebview && {
      label: 'Go Forward in Host',
      enabled: topContents.canGoForward(),
      click() {
        if (topContents.canGoForward()) {
          topContents.goForward();
        }
      },
    },
    isWebview && {
      label: 'Reload Host',
      click() {
        topContents.reload();
      },
    },
  ]);
}


app.once('ready', () => {
  Menu.setApplicationMenu(null);
  initCallback();
});

app.on('browser-window-created', (appEvent_, window) => {
  window.setMenu(null);
});

app.on('web-contents-created', (appEvent_, contents) => {
  contents.on('context-menu', (contextMenuEvent, params) => {
    let topContents = contents;
    while (topContents.hostWebContents) {
      topContents = topContents.hostWebContents;
    }

    const isWebview = contents !== topContents;

    const window = BrowserWindow.fromWebContents(topContents);
    if (!window) {
      return;
    }

    const menu = createMenu(contents, isWebview, window, contextMenuEvent, params);
    menu.popup(window);
  });
});
