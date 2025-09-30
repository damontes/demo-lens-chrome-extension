import styled from 'styled-components';
import { useState } from 'react';
import { Button } from '@zendeskgarden/react-buttons';
import { useFormContext } from 'react-hook-form';
import { LG } from '@zendeskgarden/react-typography';
import AddIntentSuggestion from './Suggestion/AddIntentSuggestion';
import IntentSuggestionItem from './Suggestion/IntentSuggestionItem';
import AIIntentSuggestionGenerator from './AIIntentSuggestionGenerator';
import SparkleIcon from '@zendeskgarden/svg-icons/src/16/sparkle-stroke.svg?react';

const IntentSuggestionsForm = () => {
  const { watch, setValue } = useFormContext();
  const [showAddSuggestion, setShowAddSuggestion] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const intentSuggestions = watch('intentSuggestions');
  const currentIndustry = watch('industry');

  const handleAddSuggestion = (suggestion: any) => {
    setValue('intentSuggestions.suggestions', [...(intentSuggestions?.suggestions || []), suggestion]);
    setShowAddSuggestion(false);
  };

  const handleEditSuggestion = (suggestion: any) => {
    const updatedSuggestions = (intentSuggestions?.suggestions || []).map((item: any) =>
      item.id === suggestion.id ? suggestion : item,
    );
    setValue('intentSuggestions.suggestions', updatedSuggestions);
  };

  const handleRemoveSuggestion = (id: string) => {
    const updatedSuggestions = (intentSuggestions?.suggestions || []).filter((item: any) => item.id !== id);
    setValue('intentSuggestions.suggestions', updatedSuggestions);
  };

  const handleAIGenerateIntentSuggestions = (aiSuggestions: any[]) => {
    const currentSuggestions = intentSuggestions?.suggestions || [];
    setValue('intentSuggestions.suggestions', [...currentSuggestions, ...aiSuggestions]);
  };

  return (
    <Section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <LG isBold>Intent Suggestions</LG>
        <Button size="small" onClick={() => setShowAIGenerator(true)} isPrimary>
          <SparkleIcon style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          Generate with AI
        </Button>
      </div>
      <div style={{ margin: '12px 0px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {intentSuggestions?.suggestions?.map((item: any) => {
          return (
            <IntentSuggestionItem
              key={item.id}
              onEdit={handleEditSuggestion}
              onRemove={handleRemoveSuggestion}
              suggestion={item}
            />
          );
        }) || []}
        {showAddSuggestion ? (
          <AddIntentSuggestion onSubmit={handleAddSuggestion} onCancel={() => setShowAddSuggestion(false)} />
        ) : (
          <Button type="button" style={{ flex: 1, borderStyle: 'dashed' }} onClick={() => setShowAddSuggestion(true)}>
            Add new intent suggestion
          </Button>
        )}
      </div>

      {/* AI Intent Suggestion Generator Modal */}
      <AIIntentSuggestionGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onGenerateIntentSuggestions={handleAIGenerateIntentSuggestions}
        industry={currentIndustry}
      />
    </Section>
  );
};

const Section = styled.div`
  display: flex;
  flex-direction: column;
`;

export default IntentSuggestionsForm;
