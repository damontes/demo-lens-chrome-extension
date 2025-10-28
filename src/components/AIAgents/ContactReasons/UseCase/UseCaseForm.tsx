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
  intent_name: '',
  bot_name: '',
  channel: '',
  reply_method: '',
  conversations_count: 0,
  automated_resolutions_rate: 0,
  custom_resolutions_rate: 0,
  escalated_conversations_rate: 0,
  bsat_percent: null,
};

const UseCaseForm = ({ onSubmit, onCancel, initialValues = DEFAULT_INITIAL_VALUES }: Props) => {
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

    if (!formValues.intent_name?.trim()) {
      newErrors.intent_name = 'Intent name is required';
    }

    if (!formValues.bot_name?.trim()) {
      newErrors.bot_name = 'Bot name is required';
    }

    if (!formValues.channel) {
      newErrors.channel = 'Channel is required';
    }

    if (!formValues.reply_method) {
      newErrors.reply_method = 'Reply method is required';
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
          <Field.Label>Intent Name *</Field.Label>
          <Input
            placeholder="Transfer to human agent"
            value={formValues.intent_name}
            onChange={(e) => updateField('intent_name', e.target.value)}
            validation={errors.intent_name ? 'error' : undefined}
          />
          {errors.intent_name && <Field.Message validation="error">{errors.intent_name}</Field.Message>}
        </Field>

        <Field>
          <Field.Label>Bot Name *</Field.Label>
          <Input
            placeholder="universal-support-bot"
            value={formValues.bot_name}
            onChange={(e) => updateField('bot_name', e.target.value)}
            validation={errors.bot_name ? 'error' : undefined}
          />
          {errors.bot_name && <Field.Message validation="error">{errors.bot_name}</Field.Message>}
        </Field>

        <Field>
          <Field.Label>Channel *</Field.Label>
          <Select
            value={formValues.channel}
            onChange={(e) => updateField('channel', e.target.value)}
            validation={errors.channel ? 'error' : undefined}
          >
            <option value="">Select channel...</option>
            <option value="chat">Chat</option>
            <option value="ticket">Ticket</option>
          </Select>
          {errors.channel && <Field.Message validation="error">{errors.channel}</Field.Message>}
        </Field>

        <Field>
          <Field.Label>Reply Method *</Field.Label>
          <Select
            value={formValues.reply_method}
            onChange={(e) => updateField('reply_method', e.target.value)}
            validation={errors.reply_method ? 'error' : undefined}
          >
            <option value="">Select method...</option>
            <option value="Dialogues">Dialogues</option>
            <option value="Procedures">Procedures</option>
          </Select>
          {errors.reply_method && <Field.Message validation="error">{errors.reply_method}</Field.Message>}
        </Field>

        <Field>
          <Field.Label>Conversations Count</Field.Label>
          <Input
            type="number"
            placeholder="0"
            value={formValues.conversations_count}
            onChange={(e) => updateField('conversations_count', Number(e.target.value))}
            validation={errors.conversations_count ? 'error' : undefined}
          />
          {errors.conversations_count && <Field.Message validation="error">{errors.conversations_count}</Field.Message>}
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
          <Field.Label>Custom Resolutions Rate (%)</Field.Label>
          <Input
            type="number"
            placeholder="10"
            step="0.01"
            min="0"
            max="100"
            value={formValues.custom_resolutions_rate}
            onChange={(e) => updateField('custom_resolutions_rate', Number(e.target.value))}
            validation={errors.custom_resolutions_rate ? 'error' : undefined}
          />
          {errors.custom_resolutions_rate && (
            <Field.Message validation="error">{errors.custom_resolutions_rate}</Field.Message>
          )}
        </Field>

        <Field>
          <Field.Label>Escalated Conversations Rate (%)</Field.Label>
          <Input
            type="number"
            placeholder="5"
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
            placeholder="4.5"
            step="0.1"
            min="1"
            max="5"
            value={formValues.bsat_percent || ''}
            onChange={(e) => updateField('bsat_percent', e.target.value ? Number(e.target.value) : null)}
            validation={errors.bsat_percent ? 'error' : undefined}
          />
          {errors.bsat_percent && <Field.Message validation="error">{errors.bsat_percent}</Field.Message>}
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

export default UseCaseForm;
