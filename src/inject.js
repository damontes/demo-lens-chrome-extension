import { ACTIONS } from './actions/dictionary';
import ExploreInterceptor from './models/exploreInterceptor';

(async function () {
  const stateScript = document.getElementById('__EXTENSION_STATE__');

  let state = stateScript ? JSON.parse(stateScript?.textContent) : {};

  // console.log('GET STATE FROM INJECT.JS', state);

  const { startAnalyzis, activeConfiguration = '', configurations = {}, dashboards = {} } = state;

  const exploreInterceptor = new ExploreInterceptor();

  const configurationDashboards = configurations[activeConfiguration]?.dashboards ?? [];

  if (startAnalyzis || configurationDashboards.length) {
    exploreInterceptor.intercept(configurationDashboards, dashboards);

    const dashboard = await exploreInterceptor.getCurrentDashboard();

    if (startAnalyzis) {
      window.dispatchEvent(
        new CustomEvent(ACTIONS.savedCurrentDashboard, {
          detail: dashboard,
        }),
      );
    }
  }
})();
