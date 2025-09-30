import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@zendeskgarden/react-buttons';
import { Field, Input, MediaInput } from '@zendeskgarden/react-forms';
import { LG, SM } from '@zendeskgarden/react-typography';
import { useTheme } from 'styled-components';
import styled from 'styled-components';
import SparkleIcon from '@zendeskgarden/svg-icons/src/16/sparkle-stroke.svg?react';
import PlusIcon from '@zendeskgarden/svg-icons/src/16/plus-stroke.svg?react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import TopicItem from './Topics/TopicItem';
import AddTopic from './Topics/AddTopic';
import AITopicsGenerator from './Topics/AITopicsGenerator';
import { AutomationTopic } from '@/models/admin/templates';

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${(p) => p.theme.space.md};
  margin-bottom: ${(p) => p.theme.space.lg};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(p) => p.theme.space.md};
`;

const TopicsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${(p) => p.theme.space.lg};
  color: ${(p) => p.theme.palette.grey[600]};
  border: 2px dashed ${(p) => p.theme.palette.grey[300]};
  border-radius: ${(p) => p.theme.borderRadii.md};
`;

const SuffixIcon = styled.span`
  color: ${(p) => p.theme.palette.grey[600]};
  font-size: ${(p) => p.theme.fontSizes.sm};
  padding-right: ${(p) => p.theme.space.xs};
`;

const AutomationPotentialForm = () => {
  const { watch, setValue } = useFormContext();
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<number | null>(null);
  const theme = useTheme();

  const automationPotential = watch('automationPotential');

  // Get current industry from form context
  const currentIndustry = watch('industry') || 'support';

  const handleAddTopic = () => {
    setShowAddTopic(true);
  };

  const handleEditTopic = (index: number) => {
    // Editing is now handled inline in TopicItem
    // This function can be removed or used for other purposes
  };

  const handleDeleteTopic = (index: number) => {
    setTopicToDelete(index);
    setShowDeleteModal(true);
  };

  const confirmDeleteTopic = () => {
    if (topicToDelete !== null) {
      const currentTopics = automationPotential?.topics || [];
      const updatedTopics = currentTopics.filter((_: any, index: number) => index !== topicToDelete);
      setValue('automationPotential.topics', updatedTopics);
    }
    setShowDeleteModal(false);
    setTopicToDelete(null);
  };

  const handleTopicSubmit = (topic: AutomationTopic) => {
    const currentTopics = automationPotential?.topics || [];
    // Only handle adding new topics, editing is done inline
    const updatedTopics = [...currentTopics, topic];
    setValue('automationPotential.topics', updatedTopics);
    setShowAddTopic(false);
  };

  const handleAIGeneratedTopics = (topics: AutomationTopic[]) => {
    const currentTopics = automationPotential?.topics || [];
    const updatedTopics = [...currentTopics, ...topics];
    setValue('automationPotential.topics', updatedTopics);
  };

  return (
    <div>
      {/* Global Metrics Section */}
      <div style={{ marginBottom: theme.space.xl }}>
        <LG style={{ marginBottom: theme.space.md, fontWeight: theme.fontWeights.semibold }}>
          Global Automation Metrics
        </LG>
        <MetricsGrid>
          <Field>
            <Field.Label>Automation Potential Ratio</Field.Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={automationPotential?.metrics?.automationPotentialRatio || 0}
              onChange={(e) =>
                setValue('automationPotential.metrics.automationPotentialRatio', parseFloat(e.target.value))
              }
            />
          </Field>
          <Field>
            <Field.Label>Cost Savings</Field.Label>
            <MediaInput
              end={<SuffixIcon>USD</SuffixIcon>}
              type="number"
              min="0"
              value={automationPotential?.metrics?.estimatedTotalCostSavings || 0}
              onChange={(e) =>
                setValue('automationPotential.metrics.estimatedTotalCostSavings', parseFloat(e.target.value))
              }
            />
          </Field>
          <Field>
            <Field.Label>Handle Time Saved</Field.Label>
            <MediaInput
              end={<SuffixIcon>SEC</SuffixIcon>}
              type="number"
              min="0"
              value={automationPotential?.metrics?.estimatedTotalHandleTimeSaved || 0}
              onChange={(e) =>
                setValue('automationPotential.metrics.estimatedTotalHandleTimeSaved', parseFloat(e.target.value))
              }
            />
          </Field>
        </MetricsGrid>
      </div>

      {/* Automation Topics Section */}
      <div>
        <SectionHeader>
          <LG style={{ fontWeight: theme.fontWeights.semibold }}>Automation Topics</LG>
          <Button onClick={() => setShowAIGenerator(true)} size="small" isPrimary>
            <SparkleIcon style={{ marginRight: theme.space.xs }} />
            Generate with AI
          </Button>
        </SectionHeader>

        <TopicsContainer>
          {automationPotential?.topics?.map((topic: AutomationTopic, index: number) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              index={index}
              onEdit={handleEditTopic}
              onDelete={handleDeleteTopic}
            />
          ))}

          {(!automationPotential?.topics || automationPotential.topics.length === 0) && (
            <EmptyState>
              <SM>No automation topics configured. Click "Add Topic" or "Generate with AI" to get started.</SM>
            </EmptyState>
          )}

          {/* Dashed Add Topic Button */}
          {!showAddTopic && (
            <Button type="button" style={{ flex: 1, borderStyle: 'dashed' }} onClick={handleAddTopic}>
              Add Topic
            </Button>
          )}
        </TopicsContainer>
      </div>

      {showDeleteModal && (
        <ConfirmationModal
          onClose={() => setShowDeleteModal(false)}
          handleSubmit={confirmDeleteTopic}
          title="Delete Automation Topic"
          description="Are you sure you want to delete this automation topic? This action cannot be undone."
        />
      )}

      {showAddTopic && (
        <div style={{ marginBottom: theme.space.lg }}>
          <AddTopic onSubmit={handleTopicSubmit} onCancel={() => setShowAddTopic(false)} />
        </div>
      )}

      {showAIGenerator && (
        <AITopicsGenerator
          isOpen={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          onGenerateTopics={handleAIGeneratedTopics}
          industry={currentIndustry}
        />
      )}
    </div>
  );
};

export default AutomationPotentialForm;
