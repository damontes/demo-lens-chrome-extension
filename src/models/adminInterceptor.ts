import { inflatePayload } from '@/lib/adminInflatePayload';
import ControllerInterceptor from './controllerInterceptor';
import FetchInterceptor from './fetchInterceptor';

export const SUPPORT_SKELETON = {
  adminAiCenterMetrics: {
    period: 30,
    aiUsageMetrics: {
      ticketsCountWithAIRules: {
        currentValue: 103,
        historicalValue: 2,
      },
      ticketsCountWithAutoAssist: {
        currentValue: 22,
        historicalValue: 7,
      },
      ticketsCountWithAISuggestions: {
        currentValue: 24,
        historicalValue: 12,
      },
      agentsCountUsingAISuggestions: {
        currentValue: 5,
        historicalValue: 3,
      },
    },
  },
  adminAiCenterSuggestions: {
    suggestions: [
      {
        id: '',
        type: '',
        tags: [],
        status: 'new',
        data: {
          action_value: '',
          actions: [
            {
              field: '',
              value: '',
            },
          ],
          analysed_period: 15,
          impacted_metric: 'First reply time',
          intents: [],
          metric_expected_improvement: 5820,
          num_tickets: 898,
          percent_tickets: 0.11,
          precision: 0.64,
        },
        createdAt: '2025-03-14 13:47:57',
      },
    ],
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

    const handleParseDashboard = (response: any) => {
      const { actions } = response.definitions;
      this.#currentDashboard = {
        ...this.#parseDashboard(actions),
        ...this.#currentDashboard,
      };
    };

    const handleSetupTasks = (response: any) => {
      const { setupTasks } = response.data.adminAiCenterSetupTasks;

      this.#currentDashboard = {
        ...this.#currentDashboard,
        setupTasks: setupTasks.map(({ __typename, ...task }: any) => task),
      };
    };

    this.#fetchInterceptor.startIntercept(async (url, response, requestBody) => {
      const clone = response.clone();
      const json = await clone.json();

      if (AdminInterceptor.isDefinitionsQuery(url)) {
        handleParseDashboard(json);
      }

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
          currentDashboard,
        );

        if (!activeDashboard) {
          return response;
        }

        const payload = inflatePayload(SUPPORT_SKELETON, activeDashboard);

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

  reset() {
    if (!this.#fetchInterceptor) return;

    this.#currentDashboard = null;
    this.#fetchInterceptor.reset();
  }

  getCurrentDashboard() {
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        const { groups = [], intents, setupTasks } = this.#currentDashboard;
        const isComplete = groups.length && intents && setupTasks.length;
        if (isComplete) {
          clearInterval(intervalId);
          resolve(this.#currentDashboard);
        }
      }, 200);
    });
  }

  #parseDashboard(dashboard: any) {
    const intents = dashboard.find((action: any) => action.title === 'Intent')?.values;
    const assignees = dashboard.find((action: any) => action.subject === 'assignee_id')?.values;
    const groups = dashboard.find((action: any) => action.subject === 'group_id')?.values;

    const { pathname, hostname } = new URL(this.#originUrl);
    const subdomain = hostname.split('.').at(0);

    return {
      id: `${subdomain}:${pathname}`,
      type: AdminInterceptor.getDashboardType(),
      groups,
      assignees,
      intents: intents?.map((item: any) => ({ ...item, title: item.title.split('::').at(-1) })) ?? [],
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
