import React, { useState } from 'react';
import { Modal } from '@zendeskgarden/react-modals';
import { Button } from '@zendeskgarden/react-buttons';
import { Field, Textarea } from '@zendeskgarden/react-forms';
import { LG, MD, SM } from '@zendeskgarden/react-typography';
import SparkleIcon from '@zendeskgarden/svg-icons/src/16/sparkle-stroke.svg?react';
import styled, { useTheme } from 'styled-components';
import type { AutomationTopic } from '@/models/admin/templates';

interface AITopicsGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateTopics: (topics: AutomationTopic[]) => void;
  industry: string;
}

const AI_PROMPTS = [
  {
    id: 'high-volume-topics',
    title: 'High-Volume Automation Topics',
    description: 'Generate topics for common high-volume support scenarios that have automation potential',
    prompt:
      'Create automation potential topics for high-volume customer support scenarios that are excellent candidates for AI agent automation. Include topics with repetitive inquiries, standard responses, and clear resolution patterns. Focus on scenarios where AI can effectively handle initial customer interaction and provide consistent, accurate responses.',
  },
  {
    id: 'industry-automation',
    title: 'Industry-Specific Automation',
    description: 'Generate automation topics tailored to your specific industry challenges',
    prompt:
      'Create industry-specific automation potential topics that address common customer support challenges in this business sector. Include specialized scenarios unique to this industry where AI agents can provide immediate value, reduce response times, and improve customer satisfaction through automated assistance.',
  },
  {
    id: 'cost-saving-opportunities',
    title: 'Cost-Saving Automation Opportunities',
    description: 'Generate topics focused on scenarios with highest cost-saving potential',
    prompt:
      'Create automation potential topics that represent the highest cost-saving opportunities through AI agent deployment. Focus on repetitive, time-consuming support scenarios that currently require significant human agent time but can be effectively automated while maintaining quality customer experience.',
  },
];

const PromptCard = styled.div<{ isSelected: boolean }>`
  border: 1px solid ${(props) => (props.isSelected ? props.theme.palette.green[600] : '#d8dcde')};
  border-radius: 6px;
  padding: 12px;
  background-color: ${(props) => (props.isSelected ? '#f0f8ff' : 'white')};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: ${(props) => props.theme.space.sm};

  &:hover {
    border-color: ${(props) => props.theme.palette.green[400]};
  }
`;

const TopicPreview = styled.div`
  border: 1px solid #e3e5e8;
  border-radius: 6px;
  padding: 12px;
  background-color: #f8f9fa;
`;

const TopicsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

const AITopicsGenerator: React.FC<AITopicsGeneratorProps> = ({ isOpen, onClose, onGenerateTopics, industry }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [generatedTopics, setGeneratedTopics] = useState<AutomationTopic[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const theme = useTheme();

  const handlePromptSelect = (prompt: (typeof AI_PROMPTS)[0]) => {
    setCustomPrompt(prompt.prompt);
    setSelectedPromptId(prompt.id);
  };

  const generateTopics = async () => {
    setIsGenerating(true);

    const selectedPrompt = AI_PROMPTS.find((p) => p.id === selectedPromptId);
    const promptToUse = selectedPrompt ? selectedPrompt.prompt : customPrompt;

    const fullPrompt = `You are helping to configure automation potential topics for a ${industry} business customer support system.

${promptToUse}

Please generate 2-3 automation potential topics with the following structure for each topic:
- Topic name (clear, descriptive)
- Impact level (HIGH, MEDIUM, or LOW)
- Ticket count (must be between 1-1000)
- Automation potential ratio (0.0 to 1.0)
- Estimated cost savings in USD
- Estimated handle time saved in seconds
- 2-3 relevant subtopics with:
  - Subtopic name
  - Summary description
  - Sample canonical request
  - Sample LLM response (or null if not applicable)
  - Knowledge coverage status (true/false)
- 2-3 related ticket examples

Provide realistic, industry-appropriate examples that would be valuable for ${industry} customer support automation.`;

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
              content: `You are a Zendesk Admin AI expert specializing in customer support automation potential analysis. Generate realistic automation potential topics for customer support automation.

IMPORTANT: Return ONLY a valid JSON array of automation topic objects with this exact structure:

[
  {
    "id": "unique_topic_id",
    "name": "Topic Name",
    "impact": "HIGH|MEDIUM|LOW",
    "ticketCount": 1-1000,
    "metrics": {
      "automationPotentialRatio": 0.0-1.0,
      "estimatedTotalCostSavings": number,
      "estimatedTotalHandleTimeSaved": number_in_seconds
    },
    "subtopics": [
      {
        "id": "unique_subtopic_id",
        "name": "Subtopic Name",
        "summary": "Brief description",
        "canonicalRequest": "Example customer request",
        "llmSampleResponse": "Sample AI response or null",
        "hasKnowledgeCoverage": true|false
      }
    ]
  }
]

CRITICAL REQUIREMENTS:
1. Generate 2-3 realistic automation potential topics
2. Each topic should have 2-3 subtopics
3. Use realistic metrics appropriate for ${industry} industry
4. Focus on common, high-volume support scenarios
5. Ensure all fields match the exact structure above`,
            },
            {
              role: 'user',
              content: fullPrompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();

      // Parse the AI response
      let topics;
      try {
        // Try to extract JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          topics = JSON.parse(jsonMatch[0]);
        } else {
          topics = JSON.parse(content);
        }

        // Validate the response structure
        if (!Array.isArray(topics)) {
          throw new Error('Response is not an array');
        }

        // Add unique IDs if missing
        topics = topics.map((topic: any, index: number) => ({
          ...topic,
          id: topic.id || `topic_${Date.now()}_${index}`,
          subtopics:
            topic.subtopics?.map((subtopic: any, subIndex: number) => ({
              ...subtopic,
              id: subtopic.id || `subtopic_${Date.now()}_${index}_${subIndex}`,
            })) || [],
        }));

        setGeneratedTopics(topics);
        setShowPreview(true);
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Failed to generate automation topics:', error);
      alert('Failed to generate automation topics. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseTopics = () => {
    onGenerateTopics(generatedTopics);
    setShowPreview(false);
    setGeneratedTopics([]);
    setSelectedPromptId(null);
    setCustomPrompt('');
    onClose();
  };

  const handleClose = () => {
    setShowPreview(false);
    setGeneratedTopics([]);
    setSelectedPromptId(null);
    setCustomPrompt('');
    onClose();
  };

  const getImpactColor = (impact: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (impact) {
      case 'HIGH':
        return '#dc3545';
      case 'MEDIUM':
        return '#ffc107';
      case 'LOW':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const formatTimeValue = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!isOpen) return null;

  return (
    <Modal>
      <Modal.Header>
        <LG style={{ display: 'flex', alignItems: 'center', gap: theme.space.xs }}>
          <SparkleIcon style={{ color: theme.colors.primaryHue }} />
          Generate Automation Topics with AI
        </LG>
      </Modal.Header>
      <Modal.Body>
        {!showPreview ? (
          <>
            <div style={{ marginBottom: theme.space.lg }}>
              <MD style={{ marginBottom: '12px', fontWeight: theme.fontWeights.semibold }}>
                Choose a topic generation type:
              </MD>
              {AI_PROMPTS.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  isSelected={selectedPromptId === prompt.id}
                  onClick={() => handlePromptSelect(prompt)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                    <SparkleIcon style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                    <SM style={{ margin: 0, fontWeight: theme.fontWeights.semibold }}>{prompt.title}</SM>
                  </div>
                  <p style={{ fontSize: '12px', color: '#68737d', margin: 0, lineHeight: '1.3' }}>
                    {prompt.description}
                  </p>
                </PromptCard>
              ))}
            </div>

            <div style={{ marginBottom: theme.space.lg }}>
              <Field style={{ marginTop: '16px' }}>
                <Field.Label>Custom prompt (optional):</Field.Label>
                <Textarea
                  rows={4}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe the specific automation topics you want to generate..."
                />
              </Field>
            </div>
          </>
        ) : (
          <>
            <MD style={{ marginBottom: theme.space.md, color: '#333' }}>Generated Automation Topics Preview:</MD>
            <TopicsList>
              {generatedTopics.map((topic, index) => (
                <TopicPreview key={topic.id}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: theme.space.sm, marginBottom: theme.space.sm }}
                  >
                    <MD style={{ fontWeight: theme.fontWeights.semibold }}>{topic.name}</MD>
                    <div
                      style={{
                        padding: `${theme.space.xs} ${theme.space.sm}`,
                        borderRadius: theme.borderRadii.sm,
                        backgroundColor: getImpactColor(topic.impact),
                        color: 'white',
                        fontSize: theme.fontSizes.sm,
                      }}
                    >
                      {topic.impact}
                    </div>
                    <SM style={{ color: theme.colors.neutralHue }}>{topic.ticketCount} tickets</SM>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: theme.space.sm,
                      marginBottom: theme.space.sm,
                    }}
                  >
                    <SM style={{ color: theme.colors.neutralHue }}>
                      Automation: {(topic.metrics.automationPotentialRatio * 100).toFixed(1)}%
                    </SM>
                    <SM style={{ color: theme.colors.neutralHue }}>
                      Savings: ${topic.metrics.estimatedTotalCostSavings}
                    </SM>
                    <SM style={{ color: theme.colors.neutralHue }}>
                      Time Saved: {formatTimeValue(topic.metrics.estimatedTotalHandleTimeSaved)}
                    </SM>
                  </div>
                  <SM style={{ color: theme.colors.neutralHue }}>
                    {topic.subtopics.length} subtopics, {topic.ticketCount} tickets
                  </SM>
                </TopicPreview>
              ))}
            </TopicsList>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Modal.FooterItem>
          <Button onClick={handleClose}>Cancel</Button>
        </Modal.FooterItem>
        <Modal.FooterItem>
          {!showPreview ? (
            <Button isPrimary onClick={generateTopics} disabled={!selectedPromptId && !customPrompt.trim()}>
              {isGenerating ? 'Generating...' : 'Generate Topics'}
            </Button>
          ) : (
            <Button isPrimary onClick={handleUseTopics}>
              Use These Topics
            </Button>
          )}
        </Modal.FooterItem>
      </Modal.Footer>
    </Modal>
  );
};

export default AITopicsGenerator;
