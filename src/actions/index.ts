import browser from 'webextension-polyfill';
import { getAppState, setAppState } from '../lib/chromeExtension';

export const startAnalyzis = async () => {
  const tab = await getCurrentTab();

  if (!tab.id) return;

  await setAppState({
    startAnalyzis: true,
    currentDashboardId: null,
  });

  await browser.tabs.reload(tab.id);

  return waitForDashboard();
};

export const activeScenario = async (dashboards: any) => {
  const tab = await getCurrentTab();

  if (!tab.id) return;

  await setAppState({
    dashboards,
  });

  await browser.tabs.reload(tab.id);
};

function waitForDashboard() {
  return new Promise((resolve) => {
    const intervalId = setInterval(async () => {
      const state = await getAppState();
      const { dashboards = {}, currentDashboardId } = state;
      if (currentDashboardId) {
        clearInterval(intervalId);
        resolve({ id: currentDashboardId, ...dashboards[currentDashboardId] });
      }
    }, 1000);
  });
}

async function getCurrentTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}
