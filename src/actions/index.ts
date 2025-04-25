import browser from 'webextension-polyfill';
import { getAppState, setAppState } from '../lib/chromeExtension';

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
