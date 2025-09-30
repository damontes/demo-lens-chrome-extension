import { Field, Input, Toggle } from '@zendeskgarden/react-forms';
import { LG, SM } from '@zendeskgarden/react-typography';
import styled, { useTheme } from 'styled-components';
import { useState } from 'react';
import { Button } from '@zendeskgarden/react-buttons';
import AddRecomendation from './Recommendations/AddRecommendation';
import RecommendationItem from './Recommendations/RecommendationItem';
import AIRecommendationGenerator from './Recommendations/AIRecommendationGenerator';
import { Table } from '@zendeskgarden/react-tables';
import ArrowTrendingIcon from '@zendeskgarden/svg-icons/src/16/arrow-trending-stroke.svg?react';
import SparkleIcon from '@zendeskgarden/svg-icons/src/16/sparkle-stroke.svg?react';
import { useFormContext } from 'react-hook-form';

const OverviewCopilotForm = () => {
  const { watch, setValue } = useFormContext();
  const [showAddRecommendation, setShowAddRecommendation] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const theme = useTheme();

  const overviewCopilot = watch('overviewCopilot');

  // Get current industry from form context
  const currentIndustry = watch('industry');

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
    setValue('overviewCopilot.metrics', {
      ...overviewCopilot?.metrics,
      ...section,
    });
  };

  const handleAddRecommendation = (recommendation: any) => {
    setValue('overviewCopilot.recommendations', [...(overviewCopilot?.recommendations || []), recommendation]);
    setShowAddRecommendation(false);
  };

  const handleEditRecommendation = (recommendation: any) => {
    const updatedRecommendations = (overviewCopilot?.recommendations || []).map((item: any) =>
      item.id === recommendation.id ? recommendation : item,
    );
    setValue('overviewCopilot.recommendations', updatedRecommendations);
  };

  const handleRemoveRecommendation = (id: string) => {
    const updatedRecommendations = (overviewCopilot?.recommendations || []).filter((item: any) => item.id !== id);
    setValue('overviewCopilot.recommendations', updatedRecommendations);
  };

  const handleAIGenerateRecommendations = (aiRecommendations: any[]) => {
    const currentRecommendations = overviewCopilot?.recommendations || [];
    setValue('overviewCopilot.recommendations', [...currentRecommendations, ...aiRecommendations]);
  };

  const handleDismissSetupTask = (id: string) => {
    const updatedSetupTasks = (overviewCopilot?.setupTasks || []).map((task: any) =>
      task.id === id ? { ...task, dismissed: !task.dismissed } : task,
    );
    setValue('overviewCopilot.setupTasks', updatedSetupTasks);
  };

  return (
    <Container>
      <Section>
        <header>
          <Subtitle>Setup tasks</Subtitle>
          <SM style={{ color: theme.palette.grey[600] }}>
            Dismissed the getting started setup tasks. (This will be the <b>initial state</b> always you enter the view)
          </SM>
        </header>
        <SetupTasksList>
          {overviewCopilot?.setupTasks?.map((task: any) => {
            return (
              <li key={task.id}>
                <Field>
                  <Toggle checked={task.dismissed} onChange={() => handleDismissSetupTask(task.id)}>
                    <Field.Label>{getSetupTaskLabel(task.id)}</Field.Label>
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
            {Object.entries(overviewCopilot?.metrics || {}).flatMap(([section, item]: any) => {
              const isUpTrend = item.currentValue > item.historicalValue;
              const percentage =
                (Math.abs(item.currentValue - item.historicalValue) /
                  Math.max(item.currentValue, item.historicalValue)) *
                100;
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Subtitle>Recommendations</Subtitle>
          <Button size="small" onClick={() => setShowAIGenerator(true)} isPrimary>
            <SparkleIcon style={{ width: '14px', height: '14px', marginRight: '4px' }} />
            Generate with AI
          </Button>
        </div>
        <div style={{ margin: '12px 0px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {overviewCopilot?.recommendations?.map((item: any) => {
            return (
              <RecommendationItem
                key={item.id}
                onEdit={handleEditRecommendation}
                onRemove={handleRemoveRecommendation}
                recommendation={item}
              />
            );
          }) || []}
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

        {/* AI Recommendation Generator Modal */}
        <AIRecommendationGenerator
          isOpen={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          onGenerateRecommendations={handleAIGenerateRecommendations}
          industry={currentIndustry}
        />
      </Section>
    </Container>
  );
};

const Container = styled.div`
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
