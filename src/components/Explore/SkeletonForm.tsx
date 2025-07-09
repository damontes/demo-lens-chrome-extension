import { MD, SM } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import { Field, Input, InputGroup } from '@zendeskgarden/react-forms';
import { Combobox, Option, Field as FieldCombox } from '@zendeskgarden/react-dropdowns';
import { FlatLineIcon, LineDecreaseIcon, LineIncreaseIcon, PulseGraphIcon, RandomIcon } from '@/icons';
import Collapsable from '../ui/Collapsable';
import { useMemo, useState } from 'react';
import { Button, IconButton } from '@zendeskgarden/react-buttons';
import TrashIcon from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg?react';
import PlusIcon from '@zendeskgarden/svg-icons/src/16/plus-stroke.svg?react';
import { addOneDay } from '@/lib/date';

type Props = {
  initialValues: any;
  onSubmit: (query: any) => any;
};

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

const SkeletonForm = ({ initialValues, onSubmit }: Props) => {
  const { payload = {}, config = {} } = initialValues ?? {};
  const [values, setValues] = useState({ rawRows: payload.rows ?? [], rawColumns: payload.columns ?? [] });
  const { rawRows, rawColumns } = values;

  const parseCellDisplayName = (cellDataDisplayName: string) => {
    return cellDataDisplayName.split(',').slice(0, -1).join(',');
  };

  const columns = useMemo(() => {
    const columnsByCellDisplayName = Object.groupBy(rawColumns, (item: any) =>
      parseCellDisplayName(item.cellDataDisplayName),
    );

    return Object.entries(columnsByCellDisplayName);
  }, [rawColumns]);

  const onDeleteRow = (idx: number) => {
    const newRawRows = rawRows.filter((_: any, rowIdx: number) => rowIdx !== idx);
    setValues((prev) => ({ ...prev, rawRows: newRawRows }));
  };

  const onAddRow = () => {
    const lastRow = rawRows.at(-1);
    const newRow = {
      ...lastRow,
      members: lastRow?.members.map((member: any) => {
        const name = `${member.levelDisplayName} ${rawRows.length + 1}`;
        return { ...member, name: name, displayName: name };
      }),
    };
    setValues((prev) => ({ ...prev, rawRows: [...prev.rawRows, newRow] }));
  };

  const onAddColumn = () => {
    const [_, lastColumns = []] = columns.at(-1) ?? [];

    const newColumns = lastColumns.map((lastColumn: any) => {
      const { cellDataDisplayName: rawCellDataDisplayName, members, ...rest } = lastColumn;
      const identifiers = rawCellDataDisplayName.split(',').map((value: string) => value.trim());
      const membersIdentifiers = identifiers.slice(0, -1).map((value: string) => {
        const lastIdentifierIndex = value.lastIndexOf(' ');
        const lastLevelDisplayName = value.substring(0, lastIdentifierIndex);
        const identifier = value.substring(lastIdentifierIndex);

        return `${lastLevelDisplayName} ${isNaN(Number(identifier)) ? addOneDay(identifier) : columns.length + 1}`;
      });
      const columnIdentifier = identifiers.at(-1);

      return {
        ...rest,
        cellDataDisplayName: `${membersIdentifiers.join(', ')}, ${columnIdentifier}`,
        members: lastColumn.members.map((member: any, idx: number) => {
          const levelDisplayName = membersIdentifiers[idx];
          return { ...member, levelDisplayName, name: levelDisplayName, displayName: levelDisplayName };
        }),
      };
    });

    setValues((prev) => ({ ...prev, rawColumns: [...prev.rawColumns, ...newColumns] }));
  };

  const onDeleteColumn = (idx: number) => {
    const [_, deletedRawColumns] = columns[idx];
    const newRawColumns = rawColumns.filter((column: any) => {
      return !deletedRawColumns?.some((deletedColumn: any) => {
        return column.cellDataDisplayName === deletedColumn.cellDataDisplayName;
      });
    });
    setValues((prev) => ({ ...prev, rawColumns: newRawColumns }));
  };

  const onChangeColumnValues = (columnValues: any) => {
    const newColumns = structuredClone(rawColumns);
    rawColumns.forEach((column: any, columnIdx: number) => {
      const columName = parseCellDisplayName(column.cellDataDisplayName);
      column.members.forEach((_member: any, memberIdx: number) => {
        const identifier = `col-${columName}#member-${memberIdx}`;
        const value = columnValues[identifier];
        if (value) {
          newColumns[columnIdx].members[memberIdx].name = value;
          newColumns[columnIdx].members[memberIdx].displayName = value;
        }
      });
    });

    return newColumns;
  };

  const onChangeRowValues = (rowValues: any) => {
    const newRows = structuredClone(rawRows);
    rawRows.forEach((row: any, rowIdx: number) => {
      row.members.forEach((_: any, memberIdx: number) => {
        const identifier = `row-${rowIdx}#member-${memberIdx}`;
        const value = rowValues[identifier];
        if (value) {
          newRows[rowIdx].members[memberIdx].name = value;
          newRows[rowIdx].members[memberIdx].displayName = value;
        }
      });
    });

    return newRows;
  };

  const onChangeConfig = (configValues: any) => {
    const { preset, range_0, range_1 } = Object.entries(configValues).reduce(
      (acc, [key, value]: any) => ({
        ...acc,
        [key.split('-').at(-1)]: value,
      }),
      {} as any,
    );

    return { preset, range: [Number(range_0), Number(range_1)] };
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());

    const columnValues = Object.entries(values)
      .filter(([key]) => key.startsWith('col'))
      .reduce((prev: any, [key, value]) => ({ ...prev, [key]: value }), {});

    const rowValues = Object.entries(values)
      .filter(([key]) => key.startsWith('row'))
      .reduce((prev: any, [key, value]) => ({ ...prev, [key]: value }), {});

    const configValues = Object.entries(values)
      .filter(([key]) => key.startsWith('config-'))
      .reduce((prev: any, [key, value]) => ({ ...prev, [key]: value }), {});

    const rows = onChangeRowValues(rowValues);
    const columns = onChangeColumnValues(columnValues);
    const config = onChangeConfig(configValues);

    await onSubmit({ payload: { rows, columns }, config });
  };

  return (
    <form
      id="edit-explore-skeleton-form"
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
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
                name="config-range_0"
                type="number"
                step="any"
                defaultValue={config.range?.[0]}
                placeholder="Min"
              />
              <Input
                name="config-range_1"
                type="number"
                step="any"
                defaultValue={config.range?.[1]}
                placeholder="Max"
              />
            </InputGroup>
          </Field>
          <FieldCombox>
            <Field.Label>Preset</Field.Label>
            <Combobox
              inputProps={{ name: `config-preset` }}
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
            {columns.map(([cellDisplayName, innerColumns]: any, columnIdx: number) => {
              const members = innerColumns[0].members;
              return (
                <Collapsable
                  style={{ display: 'flex', gap: '8px', justifyContent: 'space-around', alignItems: 'center' }}
                  key={crypto.randomUUID()}
                  headerContent={
                    <HeaderCollapsable>
                      <MD style={{ fontWeight: 'bold' }}>Column {columnIdx + 1}</MD>
                      {columnIdx === columns.length - 1 && (
                        <IconButton
                          isDanger
                          onClick={() => onDeleteColumn(columnIdx)}
                          size="small"
                          aria-label="Delete row"
                        >
                          <TrashIcon />
                        </IconButton>
                      )}
                    </HeaderCollapsable>
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0px 12px 16px 12px' }}>
                    {members.map((member: any, memberIdx: number) => (
                      <Field key={memberIdx} style={{ flex: 1 }}>
                        <Field.Hint>{member.levelDisplayName.split(' - ').at(-1)}</Field.Hint>
                        <Input defaultValue={member.name} name={`col-${cellDisplayName}#member-${memberIdx}`} />
                      </Field>
                    ))}
                  </div>
                </Collapsable>
              );
            })}
            <Button type="button" onClick={onAddColumn}>
              <PlusIcon />
              Add Column
            </Button>
          </ul>
        </Section>
      )}
      {rawRows.length > 1 && (
        <Section>
          <SectionHeader>
            <SectionTitle>Rows</SectionTitle>
            <Description>Define labels for the rows.</Description>
          </SectionHeader>
          <ul style={{ padding: '0 12px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rawRows.map((row: any, rowIdx: number) => (
              <Collapsable
                style={{ display: 'flex', gap: '8px', justifyContent: 'space-around', alignItems: 'center' }}
                key={crypto.randomUUID()}
                headerContent={
                  <HeaderCollapsable>
                    <MD style={{ fontWeight: 'bold' }}>Row {rowIdx + 1}</MD>
                    {rowIdx === rawRows.length - 1 && (
                      <IconButton isDanger onClick={() => onDeleteRow(rowIdx)} size="small" aria-label="Delete row">
                        <TrashIcon />
                      </IconButton>
                    )}
                  </HeaderCollapsable>
                }
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
                      <Input defaultValue={member.name} name={`row-${rowIdx}#member-${memberIdx}`} />
                    </Field>
                  ))}
                </div>
              </Collapsable>
            ))}
            <Button type="button" onClick={onAddRow}>
              <PlusIcon />
              Add Row
            </Button>
          </ul>
        </Section>
      )}
    </form>
  );
};

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

const HeaderCollapsable = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
`;

export default SkeletonForm;
