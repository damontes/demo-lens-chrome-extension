import FetchInterceptor from '../fetchInterceptor';
import XHRInterceptor from '../xhrInterceptor';
import ControllerInterceptor from '../controllerInterceptor';
import { AI_AGENTS_TEMPLATES } from './templates';
import {
  inflateKPIPayload,
  inflateQueryData,
  inflateContactReasonsPayload,
  inflateFullSuggestionsResponse,
} from './inflatePayload';

class AIAgentsInterceptor {
  #currentDashboard: any = {};
  #fetchInterceptor: FetchInterceptor | null;
  #xhrInterceptor: XHRInterceptor | null;
  #originUrl: string;
  #organizationData: any = null;
  #organizationDataPromises: ((value: any) => void)[] = [];
  #isValidOrganization: boolean = false;

  constructor(originUrl: string) {
    this.#fetchInterceptor = null;
    this.#xhrInterceptor = null;
    this.#originUrl = originUrl;
  }

  intercept(configurationDashboards?: any[], dashboards?: any, templates?: any) {
    this.#fetchInterceptor = new FetchInterceptor();
    this.#xhrInterceptor = new XHRInterceptor();

    // Testing new prototype-based XHR interceptor (less invasive)
    this.#xhrInterceptor.setConditionTarget((url) => {
      const interceptUrls = AIAgentsInterceptor.intercerptUrls();
      const shouldIntercept = interceptUrls.suggestions.test(url) || interceptUrls.organization.test(url);
      return shouldIntercept;
    });

    this.#xhrInterceptor.startIntercept(async (response, url) => {
      const interceptUrls = AIAgentsInterceptor.intercerptUrls();

      if (interceptUrls.organization.test(url)) {
        try {
          if (response?.organization?.zdSubdomain) {
            this.#organizationData = response.organization;
            this.#isValidOrganization = response.organization.zdSubdomain.startsWith('z3n');

            // Resolve all waiting promises
            this.#organizationDataPromises.forEach((resolve) => resolve(this.#organizationData));
            this.#organizationDataPromises = [];
          }
        } catch (error) {
          console.log('⚠️ Error processing organization data:', error);
        }

        return response;
      }

      if (interceptUrls.suggestions.test(url)) {
        // Wait for organization validation before processing
        await this.#waitForOrganizationData();

        if (!this.#isValidOrganization) {
          return response;
        }

        const urlObj = new URL(url);
        const botId = urlObj.searchParams.get('botId') ?? '';

        const template = ControllerInterceptor.getActiveTemplate(
          configurationDashboards,
          dashboards,
          templates,
          AI_AGENTS_TEMPLATES,
          AIAgentsInterceptor.getDashboardType(),
        );

        if (!template?.configuration?.suggestions) {
          return response;
        }

        return inflateFullSuggestionsResponse(template.configuration.suggestions, botId);
      }

      return response;
    });

    this.#fetchInterceptor.startIntercept(async (url, response, requestBody) => {
      const interceptUrls = AIAgentsInterceptor.intercerptUrls();

      if (interceptUrls.kpiQuery.test(url)) {
        await this.#waitForOrganizationData();

        if (!this.#isValidOrganization) {
          return response;
        }

        const template = ControllerInterceptor.getActiveTemplate(
          configurationDashboards,
          dashboards,
          templates,
          AI_AGENTS_TEMPLATES,
          AIAgentsInterceptor.getDashboardType(),
        );

        if (!template?.configuration?.kpis) {
          return response;
        }

        const fields = requestBody?.fields || [];

        if (fields.length === 0) {
          return response;
        }
        const clone = response.clone();
        const originalData = await clone.json();

        const inflatedData = inflateKPIPayload(fields, template.configuration.kpis, originalData);

        return new Response(JSON.stringify(inflatedData), {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'content-type': 'application/json',
          },
        });
      }

      if (interceptUrls.contactReasons.test(url)) {
        await this.#waitForOrganizationData();

        if (!this.#isValidOrganization) {
          return response;
        }

        const template = ControllerInterceptor.getActiveTemplate(
          configurationDashboards,
          dashboards,
          templates,
          AI_AGENTS_TEMPLATES,
          AIAgentsInterceptor.getDashboardType(),
        );

        if (!template?.configuration?.contactReasons) {
          return response;
        }

        const fields = requestBody?.fields || [];
        const view = requestBody?.view || '';

        const clone = response.clone();
        const originalData = await clone.json();

        const inflatedData = inflateContactReasonsPayload(
          fields,
          template.configuration.contactReasons,
          view,
          originalData?.data || [],
        );

        const responseData = {
          ...originalData,
          data: inflatedData,
        };

        return new Response(JSON.stringify(responseData), {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'content-type': 'application/json',
          },
        });
      }

      if (interceptUrls.queryData.test(url)) {
        try {
          const clone = response.clone();
          let text = await clone.text();

          const formattedText = '[' + text.trim().replace(/\n(?=\S)/g, ',') + ']';

          const extractedJson = JSON.parse(formattedText);

          const completedQueries = extractedJson.filter((item: any) => item.status === 'complete');

          if (completedQueries.length === 0) {
            return response;
          }

          const inflatedQueries = inflateQueryData(completedQueries);

          const newText = inflatedQueries.map((item: any) => JSON.stringify(item)).join('\n') + '\n';

          return new Response(newText, {
            status: response.status,
            statusText: response.statusText,
            headers: {
              ...Object.fromEntries(response.headers.entries()),
            },
          });
        } catch (error) {
          console.log('⚠️ Error processing query data response:', error);
        }

        return response;
      }

      return response;
    });
  }

  #waitForOrganizationData(): Promise<any> {
    if (this.#organizationData) {
      return Promise.resolve(this.#organizationData);
    }

    return new Promise((resolve) => {
      this.#organizationDataPromises.push(resolve);
    });
  }

  static intercerptUrls() {
    return {
      kpiQuery: /^https:\/\/aiagentsproduction(?:\w+).cloud.looker.com\/\/api\/4.0\/queries\/run\/json$/,
      contactReasons: /^https:\/\/aiagentsproduction(?:\w+).cloud.looker.com\/+api\/4.0\/queries\/run\/json_detail$/,
      queryData: /^https:\/\/aiagentsproduction(?:\w+).cloud.looker.com\/api\/internal\/querymanager\/queries(?:\?|$)/,
      suggestions: /^https:\/\/dashboard(?:\.?\w)*.ultimate.ai\/api\/intents\/suggestions(?:\?|$)/,
      organization: /^https:\/\/dashboard(?:\.?\w+)*.ultimate.ai\/api\/getOrganization$/,
    };
  }

  static getDashboardType() {
    return 'aiagents';
  }
}

export default AIAgentsInterceptor;
