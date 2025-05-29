import { Button, IconButton } from '@zendeskgarden/react-buttons';
import OverviewCopilotForm from './DashboardForm';
import useAppState from '@/storage';
import { useEffect, useState } from 'react';
import { startAnalyzis } from '@/actions';
import { MD } from '@zendeskgarden/react-typography';
import ReloadIcon from '@zendeskgarden/svg-icons/src/16/reload-stroke.svg?react';

type Props = {
  dashboardId: string;
  onClose: () => void;
  handleSubmit: (payload: any) => void;
};

const EditOverviewCopilotDashboard = ({ dashboardId, handleSubmit, onClose }: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentDashboard, setCurrentDashboard] = useState<any>(null);
  const [refetch, setRefetch] = useState(0);

  const dashboards = useAppState((state: any) => state.dashboards);

  const dashboard = dashboards[dashboardId];

  const onSubmit = async (values: any) => {
    const payload = {
      ...dashboard,
      ...values,
    };
    handleSubmit(payload);
  };

  const getInitialValues = () => {
    const { metrics, recommendations } = dashboard;
    return {
      metrics,
      recommendations,
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

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 48px' }}>
        <MD>
          Error loading dashboard, please make sure you are in the correct view: <b>"/admin/ai/overview/copilot"</b>.
        </MD>
        <IconButton onClick={onRefetch} style={{ marginTop: '16px' }}>
          Try again <br /> <ReloadIcon />
        </IconButton>
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

export default EditOverviewCopilotDashboard;
