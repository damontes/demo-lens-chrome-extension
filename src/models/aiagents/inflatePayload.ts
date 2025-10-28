import {
  KPIConfiguration,
  ContactReasonsConfiguration,
  SuggestionsConfiguration,
  IntentSuggestion,
  UseCase,
  KnowledgeSource,
} from './templates';

const FIELD_PREFIX = 'bi_conversations.';

// ============================================
// INTERFACES FOR QUERY DATA GENERATION
// ============================================

interface TimeInterval {
  name: string;
  count: number;
}

interface Field {
  name: string;
  type: string;
  value_format?: string | null;
  time_interval?: TimeInterval;
}

interface QueryFields {
  measures: Field[];
  dimensions: Field[];
  pivots: Field[];
}

interface Pivot {
  key: string;
  data: Record<string, any>;
}

interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Checks if the request is for feedback rating breakdown
 * (contains feedback_last_rating field)
 */
function isFeedbackRatingBreakdown(fields: string[]): boolean {
  return fields.some((field) => field === 'bi_conversations.feedback_last_rating');
}

/**
 * Inflates the KPI payload based on the requested fields
 * @param fields - Array of field names requested in the query (e.g., "bi_conversations.total_volume")
 * @param kpiConfig - The KPI configuration from the template
 * @param originalResponse - The original response data to use as fallback
 * @returns Array with the inflated data matching the requested fields
 */
export function inflateKPIPayload(fields: string[], kpiConfig: KPIConfiguration, originalResponse?: any[]): any[] {
  // Special case: Feedback Rating Breakdown returns multiple rows (one per rating)
  if (isFeedbackRatingBreakdown(fields) && kpiConfig.feedback_rating_breakdown) {
    // Recursively call inflateKPIPayload for each breakdown row
    return kpiConfig.feedback_rating_breakdown.map((breakdown: any, idx) => {
      // Treat each breakdown object as a mini KPI config and recursively process it
      const currentResponse = originalResponse?.[idx];
      const result = inflateKPIPayload(fields, breakdown, currentResponse ? [currentResponse] : []);
      return result[0]; // Extract the single row from the array
    });
  }

  // Standard case: Single row response
  const response: any = {};

  // Process each requested field
  fields.forEach((field) => {
    // Remove the "bi_conversations." prefix to get the key name
    if (field.startsWith(FIELD_PREFIX)) {
      const fieldKey = field.replace(FIELD_PREFIX, '') as keyof KPIConfiguration;

      // Check if the field exists in the KPI configuration
      if (fieldKey in kpiConfig) {
        response[field] = kpiConfig[fieldKey];
      } else {
        // Field not found in configuration, use original response value if available
        const originalValue = originalResponse?.[0]?.[field];
        response[field] = originalValue !== undefined ? originalValue : null;
      }
    } else {
      // Field doesn't start with expected prefix, use original response value if available
      const originalValue = originalResponse?.[0]?.[field];
      response[field] = originalValue !== undefined ? originalValue : null;
    }
  });

  // Return as array with single object (matching the response format from your examples)
  return [response];
}

// ============================================
// QUERY DATA GENERATION FUNCTIONS
// ============================================

/**
 * Parse date range from filter string (e.g., "2025/09/15 to 2025/10/16")
 */
function parseDateRange(dateRangeStr: string): DateRange {
  if (!dateRangeStr) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end };
  }

  const [startStr, endStr] = dateRangeStr.split(' to ');
  const start = new Date(startStr.replace(/\//g, '-'));
  const end = new Date(endStr.replace(/\//g, '-'));
  return { start, end };
}

/**
 * Generate date points based on time interval
 */
function generateDatePoints(dateRange: DateRange, timeInterval: TimeInterval): Date[] {
  const points: Date[] = [];

  // Check if this is quarterly data (month with count 3)
  const isQuarterly = timeInterval.name === 'quarter' || (timeInterval.name === 'month' && timeInterval.count === 3);

  // Special handling for quarters to ensure minimum 2 points
  if (isQuarterly) {
    // Start with the end date's quarter
    const endQuarter = new Date(dateRange.end);
    points.push(new Date(endQuarter));

    // Always add the previous quarter
    const previousQuarter = new Date(endQuarter);
    previousQuarter.setMonth(previousQuarter.getMonth() - 3);
    points.unshift(new Date(previousQuarter));
    return points;
  }

  // Regular generation for other time intervals
  const current = new Date(dateRange.start);

  while (current <= dateRange.end) {
    points.push(new Date(current));

    switch (timeInterval.name) {
      case 'day':
        current.setDate(current.getDate() + timeInterval.count);
        break;
      case 'week':
        current.setDate(current.getDate() + 7 * timeInterval.count);
        break;
      case 'month':
        current.setMonth(current.getMonth() + timeInterval.count);
        break;
      default:
        current.setDate(current.getDate() + 1);
    }
  }

  return points;
}

/**
 * Format date based on dimension type
 * Returns the formatted value for the data structure
 */
function formatDate(date: Date, dimensionType: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (dimensionType) {
    case 'date_date':
      // Daily: YYYY-MM-DD
      return `${year}-${month}-${day}`;
    case 'date_week':
      // Weekly: YYYY-MM-DD (date format, not week number)
      return `${year}-${month}-${day}`;
    case 'date_month':
      // Monthly: YYYY-MM
      return `${year}-${month}`;
    case 'date_quarter':
      // Quarterly: YYYY-MM (first month of the quarter)
      // Q1: 01, Q2: 04, Q3: 07, Q4: 10
      const quarter = Math.floor(date.getMonth() / 3);
      const firstMonthOfQuarter = String(quarter * 3 + 1).padStart(2, '0');
      return `${year}-${firstMonthOfQuarter}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Format the rendered value for quarters
 */
function formatQuarterRendered(date: Date): string {
  const year = date.getFullYear();
  const quarter = Math.floor((date.getMonth() + 3) / 3);
  return `${year}-Q${quarter}`;
}

/**
 * Generate random value based on field type and format
 */
function generateMeasureValue(field: Field): number | null {
  const { type, value_format } = field;

  // Check if it's a percentage field
  const isPercentage = value_format?.includes('%') || field.name.includes('_rate') || field.name.includes('percentage');

  // Check if it's a count field
  const isCount =
    type === 'count' || type === 'count_distinct' || field.name.includes('count') || field.name.includes('volume');

  if (isPercentage) {
    // Generate percentage between 0 and 1 (or 0-100 if format requires)
    return Math.random() * 0.8 + 0.1; // Between 0.1 and 0.9
  }

  if (isCount) {
    // Generate count between 1 and 100
    return Math.floor(Math.random() * 80) + 10; // Between 10 and 90
  }

  // Default: generate number between 0 and 1000
  return Math.floor(Math.random() * 1000);
}

/**
 * Generate query data for a single query response
 * @param fields - Query fields (measures, dimensions, pivots)
 * @param dateRangeFilter - Date range string (e.g., "2025/09/15 to 2025/10/16")
 * @param pivots - Optional pivot data
 * @returns Array of data rows
 */
function generateSingleQueryData(fields: QueryFields, dateRangeFilter: string, pivots?: Pivot[]): any[] {
  const { measures, dimensions, pivots: pivotFields } = fields;

  // Find the time dimension (should have time_interval)
  const timeDimension = dimensions.find((d) => d.time_interval);

  if (!timeDimension || !timeDimension.time_interval) {
    return [];
  }

  // Parse date range and generate date points
  const dateRange = parseDateRange(dateRangeFilter);
  const datePoints = generateDatePoints(dateRange, timeDimension.time_interval);

  // Check if we have pivots
  const hasPivots = pivots && pivots.length > 0;
  const pivotValues = hasPivots ? pivots.map((p) => p.key) : [];

  // Generate data rows
  const data: any[] = [];

  for (const date of datePoints) {
    const row: any = {};

    // Add dimension value (time)
    const dimensionValue: any = {
      value: formatDate(date, timeDimension.type),
    };

    // For quarters, add rendered and filterable_value
    if (timeDimension.type === 'date_quarter') {
      const quarterRendered = formatQuarterRendered(date);
      dimensionValue.rendered = quarterRendered;
      dimensionValue.filterable_value = quarterRendered;
    }

    row[timeDimension.name] = dimensionValue;

    // Add other dimensions (non-time)
    for (const dimension of dimensions) {
      if (dimension.name !== timeDimension.name && !dimension.time_interval) {
        row[dimension.name] = {
          value: dimension.name, // Simple value for now
        };
      }
    }

    // Add measures
    if (hasPivots) {
      // When we have pivots, each measure has values for each pivot
      for (const measure of measures) {
        const measureData: any = {};

        for (const pivotValue of pivotValues) {
          measureData[pivotValue] = {
            value: generateMeasureValue(measure),
          };
        }

        row[measure.name] = measureData;
      }
    } else {
      // No pivots: simple measure values
      for (const measure of measures) {
        row[measure.name] = {
          value: generateMeasureValue(measure),
        };
      }
    }

    data.push(row);
  }

  return data;
}

/**
 * Process multiple query responses and generate data for each
 * @param completedQueries - Array of completed query responses
 * @returns Modified query responses with generated data
 */
export function inflateQueryData(completedQueries: any[]): any[] {
  const queryResponse = structuredClone(completedQueries);

  for (let i = 0; i < completedQueries.length; i++) {
    const response = queryResponse[i];

    const fields = response.data?.fields;
    const applicableFilters = response.applicable_filters;
    const pivots = response.data?.pivots;

    const dateRangeFilter =
      applicableFilters?.['bi_conversations.conversation_start_date'] ||
      applicableFilters?.['bi_conversations.conversation_start_week'] ||
      applicableFilters?.['bi_conversations.conversation_start_month'] ||
      applicableFilters?.['bi_conversations.conversation_start_quarter'];

    const newData = generateSingleQueryData(fields, dateRangeFilter, pivots);

    response.data.data = newData;
  }

  return queryResponse;
}

// ============================================
// CONTACT REASONS INFLATION FUNCTIONS
// ============================================

import { faker } from '@faker-js/faker';

/**
 * Inflates UseCases payload with faker-js generated data
 * @param useCases - Array of use case configurations
 * @param originalResponse - The original response data to use as base
 * @returns Array with the inflated use cases data
 */
export function inflateUseCasesPayload(useCases: UseCase[], originalResponse?: any[]): any[] {
  return useCases.map((useCase, index) => {
    // Use faker for specific fields that need variation
    const channel = faker.helpers.arrayElement(['chat', 'email']);
    const replyMethod = faker.helpers.arrayElement(['Dialogues', 'Procedures']);

    return {
      'topics.intent_id': { value: useCase.intent_id },
      'topics.bot_id': { value: useCase.bot_id },
      'topics.intent_name': { value: useCase.intent_name },
      'topics.bot_name': {
        value: useCase.bot_name,
        filterable_value: `"${useCase.bot_name}"`,
      },
      'topics.channel': { value: channel },
      'topics.reply_method': { value: replyMethod },
      'topics.conversations_count': { value: useCase.conversations_count },
      'topics.automated_resolutions_rate': {
        value: useCase.automated_resolutions_rate,
        rendered: `${Math.round(useCase.automated_resolutions_rate * 100)}%`,
      },
      'topics.custom_resolutions_rate': {
        value: useCase.custom_resolutions_rate,
        rendered: `${Math.round(useCase.custom_resolutions_rate * 100)}%`,
        filterable_value: useCase.custom_resolutions_rate.toString(),
      },
      'topics.escalated_conversations_rate': {
        value: useCase.escalated_conversations_rate,
        rendered: `${Math.round(useCase.escalated_conversations_rate * 100)}%`,
      },
      'topics.bsat_percent': {
        value: useCase.bsat_percent,
        filterable_value: useCase.bsat_percent ? useCase.bsat_percent.toString() : 'NULL',
      },
    };
  });
}

/**
 * Inflates KnowledgeSources payload with faker-js generated data
 * @param knowledgeSources - Array of knowledge source configurations
 * @param originalResponse - The original response data to use as base
 * @returns Array with the inflated knowledge sources data
 */
export function inflateKnowledgeSourcesPayload(knowledgeSources: KnowledgeSource[], originalResponse?: any[]): any[] {
  return knowledgeSources.map((source, index) => {
    return {
      'knowledge_source_insights.article_name': { value: source.article_name },
      'knowledge_source_insights.kb_source_type': { value: source.kb_source_type },
      'knowledge_source_insights.kb_name': { value: source.kb_name },
      'knowledge_source_insights.usage_rate': {
        value: source.usage_rate,
        rendered: `${Math.round(source.usage_rate * 100)}%`,
      },
      'knowledge_source_insights.automated_resolutions_rate': {
        value: source.automated_resolutions_rate,
        rendered: `${Math.round(source.automated_resolutions_rate * 100)}%`,
      },
      'knowledge_source_insights.escalated_conversations_rate': {
        value: source.escalated_conversations_rate,
        rendered: `${Math.round(source.escalated_conversations_rate * 100)}%`,
      },
      'knowledge_source_insights.bsat_percent': {
        value: source.bsat_percent,
        filterable_value: source.bsat_percent ? source.bsat_percent.toString() : 'NULL',
      },
      'knowledge_source_insights_totals.total_conversations_count': {
        value: source.total_conversations_count,
      },
    };
  });
}

/**
 * Main function to inflate contact reasons payload based on the requested view
 * @param fields - Array of field names requested in the query
 * @param contactReasonsConfig - The contact reasons configuration from the template
 * @param view - The view type ('topics' for use cases, 'knowledge_source_insights' for knowledge sources)
 * @param originalResponse - The original response data to use as fallback
 * @returns Array with the inflated data matching the requested fields and view
 */
export function inflateContactReasonsPayload(
  fields: string[],
  contactReasonsConfig: ContactReasonsConfiguration,
  view: string,
  originalResponse?: any[],
): any[] {
  // Determine which type of data to return based on the view
  switch (view) {
    case 'topics':
      return inflateUseCasesPayload(contactReasonsConfig.useCases, originalResponse);
    case 'knowledge_source_insights':
      return inflateKnowledgeSourcesPayload(contactReasonsConfig.knowledgeSources, originalResponse);
    default:
      console.warn(`Unknown view type: ${view}. Returning empty array.`);
      return [];
  }
}

// ============================================
// SUGGESTIONS PAYLOAD INFLATION
// ============================================

/**
 * Inflates Suggestions payload for Ultimate.ai API
 * @param suggestionsConfig - The suggestions configuration from the template
 * @param originalResponse - The original response data to use as fallback
 * @returns Array of suggested intents matching suggest_intents.json format
 */
export function inflateSuggestionsPayload(suggestionsConfig: SuggestionsConfiguration, originalResponse?: any): any[] {
  // If no suggestions are configured, return empty array
  if (!suggestionsConfig.suggestions || suggestionsConfig.suggestions.length === 0) {
    console.warn('No suggestions configured. Returning empty array.');
    return [];
  }

  // Generate conversation IDs for each suggestion based on numberOfConversations
  const generateConversationIds = (count: number): string[] => {
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      ids.push(faker.string.uuid());
    }
    return ids;
  };

  // Calculate total conversations for frequency calculation
  const totalConfiguredConversations = suggestionsConfig.suggestions.reduce(
    (sum, suggestion) => sum + suggestion.numberOfConversations,
    0,
  );

  // Create suggested intents array matching suggest_intents.json structure
  const suggestedIntents = suggestionsConfig.suggestions.map((suggestion: IntentSuggestion) => {
    // Calculate frequency as percentage of total conversations
    const frequency = (suggestion.numberOfConversations / totalConfiguredConversations) * 100;

    return {
      _id: faker.string.alphanumeric(24),
      name: suggestion.name,
      description: suggestion.description,
      frequency: frequency,
      conversationIds: generateConversationIds(suggestion.numberOfConversations),
    };
  });

  // Sort by frequency descending (highest first) to match suggest_intents.json structure
  suggestedIntents.sort((a, b) => b.frequency - a.frequency);

  return suggestedIntents;
}

/**
 * Generates complete Ultimate.ai suggestions response structure
 * @param suggestionsConfig - The suggestions configuration from the template
 * @param botId - The bot ID extracted from URL parameters
 * @param originalResponse - The original response data (if any)
 * @returns Complete response object matching suggest_intents.json format
 */
export function inflateFullSuggestionsResponse(
  suggestionsConfig: SuggestionsConfiguration,
  botId: string,
  originalResponse?: any,
): any {
  const inflatedSuggestedIntents = inflateSuggestionsPayload(
    suggestionsConfig,
    originalResponse?.suggestedIntents || [],
  );

  // Calculate total conversations for numberOfConversations field
  const totalConversations = suggestionsConfig.suggestions.reduce(
    (sum, suggestion) => sum + suggestion.numberOfConversations,
    0,
  );

  // Generate dates for the report (simulate a realistic timeframe)
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 8 * 30 * 24 * 60 * 60 * 1000); // 8 months ago
  const reportRequestedDate = new Date(endDate.getTime() - 10 * 60 * 1000); // 10 minutes ago
  const reportCompleteDate = new Date(endDate.getTime() - 3 * 60 * 1000); // 3 minutes ago

  // Create the full response structure based on suggest_intents.json
  return {
    botId: botId,
    status: 'completed',
    suggestedIntents: inflatedSuggestedIntents,
    coverage: parseFloat((Math.random() * (50 - 30) + 30).toFixed(1)), // Random coverage between 30-50%
    rejectedIntents: [], // Empty array as shown in original
    inputs: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      numberOfConversations: 500,
      dataSource: 'zendeskMessaging',
    },
    numberOfConversations: totalConversations,
    reportRequestedDate: reportRequestedDate.toISOString(),
    reportCompleteDate: reportCompleteDate.toISOString(),
  };
}
