import browser from 'webextension-polyfill';
import { ACTIONS } from '../actions/dictionary';

const APP_STATE_KEY = 'state';

export const getAppState = async () => {
  const result = await browser.storage.local.get(APP_STATE_KEY);
  return result[APP_STATE_KEY];
};

export const setAppState = async (value: any) => {
  const state = await getAppState();
  const result = await browser.storage.local.set({ [APP_STATE_KEY]: { ...(state ?? {}), ...value } });
  return result;
};

export const initilizeApp = async (document: Document) => {
  const savedState = await getAppState();
  const dashboardId = await browser.runtime.sendMessage({ type: ACTIONS.getDashboardId });

  console.log('INITIALIZE APP', dashboardId);
  const stateTag = document.createElement('script');
  stateTag.id = '__EXTENSION_STATE__';
  stateTag.type = 'application/json';
  stateTag.textContent = JSON.stringify({ ...(savedState ?? {}), dashboardId });
  document.head.appendChild(stateTag);

  // Inject script
  const script = document.createElement('script');
  script.src = browser.runtime.getURL('src/inject.js');
  script.onload = () => script.remove();
  document.head.appendChild(script);
};

export const getCurrentTabDetails = async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  const regex = /\/precanned\/([^\/?#]+)/;

  const results = await browser.scripting.executeScript({
    target: { tabId: Number(currentTab.id) },
    func: () => document.title,
  });

  const url = currentTab.url ?? '';
  const dashboardName = results[0].result.split('|').at(0);
  const match = url.match(regex);

  const id = match ? match[1] : '';

  return { url, dashboardName, id };
};
