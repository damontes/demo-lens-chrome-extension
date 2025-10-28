import { Button } from '@zendeskgarden/react-buttons';
import useAppState from '@/storage';
import AIAgentsForm from './AIAgentsForm';

type Props = {
  dashboardId: string;
  onClose: () => void;
  handleSubmit: (payload: any) => void;
};

const EditAIAgentsSkeleton = ({ dashboardId, handleSubmit, onClose }: Props) => {
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
    const { templateId } = dashboard;
    return {
      templateId: templateId || '',
    };
  };

  return (
    <AIAgentsForm
      onSubmit={onSubmit}
      initialValues={getInitialValues()}
      footer={
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
          <Button size="medium" style={{ width: '100%' }} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isPrimary size="medium" style={{ width: '100%' }}>
            Update
          </Button>
        </footer>
      }
    />
  );
};

export default EditAIAgentsSkeleton;
