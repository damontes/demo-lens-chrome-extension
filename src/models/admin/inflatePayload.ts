import { INTENT_SUGGESTIONS_CATEGORIES } from '@/constants';
import { faker } from '@faker-js/faker';
import { formatArraytoList } from '../../lib/general';

const DEFAULT_RECOMMENDATION_TITLE = [
  'Route specific tickets to (requester_type): (requester)',
  'Prioritize tickets with intent: (intent)',
  'Decrease priority of tickets with intent: (intent)',
  'Prioritize tickets with intent: (intent)',
  'Change ticket status for intent: (intent)',
  'Change ticket type for intent: (intent)',
  'Prioritize tickets with intent: (intent)',
  'Decrease priority of tickets with intent: (intent)',
  'Adjust ticket form for intent: (intent)',
  'Change ticket type for intent: (intent)',
  'Change ticket status for intent: (intent)',
  'Send an autoreply to tickets with intent: (intent)',
  'Send an autoreply and change ticket status for intent: (intent)',
  'Decrease priority of tickets with intent: (intent)',
  'Adjust ticket form for intent: (intent)',
  'Change ticket type for intent: (intent)',
  'Send an autoreply to tickets with intent: (intent)',
  'Send an autoreply and change ticket status for intent: (intent)',
];

export const inflateOverviewCopilotPayload = (payload: any) => {
  const { recommendations } = payload;
  const suggestions = recommendations.map(parseSuggestion);
  return { ...payload, suggestions };
};

export const inflateIntentSuggestionsPayload = (intentSuggestionsConfig: any) => {
  const { suggestions } = intentSuggestionsConfig;

  // Group suggestions by parent category, then by child category
  const groupedByCategory = suggestions.reduce((acc: any, suggestion: any) => {
    const parentCategory = suggestion.parentCategory;
    const childCategory = suggestion.childCategory;

    if (!acc[parentCategory]) {
      acc[parentCategory] = {};
    }
    if (!acc[parentCategory][childCategory]) {
      acc[parentCategory][childCategory] = [];
    }
    acc[parentCategory][childCategory].push(suggestion);
    return acc;
  }, {});

  // Transform to the expected GraphQL structure
  const intentSuggestions = INTENT_SUGGESTIONS_CATEGORIES.map((parentCategory) => {
    const parentCategoryTag = parentCategory.tag;
    const parentCategoryLabel = parentCategory.label;
    const categoryData = groupedByCategory[parentCategoryTag] || {};

    return {
      label: parentCategoryLabel,
      fullTag: parentCategoryTag,
      tag: parentCategoryTag,
      visibleStatuses: ['IN_REVIEW'],
      children: parentCategory.children
        .map((childCategory: any) => {
          const childCategoryTag = childCategory.tag;
          const childCategoryLabel = childCategory.label;
          const childSuggestions = categoryData[childCategoryTag] || [];

          return {
            label: childCategoryLabel,
            description: `${childCategoryLabel} related intent suggestions`,
            fullTag: `${parentCategoryTag}.${childCategoryTag}`,
            tag: childCategoryTag,
            visibleStatuses: ['IN_REVIEW'],
            children: childSuggestions.map((suggestion: any) => ({
              label: suggestion.label,
              description: suggestion.description,
              fullTag: `${parentCategoryTag}.${childCategoryTag}.${suggestion.id}`,
              tag: suggestion.id,
              visibleStatuses: ['IN_REVIEW'],
              createdAt: faker.date.recent({ days: 30 }).toISOString(),
              updatedAt: faker.date.recent({ days: 7 }).toISOString(),
              status: faker.helpers.arrayElement(['IN_REVIEW']),
              suggestionMetadata: {
                coverageCount: faker.number.int({ min: 5, max: 50 }),
                coveragePercentage: faker.number.float({ min: 0.05, max: 0.4, fractionDigits: 3 }),
                timeframe: faker.number.int({ min: 7, max: 30 }),
              },
            })),
          };
        })
        .filter((childCategory: any) => childCategory.children.length > 0), // Only include child categories that have suggestions
    };
  }).filter((category) => category.children.length > 0); // Only include parent categories that have child categories with suggestions

  return intentSuggestions;
};

export function parseSuggestion(recommendation: any) {
  const { id, actionType, action, intent: rawIntents, ...metrics } = recommendation;
  const { numTickets, percentTickets } = metrics;
  const actionId = action?.value;
  const duration = randomDuration();

  if (!actionType || actionType === 'activate_auto_assist') {
    return {
      __typename: 'AdminAiCenterSuggestion',
      id,
      state: 'NEW',
      action: {
        __typename: 'CreateTriggerAction',
        partialTrigger: {
          actions: [
            {
              field: 'current_tags',
              value: 'agent_copilot_enabled',
            },
          ],
          conditions: {
            all: [],
            any: [],
          },
        },
      },
      content: {
        __typename: 'RecommendationCard',
        title: 'Activate auto assist',
        subtitle: 'Resolution time could improve',
        body: `<div><p>Your procedures aren't working because auto assist isn't activated. Create a trigger for the <em>agent_copilot_enabled</em> tag to start improving resolution time and agent efficiency.</p><h6>Supporting insights</h6><ul class="chip"><li class="chip"><span>Procedures configured</span> <em>${faker.number.int(
          {
            min: 10,
            max: 50,
          },
        )}</em></li></ul><ul><li>None of these procedures were used by auto assist.</li></ul></div>`,
        ctaText: 'Review trigger',
      },
      createdAt: '2025-09-20 01:10:20',
    };
  }

  // Generate random title from available templates
  const rawTitle = faker.helpers.arrayElement(DEFAULT_RECOMMENDATION_TITLE);
  const intentList = rawIntents ? formatArraytoList(rawIntents.map((item: any) => item.title)) : '';
  const intentDisplay =
    rawIntents?.length > 1
      ? `${rawIntents.at(0).title} (+${rawIntents.length - 1} more)`
      : rawIntents?.at(0)?.title || 'Unknown Intent';

  // Replace placeholders in title
  const title = replacePlaceholders(rawTitle, {
    requester_type: actionType === 'assignee_id' ? 'assignee' : actionType === 'group_id' ? 'group' : 'field',
    requester: action?.title || 'Unknown',
    intent: intentDisplay,
  });

  // Generate subtitle based on action type
  const subtitle =
    actionType === 'priority' && action?.value === 'low'
      ? 'Reduce time spent on low-priority tickets'
      : `Resolution time could improve by ${duration}`;

  // Generate trigger actions and conditions
  const triggerActions = [{ field: 'current_tags', value: 'triage_trigger' }];

  // Add specific action based on actionType
  if (actionType && action) {
    const actionField = actionType === 'reply_public' ? 'reply_public' : actionType;
    const actionValue = actionType === 'reply_public' ? '<p>Lorem ipsum</p>' : action.value || actionId;

    triggerActions.push({ field: actionField, value: actionValue });

    // Sometimes add status change for reply_public
    if (actionType === 'reply_public' && faker.datatype.boolean({ probability: 0.3 })) {
      triggerActions.push({ field: 'status', value: 'closed' });
    }
  }

  const triggerConditions = {
    all: [
      { field: 'current_tags', operator: 'not_includes', value: 'triage_trigger' },
      { field: 'custom_fields_6013059407891', operator: 'is_not', value: 'intent_confidence__low' },
    ],
    any:
      rawIntents?.map((intent: any) => ({
        field: 'custom_fields_6013052322579',
        operator: 'is',
        value: intent.value,
      })) || [],
  };

  // Generate body content based on available data
  const routingPercent = faker.number.int({ min: 80, max: 95 });
  let body = `<div> <p>Tickets with some intents tend to be ${getActionDescription(
    actionType,
  )}. Automate this action to reduce manual triage and help improve resolution time.</p> <h6>Supporting insights</h6> <ul>`;

  if (numTickets && percentTickets) {
    body += ` <li><em>${numTickets}</em> tickets (<em>${(percentTickets * 100).toFixed(
      1,
    )}%</em>) had one of these intents: <em>${intentList}</em>.</li>`;
  }

  if (action?.title) {
    body += ` <li>Most of these tickets (<em>${routingPercent}%</em>) ${getActionResult(
      actionType,
      action.title,
    )}.</li>`;
  }

  body += ` <li>On average, it took <em>${duration}</em> to manually ${getActionVerb(
    actionType,
  )} each ticket. This could be reduced through automation.</li> </ul> </div>`;

  return {
    __typename: 'AdminAiCenterSuggestion',
    id,
    state: 'NEW',
    action: {
      __typename: 'CreateTriggerAction',
      partialTrigger: {
        actions: triggerActions,
        conditions: triggerConditions,
      },
    },
    content: {
      __typename: 'RecommendationCard',
      title,
      subtitle,
      body,
      ctaText: 'Review trigger',
    },
    createdAt: '2025-09-24 16:18:47',
  };
}

function randomDuration() {
  const hours = faker.number.int({ min: 0, max: 4 });
  const minutes = faker.number.int({ min: 10, max: 59 });

  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function replacePlaceholders(title: string, data: any) {
  return title.replace(/\(\w+\)/g, (match) => {
    const key = match.slice(1, -1);
    return data[key] || match;
  });
}

function getActionDescription(actionType: string): string {
  switch (actionType) {
    case 'assignee_id':
      return 'routed to the same agent';
    case 'group_id':
      return 'routed to the same agent group';
    case 'priority':
      return 'prioritized similarly';
    case 'status':
      return 'have their status changed to the same one';
    case 'type':
      return 'have their ticket type changed to the same one';
    case 'ticket_form_id':
      return 'have their ticket form changed to the same one';
    case 'reply_public':
      return 'answered with the same reply';
    default:
      return 'handled similarly';
  }
}

function getActionResult(actionType: string, actionTitle: string): string {
  switch (actionType) {
    case 'assignee_id':
      return `were routed to the same agent: <em>${actionTitle}</em>`;
    case 'group_id':
      return `were routed to the same group: <em>${actionTitle}</em>`;
    case 'priority':
      return `had their priority changed to: <em>${actionTitle}</em>`;
    case 'status':
      return `had their status changed to: <em>${actionTitle}</em>`;
    case 'type':
      return `had the ticket type changed to: <em>${actionTitle}</em>`;
    case 'ticket_form_id':
      return `had the ticket form changed to: <em>${actionTitle}</em>`;
    case 'reply_public':
      return 'were answered with the same reply';
    default:
      return `were handled with: <em>${actionTitle}</em>`;
  }
}

function getActionVerb(actionType: string): string {
  switch (actionType) {
    case 'assignee_id':
    case 'group_id':
      return 'route';
    case 'priority':
      return 'prioritize';
    case 'status':
      return 'change status of';
    case 'type':
      return 'change type of';
    case 'ticket_form_id':
      return 'triage';
    case 'reply_public':
      return 'respond to';
    default:
      return 'handle';
  }
}

export const inflateAutomationPotentialPayload = (automationPotentialConfig: any) => {
  const { metrics, topics } = automationPotentialConfig;

  // Helper function to transform metrics to expected GraphQL structure
  const transformMetrics = (metricsData: any) => ({
    automationPotentialRatio: {
      value: metricsData.automationPotentialRatio,
      __typename: 'PercentageMetric',
    },
    estimatedTotalCostSavings: {
      unit: 'USD',
      value: metricsData.estimatedTotalCostSavings,
      __typename: 'MonetaryMetric',
    },
    estimatedTotalHandleTimeSaved: {
      value: metricsData.estimatedTotalHandleTimeSaved,
      unit: 'SECONDS',
      __typename: 'TimeMetric',
    },
    __typename: 'AIAgentsInsightsMetrics',
  });

  // Transform global metrics
  const inflatedMetrics = transformMetrics(metrics);

  // Transform topics to expected GraphQL structure
  const inflatedTopics = topics.map((topic: any) => ({
    id: topic.id,
    name: topic.name,
    impact: topic.impact,
    ticketCount: topic.ticketCount,
    metrics: transformMetrics(topic.metrics),
    subtopics: topic.subtopics.map((subtopic: any) => ({
      canonicalRequest: subtopic.canonicalRequest,
      id: subtopic.id,
      llmSampleResponse: subtopic.llmSampleResponse,
      name: subtopic.name,
      summary: subtopic.summary,
      hasKnowledgeCoverage: subtopic.hasKnowledgeCoverage,
      __typename: 'AIAgentsInsightsSubtopic',
    })),
    relatedTickets: Array.from({ length: topic.ticketCount }, (_, index) => ({
      id: `${index + 1}`,
      subject: `${topic.name} - Ticket ${index + 1}`,
      __typename: 'Issue',
    })),
    __typename: 'AIAgentsInsightsTopic',
  }));

  return {
    metrics: inflatedMetrics,
    topics: inflatedTopics,
    __typename: 'AIAgentsInsights',
  };
};
