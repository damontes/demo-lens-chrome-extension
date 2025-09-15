import {
  generateShiftsForecast,
  inflateAgentGroupsPayload,
  inflateAgentsPayload,
  inflateShiftsPayload,
  inflateTasksPayload,
  inflateWorkstreamsPayload,
  inflateAgentActivitiesPayload,
  inflateForecastActualPayload,
  generateVolumeForecastData,
  inflateReportSummaryPayload,
  inflateLocationsPayload,
  inflateTeamsPayload,
  inflateOrganizationsPayload,
  generateWidgetData,
} from './inflatePayload';
import { WFM_TEMPLATES } from './templates';
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
} from 'date-fns';
import { getDateFromString } from '@/lib/date';
import { randInt } from '@/lib/general';
import ControllerInterceptor from '../controllerInterceptor';
import XHRInterceptor from '../xhrInterceptor';
import WebSocketInterceptor from '../websocketInterceptor';

class WFMInterceptor {
  #currentDashboard: any = null;
  #xhrInterceptor: XHRInterceptor | null;
  #webSocketInterceptor: WebSocketInterceptor | null;
  #reportTemplatesCache: any[] = []; // Cache for report templates
  #useInstanceData: boolean = false; // Flag to track if we should use real data
  #instanceDataPromises: Map<string, Function[]> = new Map(); // Arrays of resolvers for data collection
  #instanceDataCollected: Map<string, any> = new Map(); // Store the collected data
  #dashboardInitialized: boolean = false; // Track if dashboard initialization is complete

  constructor() {
    this.#xhrInterceptor = null;
    this.#webSocketInterceptor = null;
  }

  intercept(configurationDashboards?: any[], dashboards?: any, templates?: any) {
    this.#xhrInterceptor = new XHRInterceptor();
    this.#webSocketInterceptor = new WebSocketInterceptor();

    this.#xhrInterceptor.setConditionTarget((url) => {
      const regesUrls = Object.values(WFMInterceptor.intercerptUrls());
      return regesUrls.some((regex) => regex.test(url));
    });

    this.#webSocketInterceptor.setConditionTarget((url) => {
      return WFMInterceptor.getWebSocketUrls().dashboard.test(url);
    });

    this.#xhrInterceptor.startIntercept(async (response: any, url: string, requestPayload: any) => {
      const obejctUrl = new URL(url);
      const searchParams = Object.fromEntries(obejctUrl.searchParams.entries());

      const activeDashboard = ControllerInterceptor.findActiveDashboard(
        configurationDashboards,
        dashboards,
        ({ type }) => type === WFMInterceptor.getDashboardType(),
      );

      if (!activeDashboard) {
        return response;
      }

      if (!this.#currentDashboard) {
        this.#initializeDashboardFromLightPayload(activeDashboard, templates);
      }

      const interceptUrls = WFMInterceptor.intercerptUrls();

      if (interceptUrls.agents.test(url)) {
        if (this.#useInstanceData) {
          this.#collectInstanceData('agents', response);
          return response;
        }

        return this.#handleResponse(this.#currentDashboard.agents);
      }

      if (interceptUrls.agentGroups.test(url)) {
        if (this.#useInstanceData) {
          this.#collectInstanceData('agentGroups', response);
          return response;
        }

        return this.#handleResponse(this.#currentDashboard.configuration.schedule.agentGroups);
      }

      if (interceptUrls.tasks.test(url)) {
        if (this.#useInstanceData) {
          this.#collectInstanceData('tasks', response);
          return response;
        }

        return this.#handleResponse(this.#currentDashboard.configuration.schedule.tasks);
      }

      if (interceptUrls.workstreams.test(url)) {
        if (this.#useInstanceData) {
          this.#collectInstanceData('workstreams', response);
          return response;
        }
        return this.#handleResponse(this.#currentDashboard.configuration.schedule.workstreams);
      }

      if (interceptUrls.locations.test(url)) {
        if (this.#useInstanceData) {
          this.#collectInstanceData('locations', response);
          return response;
        }

        return this.#handleResponse(this.#currentDashboard.configuration.schedule.locations);
      }

      if (interceptUrls.teams.test(url)) {
        if (this.#useInstanceData) {
          this.#collectInstanceData('teams', response);
          return response;
        }

        return this.#handleResponse(this.#currentDashboard.configuration.schedule.teams);
      }

      if (interceptUrls.organizations.test(url)) {
        if (this.#useInstanceData) {
          this.#collectInstanceData('organizations', response);
          return response;
        }

        return this.#handleResponse(this.#currentDashboard.configuration.schedule.organizations);
      }

      if (interceptUrls.customFields.test(url)) {
        // Always collect custom fields data since it's real API data, not generated
        this.#collectInstanceData('customFields', response);
        return response;
      }

      if (interceptUrls.shifts.test(url)) {
        if (this.#useInstanceData && !this.#dashboardInitialized) {
          await Promise.all([
            this.#waitForInstanceData('agents'),
            this.#waitForInstanceData('workstreams'),
            this.#waitForInstanceData('tasks'),
          ]);
        }

        const { agents, configuration, shifts } = this.#currentDashboard;
        const { workstreams, tasks } = configuration.schedule;
        const { startDate, endDate } = requestPayload;
        const id = `${startDate}:${endDate}`;
        let existShifts = shifts[id];

        if (!existShifts) {
          existShifts = inflateShiftsPayload(startDate, endDate, agents, workstreams, tasks);
          this.#currentDashboard.shifts[id] = existShifts;
        }

        return this.#handleResponse(existShifts);
      }

      if (interceptUrls.forecast.test(url)) {
        if (this.#useInstanceData && !this.#dashboardInitialized) {
          await this.#waitForInstanceData('workstreams');
        }

        const { startTime, type } = searchParams;

        const forecastConfig = this.#currentDashboard.configuration.forecast;

        const startTimeMs = Number(startTime);
        const { startDate, endDate } = this.#calculateDateRange(startTimeMs, type);

        const temporalResponse = this.#currentDashboard.configuration.schedule.workstreams.map((workstream: any) => {
          const volumeData = generateVolumeForecastData(
            workstream.id,
            forecastConfig,
            startDate, // Use calculated startDate instead of raw startTimeMs
            endDate,
            type, // Pass the time period type
          );

          const forecast = volumeData.map((data) => ({
            timestamp: data.timestamp,
            count: data.volumeForecast,
            type: 'historical' as const,
          }));

          return {
            status: 'done',
            workstreamId: workstream.id,
            forecast,
            errors: [],
          };
        });

        return this.#handleResponse(temporalResponse);
      }

      if (interceptUrls.fte.test(url)) {
        // If using instance data, wait for workstreams to be collected
        if (this.#useInstanceData && !this.#dashboardInitialized) {
          await this.#waitForInstanceData('workstreams');
        }

        const { date, type } = searchParams;

        const forecastConfig = this.#currentDashboard.configuration.forecast;

        // Convert date string to start of day timestamp (matching shiftsTotals approach)
        const dateMs = startOfDay(getDateFromString(date)).getTime();
        const { startDate, endDate } = this.#calculateDateRange(dateMs, type);

        const temporalResponse = this.#currentDashboard.configuration.schedule.workstreams.map((workstream: any) => {
          const volumeData = generateVolumeForecastData(workstream.id, forecastConfig, startDate, endDate, type);

          const forecast = volumeData.map((data) => ({
            timestamp: data.timestamp,
            count: randInt(5, 20), // Use same range as shiftsTotals workstreams
            type: 'forecasted' as const,
          }));

          return {
            status: 'done',
            workstreamId: workstream.id,
            forecast,
            errors: [],
          };
        });

        return this.#handleResponse(temporalResponse);
      }

      if (interceptUrls.activities.test(url)) {
        if (this.#useInstanceData && !this.#dashboardInitialized) {
          await Promise.all([this.#waitForInstanceData('agents'), this.#waitForInstanceData('workstreams')]);
        }

        const { startDate, endDate, agentsIds } = requestPayload || {};

        const { agents } = this.#currentDashboard;
        const { workstreams } = this.#currentDashboard.configuration.schedule;
        const { agentActivity } = this.#currentDashboard.configuration;

        const finalStartDate = startDate || '2025-08-21';
        const finalEndDate = endDate || '2025-08-21';

        const activityId = `${finalStartDate}:${finalEndDate}`;
        if (!this.#currentDashboard.activities) {
          this.#currentDashboard.activities = {};
        }

        let existingActivities = this.#currentDashboard.activities[activityId];
        if (!existingActivities) {
          existingActivities = inflateAgentActivitiesPayload(
            agents,
            workstreams,
            agentActivity,
            finalStartDate,
            finalEndDate,
          );
          this.#currentDashboard.activities[activityId] = existingActivities;
        }

        const filteredActivities = agentsIds?.length
          ? existingActivities.filter((activityData: any) => agentsIds.includes(activityData.id))
          : existingActivities;

        return this.#handleResponse(filteredActivities);
      }

      if (interceptUrls.forecastActual.test(url)) {
        const { startDate, endDate, workstreamsIds, interval } = requestPayload || {};

        const { forecastVsActual } = this.#currentDashboard.configuration;

        const forecastActualData = inflateForecastActualPayload(startDate, endDate, workstreamsIds, interval, {
          currentTimeIndex: forecastVsActual.currentTimeIndex,
          baseTicketVolume: forecastVsActual.baseTicketVolume,
          baseScheduledAgents: forecastVsActual.baseScheduledAgents,
          slaTarget: forecastVsActual.slaTarget,
          includeWeekends: forecastVsActual.includeWeekends,
        });
        return this.#handleResponse(forecastActualData);
      }

      if (interceptUrls.shiftsTotals.test(url)) {
        if (this.#useInstanceData && !this.#dashboardInitialized) {
          await Promise.all([this.#waitForInstanceData('workstreams'), this.#waitForInstanceData('tasks')]);
        }

        const { startDate } = searchParams;
        const { workstreams, tasks } = this.#currentDashboard.configuration.schedule;

        const startTime = startOfDay(getDateFromString(startDate)).getTime() / 1000;

        // Generate 48 intervals for 24 hours in 30-minute intervals
        const intervals = 48; // 24 hours × 2 intervals per hour
        const stepSeconds = 1800; // 30 minutes in seconds (30 × 60)

        const data = generateShiftsForecast(workstreams, tasks, startTime, intervals, stepSeconds);

        return this.#handleResponse(data);
      }

      if (interceptUrls.workstreamForecastAlgorithm.test(url)) {
        return {
          success: true,
          data: [],
          metadata: null,
          message: 'ok',
        };
      }

      if (interceptUrls.reportTemplates.test(url)) {
        this.#reportTemplatesCache = response.data || [];
      }

      if (interceptUrls.reportSummary.test(url)) {
        if (this.#useInstanceData && !this.#dashboardInitialized) {
          await Promise.all([
            this.#waitForInstanceData('agents'),
            this.#waitForInstanceData('workstreams'),
            this.#waitForInstanceData('tasks'),
            this.#waitForInstanceData('agentGroups'),
            this.#waitForInstanceData('locations'),
            this.#waitForInstanceData('teams'),
            this.#waitForInstanceData('organizations'),
          ]);
        }

        await this.#waitForInstanceData('customFields');

        const { templateId, startDate, endDate, selectedGroupingIds = [] } = requestPayload;

        const template = this.#reportTemplatesCache.find((t) => t.id === templateId);

        const reportTemplateSummary = inflateReportSummaryPayload({
          template,
          startDate,
          endDate,
          selectedGroupingIds,
          currentDashboard: this.#currentDashboard,
        });

        return this.#handleResponse(reportTemplateSummary);
      }

      if (interceptUrls.dashboards.test(url)) {
        let data = response.data;
        if (!this.#useInstanceData) {
          data = this.#modifyDashboardWorkstreamIds(data);
        }
        const newResposne = this.#handleResponse(data);
        this.#collectInstanceData('dashboards', newResposne);
        return newResposne;
      }

      if (interceptUrls.dashboardWidgetMetrics.test(url)) {
        this.#collectInstanceData('dashboardMetrics', response);
        return response;
      }

      return response;
    });

    // Start WebSocket interception for real-time dashboard widget data
    this.#webSocketInterceptor.startIntercept(async (data: any, url: string) => {
      try {
        // Handle dashboard widget value updates
        if (data && data.widgetId) {
          const { widgetId, data: widgetData } = data;

          // Wait for both dashboards and metrics to be available
          await Promise.all([this.#waitForInstanceData('dashboards'), this.#waitForInstanceData('dashboardMetrics')]);

          // Generate new widget data based on the widget configuration
          const newWidgetData = this.#generateWebSocketWidgetData(widgetId, widgetData?.value, data.completedAt);

          // Instead of replacing the entire message, just modify the data field and keep everything else the same
          const modifiedData = {
            ...data, // Keep all original fields (success, widgetId, completedAt, timezone)
            data: newWidgetData, // Only replace the data field with our generated data
          };

          return modifiedData;
        }

        return data;
      } catch (error) {
        console.error('❌ WFM: Error in WebSocket interceptor:', error);
        return data;
      }
    });
  }

  #handleResponse(data: any) {
    return {
      success: true,
      data,
      metadata: null,
      message: 'ok',
    };
  }

  #calculateDateRange(startTimeMs: number, type: string): { startDate: Date; endDate: Date } {
    const baseDate = new Date(startTimeMs);

    let result;
    switch (type) {
      case 'day':
        result = {
          startDate: startOfDay(baseDate),
          endDate: endOfDay(baseDate),
        };
        break;
      case 'week':
        result = {
          startDate: startOfWeek(baseDate),
          endDate: endOfWeek(baseDate),
        };
        break;
      case 'month':
        result = {
          startDate: startOfMonth(baseDate),
          endDate: endOfMonth(baseDate),
        };
        break;
      case 'year':
        result = {
          startDate: startOfYear(baseDate),
          endDate: endOfYear(baseDate),
        };
        break;
      default:
        result = {
          startDate: startOfDay(baseDate),
          endDate: endOfDay(baseDate),
        };
    }

    return result;
  }

  #collectInstanceData(dataType: string, response: any, dataKey: string = 'data'): any {
    if (
      !this.#useInstanceData &&
      dataType !== 'customFields' &&
      dataType !== 'dashboardMetrics' &&
      dataType !== 'dashboards'
    ) {
      return response;
    }

    if (response?.success && response[dataKey]) {
      const realData = response[dataKey];

      this.#instanceDataCollected.set(dataType, realData);

      switch (dataType) {
        case 'agents':
          this.#currentDashboard.agents = realData;

          break;
        case 'workstreams':
          this.#currentDashboard.configuration.schedule.workstreams = realData;

          break;
        case 'tasks':
          this.#currentDashboard.configuration.schedule.tasks = realData;

          break;
        case 'agentGroups':
          this.#currentDashboard.configuration.schedule.agentGroups = realData;
          break;
        case 'locations':
          this.#currentDashboard.configuration.schedule.locations = realData;
          break;
        case 'teams':
          this.#currentDashboard.configuration.schedule.teams = realData;
          break;
        case 'organizations':
          this.#currentDashboard.configuration.schedule.organizations = realData;
          break;
        case 'customFields':
          this.#currentDashboard.customFields = realData;
          break;
        case 'dashboardMetrics':
          this.#currentDashboard.dashboardMetrics = realData;
          break;
        case 'dashboards':
          this.#currentDashboard.dashboards = realData;
          break;
        default:
          break;
      }

      // Resolve all promises waiting for this data
      const resolvers = this.#instanceDataPromises.get(dataType);
      if (resolvers && resolvers.length) {
        resolvers.forEach((resolve) => resolve(realData));
        this.#instanceDataPromises.delete(dataType);
      }
    }

    return response;
  }

  #waitForInstanceData(dataType: string): Promise<any> {
    if (this.#instanceDataCollected.has(dataType)) {
      return Promise.resolve(this.#instanceDataCollected.get(dataType));
    }

    return new Promise((resolve) => {
      if (this.#instanceDataPromises.has(dataType)) {
        this.#instanceDataPromises.get(dataType)!.push(resolve);
      } else {
        this.#instanceDataPromises.set(dataType, [resolve]);
      }
    });
  }

  #resetInstanceDataCollection(): void {
    this.#instanceDataCollected.clear();
    this.#instanceDataPromises.forEach((resolvers) => {
      resolvers.forEach((resolve) => resolve(undefined));
    });
    this.#instanceDataPromises.clear();
    this.#dashboardInitialized = false;
  }

  #generateWebSocketWidgetData(widgetId: string, value: any, completedAt: number) {
    const widget = this.#findWidgetById(widgetId);

    if (!widget) {
      return { value };
    }

    const newWidgetData = generateWidgetData(
      widgetId,
      widget,
      widget.metric,
      this.#currentDashboard?.configuration?.dashboards,
    );

    // Just return the data part, not the full message structure
    return newWidgetData.data;
  }

  #modifyDashboardWorkstreamIds(dashboards: any[]) {
    // Get available workstream IDs from generated workstreams
    const availableWorkstreamIds =
      this.#currentDashboard?.configuration?.schedule?.workstreams?.map((ws: any) => ws.id) || [];

    if (availableWorkstreamIds.length === 0) {
      return dashboards; // Return original if no workstreams available
    }

    console.log('AVAIALBLE WORKSTREAMS', dashboards, this.#currentDashboard?.configuration?.schedule?.workstreams);
    return dashboards.map((dashboard) => ({
      ...dashboard,
      widgets:
        dashboard.widgets?.map((widget: any) => {
          // Randomly assign a workstream ID from available ones
          const randomWorkstreamId = availableWorkstreamIds[Math.floor(Math.random() * availableWorkstreamIds.length)];
          return {
            ...widget,
            workstreamId: randomWorkstreamId,
          };
        }) || [],
    }));
  }

  #findWidgetById(widgetId: string) {
    // Search through dashboards in currentDashboard to find the widget
    if (!this.#currentDashboard?.dashboards) {
      return null;
    }

    for (const dashboard of this.#currentDashboard.dashboards) {
      const widget = dashboard.widgets?.find((w: any) => w.id === widgetId);
      if (widget) {
        // Also find the corresponding metric for this widget
        const metric = this.#currentDashboard.dashboardMetrics?.find((m: any) => m.id === widget.metricId);
        return {
          ...widget,
          metric,
        };
      }
    }
    return null;
  }

  async #initializeDashboardFromLightPayload(activeDashboard: any, templates: any) {
    const { templateId, useInstanceData } = activeDashboard;

    if (!templateId) {
      console.error('No templateId found in activeDashboard');
      return;
    }

    this.#useInstanceData = useInstanceData || false;

    if (this.#useInstanceData) {
      this.#resetInstanceDataCollection();
    }

    let template: any = null;

    const dashboardType = WFMInterceptor.getDashboardType();

    const userTemplates = Object.values(templates).filter((t: any) => t.type === dashboardType);
    template = userTemplates.find((t: any) => t.id === templateId);

    if (!template) {
      const predefinedTemplates = WFM_TEMPLATES;
      template = predefinedTemplates.find((t: any) => t.id === templateId);
    }

    if (!template) {
      console.error(`Template with id ${templateId} not found`);
      return;
    }

    const { configuration } = template;

    if (this.#useInstanceData) {
      this.#currentDashboard = {
        agents: [],
        customFields: [],
        shifts: {},
        activities: {},
        configuration: {
          ...configuration,
          schedule: {
            ...configuration.schedule,
            workstreams: [],
            tasks: [],
            agentGroups: [],
            locations: [],
            teams: [],
            organizations: [],
          },
        },
      };

      try {
        await Promise.all([
          this.#waitForInstanceData('agents'),
          this.#waitForInstanceData('workstreams'),
          this.#waitForInstanceData('tasks'),
          this.#waitForInstanceData('agentGroups'),
          this.#waitForInstanceData('locations'),
          this.#waitForInstanceData('teams'),
          this.#waitForInstanceData('organizations'),
        ]);

        this.#dashboardInitialized = true;
      } catch (error) {
        console.error('Failed to collect instance data:', error);
      }
    } else {
      const { schedule } = configuration;
      const forecastConfig = configuration.forecast || null;
      const {
        agentsNumber,
        agentGroups: lightAgentGroups,
        tasks: lightTasks,
        workstreams: lightWorkstreams,
        locations: lightLocations,
        teams: lightTeams,
        organizations: lightOrganizations,
      } = schedule;

      const agents = inflateAgentsPayload(agentsNumber);
      const workstreams = inflateWorkstreamsPayload(agents, template.industry, lightWorkstreams, forecastConfig);
      const tasks = inflateTasksPayload(workstreams, template.industry, lightTasks);
      const agentGroups = inflateAgentGroupsPayload(agents, template.industry, lightAgentGroups);
      const locations = inflateLocationsPayload(agents, template.industry, lightLocations);
      const teams = inflateTeamsPayload(agents, template.industry, lightTeams);
      const organizations = inflateOrganizationsPayload(template.industry, lightOrganizations);

      this.#currentDashboard = {
        agents: agents.map((agent: any) => ({
          ...agent,
          workstreamsIds: workstreams.map((workstream: any) => workstream.id),
        })),
        shifts: {},
        activities: {},
        configuration: {
          ...configuration,
          schedule: {
            ...configuration.schedule,
            workstreams,
            tasks,
            agentGroups,
            locations,
            teams,
            organizations,
          },
        },
      };
    }
  }

  static intercerptUrls() {
    return {
      agentGroups: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/agentGroups/,
      tasks: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/tasks/,
      workstreams: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/workstreams(\?|$)/,
      shifts: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/shifts\/fetch\/visible$/,
      agents: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/v2\/agents/,
      forecast: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/forecasts(\?|$)/,
      fte: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/forecasts\/fte(\?|$)/,
      shiftsTotals: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/shifts\/totals/,
      activities: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/activities/,
      forecastActual: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/reports-forecast-actual/,
      workstreamForecastAlgorithm:
        /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/workstreamForecastAlgorithm$/,
      reportTemplates: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/reports\/templates$/,
      reportSummary: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/reports\/summary$/,
      locations: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/v2\/locations(\?|$)/,
      teams: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/teams(\?|$)/,
      organizations: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/organizations(\?|$)/,
      customFields: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/tickets\/customFields/,
      dashboards: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/dashboards(\?|$)/,
      dashboardWidgetMetrics: /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/l5\/api\/dashboardWidgetMetrics(\?|$)/,
    };
  }

  static getWebSocketUrls() {
    return {
      dashboard: /^wss:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/wfm\/websocket\/ws\?namespace=dashboard/,
    };
  }

  static getDashboardType() {
    return 'wfm';
  }
}

export default WFMInterceptor;
