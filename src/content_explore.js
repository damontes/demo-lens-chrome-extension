import { initilizeApp, openChromeExtension, setAppState } from './lib/chromeExtension';
import { showGlobalNotification } from './lib/notifications';
import { ACTIONS } from './actions/dictionary';

initilizeApp(document);

window.addEventListener(ACTIONS.savedCurrentDashboard, async (event) => {
  const currentDashboard = event.detail;

  setAppState({
    startAnalyzis: false,
    currentDashboard,
  });
});

window.addEventListener(ACTIONS.saveDrillInQuery, async (event) => {
  const { newDashboards, initialRoute } = event.detail;
  await setAppState({ initialRoute, dashboards: newDashboards });

  try {
    await openChromeExtension();
  } catch (error) {
    showGlobalNotification(
      'DemoLens',
      'Drill in query saved successfully, but extension not able to open.',
      NOTIFICATION_TYPES.success,
    );
  }
});

window.addEventListener(ACTIONS.updateDrillInQuery, async (event) => {
  const { newDashboards } = event.detail;
  await setAppState({ dashboards: newDashboards });
});
