import { ACTIONS } from './actions/dictionary';
import ExploreInterceptor from './models/exploreInterceptor';

(async function () {
  console.log('✅ fetch override injected into page!');

  const stateScript = document.getElementById('__EXTENSION_STATE__');

  let state = stateScript ? JSON.parse(stateScript?.textContent) : {};

  console.log('GET STATE FROM INJECT.JS', state);

  const { startAnalyzis, dashboards, dashboardId } = state;

  const exploreInterceptor = new ExploreInterceptor();

  if (startAnalyzis) {
    exploreInterceptor.intercept();

    const dashboard = await exploreInterceptor.getCurrentDashboard();

    window.dispatchEvent(
      new CustomEvent(ACTIONS.savedCurrentDashboard, {
        detail: dashboard,
      }),
    );
  }

  // const currentDashboard = dashboards?.[dashboardId];
  // const activeSceneario = currentDashboard?.activeScenario;

  // if (activeSceneario) {
  //   const scenario = currentDashboard.scenarios[activeSceneario];

  //   const payloadQueries = scenario.payloads.reduce((prev, current) => {
  //     return {
  //       ...prev,
  //       ...current.payloadQueries,
  //     };
  //   }, {});

  //   exploreInterceptor.intercept(payloadQueries);
  // }

  exploreInterceptor.intercept();
})();
