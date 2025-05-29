import useAppState from '@/storage';
import { Tabs } from '@zendeskgarden/react-tabs';
import { useState } from 'react';
import styled from 'styled-components';
import Collapsable from '../ui/Collapsable';
import { MD } from '@zendeskgarden/react-typography';
import { Field, Input, Toggle } from '@zendeskgarden/react-forms';
import { Button } from '@zendeskgarden/react-buttons';
import { Alert, Notification, useToast } from '@zendeskgarden/react-notifications';

type Props = {
  dashboardId: string;
  onClose: () => void;
  handleSubmit: (payload: any) => void;
};

const EditExploreDashboard = ({ dashboardId, onClose, handleSubmit }: Props) => {
  const dashboards = useAppState((state: any) => state.dashboards);
  const { addToast } = useToast();

  const dashboard = dashboards[dashboardId];
  const initialTabId = dashboard.tabs[0].id;

  const [selectedTabId, setSelectedTab] = useState(initialTabId);
  const [isLive, setIsLive] = useState(dashboard.isLive ?? false);

  const parseCellDisplayName = (cellDataDisplayName: string) => {
    return cellDataDisplayName.split(',').slice(0, -1).join(',');
  };

  const onChangeColumnValues = (currentTab: any, rawColumns: any) => {
    Object.entries(currentTab.queries).forEach(([queryId, query]: any) => {
      const columns = query.payload.columns;
      columns.forEach((column: any, columnIdx: number) => {
        const columName = parseCellDisplayName(column.cellDataDisplayName);
        column.members.forEach((_member: any, memberIdx: number) => {
          // const attributeName = member.attributeName;

          const identifier = `col-${columName}#member-${memberIdx}#queryId-${queryId}`;
          const name = rawColumns[identifier];
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
        row.members.forEach((_: any, memberIdx: number) => {
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

  const onChangeCellDataValues = (currentTab: any, rawCellData: any) => {
    Object.entries(currentTab.queries).forEach(([queryId, query]: any) => {
      const cellData = query.payload.cellData;
      cellData.forEach((row: any, rowIdx: number) => {
        row.forEach((_: any, columnIdx: number) => {
          const identifier = `cellData-${rowIdx}-${columnIdx}#queryId-${queryId}`;
          const value = rawCellData[identifier];
          if (value) {
            currentTab.queries[queryId].payload.cellData[rowIdx][columnIdx].value = Number(value);
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

    const rawCellData = Object.entries(values)
      .filter(([key]) => key.startsWith('cellData'))
      .reduce((prev: any, [key, value]) => ({ ...prev, [key]: value }), {});

    onChangeRowValues(currentTab, rawRows);
    onChangeColumnValues(currentTab, rawColumns);
    onChangeCellDataValues(currentTab, rawCellData);

    const newTabs = dashboard.tabs.map((tab: any, idx: number) => {
      if (idx === currentTabIndex) return currentTab;
      return tab;
    });

    const newDashboard = {
      ...dashboard,
      isLive,
      tabs: newTabs,
    };

    await handleSubmit(newDashboard);
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
    const { rows, columns, cellData } = payload;
    const columnsByCellDisplayName = Object.groupBy(columns, (item: any) =>
      parseCellDisplayName(item.cellDataDisplayName),
    );

    return (
      <>
        {rows.length > 1 && (
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
        )}
        {Object.entries(columnsByCellDisplayName).length > 1 && (
          <ul style={{ padding: '0 16px' }}>
            {Object.entries(columnsByCellDisplayName).map(([cellDisplayName, columns]: any, idx: number) => {
              const members = columns[0].members;
              return (
                <li
                  style={{ display: 'flex', gap: '8px', justifyContent: 'space-around', alignItems: 'center' }}
                  key={idx}
                >
                  <MD style={{ fontWeight: 'bold', marginTop: '12px', minWidth: '15%' }}>Column {idx + 1}</MD>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                    {members.map((member: any, idx: number) => (
                      <Field key={idx} style={{ flex: 1 }}>
                        <Field.Label>{member.levelDisplayName}</Field.Label>
                        <Input
                          defaultValue={member.name}
                          name={`col-${cellDisplayName}#member-${idx}#queryId-${queryId}`}
                        />
                      </Field>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <ul style={{ listStyleType: 'none', padding: '0 16px' }}>
          {cellData.map((row: any, rowIdx: number) => {
            return (
              <li key={rowIdx}>
                <MD style={{ fontWeight: 'bold', marginTop: '12px', minWidth: '15%' }}>
                  {rows[rowIdx].members[0].name}
                </MD>
                <ul style={{ listStyleType: 'none' }}>
                  {row.map((item: any, columnIdx: number) => {
                    return (
                      <li key={`${rowIdx}-${columnIdx}`}>
                        <Field style={{ flex: 1 }}>
                          <Field.Label>{columns[columnIdx].cellDataDisplayName}</Field.Label>
                          <Input
                            defaultValue={item.value}
                            type="number"
                            name={`cellData-${rowIdx}-${columnIdx}#queryId-${queryId}`}
                          />
                        </Field>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </>
    );
  };

  return (
    <section>
      <Alert type="info">
        <Alert.Title style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
          Live dashboard
          <Field>
            <Toggle onChange={() => setIsLive((prev: boolean) => !prev)} checked={isLive}>
              <Field.Label hidden>Accessibly hidden label</Field.Label>
            </Toggle>
          </Field>
        </Alert.Title>
        <p style={{ maxWidth: '80%', margin: 0 }}>
          If you enabled this option, the <b>values will be generated on the fly</b>.
        </p>
      </Alert>
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
            return (
              <TabPanel key={tab.id} item={tab.id}>
                {Object.entries(tab.queries).map(([queryId, query]: any) => (
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
              Save
            </Button>
          </footer>
        </form>
      </Tabs>
    </section>
  );
};

const TabList = styled(Tabs.TabList)`
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

export default EditExploreDashboard;
