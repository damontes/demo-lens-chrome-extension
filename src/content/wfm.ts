import { ACTIONS } from '@/actions/dictionary';
import { initilizeApp, setAppState } from '@/lib/chromeExtension';

initilizeApp(document);
cleanSessionStorages();

window.addEventListener(ACTIONS.savedCurrentDashboard, async (event) => {
  const currentDashboard = (event as CustomEvent).detail;

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
