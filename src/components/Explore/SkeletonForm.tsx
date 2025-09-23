import { MD, SM } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import { Field, Input, InputGroup, Toggle } from '@zendeskgarden/react-forms';
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
  const [values, setValues] = useState({
    rawRows: payload.rows ?? [],
    rawColumns: payload.columns ?? [],
    rawCellData: payload.cellData ?? [],
  });
  const { rawRows, rawColumns, rawCellData } = values;
  const [useFixedValues, setUseFixedValues] = useState(config.useFixedValues ?? false);

  const parseCellDisplayName = (cellDataDisplayName: string) => {
    return cellDataDisplayName.split(',').slice(0, -1).join(',');
  };

  // Get cellData for a specific row, create if doesn't exist
  const getCellDataForRow = (rowIdx: number) => {
    if (rawCellData[rowIdx]) {
      return rawCellData[rowIdx];
    }
    // Create default cellData for this row if it doesn't exist
    const colCount = isTableWidget ? rawColumns.length : Math.max(columns.length, 1);
    return Array.from({ length: colCount }, () => ({ value: 0 }));
  };

  const isTableWidget = useMemo(() => {
    // Check if all columns start with "column all" - this indicates a table widget
    return (
      rawColumns.length > 0 &&
      rawColumns.every((column: any) => column.cellDataDisplayName.toLowerCase().startsWith('column all'))
    );
  }, [rawColumns]);

  const columns = useMemo(() => {
    if (isTableWidget) {
      // For table widgets, each column is separate (different metrics)
      return rawColumns.map((column: any, index: number) => [
        column.cellDataDisplayName.split(', ').slice(1).join(', '), // Remove "column all, " prefix
        [column],
      ]);
    }

    // For regular widgets, group by cellDataDisplayName prefix
    const columnsByCellDisplayName = Object.groupBy(rawColumns, (item: any) =>
      parseCellDisplayName(item.cellDataDisplayName),
    );

    return Object.entries(columnsByCellDisplayName);
  }, [rawColumns, isTableWidget]);

  const isSingleColumnWidget = useMemo(() => {
    return (
      rawColumns.some((column: any) => column.cellDataDisplayName.toLowerCase().includes('column all')) &&
      columns.length === 1
    );
  }, [rawColumns, columns]);

  const isSingleRowWidget = useMemo(() => {
    return (
      rawRows.some((row: any) => row.members.at(0)?.name.toLowerCase().includes('row all')) && rawRows.length === 1
    );
  }, [rawRows]);

  const onDeleteRow = (idx: number) => {
    // Prevent deleting the last row
    if (rawRows.length <= 1) {
      return;
    }

    const newRawRows = rawRows.filter((_: any, rowIdx: number) => rowIdx !== idx);

    // Additional safety check
    if (newRawRows.length === 0) {
      console.warn('Attempted to delete all rows, operation cancelled');
      return;
    }

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

    // Update cellData to add a new column with default values for each row
    const newRawCellData = rawCellData.map((rowData: any[]) => {
      if (!rowData || !Array.isArray(rowData)) {
        // If row doesn't exist, create it with the right number of columns including the new one
        const colCount = columns.length + 1; // +1 for the new column being added
        return Array.from({ length: colCount }, () => ({ value: 0 }));
      }
      // Add a new cell with default value to existing row
      return [...rowData, { value: 0 }];
    });

    // If rawCellData is empty but we have rows, initialize it
    const finalRawCellData =
      rawCellData.length === 0 && rawRows.length > 0
        ? rawRows.map(() => Array.from({ length: columns.length + 1 }, () => ({ value: 0 })))
        : newRawCellData;

    setValues((prev) => ({
      ...prev,
      rawColumns: [...prev.rawColumns, ...newColumns],
      rawCellData: finalRawCellData,
    }));
  };

  const onDeleteColumn = (idx: number) => {
    // Prevent deleting the last column
    if (columns.length <= 1) {
      return;
    }

    const [_, deletedRawColumns] = columns[idx];
    if (!deletedRawColumns || deletedRawColumns.length === 0) {
      return;
    }

    const deletedCellDisplayNames = new Set(
      deletedRawColumns.map((deletedColumn: any) => deletedColumn.cellDataDisplayName),
    );

    const newRawColumns = rawColumns.filter((column: any) => {
      return !deletedCellDisplayNames.has(column.cellDataDisplayName);
    });

    // Additional safety check to ensure we don't end up with empty columns
    if (newRawColumns.length === 0) {
      console.warn('Attempted to delete all columns, operation cancelled');
      return;
    }

    // Update cellData to remove the deleted column
    const newRawCellData = rawCellData.map((rowData: any[]) => {
      if (!rowData || !Array.isArray(rowData)) return rowData;
      // Remove the column at the specified index
      return rowData.filter((_: any, colIdx: number) => colIdx !== idx);
    });

    setValues((prev) => ({
      ...prev,
      rawColumns: newRawColumns,
      rawCellData: newRawCellData,
    }));
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
    const { preset, range_0, range_1, useFixedValues } = Object.entries(configValues).reduce(
      (acc, [key, value]: any) => ({
        ...acc,
        [key.split('-').at(-1)]: value,
      }),
      {} as any,
    );

    return {
      preset,
      range: [Number(range_0), Number(range_1)],
      useFixedValues: useFixedValues === 'on',
    };
  };

  const onChangeCellDataValues = (cellDataValues: any) => {
    const newCellData: any[][] = [];

    // Build cellData based on current rows and columns structure
    rawRows.forEach((_: any, rowIdx: number) => {
      newCellData[rowIdx] = [];

      columns.forEach((_: any, colIdx: number) => {
        const key = `cell-${rowIdx}-${colIdx}`;
        const value = cellDataValues[key];

        newCellData[rowIdx][colIdx] = {
          value: value ? parseFloat(value) || 0 : 0,
        };
      });
    });

    return newCellData;
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

    const cellDataValues = Object.entries(values)
      .filter(([key]) => key.startsWith('cell-'))
      .reduce((prev: any, [key, value]) => ({ ...prev, [key]: value }), {});

    const configValues = Object.entries(values)
      .filter(([key]) => key.startsWith('config-'))
      .reduce((prev: any, [key, value]) => ({ ...prev, [key]: value }), {});

    console.log('ON SUBMIT cellDataValues', cellDataValues);
    const rows = onChangeRowValues(rowValues);
    const columns = onChangeColumnValues(columnValues);
    const cellData = useFixedValues ? onChangeCellDataValues(cellDataValues) : rawCellData;
    const config = onChangeConfig(configValues);

    console.log('Cell DAta', cellData);
    await onSubmit({ payload: { rows, columns, cellData }, config });
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
                disabled={useFixedValues}
              />
              <Input
                name="config-range_1"
                type="number"
                step="any"
                defaultValue={config.range?.[1]}
                placeholder="Max"
                disabled={useFixedValues}
              />
            </InputGroup>
          </Field>
          <FieldCombox>
            <Field.Label>Preset</Field.Label>
            <Combobox
              inputProps={{ name: `config-preset`, disabled: useFixedValues }}
              isEditable={false}
              isDisabled={useFixedValues}
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
          <ToggleContainer>
            <ToggleContent>
              <Field.Label>Use Fixed Values</Field.Label>
              <Description>Enable to set specific values instead of generated ones</Description>
            </ToggleContent>
            <Field>
              <Toggle
                name="config-useFixedValues"
                checked={useFixedValues}
                onChange={(e) => setUseFixedValues(e.target.checked)}
              >
                <Field.Label hidden>Use Fixed Values</Field.Label>
              </Toggle>
            </Field>
          </ToggleContainer>
        </SectionContent>
      </Section>
      {!isTableWidget && (columns.length > 1 || (columns.length === 1 && !isSingleColumnWidget)) ? (
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
                      {columns.length > 1 && (
                        <IconButton
                          isDanger
                          onClick={() => onDeleteColumn(columnIdx)}
                          size="small"
                          aria-label="Delete column"
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
            {!isSingleColumnWidget && (
              <Button type="button" onClick={onAddColumn}>
                <PlusIcon />
                Add Column
              </Button>
            )}
          </ul>
        </Section>
      ) : null}
      {rawRows.length > 1 ||
      (rawRows.length === 1 && !isSingleRowWidget) ||
      (useFixedValues && rawRows.length >= 1) ||
      isTableWidget ? (
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
                    {rawRows.length > 1 && (
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
                    gap: '12px',
                    padding: '0px 8px 16px 8px',
                  }}
                >
                  {/* Row Members (Labels) - Only show if more than one row or not using fixed values */}
                  {(rawRows.length > 1 || !useFixedValues) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <MD style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Row Labels</MD>
                      {row.members.map((member: any, memberIdx: number) => (
                        <Field key={memberIdx} style={{ flex: 1 }}>
                          <Field.Hint>{member.levelDisplayName}</Field.Hint>
                          <Input defaultValue={member.name} name={`row-${rowIdx}#member-${memberIdx}`} />
                        </Field>
                      ))}
                    </div>
                  )}

                  {/* Cell Data Values */}
                  {useFixedValues && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <MD style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Data Values</MD>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '8px',
                        }}
                      >
                        {getCellDataForRow(rowIdx).map((cell: any, colIdx: number) => {
                          let columnLabel = `Col ${colIdx + 1}`;

                          if (isTableWidget) {
                            // For table widgets, show the actual metric name
                            const column = rawColumns[colIdx];
                            if (column) {
                              const metricName = column.cellDataDisplayName.split(', ').slice(1).join(', ');
                              columnLabel = metricName || `Col ${colIdx + 1}`;
                            }
                          }

                          return (
                            <Field key={`${rowIdx}-${colIdx}`}>
                              <Field.Label>{columnLabel}</Field.Label>
                              <Input
                                type="number"
                                step="any"
                                name={`cell-${rowIdx}-${colIdx}`}
                                defaultValue={cell.value}
                                placeholder="0"
                              />
                            </Field>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Collapsable>
            ))}
            {!isSingleRowWidget && (
              <Button type="button" onClick={onAddRow}>
                <PlusIcon />
                Add Row
              </Button>
            )}
          </ul>
        </Section>
      ) : null}
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

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
`;

const ToggleContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export default SkeletonForm;
