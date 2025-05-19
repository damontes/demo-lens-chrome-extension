import { ACTIONS } from './actions/dictionary';
import ExploreInterceptor from './models/exploreInterceptor';

(async function () {
  const stateScript = document.getElementById('__EXTENSION_STATE__');

  let state = stateScript ? JSON.parse(stateScript?.textContent) : {};

  const { startAnalyzis, activeConfiguration = '', configurations = {}, dashboards = {} } = state;

  const exploreInterceptor = new ExploreInterceptor();

  const configurationDashboards = configurations[activeConfiguration]?.dashboards ?? [];

  if (startAnalyzis || configurationDashboards.length) {
    exploreInterceptor.intercept(configurationDashboards, dashboards);

    if (startAnalyzis) {
      const dashboard = await exploreInterceptor.getCurrentDashboard();

      window.dispatchEvent(
        new CustomEvent(ACTIONS.savedCurrentDashboard, {
          detail: dashboard,
        }),
      );
    }
  }
})();
