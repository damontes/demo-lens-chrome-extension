import { SUPPORT_SKELETON } from '@/models/adminInterceptor';
import { Input } from '@zendeskgarden/react-forms';
import { LG, SM } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import { useState } from 'react';
import { Button } from '@zendeskgarden/react-buttons';
import AddRecomendation from './Recommendations/AddRecommendation';
import RecommendationItem from './Recommendations/RecommendationItem';
import { Table } from '@zendeskgarden/react-tables';
import ArrowTrendingIcon from '@zendeskgarden/svg-icons/src/16/arrow-trending-stroke.svg?react';

type Props = {
  footer: JSX.Element;
  initialValues?: any;
  onSubmit: (values: any) => void;
  currentDashboard?: any;
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
  const [values, setValues] = useState<any>(initialValues);
  const [showAddRecommendation, setShowAddRecommendation] = useState(false);

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

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Form onSubmit={handleSubmit}>
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
                groups={currentDashboard.groups}
                intents={currentDashboard.intents}
                assignees={currentDashboard.assignees}
                onEdit={handleEditRecommendation}
                onRemove={handleRemoveRecommendation}
                recommendation={item}
              />
            );
          })}
          {showAddRecommendation ? (
            <AddRecomendation
              groups={currentDashboard.groups}
              intents={currentDashboard.intents}
              assignees={currentDashboard.assignees}
              onSubmit={handleAddRecommendation}
              onCancel={() => setShowAddRecommendation(false)}
            />
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

export default OverviewCopilotForm;
