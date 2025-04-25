import { useEffect, useState } from 'react';
import CreateConfiguration from './CreateConfiguration';
import { LG, MD, SM } from '@zendeskgarden/react-typography';
import { Button, IconButton } from '@zendeskgarden/react-buttons';
import { AddIcon, PauseIcon, PlayIcon, TrashIcon } from '../icons';
import styled from 'styled-components';
import useAppState from '../storage';
import { setAppState } from '../lib/chromeExtension';
import { getRandomId } from '../lib/general';
import Collapsable from './Collapsable';
import { saveActiveConfiguration } from '../actions';

const Configurations = () => {
  const [isCreateConfigurationOpen, setIsCreateConfigurationOpen] = useState(false);
  const configurations = useAppState((state: any) => state.configurations);
  const addConfiguration = useAppState((state: any) => state.addConfiguration);
  const removeConfiguration = useAppState((state: any) => state.removeConfiguration);
  const dashboards = useAppState((state: any) => state.dashboards);
  const activeConfiguration = useAppState((state: any) => state.activeConfiguration);
  const setActiveConfiguration = useAppState((state: any) => state.setActiveConfiguration);

  const onCreateConfiguration = async (newConfiguration: any) => {
    const id = getRandomId();

    addConfiguration(id, newConfiguration);
    setIsCreateConfigurationOpen(false);
  };

  const onDeleteconfiguration = (id: string) => {
    removeConfiguration(id);
  };

  const onActiveConfiguration = (id: string) => {
    const newValue = activeConfiguration === id ? '' : id;
    saveActiveConfiguration(newValue);
    setActiveConfiguration(newValue);
  };

  useEffect(() => {
    setAppState({
      configurations,
    });
  }, [configurations]);

  return (
    <>
      {!isCreateConfigurationOpen && !Object.keys(configurations).length ? (
        <>
          <LG style={{ fontWeight: 'bold', textAlign: 'center' }}>Welcome to Demo Lens</LG>
          <Description style={{ textAlign: 'center' }}>Create your firsDescription to start exploring</Description>
          <Button style={{ width: '100%', marginTop: '16px' }} onClick={() => setIsCreateConfigurationOpen(true)}>
            Create your first dashboard
          </Button>
        </>
      ) : (
        <>
          {!isCreateConfigurationOpen && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                }}
              >
                <Button size="small" style={{ marginLeft: 'auto' }} onClick={() => setIsCreateConfigurationOpen(true)}>
                  <AddIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Create configuration
                </Button>
              </div>
              <List>
                {Object.entries(configurations).map(([id, item]: any) => {
                  const isActive = activeConfiguration === id;

                  return (
                    <Collapsable
                      key={id}
                      headerContent={
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton
                            isBasic={false}
                            onClick={(e) => {
                              e.preventDefault();
                              onActiveConfiguration(id);
                            }}
                          >
                            {isActive ? (
                              <PauseIcon style={{ width: '16px', height: '16px' }} />
                            ) : (
                              <PlayIcon style={{ width: '16px', height: '16px' }} />
                            )}
                          </IconButton>
                          <div>
                            <LG style={{ fontWeight: '700' }}>{item.name}</LG>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <Tag>{item.dashboards.length} dashboards</Tag>
                              {isActive && <Tag isActive={isActive}>Active</Tag>}
                            </div>
                          </div>
                        </div>
                      }
                      isActive={isActive}
                    >
                      <div
                        style={{ padding: '8px 16px 12px 16px', display: 'flex', gap: '8px', flexDirection: 'column' }}
                      >
                        {item.dashboards.filter(Boolean).map((dashboardId: string) => {
                          const dashboard = dashboards[dashboardId];
                          return (
                            <ListItem key={dashboardId}>
                              <LG
                                tag="p"
                                style={{
                                  fontWeight: '700',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  margin: 0,
                                }}
                              >
                                {dashboard.name}
                              </LG>
                              <SM tag="span">{dashboard.sourceName}</SM>
                            </ListItem>
                          );
                        })}
                      </div>
                    </Collapsable>
                  );
                })}
              </List>
            </>
          )}
          {isCreateConfigurationOpen && (
            <CreateConfiguration
              onClose={() => setIsCreateConfigurationOpen(false)}
              handleSubmit={onCreateConfiguration}
            />
          )}
        </>
      )}
    </>
  );
};

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  padding: ${({ theme }) => theme.space.sm};
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: ${({ theme }) => theme.palette.grey[100]};
  border-radius: ${({ theme }) => theme.borderRadii.md};
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
`;

const Description = styled(MD)`
  margin: 0;
  color: ${({ theme }) => theme.palette.grey[600]};
`;

const Tag = styled.span<{ isActive?: boolean }>`
  display: inline-flex;
  align-items: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  border-radius: ${({ theme }) => theme.borderRadii.md};
  padding: 2px 6px;
  border: 1px solid ${({ theme, isActive }) => (isActive ? theme.palette.green[600] : theme.palette.grey[200])};
  background-color: ${({ theme, isActive }) => (isActive ? theme.palette.green[100] : theme.palette.grey[100])};
  color: ${({ theme, isActive }) => (isActive ? theme.palette.green[600] : theme.palette.black)};
`;

export default Configurations;
