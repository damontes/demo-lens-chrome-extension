import { initilizeApp, setAppState } from './lib/chromeExtension';
import { ACTIONS } from './actions/dictionary';

initilizeApp(document);
cleanSessionStorages();

window.addEventListener(ACTIONS.savedCurrentDashboard, async (event) => {
  const currentDashboard = event.detail;

  setAppState({
    startAnalyzis: false,
    currentDashboard,
  });
});

function cleanSessionStorages() {
  const keysToRemove = ['visible_workstreams'];

  keysToRemove.forEach((key) => {
    sessionStorage.removeItem(key);
  });
}
