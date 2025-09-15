// Forecast Configuration types
export interface ForecastAlgorithm {
  name: string;
  frequency: '15 min' | 'hourly' | 'daily';
  category: 'statistical' | 'machine_learning' | 'ai';
  forecastLength: number;
}

export interface VolumeAdjustment {
  id?: string;
  name: string;
  startTime: number;
  endTime: number;
  change: number;
  changeType: 'percentage' | 'absolute';
  active: boolean;
  workstreamId?: string;
}

export interface ExcludedOutlier {
  name: string;
  startTime: number;
  endTime: number;
  active: boolean;
  workstreamId?: string;
}

export interface StaffingParameters {
  maxOccupancyRate: number; // 0.0 - 1.0
  averageHandleTime: number; // seconds
  averageHandleTimeType: 'static' | 'dynamic';
  targetTime: number; // response time target in seconds
  shrinkage: number; // 0.0 - 1.0
  targetServiceLevel: number; // 0.0 - 1.0
  minimumStaffing: number;
  channel: 'email' | 'chat' | 'phone';
  concurrency: number;
  availability?: {
    isActive: boolean;
    availabilityHours: Array<{
      day: string;
      start: string;
      end: string;
    }>;
    timezone: string;
  };
}

export interface ForecastConfiguration {
  algorithm: ForecastAlgorithm;
  volumeAdjustments: VolumeAdjustment[];
  excludedOutliers: ExcludedOutlier[];
  staffingParameters: StaffingParameters;
}

// Configuration types for all sections
export interface ScheduleConfiguration {
  agentsNumber: number;
  agentGroups: Array<string>;
  workstreams: Array<string>;
  tasks: Array<string>;
  locations?: Array<string>;
  teams?: Array<string>;
  organizations?: Array<string>;
}

export interface AgentActivityConfiguration {
  workingHours: { start: string; end: string };
  activitiesPerAgent: { min: number; max: number };
  activityDuration: { min: number; max: number };
  untrackedActivityPercentage: number;
  untrackedDuration: { min: number; max: number };
}

export interface ForecastActualConfiguration {
  currentTimeIndex: number;
  baseTicketVolume: { min: number; max: number };
  baseScheduledAgents: { min: number; max: number };
  slaTarget: number;
  includeWeekends: boolean;
}

export interface ReportsConfiguration {
  performanceLevel: 'low' | 'average' | 'high' | 'excellent'; // 0.7, 1.0, 1.2, 1.4 multipliers
  adherenceTarget: number; // 0.8-0.98 - affects adherence metrics
  efficiencyLevel: 'low' | 'average' | 'high'; // affects handle times and response times
  qualityTarget: number; // 0.7-0.95 - affects resolution rates and bounce rates
  workloadIntensity: 'light' | 'moderate' | 'heavy' | 'peak'; // affects volume metrics
  productiveTimePercentage: number; // 0.6-0.9 - affects time distribution
}

export interface DashboardConfig {
  performanceLevel: 'low' | 'average' | 'high' | 'excellent'; // Affects the widget values generated
  volumeIntensity: 'light' | 'moderate' | 'heavy' | 'peak'; // Affects ticket/call volume ranges
  responseSpeed: 'urgent' | 'fast' | 'normal' | 'extended'; // Affects response time expectations
}

// Unified WFM Template structure (hardcoded templates)
export interface WFMTemplate {
  id: string;
  name: string;
  description: string;
  industry: string[];
  configuration: {
    schedule: ScheduleConfiguration;
    agentActivity: AgentActivityConfiguration;
    forecastVsActual: ForecastActualConfiguration;
    forecast: ForecastConfiguration;
    reports: ReportsConfiguration;
    dashboards: DashboardConfig;
  };
}

// Keep the old interface name for compatibility
export type WFMScenarioTemplate = WFMTemplate;

// Comprehensive WFM Templates with direct forecast configurations
export const WFM_TEMPLATES: WFMTemplate[] = [
  // FINANCE INDUSTRY TEMPLATES
  {
    id: 'finance-tax-season',
    name: 'Tax Season Rush',
    description: 'High volume periods with compliance focus and extended hours',
    industry: ['finance'],
    configuration: {
      schedule: {
        agentsNumber: 35,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '07:00', end: '20:00' }, // Extended hours
        activitiesPerAgent: { min: 20, max: 40 }, // High activity
        activityDuration: { min: 5, max: 45 }, // Longer calls
        untrackedActivityPercentage: 15, // Lower untracked (more focus)
        untrackedDuration: { min: 5, max: 30 },
      },
      forecastVsActual: {
        currentTimeIndex: 12,
        baseTicketVolume: { min: 80, max: 150 }, // High volume
        baseScheduledAgents: { min: 80, max: 200 },
        slaTarget: 95, // High SLA requirements
        includeWeekends: true, // Work weekends during tax season
      },
      forecast: {
        algorithm: {
          name: 'prophet',
          frequency: 'daily',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Tax Season',
            startTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 72 * 24 * 60 * 60 * 1000,
            change: 120,
            changeType: 'percentage',
            active: true,
          },
          {
            name: 'Quarter End',
            startTime: Date.now() + 85 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 92 * 24 * 60 * 60 * 1000,
            change: 60,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [
          {
            name: 'System Migration Day',
            startTime: Date.now() - 45 * 24 * 60 * 60 * 1000,
            endTime: Date.now() - 44 * 24 * 60 * 60 * 1000,
            active: true,
          },
        ],
        staffingParameters: {
          maxOccupancyRate: 0.7,
          averageHandleTime: 900,
          averageHandleTimeType: 'static',
          targetTime: 7200,
          shrinkage: 0.25,
          targetServiceLevel: 0.95,
          minimumStaffing: 8,
          channel: 'phone',
          concurrency: 1,
        },
      },
      reports: {
        performanceLevel: 'high', // High performance expected during tax season
        adherenceTarget: 0.92, // Strong adherence needed for compliance
        efficiencyLevel: 'high', // Fast response times required
        qualityTarget: 0.88, // High quality for financial accuracy
        workloadIntensity: 'peak', // Peak season workload
        productiveTimePercentage: 0.85, // Highly productive during crunch time
      },
      dashboards: {
        performanceLevel: 'high',
        volumeIntensity: 'peak', // Tax season has peak volume
        responseSpeed: 'fast', // Fast responses needed for compliance
      },
    },
  },
  {
    id: 'finance-quarter-end',
    name: 'Quarter End Surge',
    description: 'Peak activity periods with performance tracking and reporting',
    industry: ['finance'],
    configuration: {
      schedule: {
        agentsNumber: 30,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '08:00', end: '19:00' },
        activitiesPerAgent: { min: 18, max: 35 },
        activityDuration: { min: 8, max: 35 },
        untrackedActivityPercentage: 18,
        untrackedDuration: { min: 10, max: 45 },
      },
      forecastVsActual: {
        currentTimeIndex: 10,
        baseTicketVolume: { min: 60, max: 120 },
        baseScheduledAgents: { min: 70, max: 180 },
        slaTarget: 92,
        includeWeekends: false,
      },
      forecast: {
        algorithm: {
          name: 'lstm_daily',
          frequency: 'daily',
          category: 'ai',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Market Volatility',
            startTime: Date.now() + 10 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 17 * 24 * 60 * 60 * 1000,
            change: 150,
            changeType: 'percentage',
            active: true,
          },
          {
            name: 'Earnings Season',
            startTime: Date.now() + 45 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 59 * 24 * 60 * 60 * 1000,
            change: 80,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.65,
          averageHandleTime: 1800,
          averageHandleTimeType: 'static',
          targetTime: 3600,
          shrinkage: 0.3,
          targetServiceLevel: 0.98,
          minimumStaffing: 5,
          channel: 'phone',
          concurrency: 1,
        },
      },
      reports: {
        performanceLevel: 'high', // High performance during tax season
        adherenceTarget: 0.92, // High adherence expected
        efficiencyLevel: 'high', // Fast response times needed
        qualityTarget: 0.9, // High quality for compliance
        workloadIntensity: 'peak', // Peak season volume
        productiveTimePercentage: 0.85, // High productivity focus
      },
      dashboards: {
        performanceLevel: 'high',
        volumeIntensity: 'heavy', // Peak activity periods
        responseSpeed: 'fast', // Performance tracking requires fast responses
      },
    },
  },
  {
    id: 'finance-market-volatility',
    name: 'Market Volatility Response',
    description: 'Rapid response to market changes with real-time monitoring',
    industry: ['finance'],
    configuration: {
      schedule: {
        agentsNumber: 25,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '06:00', end: '21:00' }, // Extended coverage
        activitiesPerAgent: { min: 25, max: 50 }, // Very high activity
        activityDuration: { min: 3, max: 20 }, // Shorter, urgent calls
        untrackedActivityPercentage: 10, // Minimal untracked time
        untrackedDuration: { min: 5, max: 15 },
      },
      forecastVsActual: {
        currentTimeIndex: 8,
        baseTicketVolume: { min: 40, max: 200 }, // Highly variable
        baseScheduledAgents: { min: 60, max: 220 },
        slaTarget: 90,
        includeWeekends: true,
      },
      forecast: {
        algorithm: {
          name: 'xgboost',
          frequency: 'hourly',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Storm Season',
            startTime: Date.now() + 60 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 120 * 24 * 60 * 60 * 1000,
            change: 200,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.75,
          averageHandleTime: 1200,
          averageHandleTimeType: 'static',
          targetTime: 14400,
          shrinkage: 0.25,
          targetServiceLevel: 0.9,
          minimumStaffing: 6,
          channel: 'email',
          concurrency: 2,
        },
      },
      reports: {
        performanceLevel: 'low', // Crisis mode - lower performance expected
        adherenceTarget: 0.75, // Lower adherence during crisis
        efficiencyLevel: 'low', // Longer response times due to complexity
        qualityTarget: 0.7, // Lower quality acceptable during crisis
        workloadIntensity: 'heavy', // Heavy but not peak
        productiveTimePercentage: 0.65, // Lower productivity during crisis
      },
      dashboards: {
        performanceLevel: 'low',
        volumeIntensity: 'peak', // Market volatility creates peak volume
        responseSpeed: 'urgent', // Rapid response to market changes
      },
    },
  },

  // RETAIL INDUSTRY TEMPLATES
  {
    id: 'retail-fashion-rush',
    name: 'Fashion Season Rush',
    description: 'Seasonal fashion retail peaks with inventory management',
    industry: ['retail'],
    configuration: {
      schedule: {
        agentsNumber: 20,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '09:00', end: '18:00' },
        activitiesPerAgent: { min: 15, max: 30 },
        activityDuration: { min: 5, max: 25 },
        untrackedActivityPercentage: 20,
        untrackedDuration: { min: 10, max: 30 },
      },
      forecastVsActual: {
        currentTimeIndex: 11,
        baseTicketVolume: { min: 50, max: 120 },
        baseScheduledAgents: { min: 40, max: 150 },
        slaTarget: 85,
        includeWeekends: true,
      },
      forecast: {
        algorithm: {
          name: 'lstm_hourly',
          frequency: 'hourly',
          category: 'ai',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Back to School',
            startTime: Date.now() + 20 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 35 * 24 * 60 * 60 * 1000,
            change: 80,
            changeType: 'percentage',
            active: true,
          },
          {
            name: 'Holiday Shopping',
            startTime: Date.now() + 90 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 120 * 24 * 60 * 60 * 1000,
            change: 150,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [
          {
            name: 'Warehouse Issue',
            startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
            endTime: Date.now() - 28 * 24 * 60 * 60 * 1000,
            active: true,
          },
        ],
        staffingParameters: {
          maxOccupancyRate: 0.8,
          averageHandleTime: 420,
          averageHandleTimeType: 'static',
          targetTime: 10800,
          shrinkage: 0.22,
          targetServiceLevel: 0.85,
          minimumStaffing: 4,
          channel: 'chat',
          concurrency: 4,
        },
      },
      reports: {
        performanceLevel: 'high', // Fashion retail requires good performance
        adherenceTarget: 0.88, // High adherence for retail efficiency
        efficiencyLevel: 'high', // Fast response times for customer satisfaction
        qualityTarget: 0.85, // Good quality for fashion queries
        workloadIntensity: 'heavy', // Rush season is heavy
        productiveTimePercentage: 0.8, // Good productivity during rush
      },
      dashboards: {
        performanceLevel: 'high',
        volumeIntensity: 'heavy', // Fashion season has heavy volume
        responseSpeed: 'normal', // Normal response times for retail
      },
    },
  },
  {
    id: 'retail-electronics-launch',
    name: 'Electronics Product Launch',
    description: 'New product launches with technical support needs',
    industry: ['retail'],
    configuration: {
      schedule: {
        agentsNumber: 28,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '08:00', end: '20:00' },
        activitiesPerAgent: { min: 20, max: 35 },
        activityDuration: { min: 8, max: 40 },
        untrackedActivityPercentage: 15,
        untrackedDuration: { min: 15, max: 45 },
      },
      forecastVsActual: {
        currentTimeIndex: 9,
        baseTicketVolume: { min: 70, max: 180 },
        baseScheduledAgents: { min: 60, max: 200 },
        slaTarget: 88,
        includeWeekends: true,
      },
      forecast: {
        algorithm: {
          name: 'xgboost',
          frequency: '15 min',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'New iPhone Launch',
            startTime: Date.now() + 14 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 28 * 24 * 60 * 60 * 1000,
            change: 300,
            changeType: 'percentage',
            active: true,
          },
          {
            name: 'Black Friday',
            startTime: Date.now() + 70 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 74 * 24 * 60 * 60 * 1000,
            change: 400,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.85,
          averageHandleTime: 600,
          averageHandleTimeType: 'static',
          targetTime: 14400,
          shrinkage: 0.2,
          targetServiceLevel: 0.88,
          minimumStaffing: 6,
          channel: 'email',
          concurrency: 3,
        },
      },
      reports: {
        performanceLevel: 'high', // Electronics launch needs high performance
        adherenceTarget: 0.9, // Very high adherence for product launches
        efficiencyLevel: 'high', // Fast technical responses needed
        qualityTarget: 0.88, // High quality for technical questions
        workloadIntensity: 'peak', // Product launch is peak intensity
        productiveTimePercentage: 0.82, // High productivity for launch period
      },
      dashboards: {
        performanceLevel: 'high',
        volumeIntensity: 'peak', // New product launches create peak volume
        responseSpeed: 'fast', // Fast technical responses needed for product launches
      },
    },
  },

  // ECOMMERCE INDUSTRY TEMPLATES
  {
    id: 'ecommerce-marketplace-event',
    name: 'Marketplace Sale Event',
    description: 'Large-scale promotional events with order management',
    industry: ['ecommerce'],
    configuration: {
      schedule: {
        agentsNumber: 40,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '06:00', end: '22:00' },
        activitiesPerAgent: { min: 25, max: 45 },
        activityDuration: { min: 4, max: 20 },
        untrackedActivityPercentage: 12,
        untrackedDuration: { min: 8, max: 25 },
      },
      forecastVsActual: {
        currentTimeIndex: 10,
        baseTicketVolume: { min: 100, max: 300 },
        baseScheduledAgents: { min: 80, max: 250 },
        slaTarget: 87,
        includeWeekends: true,
      },
      forecast: {
        algorithm: {
          name: 'xgboost',
          frequency: '15 min',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Prime Day Event',
            startTime: Date.now() + 15 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 17 * 24 * 60 * 60 * 1000,
            change: 500,
            changeType: 'percentage',
            active: true,
          },
          {
            name: 'Holiday Season',
            startTime: Date.now() + 90 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 125 * 24 * 60 * 60 * 1000,
            change: 180,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [
          {
            name: 'Payment System Outage',
            startTime: Date.now() - 20 * 24 * 60 * 60 * 1000,
            endTime: Date.now() - 19 * 24 * 60 * 60 * 1000,
            active: true,
          },
        ],
        staffingParameters: {
          maxOccupancyRate: 0.85,
          averageHandleTime: 480,
          averageHandleTimeType: 'static',
          targetTime: 10800,
          shrinkage: 0.18,
          targetServiceLevel: 0.87,
          minimumStaffing: 12,
          channel: 'email',
          concurrency: 4,
        },
      },
      reports: {
        performanceLevel: 'high', // Marketplace events need high performance
        adherenceTarget: 0.85, // Good adherence during busy periods
        efficiencyLevel: 'high', // Fast order processing needed
        qualityTarget: 0.82, // Good quality for order inquiries
        workloadIntensity: 'peak', // Sale events are peak intensity
        productiveTimePercentage: 0.78, // High productivity during events
      },
      dashboards: {
        performanceLevel: 'high',
        volumeIntensity: 'peak',
        responseSpeed: 'fast',
      },
    },
  },

  // TELECOMMUNICATIONS INDUSTRY TEMPLATES
  {
    id: 'telecommunications-outage',
    name: 'Network Outage Response',
    description: 'Emergency response for network outages and service disruptions',
    industry: ['telecommunications'],
    configuration: {
      schedule: {
        agentsNumber: 45,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '24/7', end: '24/7' },
        activitiesPerAgent: { min: 30, max: 60 },
        activityDuration: { min: 2, max: 15 },
        untrackedActivityPercentage: 8,
        untrackedDuration: { min: 5, max: 20 },
      },
      forecastVsActual: {
        currentTimeIndex: 12,
        baseTicketVolume: { min: 200, max: 500 },
        baseScheduledAgents: { min: 100, max: 300 },
        slaTarget: 80,
        includeWeekends: true,
      },
      forecast: {
        algorithm: {
          name: 'lstm_hourly',
          frequency: 'hourly',
          category: 'ai',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Network Outage',
            startTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 6 * 24 * 60 * 60 * 1000,
            change: 800,
            changeType: 'percentage',
            active: true,
          },
          {
            name: 'New iPhone Release',
            startTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 45 * 24 * 60 * 60 * 1000,
            change: 120,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.82,
          averageHandleTime: 720,
          averageHandleTimeType: 'static',
          targetTime: 10800,
          shrinkage: 0.22,
          targetServiceLevel: 0.85,
          minimumStaffing: 15,
          channel: 'phone',
          concurrency: 1,
        },
      },
      reports: {
        performanceLevel: 'low', // Network outage crisis
        adherenceTarget: 0.7, // Very low adherence during emergencies
        efficiencyLevel: 'low', // Longer times due to technical complexity
        qualityTarget: 0.65, // Lower quality acceptable during crisis
        workloadIntensity: 'peak', // Peak crisis volume
        productiveTimePercentage: 0.6, // Lower productivity due to crisis
      },
      dashboards: {
        performanceLevel: 'low',
        volumeIntensity: 'peak',
        responseSpeed: 'fast',
      },
    },
  },

  // SUPPORT INDUSTRY TEMPLATES
  {
    id: 'support-saas-update',
    name: 'SaaS Platform Update',
    description: 'Support surge following major platform updates and releases',
    industry: ['support'],
    configuration: {
      schedule: {
        agentsNumber: 22,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '08:00', end: '18:00' },
        activitiesPerAgent: { min: 18, max: 32 },
        activityDuration: { min: 10, max: 60 },
        untrackedActivityPercentage: 22,
        untrackedDuration: { min: 15, max: 50 },
      },
      forecastVsActual: {
        currentTimeIndex: 9,
        baseTicketVolume: { min: 60, max: 140 },
        baseScheduledAgents: { min: 50, max: 160 },
        slaTarget: 90,
        includeWeekends: false,
      },
      forecast: {
        algorithm: {
          name: 'lstm_hourly',
          frequency: 'hourly',
          category: 'ai',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Platform Update',
            startTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 10 * 24 * 60 * 60 * 1000,
            change: 200,
            changeType: 'percentage',
            active: true,
          },
          {
            name: 'End of Quarter',
            startTime: Date.now() + 85 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 92 * 24 * 60 * 60 * 1000,
            change: 60,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.75,
          averageHandleTime: 1800,
          averageHandleTimeType: 'static',
          targetTime: 14400,
          shrinkage: 0.3,
          targetServiceLevel: 0.9,
          minimumStaffing: 6,
          channel: 'email',
          concurrency: 2,
        },
      },
      reports: {
        performanceLevel: 'average', // SaaS updates have moderate complexity
        adherenceTarget: 0.85, // Good adherence for support
        efficiencyLevel: 'average', // Moderate response times for updates
        qualityTarget: 0.88, // High quality for technical support
        workloadIntensity: 'heavy', // Update periods are busy
        productiveTimePercentage: 0.78, // Good productivity for support
      },
      dashboards: {
        performanceLevel: 'average',
        volumeIntensity: 'heavy',
        responseSpeed: 'normal',
      },
    },
  },

  // HELPDESK INDUSTRY TEMPLATES
  {
    id: 'helpdesk-system-migration',
    name: 'System Migration Support',
    description: 'IT helpdesk during major system migrations and upgrades',
    industry: ['helpdesk'],
    configuration: {
      schedule: {
        agentsNumber: 18,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '07:00', end: '19:00' },
        activitiesPerAgent: { min: 16, max: 28 },
        activityDuration: { min: 12, max: 90 },
        untrackedActivityPercentage: 25,
        untrackedDuration: { min: 20, max: 60 },
      },
      forecastVsActual: {
        currentTimeIndex: 8,
        baseTicketVolume: { min: 40, max: 100 },
        baseScheduledAgents: { min: 50, max: 120 },
        slaTarget: 90,
        includeWeekends: false,
      },
      forecast: {
        algorithm: {
          name: 'prophet',
          frequency: 'hourly',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'System Upgrade',
            startTime: Date.now() + 10 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 17 * 24 * 60 * 60 * 1000,
            change: 150,
            changeType: 'percentage',
            active: true,
          },
          {
            name: 'New Employee Onboarding',
            startTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 35 * 24 * 60 * 60 * 1000,
            change: 80,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [
          {
            name: 'Holiday Week',
            startTime: Date.now() - 50 * 24 * 60 * 60 * 1000,
            endTime: Date.now() - 45 * 24 * 60 * 60 * 1000,
            active: true,
          },
        ],
        staffingParameters: {
          maxOccupancyRate: 0.75,
          averageHandleTime: 1200,
          averageHandleTimeType: 'static',
          targetTime: 10800,
          shrinkage: 0.25,
          targetServiceLevel: 0.9,
          minimumStaffing: 5,
          channel: 'email',
          concurrency: 2,
        },
      },
      reports: {
        performanceLevel: 'low', // System migrations are complex
        adherenceTarget: 0.78, // Lower adherence during migrations
        efficiencyLevel: 'low', // Longer response times for complex issues
        qualityTarget: 0.85, // Good quality despite complexity
        workloadIntensity: 'heavy', // Migration periods are intensive
        productiveTimePercentage: 0.7, // Lower productivity due to complexity
      },
      dashboards: {
        performanceLevel: 'low',
        volumeIntensity: 'heavy',
        responseSpeed: 'fast',
      },
    },
  },

  // Additional RETAIL INDUSTRY TEMPLATES
  {
    id: 'retail-grocery-rush',
    name: 'Grocery Peak Hours',
    description: 'Peak shopping hours with delivery and pickup coordination',
    industry: ['retail'],
    configuration: {
      schedule: {
        agentsNumber: 18,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '07:00', end: '21:00' },
        activitiesPerAgent: { min: 12, max: 25 },
        activityDuration: { min: 3, max: 15 },
        untrackedActivityPercentage: 18,
        untrackedDuration: { min: 8, max: 25 },
      },
      forecastVsActual: {
        currentTimeIndex: 10,
        baseTicketVolume: { min: 35, max: 90 },
        baseScheduledAgents: { min: 30, max: 120 },
        slaTarget: 88,
        includeWeekends: true,
      },
      forecast: {
        algorithm: {
          name: 'prophet',
          frequency: 'hourly',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Holiday Cooking',
            startTime: Date.now() + 50 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 65 * 24 * 60 * 60 * 1000,
            change: 100,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.8,
          averageHandleTime: 360,
          averageHandleTimeType: 'static',
          targetTime: 7200,
          shrinkage: 0.2,
          targetServiceLevel: 0.9,
          minimumStaffing: 8,
          channel: 'chat',
          concurrency: 5,
        },
      },
      reports: {
        performanceLevel: 'average', // Grocery support is standard
        adherenceTarget: 0.82, // Moderate adherence for grocery rush
        efficiencyLevel: 'high', // Fast responses for grocery questions
        qualityTarget: 0.8, // Good quality for routine grocery support
        workloadIntensity: 'moderate', // Grocery rush is moderate intensity
        productiveTimePercentage: 0.75, // Standard productivity
      },
      dashboards: {
        performanceLevel: 'average',
        volumeIntensity: 'moderate',
        responseSpeed: 'fast',
      },
    },
  },
  {
    id: 'retail-return-season',
    name: 'Return Processing Peak',
    description: 'Post-holiday return processing with policy questions',
    industry: ['retail'],
    configuration: {
      schedule: {
        agentsNumber: 22,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '09:00', end: '18:00' },
        activitiesPerAgent: { min: 14, max: 28 },
        activityDuration: { min: 6, max: 30 },
        untrackedActivityPercentage: 22,
        untrackedDuration: { min: 12, max: 35 },
      },
      forecastVsActual: {
        currentTimeIndex: 11,
        baseTicketVolume: { min: 45, max: 110 },
        baseScheduledAgents: { min: 35, max: 140 },
        slaTarget: 85,
        includeWeekends: false,
      },
      forecast: {
        algorithm: {
          name: 'xgboost',
          frequency: 'daily',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Post-Holiday Returns',
            startTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 21 * 24 * 60 * 60 * 1000,
            change: 80,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.75,
          averageHandleTime: 540,
          averageHandleTimeType: 'static',
          targetTime: 14400,
          shrinkage: 0.25,
          targetServiceLevel: 0.85,
          minimumStaffing: 6,
          channel: 'email',
          concurrency: 3,
        },
      },
      reports: {
        performanceLevel: 'average', // Return processing is routine
        adherenceTarget: 0.8, // Moderate adherence for returns
        efficiencyLevel: 'average', // Standard response times for returns
        qualityTarget: 0.78, // Good quality for return policies
        workloadIntensity: 'moderate', // Post-holiday returns are moderate
        productiveTimePercentage: 0.72, // Standard productivity for returns
      },
      dashboards: {
        performanceLevel: 'average',
        volumeIntensity: 'moderate',
        responseSpeed: 'normal',
      },
    },
  },

  // Additional ECOMMERCE INDUSTRY TEMPLATES
  {
    id: 'ecommerce-subscription-billing',
    name: 'Subscription Billing Cycle',
    description: 'Monthly billing cycles with payment and account issues',
    industry: ['ecommerce'],
    configuration: {
      schedule: {
        agentsNumber: 16,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '08:00', end: '20:00' },
        activitiesPerAgent: { min: 15, max: 30 },
        activityDuration: { min: 8, max: 45 },
        untrackedActivityPercentage: 20,
        untrackedDuration: { min: 15, max: 40 },
      },
      forecastVsActual: {
        currentTimeIndex: 9,
        baseTicketVolume: { min: 25, max: 80 },
        baseScheduledAgents: { min: 25, max: 100 },
        slaTarget: 90,
        includeWeekends: true,
      },
      forecast: {
        algorithm: {
          name: 'lstm_daily',
          frequency: 'daily',
          category: 'ai',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Billing Cycle',
            startTime: Date.now() + 1 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 3 * 24 * 60 * 60 * 1000,
            change: 60,
            changeType: 'percentage',
            active: true,
          },
          {
            name: 'Price Increase Announcement',
            startTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 37 * 24 * 60 * 60 * 1000,
            change: 120,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.75,
          averageHandleTime: 900,
          averageHandleTimeType: 'static',
          targetTime: 14400,
          shrinkage: 0.25,
          targetServiceLevel: 0.92,
          minimumStaffing: 5,
          channel: 'email',
          concurrency: 2,
        },
      },
      reports: {
        performanceLevel: 'high', // Billing issues need good performance
        adherenceTarget: 0.88, // High adherence for billing accuracy
        efficiencyLevel: 'average', // Moderate response times for billing
        qualityTarget: 0.9, // High quality for financial issues
        workloadIntensity: 'moderate', // Billing cycles are predictable
        productiveTimePercentage: 0.82, // Good productivity for billing
      },
      dashboards: {
        performanceLevel: 'high',
        volumeIntensity: 'moderate',
        responseSpeed: 'normal',
      },
    },
  },
  {
    id: 'ecommerce-shipping-delays',
    name: 'Shipping & Delivery Issues',
    description: 'Peak shipping seasons with tracking and delivery inquiries',
    industry: ['ecommerce'],
    configuration: {
      schedule: {
        agentsNumber: 32,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '06:00', end: '20:00' },
        activitiesPerAgent: { min: 20, max: 38 },
        activityDuration: { min: 4, max: 18 },
        untrackedActivityPercentage: 15,
        untrackedDuration: { min: 8, max: 22 },
      },
      forecastVsActual: {
        currentTimeIndex: 12,
        baseTicketVolume: { min: 75, max: 200 },
        baseScheduledAgents: { min: 60, max: 180 },
        slaTarget: 82,
        includeWeekends: true,
      },
      forecast: {
        algorithm: {
          name: 'lgbm',
          frequency: 'hourly',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Supplier Delay',
            startTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 14 * 24 * 60 * 60 * 1000,
            change: 200,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.8,
          averageHandleTime: 540,
          averageHandleTimeType: 'static',
          targetTime: 21600,
          shrinkage: 0.2,
          targetServiceLevel: 0.8,
          minimumStaffing: 3,
          channel: 'email',
          concurrency: 3,
        },
      },
      reports: {
        performanceLevel: 'low', // Shipping delays are complex to resolve
        adherenceTarget: 0.75, // Lower adherence during shipping issues
        efficiencyLevel: 'low', // Longer response times for tracking issues
        qualityTarget: 0.75, // Good quality despite complexity
        workloadIntensity: 'heavy', // Shipping delays create heavy workload
        productiveTimePercentage: 0.68, // Lower productivity during delays
      },
      dashboards: {
        performanceLevel: 'low',
        volumeIntensity: 'heavy',
        responseSpeed: 'normal',
      },
    },
  },

  // Additional TELECOMMUNICATIONS INDUSTRY TEMPLATES
  {
    id: 'telecommunications-internet-setup',
    name: 'Internet Installation Support',
    description: 'New customer installations and technical setup assistance',
    industry: ['telecommunications'],
    configuration: {
      schedule: {
        agentsNumber: 28,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '08:00', end: '18:00' },
        activitiesPerAgent: { min: 12, max: 24 },
        activityDuration: { min: 15, max: 60 },
        untrackedActivityPercentage: 25,
        untrackedDuration: { min: 20, max: 45 },
      },
      forecastVsActual: {
        currentTimeIndex: 10,
        baseTicketVolume: { min: 40, max: 120 },
        baseScheduledAgents: { min: 50, max: 160 },
        slaTarget: 85,
        includeWeekends: false,
      },
      forecast: {
        algorithm: {
          name: 'xgboost',
          frequency: 'hourly',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Weather Event',
            startTime: Date.now() + 20 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 25 * 24 * 60 * 60 * 1000,
            change: 300,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.78,
          averageHandleTime: 900,
          averageHandleTimeType: 'static',
          targetTime: 14400,
          shrinkage: 0.25,
          targetServiceLevel: 0.82,
          minimumStaffing: 10,
          channel: 'phone',
          concurrency: 1,
        },
      },
      reports: {
        performanceLevel: 'average', // Internet setup is routine technical work
        adherenceTarget: 0.85, // Good adherence for technical setup
        efficiencyLevel: 'low', // Longer times for technical setup
        qualityTarget: 0.88, // High quality for technical installations
        workloadIntensity: 'moderate', // Setup work is steady
        productiveTimePercentage: 0.75, // Standard productivity for tech work
      },
      dashboards: {
        performanceLevel: 'average',
        volumeIntensity: 'moderate',
        responseSpeed: 'extended',
      },
    },
  },
  {
    id: 'telecommunications-billing-disputes',
    name: 'Billing Disputes & Account Issues',
    description: 'Monthly billing cycles with payment disputes and plan changes',
    industry: ['telecommunications'],
    configuration: {
      schedule: {
        agentsNumber: 24,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '08:00', end: '20:00' },
        activitiesPerAgent: { min: 18, max: 32 },
        activityDuration: { min: 10, max: 40 },
        untrackedActivityPercentage: 20,
        untrackedDuration: { min: 15, max: 35 },
      },
      forecastVsActual: {
        currentTimeIndex: 11,
        baseTicketVolume: { min: 50, max: 140 },
        baseScheduledAgents: { min: 45, max: 150 },
        slaTarget: 88,
        includeWeekends: true,
      },
      forecast: {
        algorithm: {
          name: 'prophet',
          frequency: 'daily',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Sports Season',
            startTime: Date.now() + 60 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 150 * 24 * 60 * 60 * 1000,
            change: 40,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.8,
          averageHandleTime: 660,
          averageHandleTimeType: 'static',
          targetTime: 10800,
          shrinkage: 0.2,
          targetServiceLevel: 0.88,
          minimumStaffing: 8,
          channel: 'phone',
          concurrency: 1,
        },
      },
      reports: {
        performanceLevel: 'high', // Billing disputes need high performance
        adherenceTarget: 0.9, // High adherence for billing accuracy
        efficiencyLevel: 'average', // Moderate response times for disputes
        qualityTarget: 0.92, // Very high quality for billing disputes
        workloadIntensity: 'moderate', // Billing disputes are steady
        productiveTimePercentage: 0.8, // Good productivity for billing
      },
      dashboards: {
        performanceLevel: 'high',
        volumeIntensity: 'moderate',
        responseSpeed: 'normal',
      },
    },
  },

  // Additional SUPPORT INDUSTRY TEMPLATES
  {
    id: 'support-mobile-app',
    name: 'Mobile App Support',
    description: 'Consumer mobile app with frequent updates and user questions',
    industry: ['support'],
    configuration: {
      schedule: {
        agentsNumber: 20,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '09:00', end: '21:00' },
        activitiesPerAgent: { min: 25, max: 45 },
        activityDuration: { min: 3, max: 15 },
        untrackedActivityPercentage: 12,
        untrackedDuration: { min: 8, max: 20 },
      },
      forecastVsActual: {
        currentTimeIndex: 13,
        baseTicketVolume: { min: 80, max: 180 },
        baseScheduledAgents: { min: 40, max: 120 },
        slaTarget: 82,
        includeWeekends: true,
      },
      forecast: {
        algorithm: {
          name: 'xgboost',
          frequency: '15 min',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'App Store Feature',
            startTime: Date.now() + 3 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 10 * 24 * 60 * 60 * 1000,
            change: 300,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.85,
          averageHandleTime: 300,
          averageHandleTimeType: 'static',
          targetTime: 7200,
          shrinkage: 0.15,
          targetServiceLevel: 0.85,
          minimumStaffing: 4,
          channel: 'chat',
          concurrency: 6,
        },
      },
      reports: {
        performanceLevel: 'high', // Mobile app support needs good performance
        adherenceTarget: 0.82, // Good adherence for app support
        efficiencyLevel: 'high', // Fast response times for mobile users
        qualityTarget: 0.85, // Good quality for app issues
        workloadIntensity: 'heavy', // Mobile apps generate heavy volume
        productiveTimePercentage: 0.78, // Good productivity for chat support
      },
      dashboards: {
        performanceLevel: 'high',
        volumeIntensity: 'heavy',
        responseSpeed: 'fast',
      },
    },
  },
  {
    id: 'support-gaming-platform',
    name: 'Gaming Platform Support',
    description: 'Gaming support with tournaments and new game launches',
    industry: ['support'],
    configuration: {
      schedule: {
        agentsNumber: 35,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '10:00', end: '02:00' }, // Gaming hours
        activitiesPerAgent: { min: 22, max: 50 },
        activityDuration: { min: 5, max: 25 },
        untrackedActivityPercentage: 15,
        untrackedDuration: { min: 10, max: 30 },
      },
      forecastVsActual: {
        currentTimeIndex: 14,
        baseTicketVolume: { min: 120, max: 350 },
        baseScheduledAgents: { min: 60, max: 220 },
        slaTarget: 80,
        includeWeekends: true,
      },
      forecast: {
        algorithm: {
          name: 'lgbm',
          frequency: '15 min',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'New Game Launch',
            startTime: Date.now() + 14 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 21 * 24 * 60 * 60 * 1000,
            change: 400,
            changeType: 'percentage',
            active: true,
          },
          {
            name: 'Tournament Event',
            startTime: Date.now() + 40 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 42 * 24 * 60 * 60 * 1000,
            change: 180,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [
          {
            name: 'Server Maintenance',
            startTime: Date.now() - 10 * 24 * 60 * 60 * 1000,
            endTime: Date.now() - 9 * 24 * 60 * 60 * 1000,
            active: true,
          },
        ],
        staffingParameters: {
          maxOccupancyRate: 0.88,
          averageHandleTime: 420,
          averageHandleTimeType: 'static',
          targetTime: 7200,
          shrinkage: 0.18,
          targetServiceLevel: 0.82,
          minimumStaffing: 8,
          channel: 'chat',
          concurrency: 5,
        },
      },
      reports: {
        performanceLevel: 'high', // Gaming platform needs excellent support
        adherenceTarget: 0.78, // Lower adherence due to gaming hours
        efficiencyLevel: 'high', // Fast response times for gamers
        qualityTarget: 0.82, // Good quality for gaming issues
        workloadIntensity: 'peak', // Gaming events create peak load
        productiveTimePercentage: 0.75, // Good productivity for gaming support
      },
      dashboards: {
        performanceLevel: 'high',
        volumeIntensity: 'peak',
        responseSpeed: 'fast',
      },
    },
  },

  // Additional HELPDESK INDUSTRY TEMPLATES
  {
    id: 'helpdesk-managed-services',
    name: 'Managed IT Services',
    description: 'MSP providing IT support to multiple client organizations',
    industry: ['helpdesk'],
    configuration: {
      schedule: {
        agentsNumber: 26,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '07:00', end: '19:00' },
        activitiesPerAgent: { min: 14, max: 26 },
        activityDuration: { min: 12, max: 75 },
        untrackedActivityPercentage: 22,
        untrackedDuration: { min: 20, max: 50 },
      },
      forecastVsActual: {
        currentTimeIndex: 8,
        baseTicketVolume: { min: 35, max: 95 },
        baseScheduledAgents: { min: 40, max: 130 },
        slaTarget: 88,
        includeWeekends: false,
      },
      forecast: {
        algorithm: {
          name: 'xgboost',
          frequency: 'hourly',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Security Incident',
            startTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
            change: 300,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.8,
          averageHandleTime: 900,
          averageHandleTimeType: 'static',
          targetTime: 14400,
          shrinkage: 0.22,
          targetServiceLevel: 0.88,
          minimumStaffing: 8,
          channel: 'phone',
          concurrency: 1,
        },
      },
      reports: {
        performanceLevel: 'average', // Managed services are routine
        adherenceTarget: 0.88, // High adherence for MSP
        efficiencyLevel: 'average', // Standard response times for IT
        qualityTarget: 0.9, // High quality for IT services
        workloadIntensity: 'moderate', // MSP workload is steady
        productiveTimePercentage: 0.78, // Good productivity for IT support
      },
      dashboards: {
        performanceLevel: 'average',
        volumeIntensity: 'moderate',
        responseSpeed: 'normal',
      },
    },
  },
  {
    id: 'helpdesk-software-vendor',
    name: 'Software Vendor Support',
    description: 'Technical support for software product customers and partners',
    industry: ['helpdesk'],
    configuration: {
      schedule: {
        agentsNumber: 20,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '08:00', end: '18:00' },
        activitiesPerAgent: { min: 12, max: 22 },
        activityDuration: { min: 20, max: 90 },
        untrackedActivityPercentage: 28,
        untrackedDuration: { min: 25, max: 60 },
      },
      forecastVsActual: {
        currentTimeIndex: 9,
        baseTicketVolume: { min: 25, max: 70 },
        baseScheduledAgents: { min: 30, max: 100 },
        slaTarget: 85,
        includeWeekends: false,
      },
      forecast: {
        algorithm: {
          name: 'lstm_daily',
          frequency: 'daily',
          category: 'ai',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Product Release',
            startTime: Date.now() + 20 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 35 * 24 * 60 * 60 * 1000,
            change: 180,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.78,
          averageHandleTime: 1500,
          averageHandleTimeType: 'static',
          targetTime: 21600,
          shrinkage: 0.28,
          targetServiceLevel: 0.85,
          minimumStaffing: 4,
          channel: 'email',
          concurrency: 2,
        },
      },
      reports: {
        performanceLevel: 'high', // Software vendor support needs high performance
        adherenceTarget: 0.85, // Good adherence for vendor support
        efficiencyLevel: 'low', // Longer times for complex software issues
        qualityTarget: 0.92, // Very high quality for vendor support
        workloadIntensity: 'moderate', // Software support is steady
        productiveTimePercentage: 0.72, // Lower productivity due to complexity
      },
      dashboards: {
        performanceLevel: 'high',
        volumeIntensity: 'moderate',
        responseSpeed: 'extended',
      },
    },
  },

  // HEALTHCARE INDUSTRY TEMPLATES
  {
    id: 'healthcare-flu-season',
    name: 'Flu Season Patient Surge',
    description: 'High volume patient calls during flu season with appointment scheduling',
    industry: ['healthcare'],
    configuration: {
      schedule: {
        agentsNumber: 35,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '06:00', end: '20:00' },
        activitiesPerAgent: { min: 20, max: 45 },
        activityDuration: { min: 5, max: 25 },
        untrackedActivityPercentage: 18,
        untrackedDuration: { min: 10, max: 30 },
      },
      forecastVsActual: {
        currentTimeIndex: 12,
        baseTicketVolume: { min: 80, max: 220 },
        baseScheduledAgents: { min: 60, max: 200 },
        slaTarget: 85,
        includeWeekends: true,
      },
      forecast: {
        algorithm: {
          name: 'prophet',
          frequency: 'hourly',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Flu Season Peak',
            startTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 90 * 24 * 60 * 60 * 1000,
            change: 150,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.8,
          averageHandleTime: 480,
          averageHandleTimeType: 'static',
          targetTime: 7200,
          shrinkage: 0.22,
          targetServiceLevel: 0.85,
          minimumStaffing: 10,
          channel: 'phone',
          concurrency: 1,
        },
      },
      reports: {
        performanceLevel: 'high', // Healthcare requires high performance
        adherenceTarget: 0.88, // High adherence for healthcare
        efficiencyLevel: 'average', // Moderate response times for health calls
        qualityTarget: 0.9, // Very high quality for healthcare
        workloadIntensity: 'heavy', // Flu season is heavy workload
        productiveTimePercentage: 0.82, // Good productivity in healthcare
      },
      dashboards: {
        performanceLevel: 'high',
        volumeIntensity: 'heavy',
        responseSpeed: 'normal',
      },
    },
  },
  {
    id: 'healthcare-open-enrollment',
    name: 'Insurance Open Enrollment',
    description: 'Annual enrollment periods with complex insurance and benefit questions',
    industry: ['healthcare'],
    configuration: {
      schedule: {
        agentsNumber: 42,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '08:00', end: '20:00' },
        activitiesPerAgent: { min: 15, max: 30 },
        activityDuration: { min: 10, max: 45 },
        untrackedActivityPercentage: 25,
        untrackedDuration: { min: 15, max: 40 },
      },
      forecastVsActual: {
        currentTimeIndex: 10,
        baseTicketVolume: { min: 60, max: 180 },
        baseScheduledAgents: { min: 70, max: 220 },
        slaTarget: 88,
        includeWeekends: false,
      },
      forecast: {
        algorithm: {
          name: 'xgboost',
          frequency: 'daily',
          category: 'machine_learning',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Enrollment Deadline Rush',
            startTime: Date.now() + 60 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 75 * 24 * 60 * 60 * 1000,
            change: 200,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.78,
          averageHandleTime: 1200,
          averageHandleTimeType: 'static',
          targetTime: 21600,
          shrinkage: 0.25,
          targetServiceLevel: 0.88,
          minimumStaffing: 12,
          channel: 'phone',
          concurrency: 1,
        },
      },
      reports: {
        performanceLevel: 'excellent', // Healthcare requires excellent performance
        adherenceTarget: 0.95, // Very high adherence for healthcare
        efficiencyLevel: 'high', // Efficient but thorough responses
        qualityTarget: 0.92, // Very high quality for healthcare
        workloadIntensity: 'heavy', // Enrollment season is busy
        productiveTimePercentage: 0.88, // High productivity in healthcare
      },
      dashboards: {
        performanceLevel: 'excellent',
        volumeIntensity: 'heavy',
        responseSpeed: 'normal',
      },
    },
  },
  {
    id: 'healthcare-emergency-response',
    name: 'Emergency Response Coordination',
    description: 'Crisis management with medical emergency coordination and triage',
    industry: ['healthcare'],
    configuration: {
      schedule: {
        agentsNumber: 25,
        agentGroups: [],
        workstreams: [],
        tasks: [],
        locations: [],
        teams: [],
        organizations: [],
      },
      agentActivity: {
        workingHours: { start: '00:00', end: '23:59' }, // 24/7
        activitiesPerAgent: { min: 8, max: 20 },
        activityDuration: { min: 2, max: 60 },
        untrackedActivityPercentage: 15,
        untrackedDuration: { min: 5, max: 20 },
      },
      forecastVsActual: {
        currentTimeIndex: 15,
        baseTicketVolume: { min: 20, max: 80 },
        baseScheduledAgents: { min: 25, max: 60 },
        slaTarget: 95,
        includeWeekends: true,
      },
      forecast: {
        algorithm: {
          name: 'lstm_daily',
          frequency: '15 min',
          category: 'ai',
          forecastLength: 34560,
        },
        volumeAdjustments: [
          {
            name: 'Weather Emergency',
            startTime: Date.now() + 10 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 12 * 24 * 60 * 60 * 1000,
            change: 400,
            changeType: 'percentage',
            active: true,
          },
        ],
        excludedOutliers: [],
        staffingParameters: {
          maxOccupancyRate: 0.85,
          averageHandleTime: 180,
          averageHandleTimeType: 'static',
          targetTime: 300, // 5 minutes for emergency
          shrinkage: 0.15,
          targetServiceLevel: 0.95,
          minimumStaffing: 8,
          channel: 'phone',
          concurrency: 1,
        },
      },
      reports: {
        performanceLevel: 'excellent', // Emergency response needs excellent performance
        adherenceTarget: 0.95, // Very high adherence for emergencies
        efficiencyLevel: 'high', // Fast response times for emergencies
        qualityTarget: 0.98, // Highest quality for emergency situations
        workloadIntensity: 'peak', // Emergency situations are peak intensity
        productiveTimePercentage: 0.9, // Maximum productivity for emergencies
      },
      dashboards: {
        performanceLevel: 'excellent',
        volumeIntensity: 'peak',
        responseSpeed: 'urgent',
      },
    },
  },
];

// Helper functions
export const getTemplatesByIndustry = (industry: string): WFMTemplate[] => {
  return WFM_TEMPLATES.filter((template) => template.industry.includes(industry.toLowerCase()));
};

export const getTemplateById = (id: string): WFMTemplate | undefined => {
  return WFM_TEMPLATES.find((template) => template.id === id);
};

export const getAllIndustries = (): string[] => {
  const industries = new Set<string>();
  WFM_TEMPLATES.forEach((template) => {
    template.industry.forEach((ind) => industries.add(ind));
  });
  return Array.from(industries);
};
