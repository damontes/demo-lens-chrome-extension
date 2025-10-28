import { ACTIONS } from './actions/dictionary';
import ControllerInterceptor from './models/controllerInterceptor';

(async function () {
  const stateScript = document.getElementById('__EXTENSION_STATE__');

  let state = stateScript ? JSON.parse(stateScript?.textContent) : {};

  const { startAnalyzis, activeConfiguration = '', configurations = {}, dashboards = {}, templates = {} } = state;

  const url = window.location.href;
  const controllerInterceptor = new ControllerInterceptor();
  const interceptor = await controllerInterceptor.getInterceptor(url);
  const configurationDashboards = configurations[activeConfiguration]?.dashboards ?? [];

  if (startAnalyzis || configurationDashboards.length) {
    interceptor.intercept(configurationDashboards, dashboards, templates);
    if (startAnalyzis) {
      const dashboard = await interceptor?.getCurrentDashboard();

      // Detect if we're in a cross-origin context (like Looker iframes)
      let targetWindow = window.parent;
      try {
        // Test if we can access parent window
        window.parent.location.href;
      } catch (e) {
        // Cross-origin restriction - use current window instead
        targetWindow = window;
      }

      targetWindow.dispatchEvent(
        new CustomEvent(ACTIONS.savedCurrentDashboard, {
          detail: dashboard,
        }),
      );
    }
  }
})();
