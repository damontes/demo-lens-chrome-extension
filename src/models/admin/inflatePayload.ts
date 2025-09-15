import { RECOMMENDATION_ACTION_TYPES } from '@/components/Admin/OverviewCopilot/Recommendations/RecommendationForm';
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

export const inflateOverviewCopilotPayload = (skeleton: any, payload: any) => {
  const result = skeleton;
  const { metrics, recommendations, setupTasks } = payload;

  result.adminAiCenterMetrics.aiUsageMetrics = metrics;
  result.adminAiCenterSetupTasks = setupTasks;

  result.adminAiCenterSuggestions.suggestions = recommendations.map(getRecommendationRcommendation);

  return result;
};

function getRecommendationRcommendation(recommendation: any) {
  const { id, actionType, action, intent: rawIntents, ...metrics } = recommendation;
  const { analysedPeriod, metricExpectedImprovement, numTickets, percentTickets, precision } = metrics;
  const actionId = action.value;
  const rawTitle = faker.helpers.arrayElement(DEFAULT_RECOMMENDATION_TITLE);
  const title = replacePlaceholders(rawTitle, {
    requester_type: actionType === RECOMMENDATION_ACTION_TYPES.assignee ? 'assignee' : 'group',
    requester: action.title,
    intent:
      rawIntents.length > 1 ? `${rawIntents.at(0).title} (+${rawIntents.length - 1}more)` : rawIntents.at(0).title,
  });
  const duration = randomDuration();

  return {
    __typename: 'AdminAiCenterSuggestion',
    id,
    type: actionType === RECOMMENDATION_ACTION_TYPES.assignee ? 'routing_trigger_assignee' : 'routing_trigger_group',
    tags: [],
    status: 'new',
    data: {
      action_value: actionId,
      actions: [
        {
          field: actionType,
          value: actionId,
        },
      ],
      analysed_period: analysedPeriod,
      impacted_metric: 'Resolution time',
      intents: rawIntents.map((item: any) => item.value),
      metric_baseline: null,
      metric_expected_improvement: metricExpectedImprovement,
      metric_expected_improvement_percent: null,
      num_tickets: numTickets,
      percent_tickets: percentTickets,
      precision: precision,
    },
    action: {
      __typename: 'CreateTriggerAction',
      partialTrigger: {
        actions: [
          {
            field: 'assignee_id',
            value: '8362690880410',
          },
        ],
        conditions: {
          all: [
            {
              field: 'update_type',
              operator: 'is',
              value: 'Change',
            },
            {
              field: 'custom_fields_9033652423066',
              operator: 'is_not',
              value: 'intent_confidence__low',
            },
          ],
          any: [
            {
              field: 'custom_fields_9033652422554',
              operator: 'is',
              value: 'intent__billing__checkout__issue',
            },
            {
              field: 'custom_fields_9033652422554',
              operator: 'is',
              value: 'intent__billing__refund__request',
            },
            {
              field: 'custom_fields_9033652422554',
              operator: 'is',
              value: 'intent__misc__unsolicited__partnership',
            },
          ],
        },
      },
    },
    content: {
      __typename: 'RecommendationCard',
      title: title,
      subtitle: `Resolution time could improve by ${duration}`,
      body: `<div> 
                  <p>Tickets with some intents tend to be routed to the same agent. Automate this action to reduce manual triage and help improve resolution time.</p> 
                  <h6>Supporting insights</h6> 
                  <ul> 
                    <li><em>39</em> tickets (<em>${faker.number.int({
                      min: 25,
                      max: 200,
                    })}%</em>) had one of these intents: <em>${formatArraytoList(
        rawIntents.map((item: any) => item.title),
      )}</em>.</li> 
                    <li>Most of these tickets (<em>${faker.number.int({
                      min: 10,
                      max: 100,
                    })}%</em>) were routed to the same agent: <em>${action.title}</em>.</li> 
                    <li>On average, it took <em>${duration}</em> to manually route each ticket. This could be reduced through automation.</li> 
                  </ul> 
                </div>`,
      ctaText: 'Review trigger',
    },
    createdAt: '2025-03-20 10:40:16',
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
