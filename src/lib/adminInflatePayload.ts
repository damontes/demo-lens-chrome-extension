import { RECOMMENDATION_ACTION_TYPES } from '@/components/Admin/OverviewCopilot/Recommendations/RecommendationForm';

export const inflatePayload = (skeleton: any, payload: any) => {
  const result = skeleton;
  const { metrics, recommendations } = payload;

  result.adminAiCenterMetrics.aiUsageMetrics = metrics;
  result.adminAiCenterSuggestions.suggestions = recommendations.map((recommendation: any) => {
    const suggestionSkeleton = structuredClone(result.adminAiCenterSuggestions.suggestions[0]);
    const { id, actionType, action, intent, ...metrics } = recommendation;
    const { analysedPeriod, metricExpectedImprovement, numTickets, percentTickets, precision } = metrics;

    const actionId = action.value;
    suggestionSkeleton.id = id;
    suggestionSkeleton.type =
      actionType === RECOMMENDATION_ACTION_TYPES.assignee ? 'routing_trigger_assignee' : 'routing_trigger_group';
    suggestionSkeleton.data.action_value = actionId;
    suggestionSkeleton.data.actions[0].value = actionId;
    suggestionSkeleton.data.actions[0].field = actionType;
    suggestionSkeleton.data.intents = intent.map((item: any) => item.value);

    suggestionSkeleton.data.analysed_period = analysedPeriod;
    suggestionSkeleton.data.metric_expected_improvement = metricExpectedImprovement;
    suggestionSkeleton.data.num_tickets = numTickets;
    suggestionSkeleton.data.percent_tickets = percentTickets;
    suggestionSkeleton.data.precision = precision;
    return suggestionSkeleton;
  });

  return result;
};
