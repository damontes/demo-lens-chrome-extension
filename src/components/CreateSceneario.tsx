import { Button } from '@zendeskgarden/react-buttons';
import { Field, Input, Textarea } from '@zendeskgarden/react-forms';
import { LG, MD, SM } from '@zendeskgarden/react-typography';
import { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { SKELETON } from '../models/exploreInterceptor';
import { inflatePayload } from '../lib/zendesk';
import { processItems } from '../lib/openai';
import { getRandomId } from '../lib/general';
import { Spinner } from '@zendeskgarden/react-loaders';
import { StarsIcon } from '../icons';
import ProgressBar from './ProgressBar';

const DEFAULT_INITIAL_VALUES = {
  name: '',
  description: '',
};

type Props = {
  onClose: () => void;
  handleSubmit: (params: any) => void;
  currentDashboard: any;
};

const CreateSceneario = ({ onClose, currentDashboard, handleSubmit }: Props) => {
  const [values, setValues] = useState(DEFAULT_INITIAL_VALUES);
  const [isLoading, setIsLoading] = useState(false);
  const [tabProgress, setTabProgress] = useState(new Map());

  const theme = useTheme();

  const onProgress = (tabId: string, progress: number) => {
    setTabProgress((prev) => {
      const newProgress = new Map(prev);
      const entries = Array.from(prev.entries());
      const totalProgress = entries
        .filter(([key]) => key !== 'total')
        .map(([_, value]) => value)
        .reduce((prev, current) => prev + current, 0);
      const totalProgressPercent = Math.round(totalProgress / currentDashboard.tabs.length);

      newProgress.set(tabId, progress);
      newProgress.set('total', totalProgressPercent);
      return newProgress;
    });
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const { name, description } = values;

    setIsLoading(true);

    const tabs = currentDashboard.tabs.map((tab: any) => {
      const queries = Object.entries(tab.queries).reduce((prev: any, current: any) => {
        const [queryId, query] = current;
        const payload = inflatePayload(SKELETON, query.querySchema, query.visualizationType);

        return {
          ...prev,
          [queryId]: {
            ...query,
            payload,
          },
        };
      }, {});

      return {
        ...tab,
        queries,
      };
    });

    const payloads = await Promise.all(
      tabs.map(async (tab: any) => {
        const { queries } = tab;
        const params = {
          dashboardName: currentDashboard.name,
          tabName: tab.name,
          scenarioText: description,
          queries,
        };
        const payloadQueries = await processItems(params, (progress) => onProgress(tab.id, progress));
        return { tabId: tab.id, payloadQueries };
      }),
    );

    const id = getRandomId();
    const sceneario = {
      [id]: {
        name,
        description,
        payloads,
      },
    };

    setIsLoading(false);
    handleSubmit(sceneario);
  };

  return (
    <Container>
      <Header>
        <Title>Create new scenario</Title>
        <Description>Create a custom scenario to modify dashboard data</Description>
      </Header>
      <Form onSubmit={onSubmit}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 16px' }}>
            <ProgressBar progress={tabProgress.get('total') ?? 0} label="Overall progress" />
            {currentDashboard.tabs.map((tab: any) => {
              return <ProgressBar progress={tabProgress.get(tab.id) ?? 0} label={tab.name} key={tab.id} spinner />;
            })}
            <SM style={{ textAlign: 'center', marginTop: '8px', color: theme.palette.grey[600] }}>
              Generating values for each Zendesk tab... <b>don't close this window until the process is complete.</b>
            </SM>
          </div>
        ) : (
          <>
            <Field>
              <Field.Label>Name</Field.Label>
              <Input
                placeholder="High trafic"
                value={values.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
                required
              />
            </Field>
            <Field>
              <Field.Label>Context</Field.Label>
              <Textarea
                placeholder="Shows high volume of tickets and long wait times"
                value={values.description}
                onChange={(e) => setValues({ ...values, description: e.target.value })}
                rows={4}
                maxLength={150}
              />
              <footer style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                <FooterText tag="span" style={{ maxWidth: '80%' }}>
                  Leave it empty if you don't want any context.
                </FooterText>
                <FooterText tag="span">{values.description.length} / 150</FooterText>
              </footer>
            </Field>
          </>
        )}
        <Footer>
          <Button size="medium" disabled={isLoading} style={{ width: '100%' }} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} isPrimary size="medium" style={{ width: '100%' }}>
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', marginRight: '4px' }}>
                <Spinner size="large" />
              </div>
            ) : (
              <StarsIcon style={{ width: '16px', height: '16px' }} />
            )}
            Create sceneario
          </Button>
        </Footer>
      </Form>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: ${({ theme }) => theme.space.sm};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const Title = styled(LG)`
  margin: 0;
  font-weight: bold;
`;

const Description = styled(MD)`
  margin: 0;
  color: ${({ theme }) => theme.palette.grey[600]};
`;

const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
`;

const FooterText = styled(SM)`
  color: ${({ theme }) => theme.palette.grey[600]};
`;
export default CreateSceneario;
