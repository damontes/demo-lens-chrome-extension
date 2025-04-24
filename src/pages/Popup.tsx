import { MD, LG, SM } from '@zendeskgarden/react-typography';
import { useColorScheme, DEFAULT_THEME, ThemeProvider, ColorSchemeProvider } from '@zendeskgarden/react-theming';
import styled from 'styled-components';
import { Field, Select } from '@zendeskgarden/react-forms';
import { useEffect, useState } from 'react';
import { Button, IconButton } from '@zendeskgarden/react-buttons';
import { getAppState, getCurrentTabDetails, setAppState } from '../lib/chromeExtension';
import CreateDashboard from '../components/CreateDashboard';
import CreateSceneario from '../components/CreateSceneario';
import { activeScenario } from '../actions';
import { AddIcon, PauseIcon, PlayIcon, TrashIcon } from '../icons';

const Popup = () => {
  const [dashboards, setDashboards] = useState({}) as any;
  const [selectedDashboardId, setSelectedDashboardId] = useState('');
  const [isCreateDashboardOpen, setIsCreateDashboardOpen] = useState(false);
  const [isAddScenearioOpen, setIsAddScenearioOpen] = useState(false);

  const currentDashboard = dashboards[selectedDashboardId];
  const scenarios = Object.entries(currentDashboard?.scenarios ?? {});

  const { colorScheme } = useColorScheme();

  const getInitialState = async () => {
    const state = await getAppState();
    const dashboadDetails = await getCurrentTabDetails();
    setSelectedDashboardId(dashboadDetails.id);
    setDashboards(state.dashboards);
  };

  const handleActiveScenario = (scenarioId: string) => {
    const newDashboards = { ...dashboards };
    const newDashboard = newDashboards[selectedDashboardId];

    if (newDashboard.activeScenario === scenarioId) {
      newDashboard.activeScenario = '';
    } else {
      newDashboard.activeScenario = scenarioId;
    }

    setDashboards(newDashboards);
    activeScenario(newDashboards);
  };

  const onCreateDashboard = async (currentDashboard: any) => {
    console.log('ON CREATE DASHBOARD', currentDashboard);
    const { id, ...dashboard } = currentDashboard;
    const prevState = await getAppState();

    const newDashboards = {
      ...prevState.dashboards,
      [id]: dashboard,
    };

    setSelectedDashboardId(id);
    setDashboards(newDashboards);
    setIsCreateDashboardOpen(false);
    setAppState({
      dashboards: newDashboards,
    });
  };

  const onCreateScenario = async (sceneario: any) => {
    const prevState = await getAppState();
    const { dashboards } = prevState;

    const newDashboards = {
      ...dashboards,
      [selectedDashboardId]: {
        ...currentDashboard,
        scenarios: {
          ...(currentDashboard.scenarios ?? {}),
          ...sceneario,
        },
      },
    };

    setDashboards(newDashboards);
    setIsAddScenearioOpen(false);
    setAppState({
      dashboards: newDashboards,
    });
  };

  const onDeleteDashboard = async () => {
    const newDashboards = { ...dashboards };
    delete newDashboards[selectedDashboardId];
    const lastDashboardId = Object.keys(newDashboards).at(-1) ?? '';

    setDashboards(newDashboards);
    setSelectedDashboardId(lastDashboardId);
    setAppState({
      dashboards: newDashboards,
    });
  };

  const onDeleteScenario = async (id: string) => {
    const newDashboards = { ...dashboards };
    const { scenarios } = newDashboards[selectedDashboardId];
    const newScenarios = { ...scenarios };
    delete newScenarios[id];

    newDashboards[selectedDashboardId] = {
      ...newDashboards[selectedDashboardId],
      scenarios: newScenarios,
    };

    setDashboards(newDashboards);
    setAppState({
      dashboards: newDashboards,
    });
  };

  useEffect(() => {
    getInitialState();
  }, []);

  return (
    <ThemeProvider
      theme={{ ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, base: colorScheme, primaryHue: 'green' } }}
    >
      <Container>
        <Header>
          <Image src="/icon_zendesk.png" alt="Zendesk logo" />
          <Title style={{ fontWeight: '900', color: '#eee' }}>Demo Lens</Title>
          {Object.keys(dashboards).length && !isCreateDashboardOpen && (
            <Button size="small" style={{ marginLeft: 'auto' }} onClick={() => setIsCreateDashboardOpen(true)}>
              <AddIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Create Dashboard
            </Button>
          )}
        </Header>
        {!isCreateDashboardOpen && !Object.keys(dashboards).length ? (
          <Content style={{ alignItems: 'center', padding: '24px 36px' }}>
            <LG style={{ fontWeight: 'bold' }}>Welcome to Demo Lens</LG>
            <Description>Create your first dashboard to start exploring</Description>
            <Button style={{ width: '100%', marginTop: '16px' }} onClick={() => setIsCreateDashboardOpen(true)}>
              Create your first dashboard
            </Button>
          </Content>
        ) : (
          <>
            {!(isCreateDashboardOpen || isAddScenearioOpen) && (
              <>
                <Content>
                  <Field>
                    <Field.Label>Select dashboard</Field.Label>
                    <Select onChange={(e) => setSelectedDashboardId(e.target.value)} value={selectedDashboardId}>
                      {Object.entries(dashboards).map(([id, item]: any) => (
                        <option key={id} value={id}>
                          {item?.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Content
                    style={{ border: '1px solid #eee', borderRadius: '8px', padding: '12px', marginTop: '16px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LG style={{ fontWeight: 'bold', marginRight: 'auto' }}>{currentDashboard?.name}</LG>
                      <IconButton size="small" isDanger onClick={onDeleteDashboard}>
                        <TrashIcon style={{ width: '16', height: '16' }} />
                      </IconButton>
                    </div>
                    <List>
                      {scenarios.length ? (
                        scenarios.map(([id, item]: any) => (
                          <ListItem key={id} isActive={currentDashboard.activeScenario === id}>
                            <div style={{ maxWidth: '80%', marginBottom: '8px' }}>
                              <MD style={{ fontWeight: '700' }}>{item.name}</MD>
                              <SM tag="p">{item.description}</SM>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <Button size="small" onClick={() => handleActiveScenario(id)}>
                                {currentDashboard.activeScenario === id ? (
                                  <>
                                    <PauseIcon style={{ width: '16px ', height: '16px', marginRight: '8px' }} />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <PlayIcon style={{ width: '16px ', height: '16px', marginRight: '8px' }} />
                                    Test
                                  </>
                                )}
                              </Button>
                              <IconButton
                                size="small"
                                isDanger
                                isBasic={false}
                                isPill={false}
                                onClick={() => onDeleteScenario(id)}
                              >
                                <TrashIcon style={{ width: '16px', height: '16px' }} />
                              </IconButton>
                            </div>
                          </ListItem>
                        ))
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            padding: '16px',
                            alignItems: 'center',
                          }}
                        >
                          <EmptyResults>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <AddIcon style={{ width: '24px', height: '24px' }} />
                            </span>
                            <LG tag="h2">No scenarios yet</LG>
                            <MD tag="p">Create your first scenario to modify dashboard data</MD>

                            <Button
                              isPrimary
                              size="medium"
                              style={{ width: '100%', marginTop: '24px' }}
                              onClick={() => setIsAddScenearioOpen(true)}
                            >
                              Add your first sceneario
                            </Button>
                          </EmptyResults>
                        </div>
                      )}
                    </List>
                    {scenarios.length ? (
                      <Button
                        isPrimary
                        size="medium"
                        style={{ width: '100%', marginTop: '24px' }}
                        onClick={() => setIsAddScenearioOpen(true)}
                      >
                        Add scenario
                      </Button>
                    ) : null}
                  </Content>
                </Content>
              </>
            )}
            {isAddScenearioOpen && (
              <CreateSceneario
                onClose={() => setIsAddScenearioOpen(false)}
                handleSubmit={onCreateScenario}
                currentDashboard={currentDashboard}
              />
            )}
            {isCreateDashboardOpen && (
              <CreateDashboard onClose={() => setIsCreateDashboardOpen(false)} handleSubmit={onCreateDashboard} />
            )}
          </>
        )}
      </Container>
    </ThemeProvider>
  );
};

const withColorSchemeProvider = (Component: any) => {
  return () => {
    return (
      <ColorSchemeProvider initialColorScheme="light">
        <Component />
      </ColorSchemeProvider>
    );
  };
};

export default withColorSchemeProvider(Popup);

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.space.sm};
  border: 1px solid ${({ theme, isActive }) => (isActive ? theme.palette.green[600] : theme.palette.grey[200])};
  border-radius: ${({ theme }) => theme.borderRadii.md};

  h2 {
    margin: 0;
    margin-bottom: 2px;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.palette.grey[600]};
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap-y: 16px;
  padding: ${({ theme }) => theme.space.md};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: ${({ theme }) => theme.palette.black};

  padding: ${({ theme }) => theme.space.md};
`;

const Image = styled.img`
  width: 24px;
  height: 24px;
  aspect-ratio: 1;
  border-radius: 2px;
  overflow: hidden;
`;

const Container = styled.div`
  margin-bottom: 12px;
`;

const Title = styled(MD)`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const EmptyResults = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 16px;

  span {
    background-color: ${({ theme }) => theme.palette.blue[100]};
    border-radius: 50%;
    padding: ${({ theme }) => theme.space.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.palette.blue[600]};

    & > svg {
      fill: currentColor;
    }
  }

  h2 {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    margin: 0;
    margin-top: ${({ theme }) => theme.space.md};
  }

  p {
    color: ${({ theme }) => theme.palette.grey[600]};
    margin: 0;
  }
`;

const Description = styled(MD)`
  margin: 0;
  color: ${({ theme }) => theme.palette.grey[600]};
`;
