import { useMemo } from 'react';
import useAppState from '@/storage';
import ExploreInterceptor from '@/models/explore/interceptor';
import AdminInterceptor from '@/models/admin/interceptor';
import WFMInterceptor from '@/models/wfm/interceptor';
import AIAgentsInterceptor from '@/models/aiagents/interceptor';
import { MD } from '@zendeskgarden/react-typography';
import { Button } from '@zendeskgarden/react-buttons';
import ReloadIcon from '@zendeskgarden/svg-icons/src/16/reload-stroke.svg?react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router';
import { getCategory } from '@/modules/Categories/Utils/handlers';
import AnalyzeView from '@/modules/Skeletons/Components/AnalyzeView';
import StepWizard from '@/components/ui/StepWizard';
import AddExploreSkeleton from '@/components/Explore/AddSkeleton';
import AddAdminSkeleton from '@/components/Admin/AddSkeleton';
import AddWFMSkeleton from '@/components/WFM/AddSkeleton';
import AddAIAgentsSkeleton from '@/components/AIAgents/AddSkeleton';
import CreateView from '../Components/CreateView';

const parseDashboardDetails = (rawDashboardDetails: any, pathSliceEnd: number = 2) => {
  const { url: rawUrl, dashboardName: rawDashboardName = '' } = rawDashboardDetails;
  const dashboardName = rawDashboardName.split('-').at(-1);
  const url = new URL(rawUrl);
  return {
    url: `https://${url.hostname}/${url.pathname.split('/').slice(1, pathSliceEnd).join('/')}`,
    dashboardName,
  };
};

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
      content: (props: any) => (
        <CreateView
          {...props}
          parseDashboardDetails={(rawDashboardDetails: any) => parseDashboardDetails(rawDashboardDetails, 2)}
        />
      ),
    },
    {
      id: 'step-1',
      title: 'Create',
      content: (props: any) => <AddAdminSkeleton {...props} />,
    },
  ],
  [WFMInterceptor.getDashboardType()]: [
    {
      id: 'step-0',
      title: 'Create',
      content: (props: any) => (
        <CreateView
          {...props}
          parseDashboardDetails={(rawDashboardDetails: any) => parseDashboardDetails(rawDashboardDetails, 3)}
        />
      ),
    },
    {
      id: 'step-1',
      title: 'Create',
      content: (props: any) => <AddWFMSkeleton {...props} />,
    },
  ],
  [AIAgentsInterceptor.getDashboardType()]: [
    {
      id: 'step-0',
      title: 'Analyze',
      content: (props: any) => (
        <CreateView
          {...props}
          parseDashboardDetails={(rawDashboardDetails: any) => parseDashboardDetails(rawDashboardDetails, 2)}
        />
      ),
    },
    {
      id: 'step-1',
      title: 'Create',
      content: (props: any) => <AddAIAgentsSkeleton {...props} />,
    },
  ],
};

const NewSkeleton = () => {
  const saveDashboard = useAppState((state: any) => state.saveDashboard);
  const [seachParams] = useSearchParams();
  const navigate = useNavigate();

  const category = getCategory(seachParams.get('categoryPath')?.split('.') ?? []);
  const type = category.type;

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
      category={category}
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
