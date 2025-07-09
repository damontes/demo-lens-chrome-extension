import { ungzip } from 'pako';
import {
  inflateAgentPayload,
  inflateAgentsPayload,
  inflatePayload,
  lighInflatePayload,
  parseRowMember,
} from '../lib/exploreInflatePayload';
import ControllerInterpceptor from './controllerInterceptor';
import FetchInterceptor from './fetchInterceptor';
import XHRInterceptor from './xhrInterceptor';
import { XMLParser } from 'fast-xml-parser';
import { ACTIONS, DEFAULT_CONFIG } from '@/actions/dictionary';

const xmlParser = new XMLParser({ ignoreAttributes: false });

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
              name: 'column all',
              levelName: 'column all',
              levelDisplayName: '',
              dataField: 'column all',
              isAll: 'false',
              isSubTotal: 'false',
              attributeDatafield: null,
              displayName: 'column all',
              dimensionName: 'column all',
              dimensionType: 'standard',
              isRepetition: 'false',
              attributeName: 'column all',
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
  #temporalDashboards: any;
  #lastWidgetId: number | null;
  #temporalAgents: any;

  constructor() {
    this.#xhrInterceptor = null;
    this.#fetchInterceptor = null;
    this.#lastWidgetId = null;
  }

  intercept(configurationDashboards?: any[], dashboards?: any) {
    this.#xhrInterceptor = new XHRInterceptor();
    this.#fetchInterceptor = new FetchInterceptor();
    this.#temporalDashboards = dashboards;

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
        const tabId = requestBody?.content?.tabId;

        const activeDashboard = ControllerInterpceptor.findActiveDashboard(
          configurationDashboards,
          this.#temporalDashboards,
          this.#currentDashboard,
        );

        try {
          if (!activeDashboard) return response;

          const queries = this.#getQueries(queryId, tabId, activeDashboard);
          const payload = this.#handleQueryExplorePayload(
            queryId,
            tabId,
            queries,
            requestBody,
            json,
            activeDashboard,
            this.#temporalDashboards,
          );
          return ExploreInterceptor.handleResponse(response, payload);
        } catch (error) {
          console.log('===ERROR===', error);
        }
      }

      if (ExploreInterceptor.isExploreAgentQuery(url) && this.#lastWidgetId) {
        const activeDashboard = ControllerInterpceptor.findActiveDashboard(
          configurationDashboards,
          this.#temporalDashboards,
          this.#currentDashboard,
        );

        try {
          if (!activeDashboard) return response;

          // const queries = this.#getQueriesFromWidgetId(this.#lastWidgetId, activeDashboard);
          const { operationName, variables } = requestBody;
          let payload = json;

          if (operationName === 'AgentListOCR') {
            const agents = inflateAgentsPayload(variables.filterBy);
            this.#temporalAgents = agents;
            payload = {
              ...json,
              data: {
                agentsChannelInfo: {
                  edges: agents,
                  count: agents.length,
                  pageInfo: {
                    endCursor: 'eyJvIjoiIiwidiI6IiJ9',
                    hasNextPage: false,
                    __typename: 'PageInfo',
                  },
                  __typename: 'AgentChannelInfoConnection',
                },
              },
            };
          }

          if (operationName === 'WorkItems') {
            const agentId = variables.agentId;
            const temporalAgent = this.#temporalAgents?.find((item: any) => item.node.agent.id === agentId);
            const { agentsChannelInfo, user } = inflateAgentPayload(temporalAgent.node);
            payload = {
              ...payload,
              data: {
                agentsChannelInfo,
                user,
              },
            };
          }

          return ExploreInterceptor.handleResponse(response, payload);
        } catch (error) {
          console.log('===ERROR===', error);
        }
      }

      return response;
    });

    this.#listenLastDrillWidget();
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
            const query = ExploreInterceptor.getQuerySchema(currentQuery.query_schema);

            const payload = lighInflatePayload(EXPLORE_SKELETON, query, currentQuery.visualization_type);
            return {
              ...prev,
              [currentQuery.id]: {
                widgetId: current.id,
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

  #handleQueryExplorePayload(
    queryId: string,
    tabId: number,
    queries: any,
    requestBody: any,
    json: any,
    activeDashboard: any,
    dashboards: any,
  ) {
    const { query, activeQuery: rawActiveQuery } = queries;
    const { querySchema: rawQuerySchema, visualizationType, cubeModelId } = query;
    const interactionList = requestBody?.content?.query?.interactions_list ?? [];

    const querySchema = ExploreInterceptor.generateQuerySchema(rawQuerySchema, interactionList);

    const drillInIndex = !interactionList.length ? -1 : interactionList.length - 1;
    let drillInQuery = rawActiveQuery.interactionList?.[drillInIndex];

    if (drillInIndex > -1 && !drillInQuery) {
      const payload = lighInflatePayload(EXPLORE_SKELETON, querySchema, visualizationType);
      drillInQuery = { payload, config: DEFAULT_CONFIG };
      const { id, ...newDashboard } = activeDashboard;
      const rawActiveQuery = newDashboard.tabs.find((tab: any) => tab.id === tabId).queries[queryId];
      rawActiveQuery.interactionList = (rawActiveQuery.interactionList ?? []).concat(drillInQuery);

      this.#temporalDashboards[id] = newDashboard;
      window.dispatchEvent(
        new CustomEvent(ACTIONS.saveDrillInQuery, {
          detail: {
            initialRoute: `/skeletons/${id}?tabId=${tabId}&queryId=${queryId}&drillInIndex=${drillInIndex}`,
            newDashboards: {
              ...dashboards,
              [id]: newDashboard,
            },
          },
        }),
      );
    }

    const activeQuery = drillInQuery ?? rawActiveQuery;
    const { payload: lightInflatePayload, config } = activeQuery;
    const payload = inflatePayload(EXPLORE_SKELETON, querySchema, visualizationType, lightInflatePayload, config);
    const measureDataFieldToDisplayFormat = json.content?.result?.measureDataFieldToDisplayFormat;
    if (measureDataFieldToDisplayFormat) {
      payload.measureDataFieldToDisplayFormat = measureDataFieldToDisplayFormat;
    }

    if (drillInQuery) {
      const savedAttributes = new Set(
        lightInflatePayload.rows.at(0).members.map((member: any) => member.levelDisplayName),
      );
      const currentAttributes = new Set(payload.rows.at(0).members.map((member: any) => member.levelDisplayName));
      const difference = currentAttributes.difference(savedAttributes);

      if (difference.size > 0) {
        const newRows = lightInflatePayload.rows.map((row: any, rowIdx: number) => {
          const payloadMembers = payload.rows[rowIdx].members;
          const filterMembers = payloadMembers.filter((member: any) => difference.has(member.levelDisplayName));
          return {
            ...row,
            members: row.members.concat(filterMembers.map(parseRowMember)),
          };
        });
        const { id, ...newDashboard } = activeDashboard;
        const savedQuery = newDashboard.tabs.find((tab: any) => tab.id === tabId).queries[queryId];
        savedQuery.interactionList[drillInIndex].payload.rows = newRows;

        this.#temporalDashboards[id] = newDashboard;
        window.dispatchEvent(
          new CustomEvent(ACTIONS.updateDrillInQuery, {
            detail: {
              newDashboards: {
                ...dashboards,
                [id]: newDashboard,
              },
            },
          }),
        );
      }
    }

    const newJson = {
      isSuccess: true,
      type: 'result',
      uuid: json.uuid,
      content: {
        result: { ...payload, uuid: json.uuid, queryId: String(queryId), cubeModelId },
        queryId,
      },
    };

    return newJson;
  }

  #getQueries(queryId: string, tabId: string, activeDashboard: any) {
    const currentTab = this.#currentDashboard.tabs.find((tab: any) =>
      tabId ? tab.id === tabId : tab.queries[queryId],
    );
    const query = currentTab?.queries[queryId];
    const activeQuery = activeDashboard?.tabs.find((tab: any) => tab.id === currentTab.id).queries[queryId];

    return { query, activeQuery };
  }

  // #getQueriesFromWidgetId(widgetId: number, activeDashboard: any) {
  //   const tab = this.#currentDashboard.tabs.find((tab: any) => {
  //     const queryIndex = Object.values(tab.queries).findIndex((query: any) => query.widgetId === widgetId);
  //     return queryIndex > -1;
  //   });

  //   const [queryId, query] =
  //     Object.entries(this.#currentDashboard.tabs.find((currentTab: any) => tab.id === currentTab.id).queries).find(
  //       ([_, query]: any) => query.widgetId === widgetId,
  //     ) ?? [];

  //   if (!queryId) {
  //     return { query: null, activeQuery: null };
  //   }

  //   const activeQuery = activeDashboard?.tabs.find((currentTab: any) => tab.id === currentTab.id).queries[queryId];

  //   return { query, activeQuery };
  // }

  #listenLastDrillWidget() {
    let lastWidget: any = null;
    document.addEventListener(
      'click',
      (e: any) => {
        const $widget = e.target.closest('[id^="widget-"]');

        if ($widget) {
          lastWidget = $widget;
        }

        const $drillInMenu = document.querySelector('.drill-in') || document.querySelector('.realtime-drill-in');
        const drillInClicked = $drillInMenu?.contains(e.target) || e.target === $drillInMenu;
        const rawWidgetId = lastWidget?.getAttribute('id');
        if (rawWidgetId && drillInClicked) {
          const widgetId = rawWidgetId.split('-').at(-1);
          if (widgetId && widgetId !== this.#lastWidgetId) {
            this.#temporalAgents = null;
          }

          this.#lastWidgetId = Number(widgetId);
        }
      },
      true,
    );
  }

  static getDashboardType() {
    return 'explore';
  }

  static generateQuerySchema(rawQuerySchema: string, interactionList: any[]) {
    const query = ExploreInterceptor.getQuerySchema(rawQuerySchema);
    if (!interactionList?.length) {
      return query;
    }

    const lastDrillRawSchema = interactionList.at(-1);

    if (lastDrillRawSchema && lastDrillRawSchema.type !== 'drillin') {
      return query;
    }

    const { attributes } = lastDrillRawSchema;
    const rowHierarchies = !attributes.length
      ? ''
      : attributes.map((item: any) => {
          const { hierarchyXML } = item;
          const parsedXml = xmlParser.parse(hierarchyXML);
          return parsedXml.Hierarchy;
        });

    return { ...query, Rows: { Hierarchy: rowHierarchies }, isDrillIn: true };
  }

  static getQuerySchema(rawQuerySchema: string) {
    const binary = Uint8Array.from(atob(rawQuerySchema.replace(/\n/g, '')), (c) => c.charCodeAt(0));

    const xml = ungzip(binary, { to: 'string' });
    const parsedXml = xmlParser.parse(xml);
    const { Query: query } = parsedXml;

    return query;
  }

  static isExploreQuery(url: string) {
    const exploreQueries = [
      /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/explore-fast\/api\/v2\/viewer\/dashboard\/query$/,
      /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/explore-realtime-fast\/api\/v2\/viewer\/dashboard\/query$/,
    ];
    return exploreQueries.some((regex) => regex.test(url));
  }

  static isExploreAgentQuery(url: string) {
    return /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/api\/lotus\/graphql$/.test(url);
  }

  static isDashboardBimeo(rawUrl: string) {
    const url = new URL(rawUrl);

    return url.hostname.endsWith('.amazonaws.com') && /^\/studio\/cache\/[^/]+\/front\.json$/.test(url.pathname);
  }

  static isDashboardFromZendesk(url: string) {
    return /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/explore\/graphql\?PublishedDashboardQuery/.test(url);
  }

  static handleResponse(response: Response, payload: any) {
    return new Response(JSON.stringify(payload), {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'content-type': 'application/json',
      },
    });
  }
}

export default ExploreInterceptor;
