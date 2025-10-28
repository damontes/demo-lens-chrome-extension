import React, { useState } from 'react';
import { Field, Input } from '@zendeskgarden/react-forms';
import { Button } from '@zendeskgarden/react-buttons';
import styled from 'styled-components';

type Props = {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  initialValues?: any;
};

const DEFAULT_INITIAL_VALUES = {
  name: '',
  description: '',
  numberOfConversations: 0,
};

const SuggestionForm = ({ onSubmit, onCancel, initialValues = DEFAULT_INITIAL_VALUES }: Props) => {
  const [name, setName] = useState(initialValues.name || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [numberOfConversations, setNumberOfConversations] = useState(initialValues.numberOfConversations || 0);
  const [errors, setErrors] = useState<{ name?: string; description?: string; numberOfConversations?: string }>({});

  const validateAndSubmit = () => {
    const newErrors: { name?: string; description?: string; numberOfConversations?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (numberOfConversations < 0) {
      newErrors.numberOfConversations = 'Must be 0 or greater';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        name: name.trim(),
        description: description.trim(),
        numberOfConversations,
      });
    }
  };

  return (
    <Container>
      <FormGrid>
        <Field>
          <Field.Label>Name *</Field.Label>
          <Input
            placeholder="Signal booster request"
            value={name}
            onChange={(e) => setName(e.target.value)}
            validation={errors.name ? 'error' : undefined}
          />
          {errors.name && <Field.Message validation="error">{errors.name}</Field.Message>}
        </Field>

        <Field>
          <Field.Label>Description</Field.Label>
          <Input
            placeholder="Customer requesting information about signal boosters for poor coverage areas"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            validation={errors.description ? 'error' : undefined}
          />
          {errors.description && <Field.Message validation="error">{errors.description}</Field.Message>}
        </Field>

        <Field>
          <Field.Label>Number of Conversations</Field.Label>
          <Input
            type="number"
            placeholder="345"
            value={numberOfConversations}
            onChange={(e) => setNumberOfConversations(Number(e.target.value))}
            validation={errors.numberOfConversations ? 'error' : undefined}
          />
          {errors.numberOfConversations && (
            <Field.Message validation="error">{errors.numberOfConversations}</Field.Message>
          )}
        </Field>
      </FormGrid>

      <Footer>
        <Button onClick={onCancel} isNeutral>
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
  grid-template-columns: 1fr;
  gap: 16px;
`;

const Footer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
`;

export default SuggestionForm;
