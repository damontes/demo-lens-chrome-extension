import { ungzip } from 'pako';
import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser({ ignoreAttributes: false });

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

const MIN_TIME_POINTS = 10; // > 10 columnas
const DEFAULT_TIME_POINTS = 5; // usado si no se indica
const MIN_CATEGORY_POINTS = 3; // 3-5 columnas
const MAX_CATEGORY_POINTS = 5;

export const inflatePayload = (
  skeleton: any,
  querySchemaB64: string,
  visualizationType: string,
  lightInfaltePayload?: any,
) => {
  const { columns: lightColumns, rows: lightRows } = lightInfaltePayload ?? {};

  const meta = parseQuerySchema(querySchemaB64, visualizationType);
  const result = skeleton.content.result;

  result.columns = buildColumns(meta, result, lightColumns?.length).map((column, columnIdx) => ({
    ...column,
    members: column.members.map((member: any, memberIdx: number) => ({
      ...member,
      ...(lightColumns?.[columnIdx]?.members?.[memberIdx] ?? {}),
    })),
  }));

  result.cellData = buildCellData(meta, result.columns);
  result.rows = buildRows(meta, result.cellData.length).map((row, rowIdx) => ({
    ...row,
    members: row.members.map((member: any, memberIdx: number) => ({
      ...member,
      ...(lightRows?.[rowIdx]?.members?.[memberIdx] ?? {}),
    })),
  }));

  result.rowsHeaders = meta.rowsHeaders;
  result.rowsDataFields = meta.rowsDataFields;

  // quick stats
  const flat = result.cellData.flat().map((o: any) => o.value as number);
  result.stats.maximum = Math.max(...flat);
  result.stats.minimum = Math.min(...flat);

  // OPTIONAL: fill helpers Zendesk sometimes expects
  result.columnsHeaders = meta.colHierarchies.map((c: any) => c['@_hierarchyDisplayName']);
  result.columnsDataFields = meta.colHierarchies.map((c: any) => c['@_hierarchyName']);
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

export const lighInflatePayload = (skeleton: any, querySchemaB64: string, visualizationType: string) => {
  const meta = parseQuerySchema(querySchemaB64, visualizationType);
  const result = skeleton.content.result;

  const rawColumns = buildColumns(meta, result);
  const cellData = buildCellData(meta, rawColumns);
  const rawRaws = buildRows(meta, cellData.length);

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
  }));

  const rows = rawRaws.map((row) => ({
    ...row,
    members: row.members.map(({ name, displayName, levelDisplayName, attributeName }: any) => ({
      name,
      displayName,
      levelDisplayName,
      attributeName,
    })),
  }));

  return { columns, rows };
};

function parseQuerySchema(querySchema: string, vizType: string, initialPoints?: number) {
  const binary = Uint8Array.from(atob(querySchema.replace(/\n/g, '')), (c) => c.charCodeAt(0));

  const xml = ungzip(binary, { to: 'string' });
  const parsedXml = xmlParser.parse(xml);

  const { Query: query } = parsedXml;

  const { Measures: rawMeasures, Columns: rawColumns, Rows: rawRows, Config } = query;
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
  } else if (getIsGrid(vizType, rowHierarchies.length)) {
    axis = 'category'; // grid -> N col, lo dejamos como antes
  } else if (colHierarchies[0]?.['@_dimensionType'] === 'time') {
    axis = 'time';
    timeInfo = { unit: 'day', points: initialPoints ?? DEFAULT_TIME_POINTS };
  } else {
    axis = 'category';
    categoryInfo = {
      points:
        vizType !== 'barChart' && measures.length > 1
          ? 1
          : initialPoints ?? randInt(MIN_CATEGORY_POINTS, MAX_CATEGORY_POINTS),
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

function fakeValue(m: any, configJson: any) {
  const rnd = (min: number, max: number) => Math.random() * (max - min) + min;
  const { isPercentage, limit } = getMeasureMetadata(m, configJson);
  if (isPercentage) {
    return Number(rnd(0.2, 0.95).toFixed(2));
  }

  switch (m.aggregator) {
    case 'COUNT':
      return Math.round(rnd(10, 500));
    case 'D_COUNT':
      return Math.round(rnd(5, 300));
    case 'SUM':
      return Math.round(rnd(100, limit < 10000 ? limit : 10000));
    case 'AVG':
    case 'MED':
      return Number(rnd(4, 120).toFixed(1));
    default:
      return Math.round(rnd(1, 100));
  }
}

function buildColumns(meta: any, skeleton: any, maxLength?: number) {
  const tpl = skeleton.columns[0]; // original bare column
  const cols: any[] = [];

  if (isKpiLike(meta.vizType)) {
    return [produceColumn(tpl, 'Value', meta.colHierarchies, meta.measures[0])];
  }

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
      const catLabel = `Category ${i + 1}`;
      meta.measures.forEach((m: any) => {
        cols.push(produceColumn(tpl, catLabel, meta.colHierarchies, m));
      });
    }
    return cols;
  }

  meta.measures.forEach((m: any, idx: number) =>
    cols.push(produceColumn(tpl, `<Category ${idx + 1}>`, meta.colHierarchies, m)),
  );

  return cols;
}

function buildRows(meta: any, numberOfRows: number) {
  const rows: any[] = [];

  for (let i = 0; i < numberOfRows; i++) {
    const rowMembers = meta.rowHierarchies.map((h: any) => {
      const value = `${h['@_hierarchyDisplayName']} ${i + 1}`;
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
  const hierarchyMembers = colHierarchies.map((colHierarchy: any) => ({
    name: timeDisplay ?? 'Category',
    isAll: 'false',
    isSubTotal: 'false',
    displayName: timeDisplay ?? 'Category',
    isRepetition: 'false',
    levelDisplayName: colHierarchy['@_hierarchyDisplayName'],
    dataField: colHierarchy['@_dataField'],
    attributeDatafield: colHierarchy['@_dataField'],
    dimensionName: colHierarchy['@_dimension'],
    dimensionType: colHierarchy['@_dimensionType'],
    attributeName: colHierarchy['@_hierarchyName'],
    attributeDisplayName: colHierarchy['@_hierarchyDisplayName'],
  }));

  // merge into a fresh column object
  return {
    ...tpl,
    isAll: false,
    isForecast: false,
    members: [...hierarchyMembers, m],
  };
}

function buildCellData(meta: any, columns: any): any[][] {
  const isGrid = getIsGrid(meta.vizType, meta.rowHierarchies.length);
  const isKpi = isKpiLike(meta.vizType);

  const rows = isGrid ? 10 : 1; // tabla -> varias filas; gráfico -> 1

  const buildRow = () => {
    // kpiChart / autoChart → un solo valor
    if (isKpi) {
      return [{ value: fakeValue(meta.measures[0], meta.configJson) }];
    }

    // simpleGrid2 → 1 celda por measure  (columns.length == measures.length)
    if (isGrid) {
      return meta.measures.map((m: any) => ({ value: fakeValue(m, meta.configJson) }));
    }

    // Resto de charts → 1 celda por columna
    return columns.map((c: any) => {
      const measureMeta = c.members[c.members.length - 1];

      return { value: fakeValue(measureMeta, meta.configJson) };
    });
  };

  return Array.from({ length: rows }, buildRow);
}

function toStr(v: unknown, fallback = '') {
  return typeof v === 'string' ? v : String(v ?? fallback);
}

function isKpiLike(v: string) {
  return ['kpichart', 'autochart'].includes(v.toLowerCase());
}

function getIsGrid(v: string, rows: any) {
  return v === 'simpleGrid2' || (v === 'autoChart' && rows > 1);
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMeasureMetadata(measure: any, configJson: any) {
  const includeInMeasureDisplayFormats = measure.displayNameWithoutAggregator.includes('%');
  const fmt =
    configJson.measureDisplayFormats?.[measure.name] || configJson.measureDisplayFormats?.[measure.displayName] || null;

  const isPercentage = includeInMeasureDisplayFormats || (fmt && fmt.suffix === '%' && Number(fmt.scale) === 0.01);
  const limit = fmt?.limit || 0;

  return { isPercentage, limit };
}
