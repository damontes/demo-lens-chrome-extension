import {
  inflateOverviewCopilotPayload,
  inflateIntentSuggestionsPayload,
  inflateAutomationPotentialPayload,
} from './inflatePayload';
import ControllerInterceptor from '../controllerInterceptor';
import FetchInterceptor from '../fetchInterceptor';
import { ADMIN_TEMPLATES } from './templates';

const TYPE_QUERY = {
  AdminAiCenterSuggestions: 'ADMIN_CENTER_SUGGESTIONS',
  AdminAiCenterMetrics: 'ADMIN_CENTER_METRICS',
  AdminAiCenterSetupTasks: 'ADMIN_CENTER_SETUP_TASKS',
  IntentSuggestionQuery: 'INTENT_SUGGESTION_QUERY',
  AiAgentsInsights: 'AI_AGENTS_INSIGHTS',
};

class AdminInterceptor {
  #currentDashboard: any = {};
  #fetchInterceptor: FetchInterceptor | null;
  #originUrl: string;

  constructor(originUrl: string) {
    this.#fetchInterceptor = null;
    this.#originUrl = originUrl;
  }

  intercept(configurationDashboards?: any[], dashboards?: any, templates?: any) {
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

      if (type === TYPE_QUERY.IntentSuggestionQuery) {
        const template = ControllerInterceptor.getActiveTemplate(
          configurationDashboards,
          dashboards,
          templates,
          ADMIN_TEMPLATES,
          AdminInterceptor.getDashboardType(),
        );

        if (!template?.configuration?.intentSuggestions) {
          return response;
        }

        const intentSuggestionsData = inflateIntentSuggestionsPayload(template.configuration.intentSuggestions);

        return this.#createGraphQLResponse(response, json, {
          intentSuggestions: intentSuggestionsData,
        });
      }

      if (type === TYPE_QUERY.AiAgentsInsights) {
        const template = ControllerInterceptor.getActiveTemplate(
          configurationDashboards,
          dashboards,
          templates,
          ADMIN_TEMPLATES,
          AdminInterceptor.getDashboardType(),
        );

        if (!template?.configuration?.automationPotential) {
          return response;
        }

        const automationPotentialData = inflateAutomationPotentialPayload(template.configuration.automationPotential);

        return this.#createGraphQLResponse(response, json, {
          aiAgentsInsights: {
            ...json.data.aiAgentsInsights,
            ...automationPotentialData,
          },
        });
      }

      if (
        type === TYPE_QUERY.AdminAiCenterMetrics ||
        type === TYPE_QUERY.AdminAiCenterSuggestions ||
        type === TYPE_QUERY.AdminAiCenterSetupTasks
      ) {
        const template = ControllerInterceptor.getActiveTemplate(
          configurationDashboards,
          dashboards,
          templates,
          ADMIN_TEMPLATES,
          AdminInterceptor.getDashboardType(),
        );

        if (!template) {
          return response;
        }

        const overviewCopilotConfiguration = template.configuration.overviewCopilot;

        const { metrics, setupTasks, suggestions } = inflateOverviewCopilotPayload(overviewCopilotConfiguration);

        let responseData: any = {};

        if (type === TYPE_QUERY.AdminAiCenterMetrics) {
          responseData = {
            adminAiCenterMetrics: {
              period: 20,
              aiUsageMetrics: metrics,
            },
          };
        } else if (type === TYPE_QUERY.AdminAiCenterSuggestions) {
          responseData = {
            adminAiCenterSuggestions: {
              suggestions,
              updatedAt: '2025-03-26 19:43:08',
              sampleSize: 12760,
            },
          };
        } else if (type === TYPE_QUERY.AdminAiCenterSetupTasks) {
          responseData = {
            adminAiCenterSetupTasks: {
              setupTasks,
            },
          };
        }

        return this.#createGraphQLResponse(response, json, responseData);
      }

      return response;
    });
  }

  #createGraphQLResponse(originalResponse: Response, originalJson: any, data: any): Response {
    const newJson = {
      ...originalJson,
      data,
    };

    return new Response(JSON.stringify(newJson), {
      status: originalResponse.status,
      statusText: originalResponse.statusText,
      headers: {
        ...Object.fromEntries(originalResponse.headers.entries()),
        'content-type': 'application/json',
      },
    });
  }

  // getCurrentDashboard(): Promise<any> {
  //   return new Promise((resolve) => {
  //     const intervalId = setInterval(() => {
  //       const { setupTasks } = this.#currentDashboard;
  //       const isComplete = setupTasks?.length;
  //       if (isComplete) {
  //         clearInterval(intervalId);
  //         resolve(this.#currentDashboard);
  //       }
  //     }, 200);
  //   });
  // }

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
