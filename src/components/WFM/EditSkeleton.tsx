import { Button } from '@zendeskgarden/react-buttons';
import useAppState from '@/storage';
import WFMForm from './WFMForm';

type Props = {
  dashboardId: string;
  onClose: () => void;
  handleSubmit: (payload: any) => void;
};

const EditWFMSkeleton = ({ dashboardId, handleSubmit, onClose }: Props) => {
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
    const { templateId, useInstanceData } = dashboard;
    return {
      templateId: templateId || '',
      useInstanceData: useInstanceData || false,
    };
  };

  return (
    <WFMForm
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

export default EditWFMSkeleton;
