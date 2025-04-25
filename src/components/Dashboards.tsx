import { MD, LG, SM } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Button, IconButton } from '@zendeskgarden/react-buttons';
import { setAppState } from '../lib/chromeExtension';
import CreateDashboard from '../components/CreateDashboard';
import { AddIcon, TrashIcon } from '../icons';
import useAppState from '../storage';

const Dashboards = () => {
  const dashboards = useAppState((state: any) => state.dashboards);
  const addDashboard = useAppState((state: any) => state.addDashboard);
  const removeDashboard = useAppState((state: any) => state.removeDashboard);
  const currentDashboardId = useAppState((state: any) => state.currentDashboard?.id);

  const [isCreateDashboardOpen, setIsCreateDashboardOpen] = useState(false);

  const onCreateDashboard = async (currentDashboard: any) => {
    const { id, name, sourceName } = currentDashboard;

    const newDashboard = {
      name,
      sourceName,
    };

    addDashboard(id, newDashboard);
    setIsCreateDashboardOpen(false);
  };

  const onDeleteDashboard = (dashboardId: string) => {
    removeDashboard(dashboardId);
  };

  useEffect(() => {
    setAppState({
      dashboards,
    });
  }, [dashboards]);

  return (
    <>
      {!isCreateDashboardOpen && !Object.keys(dashboards).length ? (
        <>
          <LG style={{ fontWeight: 'bold', textAlign: 'center' }}>Welcome to Demo Lens</LG>
          <Description style={{ textAlign: 'center' }}>Create your firsDescription to start exploring</Description>
          <Button style={{ width: '100%', marginTop: '16px' }} onClick={() => setIsCreateDashboardOpen(true)}>
            Create your first dashboard
          </Button>
        </>
      ) : (
        <>
          {!isCreateDashboardOpen && (
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
                    <IconButton size="small" isDanger onClick={() => onDeleteDashboard(id)}>
                      <TrashIcon style={{ width: '16px', height: '16px' }} />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
          {isCreateDashboardOpen && (
            <CreateDashboard onClose={() => setIsCreateDashboardOpen(false)} handleSubmit={onCreateDashboard} />
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
