import { ACTIONS } from '@/actions/dictionary';
import { initilizeApp, setAppState } from '@/lib/chromeExtension';

initilizeApp(document);

window.addEventListener(ACTIONS.savedCurrentDashboard, async (event) => {
  const currentDashboard = (event as CustomEvent).detail;

  setAppState({
    startAnalyzis: false,
    currentDashboard,
  });
});
