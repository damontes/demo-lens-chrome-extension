import { useEffect, useState } from 'react';
import { LG, MD, SM } from '@zendeskgarden/react-typography';
import { Button, IconButton } from '@zendeskgarden/react-buttons';
import styled from 'styled-components';
import useAppState from '@/storage';
import { saveActiveConfiguration, syncState } from '@/actions';
import Collapsable from '@/components/ui/Collapsable';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useNavigate } from 'react-router';
import PauseIcon from '@zendeskgarden/svg-icons/src/16/pause-stroke.svg?react';
import PlayIcon from '@zendeskgarden/svg-icons/src/16/play-stroke.svg?react';
import TrashIcon from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg?react';
import PlusIcon from '@zendeskgarden/svg-icons/src/16/plus-stroke.svg?react';
import PencilIcon from '@zendeskgarden/svg-icons/src/16/pencil-stroke.svg?react';

const Scenarios = () => {
  const [configurationToRemove, setConfigurationToRemove] = useState('');

  const configurations = useAppState((state) => state.configurations);
  const removeConfiguration = useAppState((state) => state.removeConfiguration);
  const dashboards = useAppState((state) => state.dashboards);
  const activeConfiguration = useAppState((state) => state.activeConfiguration);
  const setActiveConfiguration = useAppState((state) => state.setActiveConfiguration);

  const navigate = useNavigate();

  const onDeleteconfiguration = (id: string) => {
    setConfigurationToRemove(id);
  };

  const onConfirmDeleteConfiguration = () => {
    removeConfiguration(configurationToRemove);
    setConfigurationToRemove('');
    if (activeConfiguration === configurationToRemove) saveActiveConfiguration('');
  };

  const onActiveConfiguration = (id: string) => {
    const newValue = activeConfiguration === id ? '' : id;
    saveActiveConfiguration(newValue);
    setActiveConfiguration(newValue);
  };

  // useEffect(() => {
  //   syncState({
  //     configurations,
  //   });
  // }, [configurations]);

  return (
    <>
      {!Object.keys(configurations).length ? (
        <>
          <LG style={{ fontWeight: 'bold', textAlign: 'center' }}>Welcome to Demo Lens</LG>
          <Description style={{ textAlign: 'center' }}>Group multiple dashboards to create a use case.</Description>
          <Button style={{ width: '100%', marginTop: '16px' }} onClick={() => navigate('/scenarios/new')}>
            Create your first use case
          </Button>
        </>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <MD style={{ fontWeight: 'bold' }}>You can only have one use case active at a time</MD>
            <Button size="small" style={{ marginLeft: 'auto' }} onClick={() => navigate('/scenarios/new')}>
              <PlusIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Create scenario
            </Button>
          </div>
          <List>
            {Object.entries(configurations).map(([id, item]: any) => {
              const isActive = activeConfiguration === id;

              return (
                <Collapsable
                  key={id}
                  headerContent={
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                      }}
                    >
                      <IconButton
                        isBasic={false}
                        onClick={(e) => {
                          e.preventDefault();
                          onActiveConfiguration(id);
                        }}
                      >
                        {isActive ? <PauseIcon /> : <PlayIcon />}
                      </IconButton>
                      <div>
                        <LG style={{ fontWeight: '700' }}>{item.name}</LG>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <Tag>{item.dashboards.length} dashboards</Tag>
                          {isActive && <Tag isActive={isActive}>Active</Tag>}
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          marginLeft: 'auto',
                          marginRight: '16px',
                        }}
                      >
                        <IconButton size="small" onClick={() => navigate(`/scenarios/${id}`)}>
                          <PencilIcon />
                        </IconButton>
                        <IconButton size="small" isDanger onClick={() => onDeleteconfiguration(id)}>
                          <TrashIcon />
                        </IconButton>
                      </div>
                    </div>
                  }
                  isActive={isActive}
                >
                  <div style={{ padding: '8px 16px 12px 16px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    {item.dashboards.filter(Boolean).map((dashboardId: string) => {
                      const dashboard = dashboards[dashboardId];
                      if (!dashboard) return null;
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
          {Boolean(configurationToRemove) && (
            <ConfirmationModal
              title="Delete scenario"
              description={`Are you sure you want to delete this scenario </br> <b>"${configurations?.[configurationToRemove]?.name}"</b>?`}
              onClose={() => setConfigurationToRemove('')}
              handleSubmit={onConfirmDeleteConfiguration}
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

export default Scenarios;
