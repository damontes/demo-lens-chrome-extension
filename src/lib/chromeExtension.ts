import { ACTIONS, DEFAULT_CONFIG, NOTIFICATION_TYPES } from '@/actions/dictionary';
import ExploreInterceptor from '@/models/exploreInterceptor';
import browser from 'webextension-polyfill';

const APP_STATE_KEY = 'state';

export const getAppState = async () => {
  const result = await browser.storage.local.get(APP_STATE_KEY);
  const stringPayload = result[APP_STATE_KEY] ?? '{}';
  const payload = JSON.parse(stringPayload);
  return injectMissingData(payload);
};

export const setAppState = async (value: any) => {
  const state = await getAppState();
  const payload = JSON.stringify({ ...(state ?? {}), ...value }, null, 0);
  const result = await browser.storage.local.set({ [APP_STATE_KEY]: payload });
  return result;
};

export const openChromeExtension = () => {
  browser.runtime.sendMessage({
    type: ACTIONS.openChromeExtension,
  });
};

export const initilizeApp = async (document: Document) => {
  const savedState = await getAppState();

  const isActive = savedState?.activeConfiguration ?? false;
  const pathIcon = isActive ? 'icon/16_active.png' : 'icon/16.png';

  await changeTabIcon(pathIcon);

  const stateTag = document.createElement('script');
  stateTag.id = '__EXTENSION_STATE__';
  stateTag.type = 'application/json';
  stateTag.textContent = JSON.stringify({ ...(savedState ?? {}) });
  document.head.appendChild(stateTag);

  // Inject script
  const script = document.createElement('script');
  script.id = '__MY_INJECTED_SCRIPT__';
  script.src = browser.runtime.getURL('src/inject.js');
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

export const getCurrentVersion = async () => {
  const manifest = await browser.runtime.getManifest();
  return manifest.version;
};

export const setTabIcon = async (path: string) => {
  await browser.action.setIcon({
    path: {
      '16': path,
    },
  });
};

export const changeTabIcon = async (iconPath: string) => {
  browser.runtime.sendMessage({
    type: ACTIONS.changeIcon,
    payload: { iconPath },
  });
};

function injectMissingData(payload: any) {
  return {
    ...payload,
    dashboards: Object.entries(payload.dashboards ?? {}).reduce((acc, [key, item]: any) => {
      if (item.type === ExploreInterceptor.getDashboardType()) {
        return {
          ...acc,
          [key]: {
            ...item,
            tabs: item.tabs?.map((tab: any) => ({
              ...tab,
              queries: Object.entries(tab.queries).reduce((acc, [key, item]: any) => {
                return {
                  ...acc,
                  [key]: {
                    ...item,
                    config: item.config ?? DEFAULT_CONFIG,
                  },
                };
              }, {}),
            })),
          },
        };
      }

      return acc;
    }, payload.dashboards ?? {}),
  };
}
