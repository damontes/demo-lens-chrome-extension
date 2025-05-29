import { ACTIONS } from './actions/dictionary';
import ControllerInterceptor from './models/controllerInterceptor';

(async function () {
  const stateScript = document.getElementById('__EXTENSION_STATE__');

  let state = stateScript ? JSON.parse(stateScript?.textContent) : {};

  console.log('GET STATE FROM INJECT.JS', state);

  const { startAnalyzis, activeConfiguration = '', configurations = {}, dashboards = {} } = state;

  const url = window.location.href;

  const controllerInterceptor = new ControllerInterceptor();

  const interceptor = controllerInterceptor.getInterceptor(url);

  const configurationDashboards = configurations[activeConfiguration]?.dashboards ?? [];

  if (startAnalyzis || configurationDashboards.length) {
    interceptor.intercept(configurationDashboards, dashboards);

    if (startAnalyzis) {
      const dashboard = await interceptor.getCurrentDashboard();

      window.parent.dispatchEvent(
        new CustomEvent(ACTIONS.savedCurrentDashboard, {
          detail: dashboard,
        }),
      );
    }
  }
})();
