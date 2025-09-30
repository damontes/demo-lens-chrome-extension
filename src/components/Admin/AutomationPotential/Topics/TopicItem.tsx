import React, { useState } from 'react';
import { Button } from '@zendeskgarden/react-buttons';
import { LG, MD, SM } from '@zendeskgarden/react-typography';
import { useTheme } from 'styled-components';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import PencilIcon from '@zendeskgarden/svg-icons/src/16/pencil-stroke.svg?react';
import TrashIcon from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg?react';
import { AutomationTopic, AutomationSubtopic } from '@/models/admin/templates';
import EditTopic from './EditTopic';
import Collapsable from '@/components/ui/Collapsable';
import SubtopicItem from '../Subtopics/SubtopicItem';
import SubtopicForm from '../Subtopics/SubtopicForm';
import { CircleImpactIcon } from '@/icons';

interface TopicItemProps {
  topic: AutomationTopic;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${(p) => p.theme.space.sm};
  margin-top: ${(p) => p.theme.space.sm};
`;

const MetricItem = styled.div`
  padding: ${(p) => `${p.theme.space.xxs} ${p.theme.space.xs}`};
  border: 1px solid ${(p) => p.theme.palette.grey[200]};
  border-radius: ${(p) => p.theme.borderRadii.md};
`;

const TopicItem: React.FC<TopicItemProps> = ({ topic, index, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddSubtopic, setShowAddSubtopic] = useState(false);
  const { setValue, watch } = useFormContext();
  const theme = useTheme();
  const automationPotential = watch('automationPotential');

  const formatTimeValue = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedTopic: AutomationTopic) => {
    setValue(`automationPotential.topics.${index}`, updatedTopic);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAddSubtopic = (subtopic: AutomationSubtopic) => {
    const currentTopics = automationPotential?.topics || [];
    const updatedTopic = {
      ...currentTopics[index],
      subtopics: [...(currentTopics[index].subtopics || []), subtopic],
    };
    setValue(`automationPotential.topics.${index}`, updatedTopic);
    setShowAddSubtopic(false);
  };

  const handleUpdateSubtopic = (subtopicIndex: number, updatedSubtopic: AutomationSubtopic) => {
    const currentTopics = automationPotential?.topics || [];
    const updatedSubtopics = [...(currentTopics[index].subtopics || [])];
    updatedSubtopics[subtopicIndex] = updatedSubtopic;

    const updatedTopic = {
      ...currentTopics[index],
      subtopics: updatedSubtopics,
    };
    setValue(`automationPotential.topics.${index}`, updatedTopic);
  };

  const handleDeleteSubtopic = (subtopicIndex: number) => {
    const currentTopics = automationPotential?.topics || [];
    const updatedSubtopics =
      currentTopics[index].subtopics?.filter((_: AutomationSubtopic, i: number) => i !== subtopicIndex) || [];

    const updatedTopic = {
      ...currentTopics[index],
      subtopics: updatedSubtopics,
    };
    setValue(`automationPotential.topics.${index}`, updatedTopic);
  };

  if (isEditing) {
    return <EditTopic topic={topic} onSubmit={handleSave} onCancel={handleCancel} />;
  }

  const headerContent = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.space.sm }}>
        <LG style={{ margin: 0, fontWeight: theme.fontWeights.semibold }}>{topic.name}</LG>
        <CircleImpactIcon impact={topic.impact} title={`${topic.impact} Impact`} />
        <SM style={{ color: theme.palette.grey[600] }}>{topic.ticketCount} tickets</SM>
      </div>

      <div style={{ display: 'flex', gap: theme.space.xs }}>
        <Button
          size="small"
          isBasic
          isPill
          onClick={(e) => {
            e.stopPropagation();
            handleEdit();
          }}
        >
          <PencilIcon />
        </Button>
        <Button
          size="small"
          isDanger
          isBasic
          isPill
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  );

  return (
    <Collapsable headerContent={headerContent} isActive={false}>
      <div style={{ padding: `0px ${theme.space.md} ${theme.space.md} ${theme.space.md}` }}>
        <MetricsGrid>
          <MetricItem>
            <MD>
              Automation Ratio: <b>{(topic.metrics.automationPotentialRatio * 100).toFixed(1)}%</b>
            </MD>
          </MetricItem>
          <MetricItem>
            <MD>
              Cost Savings: <b>${topic.metrics.estimatedTotalCostSavings}</b>
            </MD>
          </MetricItem>
          <MetricItem>
            <MD>
              Time Saved: <b>{formatTimeValue(topic.metrics.estimatedTotalHandleTimeSaved)}</b>
            </MD>
          </MetricItem>
        </MetricsGrid>

        {topic.subtopics && topic.subtopics.length > 0 && (
          <div style={{ marginTop: theme.space.md }}>
            <MD style={{ marginBottom: theme.space.sm, fontWeight: theme.fontWeights.semibold }}>
              Subtopics ({topic.subtopics.length})
            </MD>
            <div style={{ display: 'grid', gap: theme.space.sm }}>
              {topic.subtopics.map((subtopic: AutomationSubtopic, subtopicIndex: number) => (
                <SubtopicItem
                  key={subtopic.id}
                  subtopic={subtopic}
                  index={subtopicIndex}
                  onUpdate={handleUpdateSubtopic}
                  onDelete={handleDeleteSubtopic}
                />
              ))}
            </div>
          </div>
        )}

        {/* Add Subtopic Form */}
        {showAddSubtopic && (
          <div style={{ marginTop: theme.space.md }}>
            <SubtopicForm onAdd={handleAddSubtopic} onCancel={() => setShowAddSubtopic(false)} />
          </div>
        )}

        {/* Add Subtopic Button */}
        {!showAddSubtopic && (
          <Button
            type="button"
            onClick={() => setShowAddSubtopic(true)}
            style={{ width: '100%', borderStyle: 'dashed' }}
            color="#228f67"
          >
            Add Subtopic
          </Button>
        )}
      </div>
    </Collapsable>
  );
};

export default TopicItem;
