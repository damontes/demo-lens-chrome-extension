import { Field, Input } from '@zendeskgarden/react-forms';
import { MD, SM } from '@zendeskgarden/react-typography';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@zendeskgarden/react-buttons';
import { Spinner } from '@zendeskgarden/react-loaders';
import { Alert } from '@zendeskgarden/react-notifications';
import { useStepWizardStore } from '../../../components/ui/StepWizard/StepWizardProvider';
import { getCurrentTabDetails, setAppState } from '@/lib/chromeExtension';
import ControllerInterceptor from '@/models/controllerInterceptor';

const DEFAULT_INITIAL_VALUES = {
  name: '',
  url: '',
  sourceName: '',
};

type Props = {
  onClose: () => void;
  parseDashboardDetails: (rawDashboardDetails: any) => any;
  category: any;
};

const CreateView = ({ onClose, category, parseDashboardDetails }: Props) => {
  const [values, setValues] = useState(DEFAULT_INITIAL_VALUES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const next = useStepWizardStore((state) => state.next);
  const setValue = useStepWizardStore((state) => state.setValue);

  const analyzeDashboard = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const currentDashboard = { type: category.type, name: values.name, sourceName: values.sourceName };
      setValue('currentDashboard', currentDashboard);
      next();
    } catch (error: any) {
      setError({
        title: error.message,
        description: category.errorMessage,
      });
      setAppState({ startAnalyzis: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialData = async () => {
      const rawDashboardDetails = await getCurrentTabDetails();
      const { url, dashboardName = '' } = parseDashboardDetails?.(rawDashboardDetails) ?? rawDashboardDetails;
      const name = dashboardName.trim();
      setValues((prev) => ({
        ...prev,
        url,
        sourceName: name,
        name,
      }));
    };

    initialData();
  }, []);

  return (
    <Form onSubmit={analyzeDashboard}>
      <Field>
        <Field.Label>Skeleton name</Field.Label>
        <Input
          placeholder="Zendesk Guide"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          required
        />
      </Field>
      <Field>
        <Field.Label>Context</Field.Label>
        <CurrentTabContainer>
          <Title>{values.sourceName}</Title>
          <Description>{values.url}</Description>
        </CurrentTabContainer>
      </Field>
      {Boolean(error) && (
        <Alert type="error">
          <Alert.Title>{error?.title}</Alert.Title>
          {error.description}
          <Alert.Close aria-label="Close Error Alert" onClick={() => setError(null)} />
        </Alert>
      )}
      <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
        <Button size="medium" style={{ width: '100%' }} onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isPrimary disabled={isLoading} size="medium" style={{ width: '100%' }}>
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '4px' }}>
              <Spinner size="large" />
            </div>
          )}
          Next
        </Button>
      </footer>
    </Form>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CurrentTabContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${({ theme }) => theme.space.sm};
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  border-radius: ${({ theme }) => theme.borderRadii.md};
  background-color: ${({ theme }) => theme.palette.grey[100]};
`;

const Title = styled(MD)`
  margin: 0;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  text-wrap: nowrap;
`;

const Description = styled(SM)`
  margin: 0;
  color: ${({ theme }) => theme.palette.grey[600]};
  overflow: hidden;
  text-overflow: ellipsis;
  text-wrap: nowrap;
`;

export default CreateView;
