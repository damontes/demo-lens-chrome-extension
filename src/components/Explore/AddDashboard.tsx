import { Accordion } from '@zendeskgarden/react-accordions';
import { Button } from '@zendeskgarden/react-buttons';
import styled from 'styled-components';
import { useStepWizardStore } from '../ui/StepWizard/StepWizardProvider';
import { getRandomId } from '@/lib/general';

type Props = {
  handleSubmit: (id: string, payload: any) => void;
};

const AddExploreDashboard = ({ handleSubmit }: Props) => {
  const prev = useStepWizardStore((state) => state.prev);
  const currentDashboard = useStepWizardStore((state) => state.values.currentDashboard);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const { id: dashboardId, name, sourceName, tabs, type } = currentDashboard;
    const id = getRandomId();
    const payload = {
      dashboardId,
      name,
      sourceName,
      type,
      tabs: tabs.map((tab: any) => ({
        id: tab.id,
        name: tab.name,
        queries: Object.entries(tab.queries).reduce((prev: any, current: any) => {
          const [queryId, query] = current;
          const { title, payload, visualizationType } = query;
          return {
            ...prev,
            [queryId]: {
              title,
              visualizationType,
              payload,
            },
          };
        }, {}),
      })),
    };
    handleSubmit(id, payload);
  };

  return (
    <Form onSubmit={onSubmit}>
      <Accordion level={4} defaultExpandedSections={[]}>
        {currentDashboard.tabs.map((tab: any, idx: number) => {
          const tabQueries = Object.values(tab.queries);
          const totalQueries = tabQueries.length;

          return (
            <Accordion.Section key={idx}>
              <Accordion.Header>
                <Accordion.Label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {tab.name} <Badge>{totalQueries}</Badge>
                </Accordion.Label>
              </Accordion.Header>
              <PanelContainer>
                {tabQueries.map((query: any, idx: number) => {
                  return (
                    <QueryItem key={idx}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: '18px', height: '18px', color: '#ccc' }}
                      >
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      {query.title}
                    </QueryItem>
                  );
                })}
              </PanelContainer>
            </Accordion.Section>
          );
        })}
      </Accordion>
      <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
        <Button size="medium" style={{ width: '100%' }} onClick={prev}>
          Back
        </Button>
        <Button type="submit" isPrimary size="medium" style={{ width: '100%' }}>
          Save
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

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.palette.green[600]};
  color: ${({ theme }) => theme.palette.white};
  padding: 2px 6px;
`;

const PanelContainer = styled(Accordion.Panel)`
  paddding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
`;

const QueryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${({ theme }) => theme.space.sm};
  border: 1px solid ${({ theme }) => theme.palette.green[200]};
  background-color: ${({ theme }) => theme.palette.green[100]};

  border-radius: ${({ theme }) => theme.borderRadii.md};
  color: ${({ theme }) => theme.palette.green[800]};
  margin: ${({ theme }) => theme.space.sm} 0;
`;

export default AddExploreDashboard;
