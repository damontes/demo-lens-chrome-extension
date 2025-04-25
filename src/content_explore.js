import { initilizeApp, setAppState } from './lib/chromeExtension';
import { ACTIONS } from './actions/dictionary';

window.addEventListener(ACTIONS.savedCurrentDashboard, async (event) => {
  const currentDashboard = event.detail;

  setAppState({
    startAnalyzis: false,
    currentDashboard,
  });
});

if (location.hostname.startsWith('z3n')) initilizeApp(document);
