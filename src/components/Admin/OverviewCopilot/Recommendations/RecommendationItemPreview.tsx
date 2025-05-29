import Collapsable from '@/components/ui/Collapsable';
import { formatSecondsToHourMinutes } from '@/lib/general';
import { SM } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import { RECOMMENDATION_ACTION_TYPES } from './RecommendationForm';

type Props = {
  recommendation: any;
};

const RecommendationItemPreview = ({ recommendation }: Props) => {
  const { actionType, action, intent, ...metrics } = recommendation;
  const { analysedPeriod, metricExpectedImprovement, numTickets, percentTickets, precision } = metrics;
  return (
    <Collapsable
      headerContent={
        <div style={{ maxWidth: '90%' }}>
          <SM style={{ fontWeight: 'bold' }}>
            Improve resolution time by {formatSecondsToHourMinutes(metricExpectedImprovement)}
          </SM>
          <Subtitle>
            Route to the {actionType === RECOMMENDATION_ACTION_TYPES.assignee ? 'assignee' : 'group'}{' '}
            <b>{action?.title ?? '<Select group>'}</b> tickets with intent(s):{' '}
            <b>{intent?.title ?? '<Select Intent>'}</b>
          </Subtitle>
        </div>
      }
    >
      <div style={{ padding: '0 16px' }}>
        <SM style={{ fontWeight: 'bold' }}>Rationale</SM>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li>
            In the last {analysedPeriod} days, there were {numTickets} tickets ({percentTickets}
            %) with intent(s): <b>{intent?.map((item: any) => item.title).join(', ') ?? '<Select Intent(s)>'}</b>
          </li>
          <li>
            {precision}% of these tickets were assigned to group:{' '}
            <b>
              {action?.title ??
                (actionType === RECOMMENDATION_ACTION_TYPES.assignee ? '<Select asignee>' : '<Select group>')}
              .
            </b>
          </li>
          <li>On average, it took {formatSecondsToHourMinutes(metricExpectedImprovement)} to route each ticket.</li>
          <li>Automating routing can reduce the need for manual triage and improve efficiency of workflows. </li>
        </ul>
      </div>
    </Collapsable>
  );
};

const Subtitle = styled(SM)`
  color: ${({ theme }) => theme.palette.grey[600]};
`;

export default RecommendationItemPreview;
