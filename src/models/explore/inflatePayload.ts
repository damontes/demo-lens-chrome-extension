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
  const { columns: lightColumns, rows: lightRows, cellData: lightCellData } = lightInfaltePayload ?? {};
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

  // Use saved cellData if useFixedValues is enabled, otherwise generate new data
  result.cellData =
    config?.useFixedValues && lightCellData
      ? lightCellData
      : buildCellData(meta, result.columns, config, lightRows?.length);
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

  if (colHierarchies[0]?.['@_dimensionType'] === 'time') {
    axis = 'time';
    timeInfo = { unit: 'day', points: DEFAULT_TIME_POINTS };
  } else if (isKpiLike(vizType)) {
    axis = 'category'; // 1 col
  } else if (getIsGrid(vizType, rowHierarchies.length, measures.length)) {
    axis = 'category'; // grid -> N col, lo dejamos como antes
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

export const inflateLookerExplorePayload = (originalData: any) => {
  // Generate inflated data based on the fields structure
  const inflatedData = [];

  // Get the fields from the original response
  const fields = originalData?.data?.fields;
  const drillMetadata = originalData?.data?.drill_metadata;
  if (!fields) {
    return originalData;
  }

  // Process measures (these typically have links for drill-down)
  const measures = fields.measures || [];
  const dimensions = fields.dimensions || [];

  // Detect if this is a KPI widget based on field structure:
  // KPI = 0 dimensions (measures can be 1 or more, each representing a separate KPI)
  // Table/List = has dimensions (shows tabular data)
  const isKpiWidget = dimensions.length === 0;
  const numRows = isKpiWidget ? 1 : randInt(5, 20); // KPI = 1 row, Table = 5-20 rows

  for (let i = 0; i < numRows; i++) {
    const rowData: any = {};

    // Generate measure data (with links for drill-down)
    measures.forEach((measure: any) => {
      const fieldName = measure.name;
      const label = measure.label_short || measure.label || fieldName;
      const isCount = measure.type === 'count' || measure.type === 'count_distinct';

      // Generate realistic values based on measure type
      let value;
      if (isCount || fieldName.includes('_kpi') || fieldName.includes('count')) {
        // Count measures and explicit KPIs should always be numeric
        value = randInt(0, 500);
      } else if (
        measure.measure === true &&
        measure.type === 'string' &&
        (fieldName.includes('online_agents') || fieldName.includes('_home'))
      ) {
        // Agent availability count measures (they return counts, not names, despite being string type)
        value = randInt(0, 10);
      } else if (measure.measure === true && measure.type === 'string' && fieldName.includes('agents')) {
        // Other string-type measures for agents (like agent lists)
        // Generate agent names as comma-separated list
        const numAgents = randInt(1, 5);
        const agentNames = Array.from({ length: numAgents }, () => faker.person.firstName()).join(', ');
        value = agentNames;
      } else if (fieldName.includes('tickets') && measure.is_numeric !== false) {
        // Ticket-related numeric measures
        value = randInt(0, 500);
      } else if (measure.is_numeric) {
        value = faker.number.float({ min: 0, max: 10000, fractionDigits: 2 });
      } else {
        value = faker.lorem.words(2);
      }

      // Check if this field should have drill-down links
      // KPIs, count measures, and numeric aggregations typically have drill links
      // BUT agent availability counts (online_agents, _home) are display-only without drill-down
      const shouldHaveDrillLinks =
        isCount ||
        fieldName.includes('_kpi') ||
        fieldName.includes('tickets') ||
        fieldName.includes('count') ||
        (measure.is_numeric && ['sum', 'avg', 'count', 'count_distinct'].includes(measure.type?.toLowerCase())) ||
        (measure.measure === true && !fieldName.includes('online_agents') && !fieldName.includes('_home')); // Exclude agent availability measures

      const dataObj: any = {
        value: value,
        html: shouldHaveDrillLinks
          ? `<a href="#drillmenu" style="color:#1f73b7;cursor:pointer" target="_self">${value}</a>`
          : `<span style="color:#1f73b7;display:inline-block" tabindex="0">\n        ${value}\n      </span>\n    `,
      };

      // Only add links if this field should have drill-down capability
      if (shouldHaveDrillLinks && drillMetadata?.template) {
        // Extract the base field context from the template to determine appropriate drill fields
        const getDrillFields = (template: string): string => {
          // Extract existing fields from template to understand the context
          const fieldsMatch = template.match(/fields=([^&]+)/);
          const existingFields = fieldsMatch ? fieldsMatch[1].split(',').map((f) => f.trim()) : [];

          // Remove <DRILL_BY> from existing fields to see what's already there
          const templateFields = existingFields.filter((f) => f !== '<DRILL_BY>');

          // Determine drill context based on existing fields in template
          const hasAgentFields = templateFields.some((f) => f.startsWith('agents.') || f.includes('agent_'));
          const hasTicketQueueFields = templateFields.some((f) => f.startsWith('tickets_in_queue.'));
          const hasTicketFields = templateFields.some((f) => f.startsWith('tickets.'));

          // For agent dashboards drilling into tickets, we replace with ticket-focused fields
          if (hasAgentFields && !hasTicketFields) {
            // Agent context -> complete replacement with ticket details + some agent context
            return [
              'tickets.ticket_id',
              'agents.assignee_name',
              'agents.agent_brands',
              'agents.agent_groups',
              'tickets.ticket_skills',
              'tickets.ticket_channel_localized',
              'tickets.ticket_social_channel_localized',
              'tickets.ticket_tags',
              'tickets.ticket_priority',
              'tickets.ticket_status_localized',
              'tickets.ticket_creation_date',
              'ticket_metrics.first_ticket_assigned_at',
            ].join(',');
          } else if (hasTicketQueueFields && !hasTicketFields) {
            // Queue KPI context -> complete replacement with ticket details
            return [
              'tickets.ticket_id',
              'tickets.ticket_group',
              'tickets.ticket_brand',
              'tickets.ticket_skills',
              'tickets.ticket_channel_localized',
              'tickets.ticket_social_channel_localized',
              'tickets.ticket_tags',
              'tickets.ticket_priority',
              'tickets.ticket_status_localized',
              'tickets.ticket_creation_date',
              'tickets_in_queue.formatted_wait_time',
            ].join(',');
          } else {
            // Default or mixed context - use basic ticket fields
            return [
              'tickets.ticket_id',
              'tickets.ticket_group',
              'tickets.ticket_brand',
              'tickets.ticket_status_localized',
              'tickets.ticket_creation_date',
            ].join(',');
          }
        };

        const drillFields = getDrillFields(drillMetadata.template);

        // Process the template URL by completely replacing the fields parameter
        let drillUrl = drillMetadata.template;

        // Extract the current fields parameter and replace it entirely
        const fieldsMatch = drillUrl.match(/fields=([^&]+)/);
        if (fieldsMatch) {
          const currentFields = fieldsMatch[1];
          // Replace the entire fields parameter with drill-appropriate fields
          drillUrl = drillUrl.replace(`fields=${currentFields}`, `fields=${drillFields}`);
        }

        // Replace other placeholders
        drillUrl = drillUrl
          .replace('<DRILL_INTO>', fieldName) // Field being drilled into (for the filter)
          .replace('<DRILL_VALUE>', value.toString()); // Filter value

        // Add missing filters that appear in real drill-down URLs for queue templates
        if (
          drillUrl.includes('tickets_in_queue') &&
          drillUrl.includes('filter_channel_raw]=MESSAGING') &&
          !drillUrl.includes('f[tickets_in_queue.channel]=')
        ) {
          drillUrl = drillUrl.replace(
            '&limit=500',
            '&f[tickets_in_queue.channel]=MESSAGING&f[tickets_in_queue.has_queue]=no&f[tickets.valid_ticket_status]=yes&limit=500',
          );
        } else if (
          drillUrl.includes('tickets_in_queue') &&
          drillUrl.includes('filter_channel_raw]=EMAIL') &&
          !drillUrl.includes('f[tickets_in_queue.channel]=')
        ) {
          drillUrl = drillUrl.replace(
            '&limit=500',
            '&f[tickets_in_queue.channel]=EMAIL&f[tickets_in_queue.has_queue]=no&f[tickets.valid_ticket_status]=yes&limit=500',
          );
        } else if (
          drillUrl.includes('tickets_in_queue') &&
          drillUrl.includes('filter_channel_raw]=VOICE') &&
          !drillUrl.includes('f[tickets_in_queue.channel]=')
        ) {
          drillUrl = drillUrl.replace(
            '&limit=500',
            '&f[tickets_in_queue.channel]=VOICE&f[tickets_in_queue.has_queue]=no&f[tickets.valid_ticket_status]=yes&limit=500',
          );
        }

        dataObj.links = [
          {
            label: `Show All ${value}`,
            label_prefix: 'Show All',
            label_value: value.toString(),
            url: drillUrl,
            type: 'measure_default',
          },
        ];
      }

      rowData[fieldName] = dataObj;
    });

    // Generate dimension data (without links)
    dimensions.forEach((dimension: any) => {
      const fieldName = dimension.name;
      let value;

      // Generate realistic values based on dimension type and field name
      if (fieldName.includes('agent_name') || fieldName.includes('name')) {
        value = faker.person.firstName();
      } else if (fieldName.includes('group')) {
        value = faker.helpers.arrayElement([
          'Customer Support',
          'Technical Support',
          'Sales',
          'Tier 1',
          'Tier 2',
          'Escalation Team',
        ]);
      } else if (fieldName.includes('brand')) {
        value = faker.helpers.arrayElement(['ZenCX (General CX)', '8Bar Coffee', 'ZenHome', 'ZenCX (messaging)']);
      } else if (fieldName.includes('channel')) {
        value = faker.helpers.arrayElement(['Email', 'Chat', 'Voice', 'Messaging']);
      } else if (fieldName.includes('status')) {
        value = faker.helpers.arrayElement(['New', 'Open', 'Pending', 'Solved', 'Online', 'Offline', 'Away']);
      } else if (fieldName.includes('priority')) {
        value = faker.helpers.arrayElement(['Low', 'Normal', 'High', 'Urgent']);
      } else if (fieldName.includes('time')) {
        value = faker.number.int({ min: 100, max: 10000 }).toString();
      } else if (dimension.type === 'number' || fieldName.includes('id')) {
        value = faker.number.int({ min: 10000, max: 99999 });
      } else if (dimension.type === 'date') {
        value = faker.date.recent().toISOString().slice(0, 19).replace('T', ' ');
      } else {
        // Default string value
        value = faker.lorem.words(2);
      }

      // Build the data object for dimension
      const dataObj: any = { value };

      // Add special formatting for specific field types
      if (fieldName.includes('id')) {
        dataObj.html = `<a style="cursor:pointer;color:#1f73b7" href="#" target="_blank">#${value}</a>`;
      } else if (fieldName.includes('groups') || fieldName.includes('brands')) {
        // Handle array values for groups/brands
        const arrayValues = faker.helpers.arrayElements(['Group 1', 'Group 2', 'Group 3'], randInt(1, 3));
        dataObj.value = JSON.stringify(arrayValues);
        dataObj.filterable_value = `"${JSON.stringify(arrayValues).replace(/"/g, '\\"')}"`;
        dataObj.html = `${arrayValues.slice(0, 2).join(', ')}${
          arrayValues.length > 2
            ? ` <span style="cursor:pointer;color:#1f73b7" title="${arrayValues.join('\\n')}"> &#43; ${
                arrayValues.length - 2
              } more</span>`
            : ''
        } `;
      } else if (fieldName.includes('tags')) {
        const tags = faker.helpers.arrayElements(
          ['urgent', 'escalated', 'vip', 'follow_up', 'auto_routing'],
          randInt(1, 4),
        );
        dataObj.value = JSON.stringify(tags);
        dataObj.filterable_value = `"${JSON.stringify(tags).replace(/"/g, '\\"')}"`;
        dataObj.html = `${tags.slice(0, 2).join(', ')}${
          tags.length > 2
            ? ` <span style="cursor:pointer;color:#1f73b7" title="${tags.join('\\n')}"> &#43; ${
                tags.length - 2
              } more</span>`
            : ''
        } `;
      } else if (fieldName.includes('time') && dimension.type === 'string') {
        dataObj.sort_value = parseInt(value.toString());
        dataObj.html = `<span>${faker.helpers.arrayElement(['00:15:30', '01:23:45', '02:45:12'])}</span>`;
      } else if (fieldName.includes('status')) {
        dataObj.html = `<span>${value}</span>`;
        if (fieldName.includes('localized')) {
          dataObj.sort_value = faker.helpers.arrayElement([1, 2, 3, 4]);
        }
      } else if (fieldName.includes('date')) {
        dataObj.filterable_value = `${value} for 1 second`;
        dataObj.html = faker.date.recent().toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      }

      rowData[fieldName] = dataObj;
    });

    inflatedData.push(rowData);
  }

  // Create the inflated response maintaining the original structure
  const inflatedResponse = JSON.parse(JSON.stringify(originalData));

  // Update data array with inflated data
  if (inflatedResponse.data) {
    inflatedResponse.data.data = inflatedData;

    // Ensure drill metadata template has proper placeholders
    if (inflatedResponse.data.drill_metadata?.template) {
      const template = inflatedResponse.data.drill_metadata.template;
      // Keep the original template - it should already have the proper placeholders
      // The URL construction happens above when creating individual measure links
    }
  }

  return inflatedResponse;
};
