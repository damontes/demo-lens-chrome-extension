import { ACTIONS, DEFAULT_CONFIG } from '@/actions/dictionary';
import ExploreInterceptor from '@/models/explore/interceptor';
import AdminInterceptor from '@/models/admin/interceptor';

const APP_STATE_KEY = 'state';

export const getAppState = async () => {
  const result = await chrome.storage?.local.get(APP_STATE_KEY);
  const stringPayload = result[APP_STATE_KEY] ?? '{}';
  const payload = JSON.parse(stringPayload);
  return injectMissingData(payload);
};

export const setAppState = async (value: any) => {
  const state = await getAppState();
  const payload = JSON.stringify({ ...(state ?? {}), ...value }, null, 0);
  const result = await chrome.storage?.local.set({ [APP_STATE_KEY]: payload });
  return result;
};

export const openChromeExtension = () => {
  chrome.runtime.sendMessage({
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
  script.src = chrome.runtime.getURL('src/inject.js');
  document.head.appendChild(script);
};

export const getCurrentTabDetails = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  const regex = /\/precanned\/([^\/?#]+)/;

  const results = await chrome.scripting.executeScript({
    target: { tabId: Number(currentTab.id) },
    func: () => document.title,
  });

  const url = currentTab.url ?? '';
  const dashboardName = results[0].result?.split('|').at(0);
  const match = url.match(regex);

  const id = match ? match[1] : '';

  return { url, dashboardName, id };
};

export const getCurrentVersion = async () => {
  const manifest = await chrome.runtime.getManifest();
  return manifest.version;
};

export const setTabIcon = async (path: string) => {
  await chrome.action.setIcon({
    path: {
      '16': path,
    },
  });
};

export const changeTabIcon = async (iconPath: string) => {
  chrome.runtime.sendMessage({
    type: ACTIONS.changeIcon,
    payload: { iconPath },
  });
};

function injectMissingData(payload: any) {
  const templates = payload.templates ?? {};

  return {
    ...payload,
    dashboards: Object.entries(payload.dashboards ?? {}).reduce((acc, [key, item]: any) => {
      // Handle Explore dashboards
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

      // Handle Admin dashboards - create temporary template if none exists
      if (item.type === AdminInterceptor.getDashboardType()) {
        // Check if this admin dashboard has a templateId
        if (!item.templateId) {
          // Create a temporary template from existing dashboard data
          const tempTemplateId = `temp_${key.replace(/[^a-zA-Z0-9]/g, '_')}`;

          // Create temporary template configuration matching OverviewCopilotConfiguration
          const tempTemplate = {
            id: tempTemplateId,
            type: item.type,
            createdAt: Date.now(),
            name: `${item.name} (Migrated)`,
            description: 'Automatically migrated from existing dashboard configuration',
            industry: ['general'],
            isTemporary: true,
            configuration: {
              overviewCopilot: {
                setupTasks: item.setupTasks,
                metrics: item.metrics,
                recommendations: item.recommendations,
              },
            },
          };

          // Add to templates if not already there
          const existingTemplate = templates[tempTemplateId];
          if (!existingTemplate) {
            templates[tempTemplateId] = tempTemplate;
          }

          // Return dashboard with templateId reference
          return {
            ...acc,
            [key]: {
              name: item.name,
              sourceName: item.sourceName,
              type: item.type,
              templateId: tempTemplateId,
            },
          };
        }

        // If templateId already exists, keep as is
        return {
          ...acc,
          [key]: item,
        };
      }

      return {
        ...acc,
        [key]: item,
      };
    }, payload.dashboards ?? {}),
    templates,
  };
}
