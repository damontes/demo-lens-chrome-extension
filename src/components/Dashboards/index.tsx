import { MD, LG, SM } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Button, IconButton } from '@zendeskgarden/react-buttons';
import { useToast, Notification } from '@zendeskgarden/react-notifications';
import { reloadDashboard, syncState } from '@/actions';
import useAppState from '@/storage';
import { AddIcon, EditIcon, TrashIcon } from '@/icons';
import ConfirmationModal from '../ui/ConfirmationModal';
import EditDashboard from './EditDashboard';
import Categories from '../Categories';
import { Accordion } from '@zendeskgarden/react-accordions';
import AdminInterceptor from '@/models/adminInterceptor';
import { Tag } from '@zendeskgarden/react-tags';
import ExploreInterceptor from '@/models/exploreInterceptor';
import TextEditable from '../ui/TextEditable';

const Dashboards = () => {
  const [editDashboardId, setEditDashboardId] = useState('');

  const dashboards = useAppState((state: any) => state.dashboards);
  const configurations = useAppState((state: any) => state.configurations);

  const saveDashboard = useAppState((state: any) => state.saveDashboard);
  const removeDashboard = useAppState((state: any) => state.removeDashboard);
  const currentDashboardId = useAppState((state: any) => state.currentDashboard?.id);
  const [dashboardToRemove, setDashboardToRemove] = useState('');

  const [isCreateDashboardOpen, setIsCreateDashboardOpen] = useState(false);

  const { addToast } = useToast();

  const dashboardEntries = Object.entries(dashboards);
  const dashbordsByType = Object.groupBy(
    dashboardEntries,
    ([_, dashboard]: any) => dashboard.type ?? ExploreInterceptor.getDashboardType(),
  );

  const onEditDashboard = async (newDashboard: any) => {
    saveDashboard(editDashboardId, newDashboard);
    setEditDashboardId('');
    await reloadDashboard();
  };

  const onEditDashboardName = (dashboardId: string, newDashboard: any) => {
    saveDashboard(dashboardId, newDashboard);
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
          <Notification type="warning">
            <Notification.Title>Warning</Notification.Title>

            <p style={{ maxWidth: '356px', margin: 0 }}>
              This dashboard is part of the following configurations: <br /> <b>{activeConfigurations.join(', ')}</b>.
              <br />
              Please delete it from this configurations first..
            </p>
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
              <Accordion level={4}>
                {Object.entries(dashbordsByType).map(([type, dashboards]: any) => {
                  return (
                    <Accordion.Section>
                      <Accordion.Header>
                        <Accordion.Label>{type}</Accordion.Label>
                      </Accordion.Header>
                      <Accordion.Panel>
                        <List>
                          {dashboards.map(([id, item]: any) => (
                            <ListItem key={id} isActive={currentDashboardId === id}>
                              <div style={{ maxWidth: '80%', marginBottom: '8px', width: '100%' }}>
                                <TextEditable
                                  value={item.name}
                                  style={{ fontWeight: '700', fontSize: '18px' }}
                                  onChange={(name) => onEditDashboardName(id, { ...item, name })}
                                />
                                <MD>{item.sourceName}</MD>
                                <footer style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                  <SM
                                    tag="p"
                                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                  >
                                    {id}
                                  </SM>
                                  {type === AdminInterceptor.getDashboardType() ? (
                                    <Tag hue="yellow" isPill size="small">
                                      Instance: {item.dashboardId.split(':').at(0)}
                                    </Tag>
                                  ) : null}
                                </footer>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}>
                                <IconButton size="small" onClick={() => setEditDashboardId(id)}>
                                  <EditIcon />
                                </IconButton>

                                <IconButton size="small" isDanger onClick={() => onDeleteDashboard(id)}>
                                  <TrashIcon />
                                </IconButton>
                              </div>
                            </ListItem>
                          ))}
                        </List>
                      </Accordion.Panel>
                    </Accordion.Section>
                  );
                })}
              </Accordion>
            </>
          )}
          {isCreateDashboardOpen && <Categories onClose={() => setIsCreateDashboardOpen(false)} />}
          {Boolean(editDashboardId) && (
            <EditDashboard
              dashboardId={editDashboardId}
              onClose={() => setEditDashboardId('')}
              handleSubmit={onEditDashboard}
            />
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
