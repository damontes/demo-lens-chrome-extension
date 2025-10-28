import { ACTIONS } from '@/actions/dictionary';
import { initilizeApp, setAppState } from '@/lib/chromeExtension';

const observer = new MutationObserver(async (mutations) => {
  for (const mutation of mutations) {
    for (const node of Array.from(mutation.addedNodes)) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const iframe = (node as Element).querySelector('iframe.packages-mount-point-style-iframe');
        if (iframe instanceof HTMLIFrameElement && iframe) {
          await initilizeApp(iframe.contentDocument || iframe.contentWindow?.document);
        }
      }
    }
  }
});

observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

window.addEventListener(ACTIONS.savedCurrentDashboard, async (event) => {
  const currentDashboard = (event as CustomEvent).detail;

  setAppState({
    startAnalyzis: false,
    currentDashboard,
  });
});
