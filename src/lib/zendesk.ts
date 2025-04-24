import { ungzip } from 'pako';
import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser({ ignoreAttributes: false });

const DEFAULT_HIERARCHY = {
  '@_hierarchyName': 'column all',
  '@_hierarchyDisplayName': '',
  '@_dimension': 'column all',
  '@_dimensionType': 'standard',
  '@_dataField': 'column all',
  '@_isTime': 'false',
};
const MIN_TIME_POINTS = 10; // > 10 columnas
const DEFAULT_TIME_POINTS = 12; // usado si no se indica
const MIN_CATEGORY_POINTS = 3; // 3-5 columnas
const MAX_CATEGORY_POINTS = 5;

export const inflatePayload = (skeleton: any, querySchemaB64: string, visualizationType: string) => {
  const meta = parseQuerySchema(querySchemaB64, visualizationType);
  const result = skeleton.content.result;

  result.columns = buildColumns(meta, result);
  result.cellData = buildCellData(meta, result.columns);
  // quick stats
  const flat = result.cellData.flat().map((o: any) => o.value as number);
  result.stats.maximum = Math.max(...flat);
  result.stats.minimum = Math.min(...flat);

  // OPTIONAL: fill helpers Zendesk sometimes expects
  result.columnsHeaders = result.columns.map((c: any) => c.members[0].displayName);
  result.columnsDataFields = meta.measures.map((m) => m.dataField);

  return { ...result, measures: meta.measures, configJson: meta.configJson };
};

function parseQuerySchema(querySchema: string, vizType: string) {
  const binary = Uint8Array.from(atob(querySchema.replace(/\n/g, '')), (c) => c.charCodeAt(0));

  const xml = ungzip(binary, { to: 'string' });
  const parsedXml = xmlParser.parse(xml);
  const { Query: query } = parsedXml;
  const { Measures: rawMeasures, Columns: rawColumns, Config } = query;
  const colHierarchy = rawColumns.Hierarchy || DEFAULT_HIERARCHY;

  const measures = [].concat(rawMeasures.Measure).map((m: any) => {
    const agg = m['@_aggregationType']?.toUpperCase() ?? 'SUM';
    const name = `${agg}(${m['@_dataField']})`;
    const disp = toStr(m?.['@_displayName'], name);
    return {
      aggregationType: agg,
      position: m['@_position'] ?? 'normal',
      originalMeasure: name,
      displayName: disp,
      aggregator: agg,
      levelName: 'Measures',
      levelDisplayName: 'Measures',
      uniqueName: `[Measures].[Measures].[Measures].[${name}]`,
      name,
      displayNameWithoutAggregator: disp.replace(/^([A-Z_]+)\(/, '').replace(/\)$/, ''),
      isMeasure: 'true',
      dataField: m['@_dataField'],
    };
  });

  const hierarchyMeta = {
    levelName: colHierarchy['@_hierarchyName'],
    levelDisplayName: colHierarchy['@_hierarchyDisplayName'],
    dataField: colHierarchy['@_dataField'],
    attributeDatafield: colHierarchy['@_dimension'],
    dimensionName: colHierarchy['@_dimension'],
    dimensionType: colHierarchy['@_dimensionType'],
    attributeName: colHierarchy['@_hierarchyName'],
    attributeDisplayName: colHierarchy['@_hierarchyDisplayName'],
  };

  // const isTimeSeries = colHier?.['@_dimensionType'] === 'time';
  let axis: 'time' | 'category';
  let timeInfo: { unit: string; points: number } | undefined;
  let categoryInfo: { points: number } | undefined;

  if (isKpiLike(vizType)) {
    axis = 'category'; // 1 col
  } else if (isGrid(vizType)) {
    axis = 'category'; // grid -> N col, lo dejamos como antes
  } else if (colHierarchy?.['@_dimensionType'] === 'time') {
    axis = 'time';
    timeInfo = { unit: 'day', points: DEFAULT_TIME_POINTS };
  } else {
    // 👉 charts “category” normales
    axis = 'category';
    categoryInfo = { points: randInt(MIN_CATEGORY_POINTS, MAX_CATEGORY_POINTS) };
  }

  const configJson = JSON.parse(atob(Config['@_json']));

  return { vizType, measures, axis, timeInfo, configJson, hierarchyMeta, categoryInfo };
}

function fakeValue(m: any) {
  const pctLike = /percent|ratio|rate|_pct|score/i.test(m.display);
  const rnd = (min: number, max: number) => Math.random() * (max - min) + min;

  switch (m.aggregator) {
    case 'COUNT':
      return Math.round(rnd(10, 500));
    case 'D_COUNT':
      return Math.round(rnd(5, 300));
    case 'SUM':
      return Math.round(rnd(100, 10000));
    case 'AVG':
    case 'MED':
      return pctLike
        ? Number(rnd(0.2, 0.95).toFixed(2)) // % style
        : Number(rnd(4, 120).toFixed(1)); // plain avg
    default:
      return Math.round(rnd(1, 100));
  }
}

function buildColumns(meta: any, skeleton: any) {
  const tpl = skeleton.columns[0]; // original bare column
  const cols: any[] = [];

  if (isKpiLike(meta.vizType)) {
    return [produceColumn(tpl, 'Value', meta.hierarchyMeta, meta.measures[0])];
  }

  if (meta.axis === 'time' && meta.timeInfo) {
    const pts = Math.max(meta.timeInfo.points, MIN_TIME_POINTS);

    for (let i = pts - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateLabel = d.toISOString().slice(0, 10); // YYYY-MM-DD

      meta.measures.forEach((m: any) => {
        cols.push(produceColumn(tpl, dateLabel, meta.hierarchyMeta, m));
      });
    }
    return cols;
  }
  // ─ category – just reuse the template per measure
  if (meta.axis === 'category' && meta.categoryInfo) {
    for (let i = 0; i < meta.categoryInfo.points; i++) {
      const catLabel = `Category ${i + 1}`;
      meta.measures.forEach((m: any) => {
        cols.push(produceColumn(tpl, catLabel, meta.hierarchyMeta, m));
      });
    }
    return cols;
  }

  // simpleGrid2 (sigue igual: 1 columna por medida)
  meta.measures.forEach((m: any, idx: number) =>
    cols.push(produceColumn(tpl, `<Category ${idx + 1}>`, meta.hierarchyMeta, m)),
  );

  return cols;
}

function produceColumn(
  tpl: any,
  timeDisplay: string,
  h: any, // hierarchy meta
  m: any, // measure meta
) {
  // ---- member #1  (hierarchy / time) ----
  const hierarchyMember = {
    name: timeDisplay ?? 'Category',
    levelName: h.levelName,
    levelDisplayName: h.levelDisplayName,
    dataField: h.dataField,
    isAll: 'false',
    isSubTotal: 'false',
    attributeDatafield: h.attributeDatafield,
    displayName: timeDisplay ?? 'Category',
    dimensionName: h.dimensionName,
    dimensionType: h.dimensionType,
    isRepetition: 'false',
    attributeName: h.attributeName,
    attributeDisplayName: h.attributeDisplayName,
  };

  // merge into a fresh column object
  return {
    ...tpl,
    isAll: 0,
    isForecast: 0,
    members: [hierarchyMember, m],
  };
}

function buildCellData(meta: any, columns: any): any[][] {
  const isGrid = meta.vizType.toLowerCase().includes('grid');
  const isKpi = isKpiLike(meta.vizType);

  const rows = isGrid ? 4 : 1; // tabla -> varias filas; gráfico -> 1

  const buildRow = () => {
    // kpiChart / autoChart → un solo valor
    if (isKpi) {
      return [{ value: fakeValue(meta.measures[0]) }];
    }

    // simpleGrid2 → 1 celda por measure  (columns.length == measures.length)
    if (isGrid) {
      return meta.measures.map((m: any) => ({ value: fakeValue(m) }));
    }

    // Resto de charts → 1 celda por columna
    return columns.map((c: any) => {
      const measureMeta = c.members[1]; // el measure asociado a la columna
      return { value: fakeValue(measureMeta) };
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

function isGrid(v: string) {
  return v.toLowerCase() === 'simpleGrid2';
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
