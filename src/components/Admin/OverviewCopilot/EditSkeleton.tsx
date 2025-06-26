import { Button } from '@zendeskgarden/react-buttons';
import OverviewCopilotForm from './DashboardForm';
import useAppState from '@/storage';
import { useEffect, useMemo, useState } from 'react';
import { startAnalyzis } from '@/actions';
import { MD } from '@zendeskgarden/react-typography';
import ReloadIcon from '@zendeskgarden/svg-icons/src/16/reload-stroke.svg?react';

type Props = {
  dashboardId: string;
  onClose: () => void;
  handleSubmit: (payload: any) => void;
};

const EditOverviewCopilotSkeleton = ({ dashboardId, handleSubmit, onClose }: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentDashboard, setCurrentDashboard] = useState<any>(null);
  const [refetch, setRefetch] = useState(0);

  const dashboards = useAppState((state: any) => state.dashboards);

  const dashboard = dashboards[dashboardId];
  const dashboardDetails = useAppState((state: any) => state.dashboardDetails);

  const notSameDashboard = useMemo(() => {
    const currentDashboardID = dashboard.dashboardId.split(':').at(0);
    const instanceSubdomain = new URL(dashboardDetails.url).hostname;
    return !instanceSubdomain.startsWith(currentDashboardID);
  }, [currentDashboard]);

  const dashboardInstance = useMemo(() => {
    const currentDashboardID = dashboard.dashboardId.split(':').at(0);
    return currentDashboardID;
  }, [dashboard]);

  const onSubmit = async (values: any) => {
    const payload = {
      ...dashboard,
      ...values,
    };
    handleSubmit(payload);
  };

  const getInitialValues = () => {
    const { metrics, recommendations, setupTasks: savedSetupTasks } = dashboard;
    const parsedCurrentDashboardSetupTasks = currentDashboard?.setupTasks.reduce(
      (prev: any, item: any) => ({
        ...prev,
        [item.id]: item.dismissed,
      }),
      {},
    );
    const setupTasks = !savedSetupTasks ? parsedCurrentDashboardSetupTasks : savedSetupTasks;

    return {
      metrics,
      recommendations,
      setupTasks,
    };
  };

  const onRefetch = () => {
    setRefetch((prev) => prev + 1);
    setError(false);
    setLoading(true);
  };

  const getCurrentDashboard = async () => {
    try {
      const dashboard = await startAnalyzis();
      setCurrentDashboard(dashboard);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentDashboard();
  }, [refetch]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading dependencies...</div>;
  }

  if (error || notSameDashboard) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 48px' }}>
        {!notSameDashboard ? (
          <MD>
            Error loading dashboard, please make sure you are in the correct view: <b>"/admin/ai/overview/copilot"</b>.
          </MD>
        ) : (
          <MD>
            The dashboard you are trying to edit is not the same instance as the one you are viewing.{' '}
            <b>{dashboardInstance}</b>{' '}
          </MD>
        )}
        <Button onClick={onRefetch} style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Try again <ReloadIcon />
        </Button>
      </div>
    );
  }

  return (
    <OverviewCopilotForm
      onSubmit={onSubmit}
      initialValues={getInitialValues()}
      currentDashboard={currentDashboard}
      footer={
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
          <Button size="medium" style={{ width: '100%' }} onClick={onClose}>
            Close
          </Button>
          <Button type="submit" isPrimary size="medium" style={{ width: '100%' }}>
            Save
          </Button>
        </footer>
      }
    />
  );
};

export default EditOverviewCopilotSkeleton;
