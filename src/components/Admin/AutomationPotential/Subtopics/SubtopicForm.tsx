import React, { useState } from 'react';
import { Button } from '@zendeskgarden/react-buttons';
import { Field, Input, Textarea, Select } from '@zendeskgarden/react-forms';
import { MD } from '@zendeskgarden/react-typography';
import { useTheme } from 'styled-components';
import styled from 'styled-components';
import type { AutomationSubtopic } from '@/models/admin/templates';

interface SubtopicFormProps {
  onAdd?: (subtopic: AutomationSubtopic) => void;
  onUpdate?: (subtopic: AutomationSubtopic) => void;
  onCancel: () => void;
  initialData?: AutomationSubtopic;
  isEditing?: boolean;
}

const FormCard = styled.div<{ isEditing: boolean }>`
  border: 2px dashed ${(p) => (p.isEditing ? p.theme.palette.green[300] : p.theme.palette.blue[300])};
  border-radius: ${(p) => p.theme.borderRadii.md};
  padding: ${(p) => p.theme.space.md};
  margin-bottom: ${(p) => p.theme.space.sm};
  background-color: ${(p) => (p.isEditing ? p.theme.palette.green[50] : p.theme.palette.blue[50])};
`;

const SubtopicForm: React.FC<SubtopicFormProps> = ({ onAdd, onUpdate, onCancel, initialData, isEditing = false }) => {
  const [formData, setFormData] = useState<Omit<AutomationSubtopic, 'id'>>({
    name: initialData?.name || '',
    summary: initialData?.summary || '',
    canonicalRequest: initialData?.canonicalRequest || '',
    llmSampleResponse: initialData?.llmSampleResponse || null,
    hasKnowledgeCoverage: initialData?.hasKnowledgeCoverage ?? true,
  });
  const theme = useTheme();

  const updateField = (field: keyof Omit<AutomationSubtopic, 'id'>, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.summary.trim() || !formData.canonicalRequest.trim()) {
      return; // Basic validation
    }

    if (isEditing && onUpdate && initialData) {
      const updatedSubtopic: AutomationSubtopic = {
        ...formData,
        id: initialData.id,
      };
      onUpdate(updatedSubtopic);
    } else if (onAdd) {
      const newSubtopic: AutomationSubtopic = {
        ...formData,
        id: `subtopic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      onAdd(newSubtopic);
    }
  };

  return (
    <FormCard isEditing={isEditing}>
      <div style={{ marginBottom: theme.space.md }}>
        <MD style={{ fontWeight: theme.fontWeights.semibold, marginBottom: theme.space.sm }}>
          {isEditing ? 'Edit Subtopic' : 'Add New Subtopic'}
        </MD>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: theme.space.sm,
          marginBottom: theme.space.sm,
        }}
      >
        <Field>
          <Field.Label>Name *</Field.Label>
          <Input
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Subtopic name"
          />
        </Field>
        <Field>
          <Field.Label>Knowledge Coverage</Field.Label>
          <Select
            value={formData.hasKnowledgeCoverage.toString()}
            onChange={(e) => updateField('hasKnowledgeCoverage', e.target.value === 'true')}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </Field>
      </div>

      <Field style={{ marginBottom: theme.space.sm }}>
        <Field.Label>Summary *</Field.Label>
        <Textarea
          rows={2}
          value={formData.summary}
          onChange={(e) => updateField('summary', e.target.value)}
          placeholder="Brief description of what this subtopic covers"
        />
      </Field>

      <Field style={{ marginBottom: theme.space.sm }}>
        <Field.Label>Canonical Request *</Field.Label>
        <Textarea
          rows={3}
          value={formData.canonicalRequest}
          onChange={(e) => updateField('canonicalRequest', e.target.value)}
          placeholder="Example customer request for this subtopic"
        />
      </Field>

      <Field style={{ marginBottom: theme.space.md }}>
        <Field.Label>LLM Sample Response</Field.Label>
        <Textarea
          rows={4}
          value={formData.llmSampleResponse || ''}
          onChange={(e) => updateField('llmSampleResponse', e.target.value || null)}
          placeholder="Optional: Sample response from AI agent"
        />
      </Field>

      <div style={{ display: 'flex', gap: theme.space.sm, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          isPrimary
          onClick={handleSubmit}
          disabled={!formData.name.trim() || !formData.summary.trim() || !formData.canonicalRequest.trim()}
        >
          {isEditing ? 'Update Subtopic' : 'Add Subtopic'}
        </Button>
      </div>
    </FormCard>
  );
};

export default SubtopicForm;
