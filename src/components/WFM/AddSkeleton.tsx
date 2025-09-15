import { Button } from '@zendeskgarden/react-buttons';
import { getRandomId } from '@/lib/general';
import { useStepWizardStore } from '@/components/ui/StepWizard/StepWizardProvider';
import WFMForm from './WFMForm';

type Props = {
  handleSubmit: (id: string, payload: any) => void;
};

const AddWFMSkeleton = ({ handleSubmit }: Props) => {
  const prev = useStepWizardStore((state) => state.prev);
  const currentDashboard = useStepWizardStore((state) => state.values.currentDashboard);

  const onSubmit = async (values: any) => {
    const id = getRandomId();
    const { name, sourceName, type } = currentDashboard;
    const payload = {
      name,
      sourceName,
      type,
      ...values,
    };
    handleSubmit(id, payload);
  };

  return (
    <WFMForm
      onSubmit={onSubmit}
      footer={
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
          <Button size="medium" style={{ width: '100%' }} onClick={prev}>
            Back
          </Button>
          <Button type="submit" isPrimary size="medium" style={{ width: '100%' }}>
            Save
          </Button>
        </footer>
      }
    />
  );
};

export default AddWFMSkeleton;
