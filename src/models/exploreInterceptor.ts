import { inflatePayload, lighInflatePayload } from '../lib/exploreInflatePayload';
import ControllerInterpceptor from './controllerInterceptor';
import FetchInterceptor from './fetchInterceptor';
import XHRInterceptor from './xhrInterceptor';

export const EXPLORE_SKELETON = {
  type: 'result',
  content: {
    result: {
      relatedGlobalVariables: [],
      columns: [
        {
          isAll: 0,
          isForecast: 0,
          members: [
            {
              name: '',
              levelName: '',
              levelDisplayName: '',
              dataField: '',
              isAll: '',
              isSubTotal: '',
              attributeDatafield: '',
              displayName: '',
              dimensionName: '',
              dimensionType: '',
              isRepetition: '',
              attributeName: '',
              attributeDisplayName: '',
            },
          ],
        },
      ],
      // configJson: {
      //   appliedFilters: {
      //     displayType: '',
      //     show: 0,
      //     showTopBottom: 0,
      //     showMeasureFilters: 0,
      //     showMeasuresCalculations: 0,
      //     showCalculatedMeasures: 0,
      //     showHideElements: 0,
      //     showOrder: 0,
      //     showTotals: 0,
      //     showSorts: 0,
      //     showGlobalVariables: 0,
      //     showRangeDate: 0,
      //     showSelectedExcluded: 0,
      //     showForecast: 0,
      //     showTimezone: 0,
      //     textColor: '',
      //   },
      //   autoColor: 0,
      //   axes: {
      //     useLogAxis: 0,
      //     hierarchical: 0,
      //     mouseOverGrid: 0,
      //     x: {
      //       grid: 0,
      //       hidden: 0,
      //       interval: null,
      //       label: {
      //         displayFormat: {
      //           decimalSeparator: '',
      //           formula: '',
      //           limit: 0,
      //           precision: 0,
      //           prefix: '',
      //           scale: 0,
      //           suffix: '',
      //           thousandsSeparator: '',
      //           type: '',
      //         },
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //         rotate: {
      //           degrees: 0,
      //         },
      //         textAlign: '',
      //       },
      //       style: {
      //         stroke: '',
      //         strokeWidth: 0,
      //       },
      //       title: {
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //         hidden: 0,
      //         text: null,
      //       },
      //       truncate: 0,
      //     },
      //     y: {
      //       baseAtZero: 0,
      //       grid: 0,
      //       hidden: 0,
      //       interval: null,
      //       label: {
      //         displayFormat: {
      //           decimalSeparator: '',
      //           formula: '',
      //           limit: 0,
      //           precision: 0,
      //           prefix: '',
      //           scale: 0,
      //           suffix: '',
      //           thousandsSeparator: '',
      //           type: '',
      //         },
      //         fill: '',
      //         fontSize: '',
      //         fontStyle: '',
      //         fontWeight: '',
      //         rotate: {
      //           degrees: 0,
      //         },
      //         textAlign: '',
      //       },
      //       shared: 0,
      //       style: {
      //         stroke: '',
      //         strokeWidth: 0,
      //       },
      //       time: 0,
      //       title: {
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //         hidden: 0,
      //         text: '',
      //       },
      //       truncate: 0,
      //     },
      //     dual: {
      //       grid: 0,
      //       hidden: 0,
      //       interval: null,
      //       isColumn: 0,
      //       isLine: 0,
      //       label: {
      //         displayFormat: {
      //           decimalSeparator: '',
      //           formula: '',
      //           limit: 0,
      //           precision: 0,
      //           prefix: '',
      //           scale: 0,
      //           suffix: '',
      //           thousandsSeparator: '',
      //           type: '',
      //         },
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //         rotate: {
      //           degrees: 0,
      //         },
      //         textAlign: '',
      //       },
      //       style: {
      //         stroke: '',
      //         strokeWidth: 0,
      //       },
      //       title: {
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //         hidden: 0,
      //         text: null,
      //       },
      //       truncate: null,
      //     },
      //     multipleList: [
      //       {
      //         grid: 0,
      //         hidden: 0,
      //         interval: null,
      //         isColumn: 0,
      //         isLine: 0,
      //         label: {
      //           displayFormat: {
      //             decimalSeparator: '',
      //             formula: '',
      //             limit: 0,
      //             precision: 0,
      //             prefix: '',
      //             scale: 0,
      //             suffix: '',
      //             thousandsSeparator: '',
      //             type: '',
      //           },
      //           fill: '',
      //           fontSize: '',
      //           fontStyle: '',
      //           fontWeight: '',
      //           rotate: {
      //             degrees: 0,
      //           },
      //         },
      //         style: {
      //           stroke: '',
      //           strokeWidth: 0,
      //         },
      //         title: {
      //           fill: '',
      //           fontSize: 0,
      //           fontStyle: '',
      //           fontWeight: '',
      //           hidden: 0,
      //           text: '',
      //         },
      //         truncate: null,
      //       },
      //     ],
      //   },
      //   backgroundColor: '',
      //   canAnimate: 0,
      //   colors: [],
      //   dateDisplayFormats: {
      //     'timeDimension##guide_user_sessions_ended_at##datewithouttime': '',
      //     'timeDimension##knowledge_capture_created_at##datewithouttime': '',
      //   },
      //   datePeriod: {
      //     fromDate: '',
      //     toDate: '',
      //   },
      //   decomposeOptions: {
      //     type: '',
      //     attributes: [],
      //     path: [],
      //   },
      //   displayAggregator: 0,
      //   doNotReplaceMissingValues: 0,
      //   drillInOptions: {
      //     enabledAttributes: [],
      //     levels: [],
      //     selectedAttributes: [],
      //     needDrillInConfig: 0,
      //     enableAddingAttributes: 0,
      //     enableDrillIn: 0,
      //   },
      //   drillthroughOptions: {
      //     order: [],
      //   },
      //   explosion: {
      //     factor: 0,
      //     hideTitle: 0,
      //     keepRatio: 0,
      //     label: {
      //       fill: '',
      //       fontSize: 0,
      //       fontStyle: '',
      //       fontWeight: '',
      //     },
      //     renames: {},
      //     responsive: 0,
      //   },
      //   gridColor: '',
      //   isExplosion: 0,
      //   interactionsOptions: {
      //     allowDrillIn: 0,
      //     allowDecompose: 0,
      //     allowDrillthrough: 0,
      //     allowFocus: 0,
      //     allowFocusAll: 0,
      //     allowFocusAllOther: 0,
      //     allowRealtimeDrillIn: 0,
      //   },
      //   interpolateValues: 0,
      //   legend: {
      //     isVisible: 0,
      //     inlineTitle: 0,
      //     position: '',
      //     width: 0,
      //     label: {
      //       fill: '',
      //       fontSize: 0,
      //       fontStyle: '',
      //       fontWeight: '',
      //       colorText: null,
      //       sizeText: null,
      //       renamesItems: {
      //         'breachedslapolicies-b80046f5f1 ': '',
      //         'articleslinked-af8afd79a8 ': '',
      //         'articlesflagged-4003e7c3b1 ': '',
      //         'articlescreated-1e6d98d826 ': '',
      //         'knowledgecapturetickets-fac9201dfb ': '',
      //         'knowledgecapturetickets-5b72b30a15 ': '',
      //       },
      //     },
      //     visibilityMode: '',
      //   },
      //   measureDisplayFormats: {
      //     'COUNT(articleslinked-af8afd79a8)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //     'AVG(guide_user_sessions_service_ratio)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //     'SUM(guide_aggregated_page_analytics_total_confirmed_deflections)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //     'SUM(guide_aggregated_page_analytics_total_page_exits)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //     'MED(guide_aggregated_page_analytics_average_view_time)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //     'SUM(guide_aggregated_page_analytics_total_assumed_deflections)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //     'SUM(guide_aggregated_page_analytics_total_tickets)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //     'COUNT(articlesflagged-4003e7c3b1)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //     'COUNT(articlescreated-1e6d98d826)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //     'SUM(knowledgecapturetickets-5b72b30a15)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //     'D_COUNT(knowledgecapturetickets-fac9201dfb)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //     'COUNT(guide_user_sessions_with_any_search)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //     'COUNT(guide_user_sessions_with_quick_answer)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //     'COUNT(guide_user_sessions_without_search)': {
      //       decimalSeparator: '',
      //       formula: '',
      //       limit: 0,
      //       precision: 0,
      //       prefix: '',
      //       scale: 0,
      //       suffix: '',
      //       thousandsSeparator: '',
      //       type: '',
      //     },
      //   },
      //   postProcessing: {
      //     advancedTotals: [],
      //     calculatedMeasures: [],
      //     calculations: {
      //       'COUNT(articleslinked-af8afd79a8)': {
      //         type: '',
      //         pathStrategy: '',
      //         referenceElement: '',
      //         aggregationFunction: '',
      //       },
      //       'D_COUNT(articleslinked-af8afd79a8)': {
      //         type: '',
      //         pathStrategy: '',
      //         referenceElement: '',
      //         aggregationFunction: '',
      //       },
      //       'SUM(guide_aggregated_page_analytics_total_confirmed_deflections)': {
      //         type: '',
      //         pathStrategy: '',
      //         referenceElement: '',
      //         aggregationFunction: '',
      //         startingPoint: '',
      //       },
      //       'SUM(guide_aggregated_page_analytics_total_page_exits)': {
      //         type: '',
      //         pathStrategy: '',
      //         referenceElement: '',
      //         aggregationFunction: '',
      //         startingPoint: '',
      //       },
      //       'MED(guide_aggregated_page_analytics_average_view_time)': {
      //         type: '',
      //         pathStrategy: '',
      //         referenceElement: '',
      //         aggregationFunction: '',
      //         startingPoint: '',
      //       },
      //       'SUM(guide_aggregated_page_analytics_total_assumed_deflections)': {
      //         type: '',
      //         pathStrategy: '',
      //         referenceElement: '',
      //         aggregationFunction: '',
      //         startingPoint: '',
      //       },
      //       'SUM(guide_aggregated_page_analytics_total_tickets)': {
      //         type: '',
      //         pathStrategy: '',
      //         referenceElement: '',
      //         aggregationFunction: '',
      //         startingPoint: '',
      //       },
      //       'COUNT(articlesflagged-4003e7c3b1)': {
      //         type: '',
      //         pathStrategy: '',
      //         referenceElement: '',
      //         aggregationFunction: '',
      //       },
      //       'COUNT(articlescreated-1e6d98d826)': {
      //         type: '',
      //         pathStrategy: '',
      //         referenceElement: '',
      //         aggregationFunction: '',
      //       },
      //       'SUM(knowledgecapturetickets-5b72b30a15)': {
      //         type: '',
      //         pathStrategy: '',
      //         referenceElement: '',
      //         aggregationFunction: '',
      //       },
      //       'D_COUNT(knowledgecapturetickets-fac9201dfb)': {
      //         type: '',
      //         pathStrategy: '',
      //         referenceElement: '',
      //         aggregationFunction: '',
      //       },
      //     },
      //     elementsHiding: {
      //       columns: '',
      //       firstColumns: 0,
      //       firstRows: 0,
      //       lastColumns: 0,
      //       lastRows: 0,
      //       rows: '',
      //     },
      //     forecast: {
      //       isForecastSelected: 0,
      //       pathStrategy: '',
      //       method: '',
      //       autoPeriodCycle: '',
      //       periodCycle: 0,
      //       autoPeriodToPredict: '',
      //       periodToPredict: 0,
      //     },
      //     globalVariables: {},
      //     measureFilters: {
      //       'COUNT(articleslinked-af8afd79a8)': {
      //         lower: 0,
      //         upper: 0,
      //         maximum: 0,
      //         minimum: 0,
      //       },
      //       'D_COUNT(articleslinked-af8afd79a8)': {
      //         lower: 0,
      //         upper: 0,
      //         maximum: 0,
      //         minimum: 0,
      //       },
      //       'SUM(guide_aggregated_page_analytics_total_confirmed_deflections)': {
      //         lower: 0,
      //         upper: 0,
      //         minimum: 0,
      //         maximum: 0,
      //       },
      //       'SUM(guide_aggregated_page_analytics_total_page_exits)': {
      //         lower: 0,
      //         upper: 0,
      //         minimum: 0,
      //         maximum: 0,
      //       },
      //       'MED(guide_aggregated_page_analytics_average_view_time)': {
      //         lower: 0,
      //         upper: 0,
      //         minimum: 0,
      //         maximum: 0,
      //       },
      //       'SUM(guide_aggregated_page_analytics_total_assumed_deflections)': {
      //         lower: 0,
      //         upper: 0,
      //         removeNaNValues: 0,
      //         minimum: 0,
      //         maximum: 0,
      //       },
      //       'SUM(guide_aggregated_page_analytics_total_tickets)': {
      //         lower: 0,
      //         upper: 0,
      //         minimum: 0,
      //         maximum: 0,
      //       },
      //       'COUNT(articlesflagged-4003e7c3b1)': {
      //         lower: 0,
      //         upper: 0,
      //         maximum: 0,
      //         minimum: 0,
      //       },
      //       'COUNT(articlescreated-1e6d98d826)': {
      //         lower: 0,
      //         upper: 0,
      //         maximum: 0,
      //         minimum: 0,
      //       },
      //       'SUM(knowledgecapturetickets-5b72b30a15)': {
      //         lower: 0,
      //         upper: 0,
      //         maximum: 0,
      //         minimum: 0,
      //       },
      //       'D_COUNT(knowledgecapturetickets-fac9201dfb)': {
      //         lower: 0,
      //         upper: 0,
      //         maximum: 0,
      //         minimum: 0,
      //       },
      //     },
      //     measureSortingPattern: {
      //       sortType: '',
      //       sortPath: '',
      //       measureName: null,
      //       attributeDatafield: null,
      //       aggregateValues: 0,
      //       sortTotals: 0,
      //     },
      //     order: [],
      //     sortType: '',
      //     topFilters: {
      //       aggregateFilteredElements: 0,
      //       aggregateValues: 0,
      //       bottom: 0,
      //       isBottomSelected: 0,
      //       isTopSelected: 0,
      //       strategy: '',
      //       top: 0,
      //       measure: '',
      //     },
      //     totals: {
      //       grandTotalsInColumns: 0,
      //       grandTotalsInColumnsAggregator: '',
      //       grandTotalsInRows: 0,
      //       grandTotalsInRowsAggregator: '',
      //       subTotalsInColumns: 0,
      //       subTotalsInColumnsAggregator: '',
      //       subTotalsInRows: 0,
      //       subTotalsInRowsAggregator: '',
      //       visualTotals: 0,
      //       allSubTotals: 0,
      //     },
      //     useTimeAxis: 0,
      //     useSimpleTotals: 0,
      //   },
      //   realtimeDrillIn: {},
      //   rowSelector: {
      //     allowMultiSelection: 0,
      //     colors: {
      //       backgroundHover: '',
      //       backgroundSelected: '',
      //       disabledText: '',
      //       headerText: '',
      //       text: '',
      //     },
      //     isVisible: 0,
      //     limit: {
      //       bypass: 0,
      //       isRemembered: 0,
      //       selectAll: 0,
      //     },
      //     numberOfListByColumn: 0,
      //     position: '',
      //     selectedPosition: '',
      //     selectedString: '',
      //     type: '',
      //     width: 0,
      //   },
      //   sqlOptions: {
      //     arrayMaxLength: '',
      //     havingClause: '',
      //     orderByClause: '',
      //     limitClause: '',
      //     replaceNullBy: '',
      //     useGroupEachBy: 0,
      //   },
      //   connectorOptions: {},
      //   series: {
      //     aggregateValueStacked: 0,
      //     bubble: {
      //       fill: '',
      //       radius: 0,
      //       stroke: '',
      //       'stroke-width': 0,
      //       type: '',
      //     },
      //     bullet: {
      //       arrayColorRange: [],
      //       colorRange: '',
      //       colorRangeType: '',
      //       elementSizeValue: 0,
      //       labelWidth: 0,
      //       rangeMaxValue: '',
      //       rangeMinValue: '',
      //       rangeType: '',
      //       ranges: [],
      //       targetConstantValue: null,
      //       useTargetConstant: 0,
      //     },
      //     colorEncoding: {
      //       field: '',
      //       firstStop: 0,
      //       secondStop: null,
      //       type: '',
      //       mode: '',
      //       from: '',
      //       to: '',
      //       min: null,
      //       max: null,
      //     },
      //     datatip: {
      //       background: '',
      //       lineColor: '',
      //       mode: '',
      //       rectangleColor: '',
      //       text: '',
      //       showTooltip: 0,
      //     },
      //     dualLabel: {
      //       display: '',
      //       fill: '',
      //       fontSize: 0,
      //       fontStyle: '',
      //       fontWeight: '',
      //       hideCollision: 0,
      //       lineColor: '',
      //       position: '',
      //       rendererType: '',
      //       rotation: 0,
      //       suffix: '',
      //       precision: '',
      //       percentagePrecision: 0,
      //       textAlign: '',
      //     },
      //     funnel: {
      //       displayColorLegend: 0,
      //       labelFormat: '',
      //       labelPosition: '',
      //       labelElements: '',
      //       percentMethode: '',
      //       proportion: '',
      //     },
      //     gauge: {
      //       colorBackround: '',
      //       headerStyle: {
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //       },
      //       valuesStyle: {
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //       },
      //       valuesFormat: '',
      //       gaugeColorBgAuto: 0,
      //       gaugeNeedleColor: '',
      //       gaugeTargetColor: '',
      //       gaugeRingColor: '',
      //       gaugeTextColor: '',
      //       fullGaugeRingColor: '',
      //       fullGaugeRemainColor: '',
      //       moreThan100: 0,
      //       theme: '',
      //       headerTextColor: '',
      //     },
      //     gradient: 0,
      //     kpi: {
      //       adjustLayoutInDashboard: 0,
      //       baseAtZero: 0,
      //       showZeroAxis: 0,
      //       zeroAxisColor: '',
      //       decreaseColor: '',
      //       hideLabel: 0,
      //       htmlText: '',
      //       increaseColor: '',
      //       columnColor: '',
      //       lineColor: '',
      //       label: '',
      //       chartOpacity: 0,
      //       chartColor: '',
      //       chartHeight: 0,
      //       hideInfinity: 0,
      //       lastPointColor: '',
      //       maxPointColor: '',
      //       minPointColor: '',
      //       measureLabel: {
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //         textAlign: '',
      //       },
      //       measureValue: {
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //         textAlign: '',
      //       },
      //       secondMeasureValue: {
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //         textAlign: '',
      //       },
      //       showPercentageVariation: 0,
      //       showTooltip: 0,
      //       showChart: 0,
      //       showMinMaxLast: 0,
      //       showMinMaxRendererType: '',
      //       valueType: '',
      //       variationType: '',
      //       selectedVariationKey: '',
      //       visualizationType: '',
      //       url: '',
      //       variation_decimal_place: 0,
      //     },
      //     label: {
      //       display: '',
      //       fill: '',
      //       fontSize: '',
      //       fontStyle: '',
      //       fontWeight: '',
      //       hideCollision: 0,
      //       lineColor: '',
      //       position: '',
      //       rendererType: '',
      //       rotation: 0,
      //       suffix: '',
      //       precision: '',
      //       percentagePrecision: 0,
      //       textAlign: '',
      //     },
      //     line: {
      //       lastPointColor: '',
      //       maxPointColor: '',
      //       minPointColor: '',
      //       pointRendererRadius: 0,
      //       strokeWidth: 0,
      //     },
      //     opacity: 0,
      //     parallelSets: {
      //       curve: 0,
      //       dimension: {
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //         textAlign: '',
      //       },
      //       category: {
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //         textAlign: '',
      //       },
      //       lineColor: '',
      //     },
      //     percentageValueStacked: 0,
      //     pie: {
      //       combinedMeasure: 0,
      //       donut: 0,
      //       explode: 0,
      //       explodeType: '',
      //       showTotal: 0,
      //       labelEllipsis: 0,
      //       labelElements: '',
      //       labelPosition: '',
      //       labelFormat: '',
      //       displayColorLegend: 0,
      //       displayPieLegend: 0,
      //     },
      //     pointRenderer: '',
      //     radar: {
      //       axes: {
      //         hidden: 0,
      //         label: {
      //           fill: '',
      //           fontSize: 0,
      //           fontStyle: '',
      //           fontWeight: '',
      //         },
      //         style: {
      //           stroke: '',
      //           strokeWidth: 0,
      //         },
      //         title: {
      //           fill: '',
      //           fontSize: 0,
      //           fontStyle: '',
      //           fontWeight: '',
      //           text: null,
      //         },
      //       },
      //       chartOpacity: 0,
      //       mode: '',
      //       sharedAxis: 0,
      //       showLevels: 0,
      //       showVertices: 0,
      //       strokeWidth: 0,
      //     },
      //     relational: {
      //       cartesianOrientation: '',
      //       circleColor: '',
      //       encodeIntermediatesNodes: 0,
      //       labelColor: '',
      //       layout: '',
      //       linkColor: '',
      //       linkRenderer: '',
      //       nodeRenderer: '',
      //       nodeSize: 0,
      //       rendererType: '',
      //     },
      //     simpleGrid: {
      //       alternatingRowColors: [],
      //       colorSizeEncoding: '',
      //       columnAlignAuto: 0,
      //       clickableURL: 0,
      //       cellHeight: 0,
      //       fontSize: 0,
      //       fitToContent: 0,
      //       header: {
      //         backgroundColor: '',
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //         isHidden: 0,
      //       },
      //       renames: {
      //         'Average time on page (sec)': '',
      //       },
      //       rowHeader: {
      //         backgroundColor: '',
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //         isHidden: 0,
      //       },
      //       measuresOnRows: 0,
      //       moreLessLine: 0,
      //       multilinePadding: 0,
      //       gridColor: '',
      //       showImage: 0,
      //       imageHeight: 0,
      //       imageWidth: 0,
      //       rowMoreLine: [],
      //       showJsonTag: 0,
      //       sortRowNumber: 0,
      //       sort: {
      //         allow: 0,
      //         columnIndex: 0,
      //         direction: 0,
      //       },
      //       subtotal: {
      //         backgroundColor: '',
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //       },
      //       subtotalLabel: '',
      //       subtotalRepetition: '',
      //       responsiveColumns: 0,
      //       text: {
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //       },
      //       textMonospace: 0,
      //       textInterpretation: '',
      //       total: {
      //         backgroundColor: '',
      //         fill: '',
      //         fontSize: 0,
      //         fontStyle: '',
      //         fontWeight: '',
      //       },
      //       totalLabel: '',
      //       totalRepetition: '',
      //       urlAlias: '',
      //       urlImageAlias: '',
      //       columnWidthList: [],
      //       columnVisibilityList: [],
      //       columnArrowVisibilityList: [],
      //       columnAlignList: [],
      //       allowMultiline: 0,
      //     },
      //     sizeEncoding: {
      //       from: 0,
      //       to: 0,
      //     },
      //     sparkline: {
      //       lastPointColor: '',
      //       maxPointColor: '',
      //       minPointColor: '',
      //       lowColor: '',
      //       lastColor: '',
      //       highColor: '',
      //       textColor: '',
      //       headerTextColor: '',
      //       chartOpacity: 0,
      //       chartColor: '',
      //       alternatingRowColors: [],
      //       bandlinesColors: [],
      //       renames: {},
      //       showBandlines: 0,
      //       showChartColumn: 0,
      //       showHighColumn: 0,
      //       showLastColumn: 0,
      //       showLowColumn: 0,
      //       showMinMaxLast: 0,
      //       showTrendColumn: 0,
      //       showSpreadColumn: 0,
      //       visualizationType: '',
      //     },
      //     smooth: 0,
      //     stacked: 0,
      //     totalValueStacked: 0,
      //     titles: [],
      //     treemap: {
      //       color: '',
      //       treemapColor: '',
      //       treemapHeaderColor: '',
      //       treemapTextColor: '',
      //       treemapHeaderTextColor: '',
      //       layout: '',
      //       hierarchyTreemap: 0,
      //     },
      //     sunburst: {
      //       encodeIntermediatesArea: 0,
      //     },
      //     trend: {
      //       constantColor: '',
      //       degree: 0,
      //       hideSerie: 0,
      //       showValue: 0,
      //       type: '',
      //       value: null,
      //       xValue: null,
      //       showXTrend: 0,
      //     },
      //     waterfall: {
      //       connectingBars: 0,
      //       decreaseColor: '',
      //       hideTotalBar: 0,
      //       increaseColor: '',
      //       linkColor: '',
      //       neutralColor: '',
      //       totalName: '',
      //     },
      //     wordCloud: {
      //       minIncline: 0,
      //       maxIncline: 0,
      //       orientationNumber: 0,
      //       spiral: '',
      //       scale: '',
      //       color: '',
      //       useRandom: 0,
      //       minSize: 0,
      //       maxSize: 0,
      //       padding: 0,
      //     },
      //     circlePack: {
      //       nodeColor: '',
      //       leafColor: '',
      //       isFlattened: 0,
      //       sort: '',
      //     },
      //     chord: {
      //       padding: 0,
      //       strokeColor: '',
      //       subGroupOrder: '',
      //       thickness: 0,
      //     },
      //     picto: {
      //       autoScale: 0,
      //       pictogram: '',
      //       pictoMargin: 0,
      //     },
      //   },
      //   skipRowSelectorInColorCacheManager: 0,
      //   tooltip: {
      //     backgroundColor: '',
      //     borderColor: '',
      //     borderRadius: 0,
      //     borderStyle: '',
      //     borderWidth: 0,
      //     color: '',
      //     fontFamily: '',
      //     hr: {
      //       borderTopColor: '',
      //       borderTopStyle: '',
      //       borderTopWidth: 0,
      //     },
      //     opacity: 0,
      //   },
      //   hideLimitMessage: 0,
      //   thresholds: [],
      //   visuSelectorList: [],
      //   colorRefFieldsList: [],
      //   colorPalette: [],
      //   explosionColorFieldsList: [],
      //   colorFieldsList: [],
      // },
      config: {},
      measureDataFieldToDisplayFormat: {
        'talk.agentsOnline.global': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'ask.talk.away': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'talk.callsInQueue.global': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'talk.callbacksInQueue.global': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'Longest wait time (min)': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'ask.talk.offline': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'talk.averageWaitTime.global': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'talk.liveCalls.global': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'talk.maxWaitTime.global': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'ask.talk.online': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'ask.talk.transfer': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
        'Average wait time (min)': {
          type: 'standard',
          precision: 0,
          limit: 1000,
          prefix: '',
          suffix: '',
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          scale: 1,
          formula: '',
        },
      },
      rows: [
        {
          isAll: 0,
          isForecast: 0,
          members: [
            {
              name: 'row all',
              levelName: 'row all',
              levelDisplayName: '',
              dataField: 'row all',
              isAll: 'false',
              isSubTotal: 'false',
              attributeDatafield: null,
              displayName: 'row all',
              dimensionName: 'row all',
              dimensionType: 'standard',
              isRepetition: 'false',
              attributeName: 'row all',
              attributeDisplayName: '',
            },
          ],
        },
      ],
      measures: [
        {
          aggregationType: '',
          position: '',
          originalMeasure: '',
          displayName: '',
          aggregator: '',
          levelName: '',
          levelDisplayName: '',
          uniqueName: '',
          name: '',
          displayNameWithoutAggregator: '',
          isMeasure: '',
          dataField: '',
        },
      ],
      columnsHeaders: [],
      columnsDataFields: [],
      explosionsHeaders: [],
      explosionsHierarchyXML: [],
      rowsHeaders: [],
      rowsDataFields: [],
      rowsRelatedObjects: [],
      columnsHierarchyXML: [],
      rowsHierarchyXML: [],
      cellData: [],
      stats: {
        maximum: 0,
        minimum: 0,
        isExplosion: 0,
        minMaxColors: [],
        colors: [],
        gradientColor: 0,
        measureNameToMinMaxValues: {},
      },
      warningMessage: '',
      warningMessages: [],
      mongodbAggregations: [],
      bubblingValues: {
        global: {},
        perProfile: [],
      },
      sqlQueries: [],
      filters: [
        {
          type: '',
          shortDescription: '',
          longDescription: '',
        },
      ],
      uuid: '',
      queryId: '',
      cubeModelId: '',
      allDataFields: [],
    },
    queryId: null,
  },
  isSuccess: true,
  uuid: '',
};

class ExploreInterceptor {
  #currentDashboard: any;
  #xhrInterceptor: XHRInterceptor | null;
  #fetchInterceptor: FetchInterceptor | null;

  constructor() {
    this.#xhrInterceptor = null;
    this.#fetchInterceptor = null;
  }

  intercept(configurationDashboards?: any[], dashboards?: any) {
    this.#xhrInterceptor = new XHRInterceptor();
    this.#fetchInterceptor = new FetchInterceptor();

    const handleDashboard = (response: any) => {
      this.#currentDashboard = this.#parseDashboard(response);
    };

    this.#xhrInterceptor.setConditionTarget((url) => {
      return ExploreInterceptor.isDashboardBimeo(url);
    });

    this.#xhrInterceptor.startIntercept((response) => {
      handleDashboard(response);
      return response;
    });

    this.#fetchInterceptor.startIntercept(async (url, response, requestBody) => {
      const clone = response.clone();
      const json = await clone.json();

      if (ExploreInterceptor.isDashboardFromZendesk(url)) {
        const dashboard = json.data.user.dashboards.edges[0].node.publishedVersionFrontJson;
        handleDashboard(dashboard);
      }

      if (ExploreInterceptor.isExploreQuery(url)) {
        const queryId = json.content.queryId || json.queryId;

        const activeDashboard = ControllerInterpceptor.findActiveDashboard(
          configurationDashboards,
          dashboards,
          this.#currentDashboard,
        );

        if (!activeDashboard) {
          return response;
        }

        const tabId = requestBody?.content?.tabId;
        const currentTab = this.#currentDashboard.tabs.find((tab: any) =>
          tabId ? tab.id === tabId : tab.queries[queryId],
        );
        const query = currentTab?.queries[queryId];
        const { querySchema, visualizationType, cubeModelId } = query;

        try {
          const isLive = activeDashboard.isLive ?? false;

          const lightInfaltePayload = !isLive
            ? activeDashboard?.tabs.find((tab: any) => tab.id === currentTab.id).queries[queryId].payload
            : null;

          const payload = inflatePayload(EXPLORE_SKELETON, querySchema, visualizationType, lightInfaltePayload);

          const newJson = {
            isSuccess: true,
            type: 'result',
            uuid: json.uuid,
            content: {
              result: { ...payload, uuid: json.uuid, queryId: String(queryId), cubeModelId },
              queryId,
            },
          };

          return new Response(JSON.stringify(newJson), {
            status: response.status,
            statusText: response.statusText,
            headers: {
              ...Object.fromEntries(response.headers.entries()),
              'content-type': 'application/json',
            },
          });
        } catch (error) {
          console.log('===ERROR===', error);
        }
      }

      return response;
    });
  }

  reset() {
    if (!this.#fetchInterceptor || !this.#xhrInterceptor) return;

    this.#currentDashboard = null;
    this.#fetchInterceptor.reset();
    this.#xhrInterceptor.reset();
  }

  getCurrentDashboard() {
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        const tabs = this.#currentDashboard?.tabs ?? [];
        const totalQueries = tabs.flatMap((tab: any) => Object.values(tab.queries));
        const isComplete = totalQueries.length ? totalQueries.every((query: any) => query?.completed) : false;

        if (isComplete) {
          clearInterval(intervalId);
          resolve(this.#currentDashboard);
        }
      }, 200);
    });
  }

  #parseDashboard(dashboard: any) {
    const { mainTag, queries: rawQueries, tabs } = dashboard;

    return {
      id: mainTag.guid,
      type: ExploreInterceptor.getDashboardType(),
      tabs: tabs.map((tab: any) => {
        const { id, name, name_translation_key, widgets: rawWidgets, tag_id: tagId } = tab;
        const queries = rawWidgets
          .filter((widget: any) => widget.query_id)
          .reduce((prev: any, current: any) => {
            const currentQuery = rawQueries.find((item: any) => item.id === current.query_id);
            const payload = lighInflatePayload(
              EXPLORE_SKELETON,
              currentQuery.query_schema,
              currentQuery.visualization_type,
            );
            return {
              ...prev,
              [currentQuery.id]: {
                visualizationType: currentQuery.visualization_type,
                description: currentQuery.description,
                completed: true,
                querySchema: currentQuery.query_schema,
                title: current.title ?? currentQuery.description,
                cubeModelId: String(currentQuery.cube_model_id),
                payload,
              },
            };
          }, {});

        return {
          id,
          tagId,
          name: name ?? name_translation_key?.split('_').at(-2),
          queries,
        };
      }),
    };
  }

  static getDashboardType() {
    return 'explore';
  }

  static isExploreQuery(url: string) {
    const exploreQueries = [
      /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/explore-fast\/api\/v2\/viewer\/dashboard\/query$/,
      /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/explore-realtime-fast\/api\/v2\/viewer\/dashboard\/query$/,
    ];
    return exploreQueries.some((regex) => regex.test(url));
  }

  static isDashboardBimeo(rawUrl: string) {
    const url = new URL(rawUrl);

    return url.hostname.endsWith('.amazonaws.com') && /^\/studio\/cache\/[^/]+\/front\.json$/.test(url.pathname);
  }

  static isDashboardFromZendesk(url: string) {
    return /^https:\/\/([a-zA-Z0-9-]+\.)?zendesk\.com\/explore\/graphql\?PublishedDashboardQuery/.test(url);
  }
}

export default ExploreInterceptor;
