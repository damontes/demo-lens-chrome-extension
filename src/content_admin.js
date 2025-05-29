import { initilizeApp, setAppState } from './lib/chromeExtension';
import { ACTIONS } from './actions/dictionary';

const observer = new MutationObserver(async (mutations) => {
  for (const mutation of mutations) {
    for (const node of Array.from(mutation.addedNodes)) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const iframe = node.querySelector('iframe.packages-mount-point-style-iframe');
        if (iframe instanceof HTMLIFrameElement && iframe) {
          await initilizeApp(iframe.contentDocument || iframe.contentWindow.document);
        }
      }
    }
  }
});

observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

window.addEventListener(ACTIONS.savedCurrentDashboard, async (event) => {
  const currentDashboard = event.detail;

  setAppState({
    startAnalyzis: false,
    currentDashboard,
  });
});
