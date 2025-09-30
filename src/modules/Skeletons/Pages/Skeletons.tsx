import { MD, LG, SM } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import { useState } from 'react';
import { Button, IconButton } from '@zendeskgarden/react-buttons';
import { useToast, Notification } from '@zendeskgarden/react-notifications';
import useAppState from '@/storage';
import { Accordion } from '@zendeskgarden/react-accordions';
import ExploreInterceptor from '@/models/explore/interceptor';
import { useNavigate } from 'react-router';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import TextEditable from '@/components/ui/TextEditable';
import TrashIcon from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg?react';
import PlusIcon from '@zendeskgarden/svg-icons/src/16/plus-stroke.svg?react';
import PencilIcon from '@zendeskgarden/svg-icons/src/16/pencil-stroke.svg?react';

const Skeletons = () => {
  const dashboards = useAppState((state: any) => state.dashboards);
  const configurations = useAppState((state: any) => state.configurations);

  const saveDashboard = useAppState((state: any) => state.saveDashboard);
  const removeDashboard = useAppState((state: any) => state.removeDashboard);
  const currentDashboardId = useAppState((state: any) => state.currentDashboard?.id);
  const [dashboardToRemove, setDashboardToRemove] = useState('');

  const navigate = useNavigate();

  const { addToast } = useToast();

  const dashboardEntries = Object.entries(dashboards);
  const dashbordsByType = Object.groupBy(
    dashboardEntries,
    ([_, dashboard]: any) => dashboard.type ?? ExploreInterceptor.getDashboardType(),
  );

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

  return (
    <>
      {!Object.keys(dashboards).length ? (
        <>
          <LG style={{ fontWeight: 'bold', textAlign: 'center' }}>Welcome to Demo Lens</LG>
          <Description style={{ textAlign: 'center' }}>
            Create your first skeleton, then add it to a scenario.
          </Description>
          <Button style={{ width: '100%', marginTop: '16px' }} onClick={() => navigate('/skeletons/categories')}>
            Create your first skeleton
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
            <Button size="small" style={{ marginLeft: 'auto' }} onClick={() => navigate('/skeletons/categories')}>
              <PlusIcon style={{ marginRight: '8px' }} />
              Create skeleton
            </Button>
          </div>
          <Accordion level={4}>
            {Object.entries(dashbordsByType).map(([type, dashboards]: any) => {
              return (
                <Accordion.Section key={type}>
                  <ItemHeader>
                    <Accordion.Label>{type}</Accordion.Label>
                  </ItemHeader>
                  <Accordion.Panel>
                    <List>
                      {dashboards.map(([id, item]: any) => (
                        <ListItem key={id} $isActive={currentDashboardId === id}>
                          <div style={{ maxWidth: '80%', marginBottom: '8px', width: '100%' }}>
                            <TextEditable
                              value={item.name}
                              style={{ fontWeight: '700', fontSize: '1rem' }}
                              onChange={(name) => onEditDashboardName(id, { ...item, name })}
                            />
                            <SM>{item.sourceName}</SM>
                            <footer style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <SM
                                tag="p"
                                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                {id}
                              </SM>
                              {/* {type === AdminInterceptor.getDashboardType() ? (
                                <Tag hue="yellow" isPill size="small">
                                  Instance: {item.dashboardId.split(':').at(0)}
                                </Tag>
                              ) : null} */}
                            </footer>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}>
                            <IconButton size="small" onClick={() => navigate(`/skeletons/${id}`)}>
                              <PencilIcon />
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
          {Boolean(dashboardToRemove) && (
            <ConfirmationModal
              title="Delete skeleton"
              description={`Are you sure you want to delete this skeleton </br> <b>"${dashboards?.[dashboardToRemove]?.name}"</b>?`}
              onClose={() => setDashboardToRemove('')}
              handleSubmit={onConfirmDeleteConfiguration}
            />
          )}
        </>
      )}
    </>
  );
};

export default Skeletons;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li<{ $isActive: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: ${({ theme }) => theme.space.sm};
  border: 1px solid ${({ theme, $isActive }) => ($isActive ? theme.palette.green[600] : theme.palette.grey[200])};
  border-radius: ${({ theme }) => theme.borderRadii.md};
  background-color: white;

  h2 {
    margin: 0;
    margin-bottom: 2px;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.palette.grey[600]};
  }
`;

const ItemHeader = styled(Accordion.Header)`
  button {
    font-size: 1rem;
    text-transform: capitalize;
  }

  svg {
    padding: 0;
  }
`;

const Description = styled(MD)`
  margin: 0;
  color: ${({ theme }) => theme.palette.grey[600]};
`;
