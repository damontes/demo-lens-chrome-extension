import { Field, Input } from '@zendeskgarden/react-forms';
import { MD, SM } from '@zendeskgarden/react-typography';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@zendeskgarden/react-buttons';
import { Spinner } from '@zendeskgarden/react-loaders';
import useAppState from '@/storage';
import { Alert } from '@zendeskgarden/react-notifications';
import { useStepWizardStore } from '../../../components/ui/StepWizard/StepWizardProvider';
import { getCurrentTabDetails } from '@/lib/chromeExtension';
import { startAnalyzis } from '@/actions';

const DEFAULT_INITIAL_VALUES = {
  name: '',
  url: '',
  sourceName: '',
};

type Props = {
  onClose: () => void;
  category: any;
};

const AnalyzeView = ({ onClose, category }: Props) => {
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
      const dashboard = await startAnalyzis();
      const currentDashboard = { ...(dashboard ?? {}), name: values.name, sourceName: values.sourceName };
      setValue('currentDashboard', currentDashboard);
      next();
    } catch (error: any) {
      setError({
        title: error.message,
        description: category.errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialData = async () => {
      const { url, dashboardName } = await getCurrentTabDetails();
      setValues((prev) => ({
        ...prev,
        url,
        sourceName: dashboardName,
        name: dashboardName,
      }));
    };

    initialData();
  }, []);

  return (
    <Form onSubmit={analyzeDashboard}>
      <Field>
        <Field.Label>Dashboard name</Field.Label>
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
          Analyze
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

export default AnalyzeView;
