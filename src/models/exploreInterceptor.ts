import { inflatePayload, lighInflatePayload } from '../lib/exploreInflatePayload';
import ControllerInterpceptor from './controllerInterceptor';
import FetchInterceptor from './fetchInterceptor';
import XHRInterceptor from './xhrInterceptor';

export const EXPLORE_SKELETON = {
  type: 'result',
  content: {
    result: {
      relatedGlobalVariables: [],
      columns: [
        {
          isAll: 0,
          isForecast: 0,
          members: [
            {
              name: '',
              levelName: '',
              levelDisplayName: '',
              dataField: '',
              isAll: '',
              isSubTotal: '',
              attributeDatafield: '',
              displayName: '',
              dimensionName: '',
              dimensionType: '',
              isRepetition: '',
              attributeName: '',
              attributeDisplayName: '',
            },
          ],
        },
      ],
      config: {},
      measureDataFieldToDisplayFormat: {
        'talk.agentsOnline.global': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'ask.talk.away': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'talk.callsInQueue.global': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'talk.callbacksInQueue.global': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'Longest wait time (min)': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'ask.talk.offline': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'talk.averageWaitTime.global': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'talk.liveCalls.global': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'talk.maxWaitTime.global': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'ask.talk.online': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'ask.talk.transfer': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'Average wait time (min)': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
      },
      rows: [
        {
          isAll: 0,
          isForecast: 0,
          members: [
            {
              name: 'row all',
              levelName: 'row all',
              levelDisplayName: '',
              dataField: 'row all',
              isAll: 'false',
              isSubTotal: 'false',
              attributeDatafield: null,
              displayName: 'row all',
              dimensionName: 'row all',
              dimensionType: 'standard',
              isRepetition: 'false',
              attributeName: 'row all',
              attributeDisplayName: '',
            },
          ],
        },
      ],
      measures: [
        {
          aggregationType: '',
          position: '',
          originalMeasure: '',
          displayName: '',
          aggregator: '',
          levelName: '',
          levelDisplayName: '',
          uniqueName: '',
          name: '',
          displayNameWithoutAggregator: '',
          isMeasure: '',
          dataField: '',
        },
      ],
      columnsHeaders: [],
      columnsDataFields: [],
      explosionsHeaders: [],
      explosionsHierarchyXML: [],
      rowsHeaders: [],
      rowsDataFields: [],
      rowsRelatedObjects: [],
      columnsHierarchyXML: [],
      rowsHierarchyXML: [],
      cellData: [],
      stats: {
        maximum: 0,
        minimum: 0,
        isExplosion: 0,
        minMaxColors: [],
        colors: [],
        gradientColor: 0,
        measureNameToMinMaxValues: {},
      },
      warningMessage: '',
      warningMessages: [],
      mongodbAggregations: [],
      bubblingValues: {
        global: {},
        perProfile: [],
      },
      sqlQueries: [],
      filters: [
        {
          type: '',
          shortDescription: '',
          longDescription: '',
        },
      ],
      uuid: '',
      queryId: '',
      cubeModelId: '',
      allDataFields: [],
    },
    queryId: null,
  },
  isSuccess: true,
  uuid: '',
};

class ExploreInterceptor {
  #currentDashboard: any;
  #xhrInterceptor: XHRInterceptor | null;
  #fetchInterceptor: FetchInterceptor | null;

  constructor() {
    this.#xhrInterceptor = null;
    this.#fetchInterceptor = null;
  }

  intercept(configurationDashboards?: any[], dashboards?: any) {
    this.#xhrInterceptor = new XHRInterceptor();
    this.#fetchInterceptor = new FetchInterceptor();

    const handleDashboard = (response: any) => {
      this.#currentDashboard = this.#parseDashboard(response);
    };

    this.#xhrInterceptor.setConditionTarget((url) => {
      return ExploreInterceptor.isDashboardBimeo(url);
    });

    this.#xhrInterceptor.startIntercept((response) => {
      handleDashboard(response);
      return response;
    });

    this.#fetchInterceptor.startIntercept(async (url, response, requestBody) => {
      const clone = response.clone();
      const json = await clone.json();

      if (ExploreInterceptor.isDashboardFromZendesk(url)) {
        const dashboard = json.data.user.dashboards.edges[0].node.publishedVersionFrontJson;
        handleDashboard(dashboard);
      }

      if (ExploreInterceptor.isExploreQuery(url)) {
        const queryId = json.content.queryId || json.queryId;

        const activeDashboard = ControllerInterpceptor.findActiveDashboard(
          configurationDashboards,
          dashboards,
          this.#currentDashboard,
        );

        if (!activeDashboard) {
          return response;
        }

        const tabId = requestBody?.content?.tabId;
        const currentTab = this.#currentDashboard.tabs.find((tab: any) =>
          tabId ? tab.id === tabId : tab.queries[queryId],
        );
        const query = currentTab?.queries[queryId];
        const { querySchema, visualizationType, cubeModelId } = query;

        try {
          const isLive = activeDashboard.isLive ?? false;

          const lightInfaltePayload = !isLive
            ? activeDashboard?.tabs.find((tab: any) => tab.id === currentTab.id).queries[queryId].payload
            : null;

          const payload = inflatePayload(EXPLORE_SKELETON, querySchema, visualizationType, lightInfaltePayload);

          const newJson = {
            isSuccess: true,
            type: 'result',
            uuid: json.uuid,
            content: {
              result: { ...payload, uuid: json.uuid, queryId: String(queryId), cubeModelId },
              queryId,
            },
          };

          return new Response(JSON.stringify(newJson), {
            status: response.status,
            statusText: response.statusText,
            headers: {
              ...Object.fromEntries(response.headers.entries()),
              'content-type': 'application/json',
            },
          });
        } catch (error) {
          console.log('===ERROR===', error);
        }
      }

      return response;
    });
  }

  reset() {
    if (!this.#fetchInterceptor || !this.#xhrInterceptor) return;

    this.#currentDashboard = null;
    this.#fetchInterceptor.reset();
    this.#xhrInterceptor.reset();
  }

  getCurrentDashboard() {
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        const tabs = this.#currentDashboard?.tabs ?? [];
        const totalQueries = tabs.flatMap((tab: any) => Object.values(tab.queries));
        const isComplete = totalQueries.length ? totalQueries.every((query: any) => query?.completed) : false;

        if (isComplete) {
          clearInterval(intervalId);
          resolve(this.#currentDashboard);
        }
      }, 200);
    });
  }

  #parseDashboard(dashboard: any) {
    const { mainTag, queries: rawQueries, tabs } = dashboard;

    return {
      id: mainTag.guid,
      type: ExploreInterceptor.getDashboardType(),
      tabs: tabs.map((tab: any) => {
        const { id, name, name_translation_key, widgets: rawWidgets, tag_id: tagId } = tab;
        const queries = rawWidgets
          .filter((widget: any) => widget.query_id)
          .reduce((prev: any, current: any) => {
            const currentQuery = rawQueries.find((item: any) => item.id === current.query_id);
            const payload = lighInflatePayload(
              EXPLORE_SKELETON,
              currentQuery.query_schema,
              currentQuery.visualization_type,
            );
            return {
              ...prev,
              [currentQuery.id]: {
                visualizationType: currentQuery.visualization_type,
                description: currentQuery.description,
                completed: true,
                querySchema: currentQuery.query_schema,
                title: current.title ?? currentQuery.description,
                cubeModelId: String(currentQuery.cube_model_id),
                payload,
              },
            };
          }, {});

        return {
          id,
          tagId,
          name: name ?? name_translation_key?.split('_').at(-2),
          queries,
        };
      }),
    };
  }

  static getDashboardType() {
    return 'explore';
  }

  static isExploreQuery(url: string) {
    const exploreQueries = [
      /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/explore-fast\/api\/v2\/viewer\/dashboard\/query$/,
      /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/explore-realtime-fast\/api\/v2\/viewer\/dashboard\/query$/,
    ];
    return exploreQueries.some((regex) => regex.test(url));
  }

  static isDashboardBimeo(rawUrl: string) {
    const url = new URL(rawUrl);

    return url.hostname.endsWith('.amazonaws.com') && /^\/studio\/cache\/[^/]+\/front\.json$/.test(url.pathname);
  }

  static isDashboardFromZendesk(url: string) {
    return /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/explore\/graphql\?PublishedDashboardQuery/.test(url);
  }
}

export default ExploreInterceptor;
