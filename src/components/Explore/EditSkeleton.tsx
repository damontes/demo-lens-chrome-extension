import useAppState from '@/storage';
import { Tabs } from '@zendeskgarden/react-tabs';
import { useState } from 'react';
import styled from 'styled-components';
import { MD, SM } from '@zendeskgarden/react-typography';
import { Field, Input, InputGroup } from '@zendeskgarden/react-forms';
import { Button } from '@zendeskgarden/react-buttons';
import { Notification, useToast } from '@zendeskgarden/react-notifications';
import { Drawer } from '@zendeskgarden/react-modals';
import { Combobox, Option, Field as FieldCombox } from '@zendeskgarden/react-dropdowns';
import Collapsable from '../ui/Collapsable';
import { FlatLineIcon, LineDecreaseIcon, LineIncreaseIcon, PulseGraphIcon, RandomIcon } from '@/icons';

const PRESET_OPTIONS = {
  random: {
    name: 'Random',
    icon: RandomIcon,
  },
  spike: {
    name: 'Spike',
    icon: PulseGraphIcon,
  },
  peak_mid: {
    name: 'Peak Middle',
    icon: PulseGraphIcon,
  },
  valley_mid: {
    name: 'Valley Middle',
    icon: PulseGraphIcon,
  },
  increase: {
    name: 'Linear increase',
    icon: LineIncreaseIcon,
  },
  decrease: {
    name: 'Linear decrease',
    icon: LineDecreaseIcon,
  },
  flat: {
    name: 'Flat',
    icon: FlatLineIcon,
  },
};

type Props = {
  dashboardId: string;
  handleSubmit: (payload: any) => void;
};

const EditExploreSkeleton = ({ dashboardId, handleSubmit }: Props) => {
  const dashboards = useAppState((state: any) => state.dashboards);
  const { addToast } = useToast();

  const dashboard = dashboards[dashboardId];
  const initialTabId = dashboard.tabs[0].id;

  const [selectedTabId, setSelectedTab] = useState(initialTabId);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);

  const parseCellDisplayName = (cellDataDisplayName: string) => {
    return cellDataDisplayName.split(',').slice(0, -1).join(',');
  };

  const handleSelectedQuery = (queryId: string) => {
    const currentTabIndex = dashboard.tabs.findIndex((tab: any) => tab.id === selectedTabId);
    const currentTab = dashboard.tabs[currentTabIndex];
    const query = currentTab.queries[queryId];
    setSelectedQuery([queryId, query]);
  };

  const onChangeColumnValues = (currentTab: any, rawColumns: any) => {
    Object.entries(currentTab.queries).forEach(([queryId, query]: any) => {
      const columns = query.payload.columns;
      columns.forEach((column: any, columnIdx: number) => {
        const columName = parseCellDisplayName(column.cellDataDisplayName);
        column.members.forEach((_member: any, memberIdx: number) => {
          const identifier = `col-${columName}#member-${memberIdx}#queryId-${queryId}#tabId-${currentTab.id}`;
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
          const identifier = `row-${rowIdx}#member-${memberIdx}#queryId-${queryId}#tabId-${currentTab.id}`;
          const name = rawRows[identifier];
          if (name) {
            currentTab.queries[queryId].payload.rows[rowIdx].members[memberIdx].name = name;
            currentTab.queries[queryId].payload.rows[rowIdx].members[memberIdx].displayName = name;
          }
        });
      });
    });
  };

  const onChangeConfig = (currentTab: any, rawConfig: any) => {
    Object.entries(rawConfig).forEach(([key, value]) => {
      const [configKey, queryId, tabId] = key.split('#');

      if (configKey.startsWith('config-preset')) {
        currentTab.queries[queryId].config.preset = value;
      } else if (configKey.startsWith('config-range')) {
        const index = configKey.split('_').at(-1);
        if (index !== undefined) currentTab.queries[queryId].config.range[index] = Number(value);
      }
    }, {});
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

    const config = Object.entries(values)
      .filter(([key]) => key.startsWith('config-'))
      .reduce((prev: any, [key, value]) => ({ ...prev, [key]: value }), {});

    onChangeRowValues(currentTab, rawRows);
    onChangeColumnValues(currentTab, rawColumns);
    onChangeConfig(currentTab, config);

    const newTabs = dashboard.tabs.map((tab: any, idx: number) => {
      if (idx === currentTabIndex) return currentTab;
      return tab;
    });

    const newDashboard = {
      ...dashboard,
      tabs: newTabs,
    };

    await handleSubmit(newDashboard);
    setSelectedQuery(null);

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

  const renderFields = (tabId: string) => {
    if (!selectedQuery) {
      return <MD style={{ padding: '16px', textAlign: 'center' }}>Select a query to edit its fields</MD>;
    }

    const [queryId, query] = selectedQuery;

    const { payload, config } = query;
    const { rows, columns: rawColumns } = payload;

    const columnsByCellDisplayName = Object.groupBy(rawColumns, (item: any) =>
      parseCellDisplayName(item.cellDataDisplayName),
    );
    const columns = Object.entries(columnsByCellDisplayName);

    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Section>
          <SectionHeader>
            <SectionTitle>Data simulation controls</SectionTitle>
            <Description>Control how the values are been generated</Description>
          </SectionHeader>
          <SectionContent>
            <Field>
              <Field.Label>Range</Field.Label>
              <InputGroup style={{ display: 'flex', gap: '8px' }}>
                <Input
                  name={`config-range_0#${queryId}#${tabId}`}
                  type="number"
                  step="any"
                  defaultValue={config.range[0]}
                  placeholder="Min"
                />
                <Input
                  name={`config-range_1#${queryId}#${tabId}`}
                  type="number"
                  step="any"
                  defaultValue={config.range[1]}
                  placeholder="Max"
                />
              </InputGroup>
            </Field>
            <FieldCombox>
              <Field.Label>Preset</Field.Label>
              <Combobox
                inputProps={{ name: `config-preset#${queryId}#${tabId}` }}
                isEditable={false}
                renderValue={({ inputValue }) => {
                  if (!inputValue) {
                    return null;
                  }

                  const { name, icon: Icon } = PRESET_OPTIONS[inputValue as keyof typeof PRESET_OPTIONS];
                  return (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon width={16} height={16} /> {name}
                    </span>
                  );
                }}
              >
                {Object.entries(PRESET_OPTIONS).map(([value, { name, icon: Icon }]) => (
                  <Option isSelected={config.preset === value} key={value} value={value} icon={<Icon />}>
                    {name}
                  </Option>
                ))}
              </Combobox>
            </FieldCombox>
          </SectionContent>
        </Section>
        {columns.length > 1 && (
          <Section>
            <SectionHeader>
              <SectionTitle>Chart labels</SectionTitle>
              <Description>Define labels for the chart.</Description>
            </SectionHeader>
            <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {columns.map(([cellDisplayName, columns]: any, idx: number) => {
                const members = columns[0].members;
                return (
                  <Collapsable
                    style={{ display: 'flex', gap: '8px', justifyContent: 'space-around', alignItems: 'center' }}
                    key={idx}
                    headerContent={<MD style={{ fontWeight: 'bold' }}>Column {idx + 1}</MD>}
                  >
                    <div
                      style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0px 12px 16px 12px' }}
                    >
                      {members.map((member: any, memberIdx: number) => (
                        <Field key={memberIdx} style={{ flex: 1 }}>
                          <Field.Hint>{member.levelDisplayName.split(' - ').at(-1)}</Field.Hint>
                          <Input
                            defaultValue={member.name}
                            name={`col-${cellDisplayName}#member-${memberIdx}#queryId-${queryId}#tabId-${tabId}`}
                          />
                        </Field>
                      ))}
                    </div>
                  </Collapsable>
                );
              })}
            </ul>
          </Section>
        )}
        {rows.length > 1 && (
          <Section>
            <SectionHeader>
              <SectionTitle>Rows</SectionTitle>
              <Description>Define labels for the rows.</Description>
            </SectionHeader>
            <ul style={{ padding: '0 12px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rows.map((row: any, rowIdx: number) => (
                <Collapsable
                  style={{ display: 'flex', gap: '8px', justifyContent: 'space-around', alignItems: 'center' }}
                  key={rowIdx}
                  headerContent={<MD style={{ fontWeight: 'bold' }}>Row {rowIdx + 1}</MD>}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '0px 8px 16px 8px',
                    }}
                  >
                    {row.members.map((member: any, memberIdx: number) => (
                      <Field key={memberIdx} style={{ flex: 1 }}>
                        <Field.Hint>{member.levelDisplayName}</Field.Hint>
                        <Input
                          defaultValue={member.name}
                          name={`row-${rowIdx}#member-${memberIdx}#queryId-${queryId}#tabId-${tabId}`}
                        />
                      </Field>
                    ))}
                  </div>
                </Collapsable>
              ))}
            </ul>
          </Section>
        )}
      </section>
    );
  };

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
              <ListItem key={queryId} onClick={() => handleSelectedQuery(queryId)}>
                <MD style={{ fontWeight: 'bold' }}>{query.title}</MD>
              </ListItem>
            ))}
          </TabPanel>
        );
      })}
      <Drawer isOpen={Boolean(selectedQuery)} onClose={() => setSelectedQuery(null)}>
        <Drawer.Header tag="h2">{selectedQuery?.at(-1)?.title}</Drawer.Header>
        <DrawerBody>
          <form id="edit-explore-skeleton-form" onSubmit={onSubmit}>
            {renderFields(selectedTabId)}
          </form>
        </DrawerBody>
        <Drawer.Footer>
          <Drawer.FooterItem>
            <Button size="medium" style={{ width: '100%' }} onClick={() => setSelectedQuery(null)}>
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

const ListItem = styled.button`
  background-color: white;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  transition: background-color 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.palette.grey[100]};
  }
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

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled(MD)`
  margin: 0;
  font-weight: bold;
`;

const Description = styled(SM)`
  margin: 0;
  color: ${({ theme }) => theme.palette.grey[600]};
`;

const DrawerBody = styled(Drawer.Body)`
  background-color: ${({ theme }) => theme.palette.grey[100]};
`;

export default EditExploreSkeleton;
