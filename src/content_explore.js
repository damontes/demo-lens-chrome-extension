import { initilizeApp, setAppState } from './lib/chromeExtension';
import { ACTIONS } from './actions/dictionary';

initilizeApp(document);

window.addEventListener(ACTIONS.savedCurrentDashboard, async (event) => {
  const currentDashboard = event.detail;

  setAppState({
    startAnalyzis: false,
    currentDashboard,
  });
});
