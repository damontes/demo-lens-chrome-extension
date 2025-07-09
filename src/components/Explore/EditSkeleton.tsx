import useAppState from '@/storage';
import { Tabs } from '@zendeskgarden/react-tabs';
import { useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { MD, SM } from '@zendeskgarden/react-typography';
import { Button } from '@zendeskgarden/react-buttons';
import { Alert, Notification, useToast } from '@zendeskgarden/react-notifications';
import { Drawer } from '@zendeskgarden/react-modals';
import AdjustIcon from '@zendeskgarden/svg-icons/src/16/adjust-stroke.svg?react';
import { useSearchParams } from 'react-router';
import SkeletonForm from './SkeletonForm';

type Props = {
  dashboardId: string;
  handleSubmit: (payload: any) => void;
};

const EditExploreSkeleton = ({ dashboardId, handleSubmit }: Props) => {
  const dashboards = useAppState((state: any) => state.dashboards);
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const theme = useTheme();

  const searchParamsValues = Object.fromEntries(searchParams.entries());
  const dashboard = dashboards[dashboardId];

  const {
    tabId: initialTabId = dashboard.tabs[0].id,
    queryId: initialQueryId = null,
    drillInIndex,
  } = searchParamsValues ?? {};

  const [selectedTabId, setSelectedTab] = useState(Number(initialTabId));
  const [selectedQueryId, setSelectedQueryId] = useState<any>(initialQueryId);
  const [selectedInteractionListIndex, setInteractionListIndex] = useState<any>(null);

  const selectedQuery = useMemo(() => {
    if (!selectedQueryId) {
      return null;
    }

    const currentTabIndex = dashboard.tabs.findIndex((tab: any) => tab.id === selectedTabId);
    const currentTab = dashboard.tabs[currentTabIndex];
    const query = currentTab.queries[selectedQueryId];

    if (selectedInteractionListIndex !== null && query.interactionList) {
      const innerQuery = query.interactionList[selectedInteractionListIndex];

      return { ...innerQuery, title: query.title };
    }

    return query;
  }, [selectedQueryId, selectedInteractionListIndex]);

  const handleClose = () => {
    if (selectedInteractionListIndex !== null) {
      setInteractionListIndex(null);
    } else {
      setSelectedQueryId(null);
    }
  };

  const onSubmit = async (newQuery: any) => {
    const currentTabIndex = dashboard.tabs.findIndex((tab: any) => tab.id === selectedTabId);
    const currentTab = structuredClone(dashboard.tabs[currentTabIndex]);

    if (selectedInteractionListIndex !== null) {
      const previousQuery = currentTab.queries[selectedQueryId].interactionList[selectedInteractionListIndex];
      currentTab.queries[selectedQueryId].interactionList[selectedInteractionListIndex] = {
        ...previousQuery,
        ...newQuery,
      };
    } else {
      const previousQuery = currentTab.queries[selectedQueryId];
      currentTab.queries[selectedQueryId] = { ...previousQuery, ...newQuery };
    }

    const newTabs = dashboard.tabs.map((tab: any, idx: number) => {
      if (idx === currentTabIndex) return currentTab;
      return tab;
    });

    const newDashboard = {
      ...dashboard,
      tabs: newTabs,
    };

    await handleSubmit(newDashboard);
    if (selectedInteractionListIndex !== null) {
      setInteractionListIndex(null);
    } else {
      setSelectedQueryId(null);
    }

    addToast(
      ({ close }) => (
        <Notification type="success" style={{ maxWidth: '80%' }}>
          <Notification.Title>Success</Notification.Title>
          Tab has been modified
          <Notification.Close aria-label="Close" onClick={close} />
        </Notification>
      ),
      { placement: 'top-end' },
    );
  };

  useEffect(() => {
    if (Boolean(selectedQuery) && drillInIndex !== undefined) {
      setTimeout(() => {
        const el = document.querySelector('#section-drill-in');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [selectedQuery, drillInIndex]);

  return (
    <Tabs selectedItem={selectedTabId} onChange={setSelectedTab}>
      <TabList>
        {dashboard.tabs.map((tab: any) => (
          <Tabs.Tab key={tab.id} item={tab.id}>
            {tab.name}
          </Tabs.Tab>
        ))}
      </TabList>
      {dashboard.tabs.map((tab: any) => {
        return (
          <TabPanel key={tab.id} item={tab.id}>
            {Object.entries(tab.queries).map(([queryId, query]: any) => (
              <ListItem key={queryId} onClick={() => setSelectedQueryId(queryId)}>
                <MD style={{ fontWeight: 'bold', textAlign: 'center', flex: 1 }}>{query.title}</MD>
              </ListItem>
            ))}
          </TabPanel>
        );
      })}
      <Drawer isOpen={Boolean(selectedQuery)} onClose={handleClose}>
        <Drawer.Header tag="h2">{selectedQuery?.title}</Drawer.Header>
        <DrawerBody>
          {selectedInteractionListIndex !== null ? (
            <SectionTitle>Drill in query {selectedInteractionListIndex + 1}</SectionTitle>
          ) : null}
          <SkeletonForm
            key={selectedInteractionListIndex !== null ? 'dirll-in-query-form' : 'query-form'}
            initialValues={selectedQuery}
            onSubmit={onSubmit}
          />
          {selectedInteractionListIndex === null && (
            <Section id="section-drill-in">
              <SectionHeader>
                <SectionTitle>Drill in queries</SectionTitle>
                <Description>Configure drill in queries</Description>
              </SectionHeader>
              {selectedQuery?.interactionList?.length ? (
                <ul
                  style={{
                    padding: '0 12px',
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    position: 'relative',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ConnectorLine />
                  {selectedQuery.interactionList.map((_: any, index: number) => {
                    return (
                      <ListItem
                        added={Number(drillInIndex) === index}
                        key={index}
                        onClick={() => setInteractionListIndex(index)}
                      >
                        <AdjustIcon style={{ transform: 'rotate(90deg)', color: theme.palette.blue[500] }} />
                        <MD>Drill in query #{index + 1}</MD>
                      </ListItem>
                    );
                  })}
                </ul>
              ) : (
                <Alert type="info">
                  <Alert.Title style={{ padding: '0px 20px' }}>Adding drill-in data</Alert.Title>
                  Drill-in data will be added automatically after you:
                  <ul>
                    <li>Activate a scenario</li>
                    <li>Add this skeleton to it</li>
                  </ul>
                  Then just click the current drill-in to insert the query.
                </Alert>
              )}
            </Section>
          )}
        </DrawerBody>
        <Drawer.Footer>
          <Drawer.FooterItem>
            <Button size="medium" style={{ width: '100%' }} onClick={handleClose}>
              Close
            </Button>
          </Drawer.FooterItem>
          <Drawer.FooterItem>
            <Button type="submit" form="edit-explore-skeleton-form" isPrimary size="medium" style={{ width: '100%' }}>
              Save
            </Button>
          </Drawer.FooterItem>
        </Drawer.Footer>
        <Drawer.Close />
      </Drawer>
    </Tabs>
  );
};

const TabList = styled(Tabs.TabList)`
  padding-right: 4px;
  overflow-x: scroll;
`;

const TabPanel = styled(Tabs.TabPanel)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const ListItem = styled.button<{ added?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: ${({ theme, added }) => (added ? theme.palette.green[200] : 'white')};
  animation: ${({ added }) => (added ? 'pulse 2s infinite' : 'none')};
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme, added }) => (added ? theme.palette.green[600] : theme.palette.grey[300])};
  transition: background-color 0.2s ease-in-out;
  cursor: pointer;
  width: 100%;
  position: relative;

  &:hover {
    background-color: ${({ theme }) => theme.palette.grey[100]};
  }
`;

const DrawerBody = styled(Drawer.Body)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: ${({ theme }) => theme.palette.grey[100]};
`;

const Section = styled.div`
  background-color: white;
  padding: 12px 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  padding: 0 8px;
`;

const SectionTitle = styled(MD)`
  margin: 0;
  font-weight: bold;
`;

const Description = styled(SM)`
  margin: 0;
  color: ${({ theme }) => theme.palette.grey[600]};
`;

const ConnectorLine = styled.div`
  width: 1px;
  height: 90%;
  position: absolute;

  background-color: ${({ theme }) => theme.palette.grey[300]};
`;

export default EditExploreSkeleton;
