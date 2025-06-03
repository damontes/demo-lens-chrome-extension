import browser from 'webextension-polyfill';
import { getAppState, setAppState } from '../lib/chromeExtension';
import { ACTIONS } from './dictionary';

export const reloadDashboard = async () => {
  const tab = await getCurrentTab();
  if (!tab.id) return;
  await browser.tabs.reload(tab.id);
};

export const startAnalyzis = async () => {
  await setAppState({
    startAnalyzis: true,
    currentDashboard: null,
  });

  await reloadDashboard();
  return waitForDashboard();
};

export const saveActiveConfiguration = async (activeConfiguration: string) => {
  await setAppState({
    activeConfiguration,
  });

  await reloadDashboard();
};

export const syncState = async (payload: any) => {
  return browser.runtime.sendMessage({
    type: ACTIONS.syncState,
    payload,
  });
};

function waitForDashboard() {
  const MAX_WAIT_TIME = 12000; // 10 seconds
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      if (Date.now() - startTime > MAX_WAIT_TIME) {
        clearInterval(intervalId);
        reject(new Error('Timeout waiting for analyzing dashboard'));
      }

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
