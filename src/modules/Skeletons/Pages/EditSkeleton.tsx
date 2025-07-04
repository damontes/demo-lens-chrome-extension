import ExploreInterceptor from '@/models/exploreInterceptor';
import AdminInterceptor from '@/models/adminInterceptor';
import useAppState from '@/storage';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import EditExploreSkeleton from '@/components/Explore/EditSkeleton';
import EditOverviewCopilotDashboard from '@/components/Admin/OverviewCopilot/EditSkeleton';
import { reloadDashboard } from '@/actions';

const EDIT_FORM = {
  [ExploreInterceptor.getDashboardType()]: EditExploreSkeleton,
  [AdminInterceptor.getDashboardType()]: EditOverviewCopilotDashboard,
};

const EditSkeleton = () => {
  const dashboards = useAppState((state) => state.dashboards);
  const saveDashboard = useAppState((state: any) => state.saveDashboard);

  const { skeletonId = '' } = useParams();

  const navigate = useNavigate();

  const onClose = () => {
    navigate(-1);
  };

  const handleSubmit = async (newSkeleton: any) => {
    saveDashboard(skeletonId, newSkeleton);
    await reloadDashboard();
  };

  const Content = useMemo(() => {
    const dashboard = dashboards[skeletonId];
    if (!dashboard) {
      return () => <div>Dashboard not found</div>;
    }

    const type = dashboard.type ?? ExploreInterceptor.getDashboardType();

    return EDIT_FORM[type];
  }, [skeletonId]);

  return <Content dashboardId={skeletonId} onClose={onClose} handleSubmit={handleSubmit} />;
};

export default EditSkeleton;
