import { useMemo } from 'react';
import AnalyzeDashboardStep from './AnalyzeDashboardStep';
import StepWizard from '../ui/StepWizard';
import useAppState from '@/storage';
import ControllerInterpceptor from '@/models/controllerInterceptor';
import ExploreInterceptor from '@/models/exploreInterceptor';
import AdminInterceptor from '@/models/adminInterceptor';
import AddOverviewCopilotDashboard from '../Admin/OverviewCopilot/AddDashboard';
import AddExploreDashboard from '../Explore/AddDashboard';
import { MD } from '@zendeskgarden/react-typography';
import { Button } from '@zendeskgarden/react-buttons';
import ReloadIcon from '@zendeskgarden/svg-icons/src/16/reload-stroke.svg?react';
import styled from 'styled-components';

const ALL_STEPS = {
  [ExploreInterceptor.getDashboardType()]: [
    {
      id: 'step-0',
      title: 'Analyze',
      content: (props: any) => <AnalyzeDashboardStep {...props} />,
    },
    {
      id: 'step-1',
      title: 'Create',
      content: (props: any) => <AddExploreDashboard {...props} />,
    },
  ],
  [AdminInterceptor.getDashboardType()]: [
    {
      id: 'step-0',
      title: 'Analyze',
      content: (props: any) => <AnalyzeDashboardStep {...props} />,
    },
    {
      id: 'step-1',
      title: 'Create',
      content: (props: any) => <AddOverviewCopilotDashboard {...props} />,
    },
  ],
};

type Props = {
  onClose: () => void;
  handleSubmit: (id: string, payload: any) => void;
};

const CreateDashboard = ({ onClose, handleSubmit }: Props) => {
  const dashboadDetails = useAppState((state) => state.dashboardDetails);
  const dashboardToAnalyze = useAppState((state: any) => state.dashboardToAnalyze);

  const type = ControllerInterpceptor.getInterceptorType(dashboadDetails.url);

  const steps = useMemo(() => {
    if (!type) {
      return [];
    }

    return ALL_STEPS[type];
  }, [type]);

  if (!steps.length) {
    return (
      <ErrorContainer>
        <MD>{dashboardToAnalyze.errorMessage}</MD>
        <Button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Try again <ReloadIcon width={12} height={12} />
        </Button>
      </ErrorContainer>
    );
  }

  return (
    <StepWizard
      title="Create dashboard"
      description={`Enter a name for your dashboard. We'll analyze the current Zendesk tab you're viewing.`}
      steps={steps}
      onClose={onClose}
      handleSubmit={handleSubmit}
    />
  );
};

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 48px;
  gap: 16px;
`;
export default CreateDashboard;
