import browser from 'webextension-polyfill';
import { getAppState, setAppState } from '../lib/chromeExtension';
import { ACTIONS } from './dictionary';

export const startAnalyzis = async () => {
  const tab = await getCurrentTab();

  if (!tab.id) return;

  await setAppState({
    startAnalyzis: true,
  });

  await browser.tabs.reload(tab.id);

  return waitForDashboard();
};

export const saveActiveConfiguration = async (activeConfiguration: string) => {
  const tab = await getCurrentTab();

  if (!tab.id) return;

  await setAppState({
    activeConfiguration,
  });

  await browser.tabs.reload(tab.id);
};

export const saveTabs = async (dashboards: any, dashboardId: string, tabs: any) => {
  const browserTab = await getCurrentTab();

  if (!browserTab.id) return;

  await setAppState({
    dashboards: {
      ...dashboards,
      [dashboardId]: {
        ...dashboards[dashboardId],
        tabs,
      },
    },
  });

  await browser.tabs.reload(browserTab.id);
};

export const syncState = async (payload: any) => {
  return browser.runtime.sendMessage({
    type: ACTIONS.syncState,
    payload,
  });
};

function waitForDashboard() {
  return new Promise((resolve) => {
    const intervalId = setInterval(async () => {
      const state = await getAppState();
      const { currentDashboard } = state;
      if (currentDashboard) {
        clearInterval(intervalId);
        resolve(currentDashboard);
      }
    }, 1000);
  });
}

async function getCurrentTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}
