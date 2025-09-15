import { generateMaskedValues, randInt } from '@/lib/general';
import { faker } from '@faker-js/faker';

const DEFAULT_HIERARCHY_COLUMN = {
  '@_hierarchyName': 'column all',
  '@_hierarchyDisplayName': '',
  '@_dimension': 'column all',
  '@_dimensionType': 'standard',
  '@_dataField': 'column all',
  '@_isTime': 'false',
};

const DEFAULT_HIERARCHY_ROW = {
  '@_hierarchyName': 'row all',
  '@_hierarchyDisplayName': '',
  '@_dimension': 'row all',
  '@_dimensionType': 'standard',
  '@_dataField': 'row all',
  '@_isTime': 'false',
};

const DEFAULT_CHANNELS = ['SUPPORT', 'TALK', 'MESSAGING', 'CHAT'];
const DEFAULT_STATES = ['ONLINE', 'OFFLINE', 'AWAY', 'TRANSFERS_ONLY'];

const MIN_TIME_POINTS = 10; // > 10 columnas
const DEFAULT_TIME_POINTS = 5; // usado si no se indica
const MIN_CATEGORY_POINTS = 3; // 3-5 columnas
const MAX_CATEGORY_POINTS = 5;

export const parseRowMember = (rowMember: any) => {
  const { name, displayName, levelDisplayName, attributeName } = rowMember;
  return {
    name,
    displayName,
    levelDisplayName,
    attributeName,
  };
};

export const inflatePayload = (
  skeleton: any,
  querySchema: any,
  visualizationType: string,
  lightInfaltePayload?: any,
  config?: any,
) => {
  const { columns: lightColumns, rows: lightRows } = lightInfaltePayload ?? {};
  const isDrillIn = querySchema?.isDrillIn;

  const meta = parseQuerySchema(querySchema, visualizationType);
  const result = structuredClone(skeleton.content.result);

  result.columns = buildColumns(meta, result, lightColumns?.length)
    .map((column, columnIdx) => ({
      ...column,
      members: column.members.map((member: any, memberIdx: number) => ({
        ...member,
        ...(lightColumns?.[columnIdx]?.members?.[memberIdx] ?? {}),
      })),
    }))
    .map((column) => {
      if (isDrillIn) {
        return {
          ...column,
          members: column.members.map((member: any) =>
            member.isMeasure !== 'true' ? skeleton.content.result.columns[0].members[0] : member,
          ),
        };
      }
      return column;
    });

  result.cellData = buildCellData(meta, result.columns, config, lightRows?.length);
  result.rows = buildRows(meta, result.cellData.length).map((row, rowIdx) => ({
    ...row,
    members: row.members.map((member: any) => ({
      ...member,
      ...(lightRows?.[rowIdx]?.members.find(
        (lightMember: any) => lightMember.levelDisplayName === member.levelDisplayName,
      ) ?? {}),
    })),
  }));

  result.rowsHeaders = meta.rowsHeaders;
  result.rowsDataFields = meta.rowsDataFields;

  const flat = result.cellData.flat().map((o: any) => o.value as number);
  result.stats.maximum = Math.max(...flat);
  result.stats.minimum = Math.min(...flat);

  result.columnsHeaders = meta.colHierarchies.map((c: any) => c['@_hierarchyDisplayName']).filter(Boolean);
  result.columnsDataFields = meta.colHierarchies
    .map((c: any) => c['@_hierarchyName'])
    .filter((v: string) => v !== 'column all');
  const currentFields = [...meta.colHierarchies, ...meta.rowHierarchies]
    .map((c: any) => c['@_hierarchyName'])
    .filter(
      (v: string) =>
        v !== DEFAULT_HIERARCHY_COLUMN['@_hierarchyName'] || v !== DEFAULT_HIERARCHY_ROW['@_hierarchyName'],
    );
  result.allDataFields = currentFields.map((value: string) => ({
    hierarchyDataField: value,
    originalDataField: null,
  }));
  result.stats = {
    ...result.stats,
    measureNameToMinMaxValues: meta.measures.reduce((prev: any, current: any) => {
      const { name } = current;
      return {
        ...prev,
        [name]: {
          minimum: 1,
          maximum: 738,
        },
      };
    }, {}),
  };

  return { ...result, measures: meta.measures, configJson: meta.configJson };
};

export const lighInflatePayload = (skeleton: any, querySchema: any, visualizationType: string) => {
  const meta = parseQuerySchema(querySchema, visualizationType);
  const result = skeleton.content.result;
  const isDrillIn = querySchema.isDrillIn;

  const rawColumns = buildColumns(meta, result);
  const cellData = buildCellData(meta, rawColumns);
  const rawRaws = buildRows(meta, cellData.length);
  const rawMeasures = meta.measures;

  const measures = rawMeasures.reduce((prev: any, current: any) => {
    const { dataField, displayNameWithoutAggregator } = current;
    return {
      ...prev,
      [dataField]: displayNameWithoutAggregator,
    };
  }, {});

  const columns = rawColumns.map((column) => ({
    ...column,
    members: column.members
      .filter((member: any) => member.isMeasure !== 'true')
      .map(({ name, displayName, attributeName, levelDisplayName }: any) => ({
        name,
        displayName,
        levelDisplayName,
        attributeName,
      })),
    cellDataDisplayName: column.members
      .map((member: any) => {
        if (member.isMeasure === 'true') {
          return measures[member.dataField];
        }

        return member.name;
      })
      .join(', '),
  }));

  const rows = rawRaws.map((row) => ({
    ...row,
    members: row.members.map(parseRowMember),
  }));

  return { columns: isDrillIn ? columns.slice(0, rawMeasures.length) : columns, rows };
};

export const inflateAgentsPayload = (filterBy: any) => {
  const { channels: initialChanels, states: initialStates, unifiedStateIds: initialUnifiedStatusId } = filterBy;
  const numberOfAgents = randInt(1, 15);
  const states = !initialStates?.length ? DEFAULT_STATES : initialStates;
  const unifiedStateIds = !initialUnifiedStatusId?.length ? ['2', '3', '4', '5'] : initialUnifiedStatusId;
  const channels = !initialChanels?.length ? DEFAULT_CHANNELS : initialChanels;

  const createAgentChannelInfoEdge = () => {
    return {
      node: {
        id: faker.string.numeric({ length: 14, allowLeadingZeros: false }),
        agentChannelUnifiedState: {
          id: faker.helpers.arrayElement(unifiedStateIds),
          __typename: 'AgentChannelUnifiedState',
        },
        unifiedStateLastUpdatedAt: faker.date.recent().getTime(),
        agent: {
          id: faker.string.numeric({ length: 14, allowLeadingZeros: false }),
          name: faker.person.fullName(),
          role: faker.helpers.arrayElement(['AGENT', 'ADMIN']),
          photo: {
            contentUrl: faker.image.avatar(),
            __typename: 'Image',
          },
          __typename: 'Agent',
        },
        channelInfo: [generateChannelInfo(faker.helpers.arrayElement(channels), states)],
        __typename: 'AgentChannelInfo',
      },
      __typename: 'AgentChannelInfoEdge',
    };
  };

  return Array.from({ length: numberOfAgents }, () => createAgentChannelInfoEdge());
};

export const inflateAgentPayload = (agent: any) => {
  const {
    agent: { id, name, role, photo },
    channelInfo: rawChannelInfo,
  } = agent;
  const channelInfo = DEFAULT_CHANNELS.map((channel) => {
    if (rawChannelInfo.at(0)?.channel !== channel) {
      return generateChannelInfo(channel);
    }
    return rawChannelInfo.at(0);
  });

  return {
    agentsChannelInfo: {
      edges: [
        {
          node: {
            channelInfo,
            unifiedStateLastUpdatedAt: 1750300246000,
            __typename: 'AgentChannelInfo',
          },
          __typename: 'AgentChannelInfoEdge',
        },
      ],
      __typename: 'AgentChannelInfoConnection',
    },
    user: {
      id,
      nonPaginatedAgentStatus: [
        ...generateRandomItems(generateTicketWorkItem, 1, 5),
        ...generateRandomItems(generateTalkWorkItem, 1, 2),
        ...generateRandomItems(generateMessageWorkItems, 1, 3),
      ],
      photo,
      name,
      role,
      __typename: 'Agent',
    },
  };
};

function generateChannelInfo(channel: string, states?: string[]) {
  const state = faker.helpers.arrayElement(states ?? DEFAULT_STATES);

  return {
    channel: channel,
    stateUpdatedAt: faker.date.recent().getTime(),
    state,
    capacity: {
      acceptedCapacity: faker.number.int({ min: 0, max: 3 }),
      maxCapacity: faker.number.int({ min: 1, max: 5 }),
      freeCapacityPercentage: faker.number.float({ min: 0, max: 100 }),
      __typename: 'AgentCapacityInfo',
    },
    __typename: 'AgentChannelStatus',
  };
}

function generateTicketWorkItem() {
  const priority = faker.helpers.arrayElement(['NOT_SET', 'URGENT']);
  const requesterType = faker.helpers.arrayElement(['Agent', 'Customer']);
  const createdAt = faker.date.past().toISOString();
  const updatedAt = faker.date.recent().toISOString();
  const status = faker.helpers.arrayElement(['NEW', 'OPEN', 'CLOSED', 'PENDING']);
  const groupName = faker.helpers.arrayElement(['Talk', 'Email', 'Messaging', 'Chat']);
  const brandName = faker.helpers.arrayElement(['Master', 'Premium', 'Basic']);
  const id = faker.string.numeric({ length: 3, allowLeadingZeros: false });
  return {
    id,
    ticket: {
      id,
      createdAt,
      updatedAt,
      status,
      priority,
      brand: {
        name: brandName,
        __typename: 'Brand',
      },
      requester: {
        name: faker.person.fullName(),
        __typename: requesterType,
      },
      assignee: {
        group: {
          name: groupName,
          __typename: 'SupportGroup',
        },
        __typename: 'Assignee',
      },
      __typename: 'Issue',
    },
    __typename: 'SupportWorkItem',
  };
}

function generateTalkWorkItem() {
  return {
    details: {
      fromLine: faker.phone.number({ style: 'international' }),
      callDirection: faker.helpers.arrayElement(['INBOUND', 'OUTBOUND']),
      createdAt: faker.date.recent().toISOString(),
      ticket: {
        id: faker.string.numeric(3),
        __typename: 'Issue',
      },
      __typename: 'TalkWorkItemDetails',
    },
    __typename: 'TalkWorkItem',
  };
}

function generateMessageWorkItems() {
  return {
    id: '13636770',
    details: {
      duration: 0,
      requester: 'Peter Sax',
      __typename: 'MessagingWorkItemDetails',
    },
    channelName: 'messaging',
    reason: 'REOPENED',
    __typename: 'MessagingWorkItem',
  };
}

function generateRandomItems(callback: () => any, min = 1, max = 5) {
  const count = faker.number.int({ min, max });
  return Array.from({ length: count }, callback);
}

function parseQuerySchema(querySchema: any, vizType: string) {
  const { Measures: rawMeasures, Columns: rawColumns, Rows: rawRows, Config } = querySchema;
  const colHierarchies = Array.isArray(rawColumns.Hierarchy)
    ? rawColumns.Hierarchy
    : [rawColumns.Hierarchy || DEFAULT_HIERARCHY_COLUMN];

  const rowHierarchies = Array.isArray(rawRows.Hierarchy)
    ? rawRows.Hierarchy
    : [rawRows.Hierarchy || DEFAULT_HIERARCHY_ROW];
  const rowsHeaders = rowHierarchies.map((h: any) => h['@_hierarchyDisplayName']).filter(Boolean);
  const rowsDataFields = rowHierarchies.map((h: any) => h['@_dataField']).filter((v: any) => v !== 'row all');

  const measures = [].concat(rawMeasures.Measure).map((m: any) => {
    const agg = m['@_aggregationType']?.toUpperCase() ?? 'SUM';
    const name = `${agg}(${m['@_dataField']})`;
    const disp = toStr(m?.['@_displayName'], name);
    return {
      aggregator: agg,
      dataField: m['@_dataField'],
      displayName: disp,
      displayNameWithoutAggregator: disp.replace(/^([A-Z_]+)\(/, '').replace(/\)$/, ''),
      isMeasure: 'true',
      levelDisplayName: 'Measures',
      levelName: 'Measures',
      name,
      uniqueName: `[Measures].[Measures].[Measures].[${name}]`,

      aggregationType: agg,
      position: m['@_position'] ?? 'normal',
      originalMeasure: name,
    };
  });

  let axis: 'time' | 'category';
  let timeInfo: { unit: string; points: number } | undefined;
  let categoryInfo: { points: number } | undefined;

  if (isKpiLike(vizType)) {
    axis = 'category'; // 1 col
  } else if (getIsGrid(vizType, rowHierarchies.length, measures.length)) {
    axis = 'category'; // grid -> N col, lo dejamos como antes
  } else if (colHierarchies[0]?.['@_dimensionType'] === 'time') {
    axis = 'time';
    timeInfo = { unit: 'day', points: DEFAULT_TIME_POINTS };
  } else {
    axis = 'category';
    categoryInfo = {
      points:
        ((vizType === 'pieChart' || vizType === 'funnelChart') && measures.length > 1) || vizType === 'gaugeChart'
          ? 1
          : randInt(MIN_CATEGORY_POINTS, MAX_CATEGORY_POINTS),
    };
  }

  const configJson = JSON.parse(atob(Config['@_json']));

  return {
    vizType,
    measures,
    axis,
    timeInfo,
    configJson,
    colHierarchies,
    categoryInfo,
    rowHierarchies,
    rowsHeaders,
    rowsDataFields,
  };
}

function fakeValue(raw: number, m: any, configJson: any) {
  const { isPercentage } = getMeasureMetadata(m, configJson);

  if (isPercentage) {
    return Number(Math.min(0.95, Math.max(0.2, raw)).toFixed(2));
  }

  switch (m.aggregator) {
    case 'COUNT':
      return raw;
    case 'D_COUNT':
      return raw;
    case 'SUM':
      return raw;
    case 'AVG':
    case 'MED':
      return Number(raw.toFixed(1));
    default:
      return raw;
  }
}

function buildColumns(meta: any, skeleton: any, maxLength?: number) {
  const tpl = skeleton.columns[0]; // original bare column
  const cols: any[] = [];

  const measuresCount = meta.measures.length;

  if (meta.axis === 'time' && meta.timeInfo) {
    const pts =
      maxLength !== undefined ? Math.floor(maxLength / measuresCount) : Math.max(meta.timeInfo.points, MIN_TIME_POINTS);

    for (let i = pts - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateLabel = d.toISOString().slice(0, 10); // YYYY-MM-DD

      meta.measures.forEach((m: any) => {
        cols.push(produceColumn(tpl, dateLabel, meta.colHierarchies, m));
      });
    }
    return cols;
  }

  if (meta.axis === 'category' && meta.categoryInfo) {
    const pts = maxLength !== undefined ? Math.floor(maxLength / measuresCount) : meta.categoryInfo.points;

    for (let i = 0; i < pts; i++) {
      const catLabel = `${i + 1}`;
      meta.measures.forEach((m: any) => {
        cols.push(produceColumn(tpl, catLabel, meta.colHierarchies, m));
      });
    }
    return cols;
  }

  meta.measures.forEach((m: any, idx: number) =>
    cols.push(
      produceColumn(tpl, isKpiLike(meta.vizType) ? 'column all' : `<Category ${idx + 1}>`, meta.colHierarchies, m),
    ),
  );

  return cols;
}

function buildRows(meta: any, numberOfRows: number) {
  const rows: any[] = [];

  for (let i = 0; i < numberOfRows; i++) {
    const rowMembers = meta.rowHierarchies.map((h: any) => {
      const nothHasDisplayName = !h['@_hierarchyDisplayName'];
      const value = nothHasDisplayName ? 'row all' : `${h['@_hierarchyDisplayName']} ${i + 1}`;
      return {
        name: value,
        levelName: h['@_hierarchyName'],
        levelDisplayName: h['@_hierarchyDisplayName'],
        dataField: h['@_dataField'],
        isAll: 'false',
        isSubTotal: 'false',
        attributeDatafield: h['@_dataField'],
        displayName: value,
        dimensionName: h['@_dimension'],
        dimensionType: 'standard',
        isRepetition: 'false',
        attributeName: h['@_hierarchyName'],
        attributeDisplayName: h['@_hierarchyDisplayName'],
      };
    });

    rows.push({ isAll: false, isForecast: false, members: rowMembers });
  }

  return rows;
}

function produceColumn(
  tpl: any,
  timeDisplay: string,
  colHierarchies: any,
  m: any, // measure meta
) {
  const hierarchyMembers = colHierarchies.map((colHierarchy: any) => {
    const nothHasDisplayName = !colHierarchy['@_hierarchyDisplayName'];
    const value = nothHasDisplayName ? 'column all' : `${colHierarchy['@_hierarchyDisplayName']} ${timeDisplay}`;
    return {
      name: value,
      isAll: 'false',
      isSubTotal: 'false',
      displayName: value,
      isRepetition: 'false',
      levelDisplayName: nothHasDisplayName ? '' : value,
      dataField: colHierarchy['@_dataField'],
      attributeDatafield: colHierarchy['@_dataField'],
      dimensionName: colHierarchy['@_dimension'],
      dimensionType: colHierarchy['@_dimensionType'],
      attributeName: colHierarchy['@_hierarchyName'],
      attributeDisplayName: value,
    };
  });

  // merge into a fresh column object
  return {
    ...tpl,
    isAll: false,
    isForecast: false,
    members: [...hierarchyMembers, m],
  };
}

function buildCellData(meta: any, columns: any, config?: any, rowsLength: number = 4): any[][] {
  const isGrid = getIsGrid(meta.vizType, meta.rowHierarchies.length, meta.measures.length);
  const hasMultipleRows = meta.rowHierarchies[0]?.['@_dataField'] !== DEFAULT_HIERARCHY_ROW['@_dataField'];
  const rows = isGrid || hasMultipleRows ? rowsLength : 1; // tabla -> varias filas; gráfico -> 1

  const cols = isGrid ? meta.measures.length : columns.length;
  const maskedValues: number[][] = Array.from({ length: rows }, () => generateMaskedValues(config, cols));

  const buildRow = (rowIdx: number) => {
    const values = maskedValues[rowIdx];

    // simpleGrid2 → 1 celda por measure  (columns.length == measures.length)
    if (isGrid) {
      return meta.measures.map((m: any, idx: number) => ({ value: fakeValue(values[idx], m, meta.configJson) }));
    }

    // Resto de charts → 1 celda por columna
    return columns.map((c: any, idx: number) => {
      const measureMeta = c.members[c.members.length - 1];

      return { value: fakeValue(values[idx], measureMeta, meta.configJson) };
    });
  };

  return Array.from({ length: rows }, (_, idx) => buildRow(idx));
}

function toStr(v: unknown, fallback = '') {
  return typeof v === 'string' ? v : String(v ?? fallback);
}

function isKpiLike(v: string) {
  return ['kpichart', 'autochart'].includes(v.toLowerCase());
}

function getIsGrid(v: string, rows: any, measures: any) {
  return v === 'simpleGrid2' || (v === 'autoChart' && rows > 1) || (v === 'autoChart' && measures > 1);
}

function getMeasureMetadata(measure: any, configJson: any) {
  const includeInMeasureDisplayFormats = measure.displayNameWithoutAggregator.includes('%');
  const fmt =
    configJson.measureDisplayFormats?.[measure.name] || configJson.measureDisplayFormats?.[measure.displayName] || null;

  const isPercentage = includeInMeasureDisplayFormats || (fmt && fmt.suffix === '%' && Number(fmt.scale) === 0.01);
  const limit = fmt?.limit || 0;

  return { isPercentage, limit };
}
