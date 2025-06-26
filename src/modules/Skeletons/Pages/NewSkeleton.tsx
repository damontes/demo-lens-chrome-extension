import { useMemo } from 'react';
import useAppState from '@/storage';
import ControllerInterpceptor from '@/models/controllerInterceptor';
import ExploreInterceptor from '@/models/exploreInterceptor';
import AdminInterceptor from '@/models/adminInterceptor';
import { MD } from '@zendeskgarden/react-typography';
import { Button } from '@zendeskgarden/react-buttons';
import ReloadIcon from '@zendeskgarden/svg-icons/src/16/reload-stroke.svg?react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router';
import { getCategory } from '@/modules/Categories/Utils/handlers';
import AnalyzeView from '@/modules/Skeletons/Components/AnalyzeView';
import StepWizard from '@/components/ui/StepWizard';
import AddExploreSkeleton from '@/components/Explore/AddSkeleton';
import AddOverviewCopilotSkeleton from '@/components/Admin/OverviewCopilot/AddSkeleton';

const ALL_STEPS = {
  [ExploreInterceptor.getDashboardType()]: [
    {
      id: 'step-0',
      title: 'Analyze',
      content: (props: any) => <AnalyzeView {...props} />,
    },
    {
      id: 'step-1',
      title: 'Create',
      content: (props: any) => <AddExploreSkeleton {...props} />,
    },
  ],
  [AdminInterceptor.getDashboardType()]: [
    {
      id: 'step-0',
      title: 'Analyze',
      content: (props: any) => <AnalyzeView {...props} />,
    },
    {
      id: 'step-1',
      title: 'Create',
      content: (props: any) => <AddOverviewCopilotSkeleton {...props} />,
    },
  ],
};

type Props = {
  onClose: () => void;
  handleSubmit: (id: string, payload: any) => void;
};

const NewSkeleton = () => {
  const dashboadDetails = useAppState((state) => state.dashboardDetails);
  const saveDashboard = useAppState((state: any) => state.saveDashboard);
  const [seachParams] = useSearchParams();
  const navigate = useNavigate();

  const category = getCategory(seachParams.get('categoryPath')?.split('.') ?? []);

  const type = ControllerInterpceptor.getInterceptorType(dashboadDetails.url);

  const goBack = () => {
    navigate(-1);
  };

  const onCreateSkeleton = async (id: string, newSkeleton: any) => {
    saveDashboard(id, newSkeleton);
    navigate('/skeletons');
  };

  const steps = useMemo(() => {
    if (!type) {
      return [];
    }

    return ALL_STEPS[type];
  }, [type]);

  if (!steps.length) {
    return (
      <ErrorContainer>
        <MD>{category.errorMessage}</MD>
        <Button onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Try again <ReloadIcon width={12} height={12} />
        </Button>
      </ErrorContainer>
    );
  }

  return (
    <StepWizard
      title="Create skeleton"
      description={`Enter a name for your skeleton. We'll analyze the current Zendesk tab you're viewing.`}
      steps={steps}
      onClose={goBack}
      handleSubmit={onCreateSkeleton}
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

export default NewSkeleton;
