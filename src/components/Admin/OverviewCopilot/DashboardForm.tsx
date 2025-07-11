import { SUPPORT_SKELETON } from '@/models/adminInterceptor';
import { Field, Input, Toggle } from '@zendeskgarden/react-forms';
import { LG, MD, SM } from '@zendeskgarden/react-typography';
import styled, { useTheme } from 'styled-components';
import { useState } from 'react';
import { Button } from '@zendeskgarden/react-buttons';
import AddRecomendation from './Recommendations/AddRecommendation';
import RecommendationItem from './Recommendations/RecommendationItem';
import { Table } from '@zendeskgarden/react-tables';
import ArrowTrendingIcon from '@zendeskgarden/svg-icons/src/16/arrow-trending-stroke.svg?react';

type Props = {
  footer: JSX.Element;
  onSubmit: (values: any) => void;
  currentDashboard: any;
  initialValues?: any;
};

const DEFAULT_INITIAL_VALUES = {
  metrics: SUPPORT_SKELETON.adminAiCenterMetrics.aiUsageMetrics,
  recommendations: [],
};

const OverviewCopilotForm = ({
  footer,
  onSubmit,
  currentDashboard = {},
  initialValues = DEFAULT_INITIAL_VALUES,
}: Props) => {
  const initialSetupTasks = currentDashboard?.setupTasks.reduce(
    (prev: any, item: any) => ({
      ...prev,
      [item.id]: item.dismissed,
    }),
    {},
  );
  const [values, setValues] = useState<any>({ setupTasks: initialSetupTasks, ...initialValues });
  const [showAddRecommendation, setShowAddRecommendation] = useState(false);

  const theme = useTheme();

  const getSectionsLabelName = (section: string) => {
    switch (section) {
      case 'ticketsCountWithAIRules':
        return 'Tickets automated with intelligent triage';
      case 'ticketsCountWithAutoAssist':
        return 'Tickets with auto assist';
      case 'agentsCountUsingAISuggestions':
        return 'Agents using agent copilot';
      case 'ticketsCountWithAISuggestions':
        return 'Tickets with agent copilot';
      default:
        return '';
    }
  };

  const getSetupTaskLabel = (id: string) => {
    const name = id.split('+').at(-1);
    switch (name) {
      case 'intro':
        return 'Intro to AI features';
      case 'auto_assist':
        return 'Setup auto assist';
      case 'entities':
        return 'Add entities';
      case 'intents':
        return 'Start using intents';
      default:
        return name;
    }
  };

  const handleUpdateMetrics = (section: any) => {
    setValues((prev: any) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        ...section,
      },
    }));
  };

  const handleAddRecommendation = (recommendation: any) => {
    setValues((prev: any) => ({
      ...prev,
      recommendations: [...prev.recommendations, recommendation],
    }));
    setShowAddRecommendation(false);
  };

  const handleEditRecommendation = (recommendation: any) => {
    setValues((prev: any) => ({
      ...prev,
      recommendations: prev.recommendations.map((item: any) => (item.id === recommendation.id ? recommendation : item)),
    }));
  };

  const handleRemoveRecommendation = (id: string) => {
    setValues((prev: any) => ({
      ...prev,
      recommendations: prev.recommendations.filter((item: any) => item.id !== id),
    }));
  };

  const handleDismissSetupTask = (id: string) => {
    setValues((prev: any) => ({
      ...prev,
      setupTasks: {
        ...prev.setupTasks,
        [id]: !prev.setupTasks[id],
      },
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Section>
        <header>
          <Subtitle>Setup tasks</Subtitle>
          <SM style={{ color: theme.palette.grey[600] }}>
            Dismissed the getting started setup tasks. (This will be the <b>initial state</b> always you enter the view)
          </SM>
        </header>
        <SetupTasksList>
          {Object.entries(values.setupTasks)?.map(([id, value]: any) => {
            return (
              <li key={id}>
                <Field>
                  <Toggle checked={value} onChange={() => handleDismissSetupTask(id)}>
                    <Field.Label>{getSetupTaskLabel(id)}</Field.Label>
                  </Toggle>
                </Field>
              </li>
            );
          })}
        </SetupTasksList>
      </Section>
      <Section>
        <Subtitle>Metrics</Subtitle>
        <Table>
          <Table.Head>
            <Table.HeaderRow>
              <Table.HeaderCell>Metric</Table.HeaderCell>
              <Table.HeaderCell width={120}>Current Value</Table.HeaderCell>
              <Table.HeaderCell width={120}>Historic Value</Table.HeaderCell>
              <Table.HeaderCell width={72}>Trend</Table.HeaderCell>
            </Table.HeaderRow>
          </Table.Head>
          <Table.Body>
            {Object.entries(values.metrics).flatMap(([section, item]: any) => {
              const isUpTrend = item.currentValue > item.historicalValue;
              const percentage = ((item.currentValue - item.historicalValue) / item.historicalValue) * 100;
              return (
                <Table.Row key={section}>
                  <Table.Cell>{getSectionsLabelName(section)}</Table.Cell>
                  {Object.entries(item).map(([metric, value]: any) => {
                    return (
                      <Table.Cell key={`${section}-${metric}`}>
                        <Input
                          value={value}
                          type="number"
                          onChange={(e) =>
                            handleUpdateMetrics({
                              [section]: {
                                ...item,
                                [metric]: e.target.value,
                              },
                            })
                          }
                        />
                      </Table.Cell>
                    );
                  })}
                  <Table.Cell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                      <ArrowTrendingIcon
                        style={{
                          color: isUpTrend ? 'green' : 'red',
                          transform: !isUpTrend ? 'rotate(180deg)' : '',
                        }}
                      />
                      <SM style={{ color: isUpTrend ? 'green' : 'red' }} tag="span">
                        {Math.round(Math.abs(percentage))}%
                      </SM>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </Section>
      <Section>
        <Subtitle>Recomendations</Subtitle>
        <div style={{ margin: '12px 0px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {values.recommendations.map((item: any) => {
            return (
              <RecommendationItem
                key={item.id}
                onEdit={handleEditRecommendation}
                onRemove={handleRemoveRecommendation}
                recommendation={item}
              />
            );
          })}
          {showAddRecommendation ? (
            <AddRecomendation onSubmit={handleAddRecommendation} onCancel={() => setShowAddRecommendation(false)} />
          ) : (
            <Button
              type="button"
              style={{ flex: 1, borderStyle: 'dashed' }}
              onClick={() => setShowAddRecommendation(true)}
            >
              Add new recommendation
            </Button>
          )}
        </div>
      </Section>
      {footer}
    </Form>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Subtitle = styled(LG)`
  font-weight: ${(props) => props.theme.fontWeights.bold};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 12px;
`;

const SetupTasksList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 14px 0px 0px 0px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export default OverviewCopilotForm;
