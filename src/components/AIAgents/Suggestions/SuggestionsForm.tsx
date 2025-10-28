import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MD, SM } from '@zendeskgarden/react-typography';
import { Button } from '@zendeskgarden/react-buttons';
import styled from 'styled-components';
import PlusIcon from '@zendeskgarden/svg-icons/src/16/plus-stroke.svg?react';
import LightningBoltIcon from '@zendeskgarden/svg-icons/src/16/lightning-bolt-stroke.svg?react';
import SuggestionItem from './Suggestion/SuggestionItem';
import AddSuggestion from './Suggestion/AddSuggestion';

const SuggestionsForm: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const [showAddSuggestion, setShowAddSuggestion] = useState(false);

  const suggestions = watch('suggestions');

  const handleAddSuggestion = (suggestionData: any) => {
    const currentSuggestions = suggestions?.suggestions || [];
    const newSuggestion = {
      ...suggestionData,
      id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setValue('suggestions.suggestions', [...currentSuggestions, newSuggestion]);
    setShowAddSuggestion(false);
  };

  const handleEditSuggestion = (index: number, suggestionData: any) => {
    const currentSuggestions = suggestions?.suggestions || [];
    const updatedSuggestions = currentSuggestions.map((item: any, idx: number) =>
      idx === index ? { ...suggestionData, id: item.id } : item,
    );
    setValue('suggestions.suggestions', updatedSuggestions);
  };

  const handleRemoveSuggestion = (index: number) => {
    const currentSuggestions = suggestions?.suggestions || [];
    const updatedSuggestions = currentSuggestions.filter((_: any, idx: number) => idx !== index);
    setValue('suggestions.suggestions', updatedSuggestions);
  };

  const getSuggestions = () => {
    const currentSuggestions = suggestions?.suggestions || [];
    return Array.isArray(currentSuggestions) ? currentSuggestions : [];
  };

  return (
    <Container>
      <ContentSection>
        {getSuggestions().map((suggestion: any, index: number) => (
          <SuggestionItem
            key={suggestion.id || index}
            suggestion={suggestion}
            index={index}
            onEdit={handleEditSuggestion}
            onRemove={() => handleRemoveSuggestion(index)}
          />
        ))}

        {showAddSuggestion ? (
          <AddSuggestion onCancel={() => setShowAddSuggestion(false)} onSubmit={handleAddSuggestion} />
        ) : (
          <Button type="button" style={{ flex: 1, borderStyle: 'dashed' }} onClick={() => setShowAddSuggestion(true)}>
            Add Suggestion
          </Button>
        )}
      </ContentSection>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export default SuggestionsForm;
