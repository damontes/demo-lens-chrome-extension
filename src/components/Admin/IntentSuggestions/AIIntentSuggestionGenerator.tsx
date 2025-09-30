import React, { useState } from 'react';
import { Modal } from '@zendeskgarden/react-modals';
import { Button } from '@zendeskgarden/react-buttons';
import { Field, Textarea } from '@zendeskgarden/react-forms';
import { LG, MD, SM } from '@zendeskgarden/react-typography';
import SparkleIcon from '@zendeskgarden/svg-icons/src/16/sparkle-stroke.svg?react';
import styled, { useTheme } from 'styled-components';
import { INTENT_SUGGESTIONS_CATEGORIES } from '@/constants';

interface AIIntentSuggestionGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateIntentSuggestions: (suggestions: any[]) => void;
  industry: string;
}

const AI_PROMPTS = [
  {
    id: 'common-intents',
    title: 'Common Customer Intents',
    description: 'Generate intent suggestions for typical customer support scenarios',
    prompt:
      'Create realistic intent suggestions for common customer support scenarios including account management, billing inquiries, order questions, technical support issues, and general service requests. Focus on intents that customers frequently express when contacting support.',
  },
  {
    id: 'industry-specific',
    title: 'Industry-Specific Intents',
    description: 'Generate intent suggestions tailored to your specific industry',
    prompt:
      'Create industry-specific intent suggestions that are commonly encountered in customer support for this business type. Include specialized scenarios and terminology that are unique to this industry while covering the most frequent customer needs.',
  },
  {
    id: 'priority-intents',
    title: 'High-Priority Intent Detection',
    description: 'Generate intent suggestions for identifying urgent or high-priority customer issues',
    prompt:
      'Create intent suggestions focused on identifying high-priority and urgent customer issues that need immediate attention. Include intents for security concerns, service outages, billing disputes, account access problems, and other time-sensitive matters that require prompt response.',
  },
];

const AIIntentSuggestionGenerator: React.FC<AIIntentSuggestionGeneratorProps> = ({
  isOpen,
  onClose,
  onGenerateIntentSuggestions,
  industry,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const theme = useTheme();

  const handlePromptSelect = (prompt: (typeof AI_PROMPTS)[0]) => {
    setCustomPrompt(prompt.prompt);
    setSelectedPromptId(prompt.id);
  };

  const generateIntentSuggestions = async () => {
    if (!customPrompt.trim()) {
      alert('Please enter a prompt or select a template example.');
      return;
    }

    setIsGenerating(true);

    try {
      // Call OpenAI API through the Zendesk proxy
      const response = await fetch('https://auth-dev.demoengineering.zende.sk/v1/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Proxy-Url': 'https://api.openai.com/v1/chat/completions',
          'X-Token-Path': 'z3n-daniel/z3n-daniel/openai',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a Zendesk Admin AI expert specializing in customer intent analysis. Generate realistic intent suggestions for customer support categorization.

IMPORTANT: Return ONLY a valid JSON array of intent suggestion objects with this exact structure:

[
  {
    "id": "unique_suggestion_id",
    "label": "Human readable label",
    "description": "Detailed description of what this intent covers",
    "parentCategory": "must_match_parent_tag_exactly",
    "childCategory": "must_match_child_tag_exactly"
  }
]

CRITICAL REQUIREMENTS:
1. Generate 3-6 realistic intent suggestions
2. MUST use valid category combinations from the provided structure
3. Each suggestion should represent a common customer support scenario
4. Labels should be clear and descriptive for support agents
5. Descriptions should explain what types of customer messages would match this intent
6. Focus on practical, actionable intent categorization`,
            },
            {
              role: 'user',
              content: `${customPrompt}

Context: Generate intent suggestions for the ${industry} industry.

IMPORTANT: You MUST use these exact category structures:

AVAILABLE PARENT CATEGORIES: ${INTENT_SUGGESTIONS_CATEGORIES.map((cat) => `"${cat.tag}"`).join(', ')}

CATEGORY STRUCTURE (use only these valid combinations):
${INTENT_SUGGESTIONS_CATEGORIES.map(
  (parent) => `- ${parent.tag} → ${parent.children.map((child) => child.tag).join(', ')}`,
).join('\n')}

RULES:
1. The parentCategory MUST be one of the parent categories listed above
2. The childCategory MUST be one of the valid children for that parent
3. Use realistic combinations that match common customer support scenarios

EXAMPLE VALID COMBINATIONS:
- Account activation → parentCategory: "account", childCategory: "activation"
- Payment refund → parentCategory: "billing", childCategory: "refund"
- Software crash → parentCategory: "software", childCategory: "crash"
- Order status → parentCategory: "order", childCategory: "status"
- Service appointment → parentCategory: "service", childCategory: "appointment"

Focus on creating realistic intent suggestions that would commonly occur in ${industry} industry support scenarios.`,
            },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();

      // Parse the AI response
      let suggestions;
      try {
        // Try to extract JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          suggestions = JSON.parse(content);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Invalid response format from AI');
      }

      setGeneratedSuggestions(suggestions);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to generate intent suggestions:', error);
      alert('Failed to generate intent suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptSuggestions = () => {
    onGenerateIntentSuggestions(generatedSuggestions);
    handleClose();
  };

  const handleClose = () => {
    setCustomPrompt('');
    setSelectedPromptId(null);
    setGeneratedSuggestions([]);
    setShowPreview(false);
    onClose();
  };

  // Get category labels for display
  const getCategoryLabels = (parentTag: string, childTag: string) => {
    const parentCat = INTENT_SUGGESTIONS_CATEGORIES.find((cat) => cat.tag === parentTag);
    const childCat = parentCat?.children.find((child: any) => child.tag === childTag);
    return {
      parentLabel: parentCat?.label || parentTag,
      childLabel: childCat?.label || childTag,
    };
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={handleClose}>
      <Modal.Header>
        <LG style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SparkleIcon style={{ width: '18px', height: '18px', color: theme.palette.green[600] }} />
          Generate Intent Suggestions with AI
        </LG>
      </Modal.Header>
      <Modal.Body>
        {!showPreview ? (
          <GenerationStep>
            <MD isBold style={{ marginBottom: '12px' }}>
              Choose an intent suggestion type:
            </MD>
            <PromptList>
              {AI_PROMPTS.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  $isSelected={selectedPromptId === prompt.id}
                  onClick={() => handlePromptSelect(prompt)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                    <SparkleIcon style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                    <SM isBold style={{ margin: 0 }}>
                      {prompt.title}
                    </SM>
                  </div>
                  <p style={{ fontSize: '12px', color: '#68737d', margin: 0, lineHeight: '1.3' }}>
                    {prompt.description}
                  </p>
                </PromptCard>
              ))}
            </PromptList>

            <Field style={{ marginTop: '16px' }}>
              <Field.Label>Custom prompt (optional):</Field.Label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe the specific intent suggestions you want to generate..."
                rows={4}
              />
            </Field>
          </GenerationStep>
        ) : (
          <PreviewStep>
            <MD isBold style={{ marginBottom: '12px' }}>
              Generated Intent Suggestions ({generatedSuggestions.length})
            </MD>
            <SuggestionsList>
              {generatedSuggestions.map((suggestion, index) => {
                const { parentLabel, childLabel } = getCategoryLabels(
                  suggestion.parentCategory,
                  suggestion.childCategory,
                );
                return (
                  <SuggestionPreview key={suggestion.id || index}>
                    <div style={{ marginBottom: '8px' }}>
                      <SM isBold>{suggestion.label}</SM>
                      <p style={{ fontSize: '12px', color: '#68737d', margin: '4px 0', lineHeight: '1.4' }}>
                        {suggestion.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          backgroundColor: '#e3f2fd',
                          padding: '2px 6px',
                          borderRadius: '12px',
                          border: '1px solid #1976d2',
                          color: '#1976d2',
                        }}
                      >
                        {parentLabel}
                      </span>
                      <span style={{ fontSize: '10px', color: '#68737d' }}>→</span>
                      <span
                        style={{
                          fontSize: '10px',
                          backgroundColor: '#f3e5f5',
                          padding: '2px 6px',
                          borderRadius: '12px',
                          border: '1px solid #7b1fa2',
                          color: '#7b1fa2',
                        }}
                      >
                        {childLabel}
                      </span>
                    </div>
                  </SuggestionPreview>
                );
              })}
            </SuggestionsList>
          </PreviewStep>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Modal.FooterItem>
          <Button onClick={handleClose}>Cancel</Button>
        </Modal.FooterItem>
        <Modal.FooterItem>
          {!showPreview ? (
            <Button isPrimary onClick={generateIntentSuggestions} disabled={isGenerating || !customPrompt.trim()}>
              {isGenerating ? 'Generating...' : 'Generate Intent Suggestions'}
            </Button>
          ) : (
            <Button isPrimary onClick={handleAcceptSuggestions}>
              Add {generatedSuggestions.length} Intent Suggestions
            </Button>
          )}
        </Modal.FooterItem>
      </Modal.Footer>
    </Modal>
  );
};

const GenerationStep = styled.div`
  display: flex;
  flex-direction: column;
`;

const PreviewStep = styled.div`
  display: flex;
  flex-direction: column;
`;

const PromptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PromptCard = styled.div<{ $isSelected: boolean }>`
  border: 1px solid ${(props) => (props.$isSelected ? props.theme.palette.green[600] : '#d8dcde')};
  border-radius: 6px;
  padding: 12px;
  background-color: ${(props) => (props.$isSelected ? '#f0f8ff' : 'white')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(props) => props.theme.palette.green[400]};
  }
`;

const SuggestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

const SuggestionPreview = styled.div`
  border: 1px solid #e3e5e8;
  border-radius: 6px;
  padding: 12px;
  background-color: #f8f9fa;
`;

export default AIIntentSuggestionGenerator;
