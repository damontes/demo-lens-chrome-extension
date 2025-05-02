import { Field, Input } from '@zendeskgarden/react-forms';
import { MD, SM } from '@zendeskgarden/react-typography';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getCurrentTabDetails } from '../lib/chromeExtension';
import { Button } from '@zendeskgarden/react-buttons';
import { startAnalyzis } from '../actions';
import { Spinner } from '@zendeskgarden/react-loaders';
import ExploreInterceptor from '@/models/exploreInterceptor';

const DEFAULT_INITIAL_VALUES = {
  name: '',
  url: '',
  sourceName: '',
};

type Props = {
  onClose: () => void;
  handleCurrentDashboard: (dashboard: any) => void;
  onNext: () => void;
};

const AnalyzeDashboardStep = ({ onClose, onNext, handleCurrentDashboard }: Props) => {
  const [values, setValues] = useState(DEFAULT_INITIAL_VALUES);
  const [isLoading, setIsLoading] = useState(false);

  const isNotValidDashboard = ExploreInterceptor.isNotValidDashboard(values.url);

  const analyzeDashboard = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const dashboard = await startAnalyzis();
    handleCurrentDashboard({ ...(dashboard ?? {}), name: values.name, sourceName: values.sourceName });
    setIsLoading(false);
    onNext();
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

  if (isNotValidDashboard) {
    return <EmptyText>This is not a valid dashboard please make sure you are in the correct URL.</EmptyText>;
  }

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
          Analyze dashboard
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

const EmptyText = styled(SM)`
  margin: 0;
  text-align: center;
  color: ${({ theme }) => theme.palette.grey[600]};
  padding: ${({ theme }) => theme.space.sm} 0px;
`;

export default AnalyzeDashboardStep;
