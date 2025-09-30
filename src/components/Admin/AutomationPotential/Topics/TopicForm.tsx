import React, { useState } from 'react';
import { Button } from '@zendeskgarden/react-buttons';
import { Field, Input, Select, MediaInput } from '@zendeskgarden/react-forms';
import { LG, MD, SM } from '@zendeskgarden/react-typography';
import { useTheme } from 'styled-components';
import styled from 'styled-components';
import PlusIcon from '@zendeskgarden/svg-icons/src/16/plus-stroke.svg?react';
import { AutomationTopic, AutomationSubtopic } from '@/models/admin/templates';
import SubtopicItem from '../Subtopics/SubtopicItem';
import SubtopicForm from '../Subtopics/SubtopicForm';

interface TopicFormProps {
  onSubmit: (topic: AutomationTopic) => void;
  onCancel: () => void;
  initialTopic?: AutomationTopic;
  isEditing?: boolean;
}

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

const SuffixIcon = styled.span`
  color: ${(p) => p.theme.palette.grey[600]};
  font-size: ${(p) => p.theme.fontSizes.sm};
  padding-right: ${(p) => p.theme.space.xs};
`;

const TopicForm: React.FC<TopicFormProps> = ({ onSubmit, onCancel, initialTopic, isEditing = false }) => {
  const [formData, setFormData] = useState<AutomationTopic>(
    initialTopic || {
      id: '',
      name: '',
      impact: 'MEDIUM',
      ticketCount: 3,
      metrics: {
        automationPotentialRatio: 0,
        estimatedTotalCostSavings: 0,
        estimatedTotalHandleTimeSaved: 0,
      },
      subtopics: [],
    },
  );
  const [showSubtopicForm, setShowSubtopicForm] = useState(false);
  const theme = useTheme();

  const updateField = (field: string, value: any) => {
    if (field.startsWith('metrics.')) {
      const metricField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          [metricField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      return; // Basic validation
    }

    const topicToSave: AutomationTopic = {
      ...formData,
      id: formData.id || `topic_${Date.now()}`,
    };

    onSubmit(topicToSave);
  };

  const handleAddSubtopic = (subtopic: AutomationSubtopic) => {
    setFormData((prev) => ({
      ...prev,
      subtopics: [...prev.subtopics, subtopic],
    }));
    setShowSubtopicForm(false);
  };

  const handleUpdateSubtopic = (index: number, updatedSubtopic: AutomationSubtopic) => {
    setFormData((prev) => ({
      ...prev,
      subtopics: prev.subtopics.map((sub, i) => (i === index ? updatedSubtopic : sub)),
    }));
  };

  const handleDeleteSubtopic = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subtopics: prev.subtopics.filter((_, i) => i !== index),
    }));
  };

  return (
    <div>
      {/* Topic Basic Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: theme.space.md,
          marginBottom: theme.space.md,
        }}
      >
        <Field>
          <Field.Label>Topic Name *</Field.Label>
          <Input
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Enter topic name"
          />
        </Field>
        <Field>
          <Field.Label>Impact Level</Field.Label>
          <Select value={formData.impact} onChange={(e) => updateField('impact', e.target.value)}>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </Select>
        </Field>
        <Field>
          <Field.Label>Ticket Count</Field.Label>
          <Input
            type="number"
            value={formData.ticketCount}
            onChange={(e) => updateField('ticketCount', e.target.value === '' ? '' : parseInt(e.target.value))}
            placeholder="Enter ticket count"
          />
        </Field>
      </div>

      {/* Metrics Section */}
      <div style={{ marginBottom: theme.space.lg }}>
        <MD style={{ marginBottom: theme.space.md, fontWeight: theme.fontWeights.semibold }}>Automation Metrics</MD>
        <MetricsGrid>
          <Field>
            <Field.Label>Automation Ratio</Field.Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.metrics.automationPotentialRatio}
              onChange={(e) => updateField('metrics.automationPotentialRatio', parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field>
            <Field.Label>Cost Savings</Field.Label>
            <MediaInput
              end={<SuffixIcon>USD</SuffixIcon>}
              type="number"
              min="0"
              value={formData.metrics.estimatedTotalCostSavings}
              onChange={(e) => updateField('metrics.estimatedTotalCostSavings', parseInt(e.target.value) || 0)}
            />
          </Field>
          <Field>
            <Field.Label>Time Saved</Field.Label>
            <MediaInput
              end={<SuffixIcon>SEC</SuffixIcon>}
              type="number"
              min="0"
              value={formData.metrics.estimatedTotalHandleTimeSaved}
              onChange={(e) => updateField('metrics.estimatedTotalHandleTimeSaved', parseInt(e.target.value) || 0)}
            />
          </Field>
        </MetricsGrid>
      </div>

      {/* Subtopics Section */}
      <div style={{ marginBottom: theme.space.lg }}>
        <SectionHeader>
          <MD style={{ fontWeight: theme.fontWeights.semibold }}>Subtopics ({formData.subtopics.length})</MD>
          {!showSubtopicForm && (
            <Button size="small" onClick={() => setShowSubtopicForm(true)}>
              <PlusIcon style={{ marginRight: theme.space.xs }} />
              Add Subtopic
            </Button>
          )}
        </SectionHeader>

        {showSubtopicForm && <SubtopicForm onAdd={handleAddSubtopic} onCancel={() => setShowSubtopicForm(false)} />}

        {formData.subtopics.map((subtopic, index) => (
          <SubtopicItem
            key={subtopic.id}
            subtopic={subtopic}
            index={index}
            onUpdate={handleUpdateSubtopic}
            onDelete={handleDeleteSubtopic}
          />
        ))}

        {formData.subtopics.length === 0 && !showSubtopicForm && (
          <div
            style={{
              textAlign: 'center',
              padding: theme.space.lg,
              color: theme.palette.grey[600],
              border: '2px dashed ' + theme.palette.grey[300],
              borderRadius: theme.borderRadii.md,
            }}
          >
            <SM>No subtopics added yet. Click "Add Subtopic" to get started.</SM>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: theme.space.sm, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button isPrimary onClick={handleSubmit} disabled={!formData.name.trim()}>
          {isEditing ? 'Update Topic' : 'Add Topic'}
        </Button>
      </div>
    </div>
  );
};

export default TopicForm;
