import React, { useState } from 'react';
import { Field, Input, Select } from '@zendeskgarden/react-forms';
import { Button } from '@zendeskgarden/react-buttons';
import styled from 'styled-components';

type Props = {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  initialValues?: any;
};

const DEFAULT_INITIAL_VALUES = {
  article_name: '',
  kb_source_type: '',
  kb_name: '',
  usage_rate: 0,
  automated_resolutions_rate: 0,
  escalated_conversations_rate: 0,
  bsat_percent: null,
  total_conversations_count: 0,
};

const KnowledgeSourceForm = ({ onSubmit, onCancel, initialValues = DEFAULT_INITIAL_VALUES }: Props) => {
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    setFormValues((prev: any) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateAndSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!formValues.article_name?.trim()) {
      newErrors.article_name = 'Article name is required';
    }

    if (!formValues.kb_source_type) {
      newErrors.kb_source_type = 'Knowledge base source type is required';
    }

    if (!formValues.kb_name?.trim()) {
      newErrors.kb_name = 'Knowledge base name is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formValues);
    }
  };

  return (
    <Container>
      <FormGrid>
        <Field>
          <Field.Label>Article Name *</Field.Label>
          <Input
            placeholder="Password Reset Guide"
            value={formValues.article_name}
            onChange={(e) => updateField('article_name', e.target.value)}
            validation={errors.article_name ? 'error' : undefined}
          />
          {errors.article_name && <Field.Message validation="error">{errors.article_name}</Field.Message>}
        </Field>

        <Field>
          <Field.Label>KB Source Type *</Field.Label>
          <Select
            value={formValues.kb_source_type}
            onChange={(e) => updateField('kb_source_type', e.target.value)}
            validation={errors.kb_source_type ? 'error' : undefined}
          >
            <option value="">Select source type...</option>
            <option value="internal_docs">Internal Docs</option>
            <option value="zendesk_guide">Zendesk Guide</option>
            <option value="confluence">Confluence</option>
          </Select>
          {errors.kb_source_type && <Field.Message validation="error">{errors.kb_source_type}</Field.Message>}
        </Field>

        <Field>
          <Field.Label>KB Name *</Field.Label>
          <Input
            placeholder="Customer Support KB"
            value={formValues.kb_name}
            onChange={(e) => updateField('kb_name', e.target.value)}
            validation={errors.kb_name ? 'error' : undefined}
          />
          {errors.kb_name && <Field.Message validation="error">{errors.kb_name}</Field.Message>}
        </Field>

        <Field>
          <Field.Label>Usage Rate (%)</Field.Label>
          <Input
            type="number"
            placeholder="75"
            step="0.01"
            min="0"
            max="100"
            value={formValues.usage_rate}
            onChange={(e) => updateField('usage_rate', Number(e.target.value))}
            validation={errors.usage_rate ? 'error' : undefined}
          />
          {errors.usage_rate && <Field.Message validation="error">{errors.usage_rate}</Field.Message>}
        </Field>

        <Field>
          <Field.Label>Automated Resolutions Rate (%)</Field.Label>
          <Input
            type="number"
            placeholder="85"
            step="0.01"
            min="0"
            max="100"
            value={formValues.automated_resolutions_rate}
            onChange={(e) => updateField('automated_resolutions_rate', Number(e.target.value))}
            validation={errors.automated_resolutions_rate ? 'error' : undefined}
          />
          {errors.automated_resolutions_rate && (
            <Field.Message validation="error">{errors.automated_resolutions_rate}</Field.Message>
          )}
        </Field>

        <Field>
          <Field.Label>Escalated Conversations Rate (%)</Field.Label>
          <Input
            type="number"
            placeholder="10"
            step="0.01"
            min="0"
            max="100"
            value={formValues.escalated_conversations_rate}
            onChange={(e) => updateField('escalated_conversations_rate', Number(e.target.value))}
            validation={errors.escalated_conversations_rate ? 'error' : undefined}
          />
          {errors.escalated_conversations_rate && (
            <Field.Message validation="error">{errors.escalated_conversations_rate}</Field.Message>
          )}
        </Field>

        <Field>
          <Field.Label>BSAT Percentage</Field.Label>
          <Input
            type="number"
            placeholder="4.2"
            step="0.1"
            min="1"
            max="5"
            value={formValues.bsat_percent || ''}
            onChange={(e) => updateField('bsat_percent', e.target.value ? Number(e.target.value) : null)}
            validation={errors.bsat_percent ? 'error' : undefined}
          />
          {errors.bsat_percent && <Field.Message validation="error">{errors.bsat_percent}</Field.Message>}
        </Field>

        <Field>
          <Field.Label>Total Conversations Count</Field.Label>
          <Input
            type="number"
            placeholder="500"
            value={formValues.total_conversations_count}
            onChange={(e) => updateField('total_conversations_count', Number(e.target.value))}
            validation={errors.total_conversations_count ? 'error' : undefined}
          />
          {errors.total_conversations_count && (
            <Field.Message validation="error">{errors.total_conversations_count}</Field.Message>
          )}
        </Field>
      </FormGrid>

      <Footer>
        <Button type="button" onClick={onCancel} isNeutral>
          Cancel
        </Button>
        <Button onClick={validateAndSubmit} isPrimary>
          Save
        </Button>
      </Footer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const Footer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
`;

export default KnowledgeSourceForm;
