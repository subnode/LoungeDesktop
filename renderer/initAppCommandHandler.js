import * as ipc from './lib/ipc';


let currentMouseX;
let currentMouseY;


/**
 * @param {MouseEvent} event
 */
function mouseMoveHandler(event) {
  currentMouseX = event.pageX;
  currentMouseY = event.pageY;
}


document.addEventListener('mouseenter', mouseMoveHandler);
document.addEventListener('mousemove', mouseMoveHandler);

ipc.on('appCommand', command => {
  const element = document.elementFromPoint(currentMouseX, currentMouseY);
  const isWebview = element.tagName.toLowerCase() === 'webview';

  if (isWebview) {
    /** @type {webContents} */
    const contents = element.getWebContents();

    switch (command) {
      case 'browser-backward':
        if (contents.canGoBack()) {
          contents.goBack();
        }
        break;

      case 'browser-forward':
        if (contents.canGoForward()) {
          contents.goForward();
        }
        break;
    }
    return;
  }

  switch (command) {
    case 'browser-backward':
      history.back();
      break;

    case 'browser-forward':
      history.forward();
      break;
  }
});
