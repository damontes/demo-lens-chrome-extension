import ExploreInterceptor from '@/models/exploreInterceptor';
import AdminInterceptor from '@/models/adminInterceptor';
import useAppState from '@/storage';
import { useMemo } from 'react';
import EditOverviewCopilotDashboard from '../Admin/OverviewCopilot/EditDashboard';
import EditExploreDashboard from '../Explore/EditDashboard';

type Props = {
  dashboardId: string;
  onClose: () => void;
  handleSubmit: (payload: any) => void;
};

const EDIT_FORM = {
  [ExploreInterceptor.getDashboardType()]: EditExploreDashboard,
  [AdminInterceptor.getDashboardType()]: EditOverviewCopilotDashboard,
};

const EditDashboard = ({ dashboardId, onClose, handleSubmit }: Props) => {
  const dashboards = useAppState((state) => state.dashboards);

  const Content = useMemo(() => {
    const dashboard = dashboards[dashboardId];
    if (!dashboard) {
      return () => <div>Dashboard not found</div>;
    }

    const type = dashboard.type ?? ExploreInterceptor.getDashboardType();

    return EDIT_FORM[type];
  }, [dashboardId]);

  return <Content dashboardId={dashboardId} onClose={onClose} handleSubmit={handleSubmit} />;
};

export default EditDashboard;
