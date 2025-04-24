import { getAppState, initilizeApp, setAppState } from './lib/chromeExtension';
import { ACTIONS } from './actions/dictionary';

// console.log('INITIALIZE APP');

// browser.runtime.onMessage.addListener((message) => {
//   console.log('MESSAGE', message);
//   if (message.action === ACTIONS.savedCurrentDashboard) {
//     const event = new CustomEvent(ACTIONS.startInterception, {
//       detail: message.payload ?? null,
//     });

//     window.dispatchEvent(event);
//   }
// });

window.addEventListener(ACTIONS.savedCurrentDashboard, async (event) => {
  const data = event.detail;
  const { id, tabs } = data;
  const prevState = await getAppState();
  const prevDashboards = prevState.dashboards ?? {};

  setAppState({
    startAnalyzis: false,
    currentDashboardId: id,
    dashboards: {
      ...prevDashboards,
      [id]: {
        tabs,
      },
    },
  });
});

initilizeApp(document);
