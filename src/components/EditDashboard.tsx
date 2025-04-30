import useAppState from '@/storage';
import { Tabs } from '@zendeskgarden/react-tabs';
import { useState } from 'react';
import styled from 'styled-components';
import Collapsable from './Collapsable';
import { MD } from '@zendeskgarden/react-typography';
import { Field, Input } from '@zendeskgarden/react-forms';
import { Button } from '@zendeskgarden/react-buttons';
import { saveTabs } from '@/actions';
import { Notification, useToast } from '@zendeskgarden/react-notifications';

const EditDashboard = ({ dashboardId, onClose }: any) => {
  const dashboards = useAppState((state: any) => state.dashboards);
  const { addToast } = useToast();

  const dashboard = dashboards[dashboardId];
  const initialTabId = dashboard.tabs[0].id;

  const [selectedTabId, setSelectedTab] = useState(initialTabId);
  const saveTab = useAppState((state: any) => state.saveTab);

  const onChangeColumnValues = (currentTab: any, rawRows: any) => {
    Object.entries(currentTab.queries).forEach(([queryId, query]: any) => {
      const columns = query.payload.columns;
      columns.forEach((column: any, columnIdx: number) => {
        column.members.forEach((member: any, memberIdx: number) => {
          const columName = member.name;
          const attributeName = member.attributeName;

          const identifier = `col-${columName}#attributeName-${attributeName}#queryId-${queryId}`;
          const name = rawRows[identifier];
          if (name) {
            currentTab.queries[queryId].payload.columns[columnIdx].members[memberIdx].name = name;
            currentTab.queries[queryId].payload.columns[columnIdx].members[memberIdx].displayName = name;
          }
        });
      });
    });
  };

  const onChangeRowValues = (currentTab: any, rawRows: any) => {
    Object.entries(currentTab.queries).forEach(([queryId, query]: any) => {
      const rows = query.payload.rows;
      rows.forEach((row: any, rowIdx: number) => {
        row.members.forEach((member: any, memberIdx: number) => {
          const identifier = `row-${rowIdx}#member-${memberIdx}#queryId-${queryId}`;
          const name = rawRows[identifier];
          if (name) {
            currentTab.queries[queryId].payload.rows[rowIdx].members[memberIdx].name = name;
            currentTab.queries[queryId].payload.rows[rowIdx].members[memberIdx].displayName = name;
          }
        });
      });
    });
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());

    const currentTabIndex = dashboard.tabs.findIndex((tab: any) => tab.id === selectedTabId);
    const currentTab = structuredClone(dashboard.tabs[currentTabIndex]);

    const rawColumns = Object.entries(values)
      .filter(([key]) => key.startsWith('col'))
      .reduce((prev: any, [key, value]) => ({ ...prev, [key]: value }), {});

    const rawRows = Object.entries(values)
      .filter(([key]) => key.startsWith('row'))
      .reduce((prev: any, [key, value]) => ({ ...prev, [key]: value }), {});

    onChangeRowValues(currentTab, rawRows);
    onChangeColumnValues(currentTab, rawColumns);

    const newTabs = dashboard.tabs.map((tab: any, idx: number) => {
      if (idx === currentTabIndex) return currentTab;
      return tab;
    });

    saveTab(dashboardId, currentTabIndex, currentTab);
    await saveTabs(dashboards, dashboardId, newTabs);
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

  const renderFields = (queryId: string, payload: any) => {
    const { rows, columns } = payload;

    if (rows.length > 1) {
      return (
        <ul style={{ padding: '0 16px' }}>
          {rows.map((row: any, rowIdx: number) => (
            <li
              style={{ display: 'flex', gap: '8px', justifyContent: 'space-around', alignItems: 'center' }}
              key={rowIdx}
            >
              <MD style={{ fontWeight: 'bold', marginTop: '12px', minWidth: '15%' }}>Row {rowIdx + 1}</MD>
              <div
                style={{ display: 'grid', gap: '8px', alignItems: 'center', flex: 1, gridTemplateColumns: '1fr 1fr' }}
              >
                {row.members.map((member: any, memberIdx: number) => (
                  <Field key={memberIdx} style={{ flex: 1 }}>
                    <Field.Label>{member.levelDisplayName}</Field.Label>
                    <Input defaultValue={member.name} name={`row-${rowIdx}#member-${memberIdx}#queryId-${queryId}`} />
                  </Field>
                ))}
              </div>
            </li>
          ))}
        </ul>
      );
    }

    const columnsByGroupName = Object.groupBy(columns, (item: any) => item.members[0].name);
    return (
      <ul style={{ padding: '0 16px' }}>
        {Object.entries(columnsByGroupName).map(([groupByName, columns]: any, idx: number) => {
          const members = columns[0].members;
          return (
            <li style={{ display: 'flex', gap: '8px', justifyContent: 'space-around', alignItems: 'center' }} key={idx}>
              <MD style={{ fontWeight: 'bold', marginTop: '12px', minWidth: '15%' }}>Column {idx + 1}</MD>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                {members.map((member: any, idx: number) => (
                  <Field key={idx} style={{ flex: 1 }}>
                    <Field.Label>{member.levelDisplayName}</Field.Label>
                    <Input
                      defaultValue={groupByName}
                      name={`col-${groupByName}#attributeName-${member.attributeName}#queryId-${queryId}`}
                    />
                  </Field>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <Tabs selectedItem={selectedTabId} onChange={setSelectedTab} style={{ width: '100%', overflow: 'hidden' }}>
      <TabList>
        {dashboard.tabs.map((tab: any) => (
          <Tabs.Tab key={tab.id} item={tab.id}>
            {tab.name}
          </Tabs.Tab>
        ))}
      </TabList>
      <form key={selectedTabId} onSubmit={onSubmit}>
        {dashboard.tabs.map((tab: any) => {
          const filteredQueries = Object.entries(tab.queries).filter(([_, query]: any) => {
            if (query.visualizationType === 'kpiChart') return false;
            if (query.visualizationType === 'autoChart' && query.payload.rows.length < 1) return false;
            return true;
          });

          return (
            <TabPanel key={tab.id} item={tab.id}>
              {filteredQueries.map(([queryId, query]: any) => (
                <Collapsable
                  headerContent={
                    <div>
                      <MD style={{ fontWeight: 'bold' }}>{query.title}</MD>
                    </div>
                  }
                  key={queryId}
                >
                  {renderFields(queryId, query.payload)}
                </Collapsable>
              ))}
            </TabPanel>
          );
        })}
        <footer
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '16px',
            marginTop: '8px',
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            backgroundColor: 'white',
            padding: '16px',
          }}
        >
          <Button size="medium" style={{ width: '100%' }} onClick={onClose}>
            Close
          </Button>
          <Button type="submit" isPrimary size="medium" style={{ width: '100%' }}>
            Save tab
          </Button>
        </footer>
      </form>
    </Tabs>
  );
};

const TabList = styled(Tabs.TabList)`
  border-right: 1px solid ${({ theme }) => theme.palette.grey[200]};
  padding-right: 4px;
  position: sticky;
  top: 0;
  overflow-x: scroll;
`;

const TabPanel = styled(Tabs.TabPanel)`
  display: flex;
  flex-direction: column;
  max-height: 600px;
  overflow-y: scroll;
  gap: 12px;
  flex: 1;
  padding-bottom: 56px;
`;

export default EditDashboard;
