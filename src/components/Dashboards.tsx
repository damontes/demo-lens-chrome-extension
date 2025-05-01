import { MD, LG, SM } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Button, IconButton } from '@zendeskgarden/react-buttons';
import CreateDashboard from '../components/CreateDashboard';
import { AddIcon, EditIcon, TrashIcon } from '../icons';
import useAppState from '../storage';
import EditDashboard from './EditDashboard';
import ConfirmationModal from './ConfirmationModal';
import { useToast, Notification } from '@zendeskgarden/react-notifications';
import { syncState } from '@/actions';

const Dashboards = () => {
  const [editDashboardId, setEditDashboardId] = useState('');

  const dashboards = useAppState((state: any) => state.dashboards);
  const configurations = useAppState((state: any) => state.configurations);

  const addDashboard = useAppState((state: any) => state.addDashboard);
  const removeDashboard = useAppState((state: any) => state.removeDashboard);
  const currentDashboardId = useAppState((state: any) => state.currentDashboard?.id);
  const [dashboardToRemove, setDashboardToRemove] = useState('');

  const [isCreateDashboardOpen, setIsCreateDashboardOpen] = useState(false);

  const { addToast } = useToast();

  const onCreateDashboard = async (currentDashboard: any) => {
    const { id, name, sourceName, tabs } = currentDashboard;
    const newDashboard = {
      name,
      sourceName,
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

    addDashboard(id, newDashboard);
    setIsCreateDashboardOpen(false);
  };

  const onDeleteDashboard = (dashboardId: string) => {
    setDashboardToRemove(dashboardId);
  };

  const onConfirmDeleteConfiguration = () => {
    const activeConfigurations = Object.entries(configurations)
      .filter(([_, configuration]: any) => configuration.dashboards.includes(dashboardToRemove))
      .map(([_, configuration]: any) => configuration.name);

    if (activeConfigurations.length > 0) {
      addToast(
        ({ close }) => (
          <Notification type="warning" style={{ maxWidth: '80%' }}>
            <Notification.Title>Warning</Notification.Title>
            <div
              dangerouslySetInnerHTML={{
                __html: `This dashboard is part of this configurations </br> <b>"${activeConfigurations.join(
                  ', ',
                )}"</b>. </br> Please delete it from this configurations first.`,
              }}
            />
            <Notification.Close aria-label="Close" onClick={close} />
          </Notification>
        ),
        { placement: 'top-end' },
      );
      setDashboardToRemove('');
      return;
    }
    removeDashboard(dashboardToRemove);
    setDashboardToRemove('');
  };

  const onEditDashboard = (dashboardId: string) => {
    setEditDashboardId(dashboardId);
  };

  useEffect(() => {
    syncState({
      dashboards,
      currentDashboard: null,
    });
  }, [dashboards]);

  return (
    <>
      {!isCreateDashboardOpen && !Object.keys(dashboards).length ? (
        <>
          <LG style={{ fontWeight: 'bold', textAlign: 'center' }}>Welcome to Demo Lens</LG>
          <Description style={{ textAlign: 'center' }}>
            Create your first dashboard, then add it to a configuration.
          </Description>
          <Button style={{ width: '100%', marginTop: '16px' }} onClick={() => setIsCreateDashboardOpen(true)}>
            Create your first dashboard
          </Button>
        </>
      ) : (
        <>
          {!isCreateDashboardOpen && !Boolean(editDashboardId) && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                }}
              >
                <Button size="small" style={{ marginLeft: 'auto' }} onClick={() => setIsCreateDashboardOpen(true)}>
                  <AddIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Create Dashboard
                </Button>
              </div>
              <List>
                {Object.entries(dashboards).map(([id, item]: any) => (
                  <ListItem key={id} isActive={currentDashboardId === id}>
                    <div style={{ maxWidth: '80%', marginBottom: '8px' }}>
                      <LG style={{ fontWeight: '700' }}>{item.name}</LG>
                      <MD>{item.sourceName}</MD>
                      <SM tag="p" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {id}
                      </SM>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}>
                      <IconButton size="small" onClick={() => onEditDashboard(id)}>
                        <EditIcon />
                      </IconButton>

                      <IconButton size="small" isDanger onClick={() => onDeleteDashboard(id)}>
                        <TrashIcon />
                      </IconButton>
                    </div>
                  </ListItem>
                ))}
              </List>
            </>
          )}
          {isCreateDashboardOpen && (
            <CreateDashboard onClose={() => setIsCreateDashboardOpen(false)} handleSubmit={onCreateDashboard} />
          )}
          {Boolean(editDashboardId) && (
            <EditDashboard dashboardId={editDashboardId} onClose={() => setEditDashboardId('')} />
          )}
          {Boolean(dashboardToRemove) && (
            <ConfirmationModal
              title="Delete configuration"
              description={`Are you sure you want to delete this dashboard </br> <b>"${dashboards?.[dashboardToRemove]?.name}"</b>?`}
              onClose={() => setDashboardToRemove('')}
              handleSubmit={onConfirmDeleteConfiguration}
            />
          )}
        </>
      )}
    </>
  );
};

export default Dashboards;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li<{ isActive: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
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

const Description = styled(MD)`
  margin: 0;
  color: ${({ theme }) => theme.palette.grey[600]};
`;
