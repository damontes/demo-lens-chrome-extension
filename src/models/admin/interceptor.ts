import { inflateOverviewCopilotPayload } from './inflatePayload';
import ControllerInterceptor from '../controllerInterceptor';
import FetchInterceptor from '../fetchInterceptor';

export const SUPPORT_SKELETON = {
  adminAiCenterMetrics: {
    period: 30,
    aiUsageMetrics: {
      ticketsCountWithAIRules: {
        currentValue: 719,
        historicalValue: 582,
      },
      ticketsCountWithAutoAssist: {
        currentValue: 14,
        historicalValue: 35,
      },
      ticketsCountWithAISuggestions: {
        currentValue: 58,
        historicalValue: 48,
      },
      agentsCountUsingAISuggestions: {
        currentValue: 22,
        historicalValue: 6,
      },
    },
  },
  adminAiCenterSuggestions: {
    suggestions: null,
    updatedAt: '2025-03-26 19:43:08',
    sampleSize: 12760,
  },
  adminAiCenterSetupTasks: {
    setupTasks: null,
  },
};

const TYPE_QUERY = {
  AdminAiCenterSuggestions: 'ADMIN_CENTER_SUGGESTIONS',
  AdminAiCenterMetrics: 'ADMIN_CENTER_METRICS',
  AdminAiCenterSetupTasks: 'ADMIN_CENTER_SETUP_TASKS',
};

class AdminInterceptor {
  #currentDashboard: any = {};
  #fetchInterceptor: FetchInterceptor | null;
  #originUrl: string;

  constructor(originUrl: string) {
    this.#fetchInterceptor = null;
    this.#originUrl = originUrl;
  }

  intercept(configurationDashboards?: any[], dashboards?: any) {
    this.#fetchInterceptor = new FetchInterceptor();

    // const handleParseDashboard = (response: any) => {
    //   const { actions } = response.definitions;
    //   this.#currentDashboard = {
    //     ...this.#parseDashboard(actions),
    //     ...this.#currentDashboard,
    //   };
    // };

    const handleSetupTasks = (response: any) => {
      const { setupTasks } = response.data.adminAiCenterSetupTasks;

      this.#currentDashboard = {
        ...this.#parseDashboard(),
        setupTasks: setupTasks.map(({ __typename, ...task }: any) => task),
      };
    };

    this.#fetchInterceptor.startIntercept(async (url, response, requestBody) => {
      const clone = response.clone();
      const json = await clone.json();

      // if (AdminInterceptor.isDefinitionsQuery(url)) {
      //   handleParseDashboard(json);
      // }

      const type = AdminInterceptor.getTypeQuery(url, requestBody);

      if (type === TYPE_QUERY.AdminAiCenterSetupTasks) {
        handleSetupTasks(json);
      }

      if (
        type === TYPE_QUERY.AdminAiCenterMetrics ||
        type === TYPE_QUERY.AdminAiCenterSuggestions ||
        type === TYPE_QUERY.AdminAiCenterSetupTasks
      ) {
        const currentDashboard = await this.getCurrentDashboard();
        const activeDashboard = ControllerInterceptor.findActiveDashboard(
          configurationDashboards,
          dashboards,
          ({ dashboardId }) => dashboardId === currentDashboard.id,
        );

        if (!activeDashboard) {
          return response;
        }

        const payload = inflateOverviewCopilotPayload(SUPPORT_SKELETON, activeDashboard);

        let newJson = { ...json };

        if (type === TYPE_QUERY.AdminAiCenterMetrics) {
          newJson = {
            ...newJson,
            data: {
              adminAiCenterMetrics: payload.adminAiCenterMetrics,
            },
          };
        } else if (type === TYPE_QUERY.AdminAiCenterSuggestions) {
          newJson = {
            ...newJson,
            data: {
              adminAiCenterSuggestions: payload.adminAiCenterSuggestions,
            },
          };
        } else if (type === TYPE_QUERY.AdminAiCenterSetupTasks) {
          const { setupTasks } = json.data.adminAiCenterSetupTasks;
          newJson = {
            ...newJson,
            data: {
              adminAiCenterSetupTasks: {
                setupTasks: setupTasks.map((item: any) => {
                  const taskDismissed = payload.adminAiCenterSetupTasks[item.id];
                  return { ...item, dismissed: taskDismissed ?? item.dismissed };
                }),
              },
            },
          };
        }

        return new Response(JSON.stringify(newJson), {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'content-type': 'application/json',
          },
        });
      }

      return response;
    });
  }

  getCurrentDashboard(): Promise<any> {
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        const { setupTasks } = this.#currentDashboard;
        const isComplete = setupTasks?.length;
        if (isComplete) {
          clearInterval(intervalId);
          resolve(this.#currentDashboard);
        }
      }, 200);
    });
  }

  #parseDashboard() {
    const { pathname, hostname } = new URL(this.#originUrl);
    const subdomain = hostname.split('.').at(0);

    return {
      id: `${subdomain}:${pathname}`,
      type: AdminInterceptor.getDashboardType(),
    };
  }

  static getDashboardType() {
    return 'admin';
  }

  static isDefinitionsQuery(url: string) {
    const regex = /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/api\/v2\/triggers\/definitions.json$/;
    return regex.test(url);
  }

  static getTypeQuery(url: string, requestBody: any) {
    const regex = /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/api\/graphql$/;

    if (!regex.test(url)) {
      return null;
    }

    return TYPE_QUERY[requestBody.operationName as keyof typeof TYPE_QUERY] || null;
  }
}

export default AdminInterceptor;
