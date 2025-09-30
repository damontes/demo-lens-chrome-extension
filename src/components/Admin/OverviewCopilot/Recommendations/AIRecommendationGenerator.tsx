import React, { useState } from 'react';
import { Modal } from '@zendeskgarden/react-modals';
import { Button } from '@zendeskgarden/react-buttons';
import { Field, Textarea } from '@zendeskgarden/react-forms';
import { LG, MD, SM } from '@zendeskgarden/react-typography';
import SparkleIcon from '@zendeskgarden/svg-icons/src/16/sparkle-stroke.svg?react';
import styled, { useTheme } from 'styled-components';

interface AIRecommendationGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateRecommendations: (recommendations: any[]) => void;
  industry: string;
}

const AI_PROMPTS = [
  {
    id: 'intelligent-routing',
    title: 'Smart Ticket Routing',
    description: 'Generate recommendations for intelligent ticket routing based on customer intent analysis',
    prompt:
      'Create AI-powered ticket routing recommendations that automatically direct tickets to appropriate support teams based on detected customer intents. Focus on common scenarios like billing inquiries routing to billing teams, technical issues to tech support, account problems to account specialists, and order issues to fulfillment teams. Include realistic metrics showing ticket volumes and efficiency improvements.',
  },
  {
    id: 'priority-automation',
    title: 'Priority Management',
    description: 'Generate recommendations for automated priority adjustment based on issue urgency',
    prompt:
      'Create recommendations for intelligent priority management that automatically adjusts ticket priorities based on detected customer intents and issue severity. Include rules for escalating urgent issues (security breaches, service outages, VIP customers), setting high priority for time-sensitive requests (billing disputes, account lockouts), and normal priority for routine inquiries.',
  },
  {
    id: 'workflow-optimization',
    title: 'Workflow Automation',
    description: 'Generate comprehensive workflow recommendations combining multiple automation strategies',
    prompt:
      'Create diverse automation recommendations including smart team routing, automatic status updates, agent assignment optimization, and response automation for common inquiries. Focus on reducing manual triage time while improving both response speed and resolution quality through intelligent workflow automation.',
  },
];

const AIRecommendationGenerator: React.FC<AIRecommendationGeneratorProps> = ({
  isOpen,
  onClose,
  onGenerateRecommendations,
  industry,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [generatedRecommendations, setGeneratedRecommendations] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const theme = useTheme();

  const handlePromptSelect = (prompt: (typeof AI_PROMPTS)[0]) => {
    setCustomPrompt(prompt.prompt);
    setSelectedPromptId(prompt.id);
  };

  const generateRecommendations = async () => {
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
              content: `You are a Zendesk Admin AI expert specializing in automation recommendations. Generate realistic admin copilot recommendations that improve workflow efficiency.

IMPORTANT: Return ONLY a valid JSON array of recommendation objects with this exact structure:

[
  {
    "id": "unique_recommendation_id",
    "numTickets": 50-300,
    "percentTickets": 0.08-0.30,
    "action": {
      "value": "team_or_priority_value",
      "title": "Human readable action title"
    },
    "intent": [
      {
        "value": "intent_technical_name",
        "title": "Human readable intent"
      }
    ],
    "actionType": "group_id" | "priority" | "assignee_id",
    "analysedPeriod": 7-14,
    "metricExpectedImprovement": 1800-7200,
    "precision": 0.80-0.95
  }
]

REQUIREMENTS:
1. Generate 2-4 realistic recommendations
2. Include diverse automation types: routing (group_id), priority management (priority), assignment (assignee_id)
3. Use realistic business metrics and volumes
4. Focus on common support scenarios for ${industry} industry
5. Each recommendation should target specific intents and provide measurable improvements
6. metricExpectedImprovement should be in seconds (30min-2h time savings)`,
            },
            {
              role: 'user',
              content: `${customPrompt}

Context: Generate automation recommendations for the ${industry} industry.

Focus on creating realistic, actionable automation recommendations that would commonly improve workflow efficiency in ${industry} support scenarios. Include appropriate intent detection and business impact metrics.`,
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
      let recommendations;
      try {
        // Try to extract JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        } else {
          recommendations = JSON.parse(content);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Invalid response format from AI');
      }

      setGeneratedRecommendations(recommendations);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      alert('Failed to generate recommendations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptRecommendations = () => {
    onGenerateRecommendations(generatedRecommendations);
    handleClose();
  };

  const handleClose = () => {
    setCustomPrompt('');
    setSelectedPromptId(null);
    setGeneratedRecommendations([]);
    setShowPreview(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={handleClose}>
      <Modal.Header>
        <LG style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SparkleIcon style={{ width: '18px', height: '18px', color: theme.palette.green[600] }} />
          Generate Recommendations with AI
        </LG>
      </Modal.Header>
      <Modal.Body>
        {!showPreview ? (
          <GenerationStep>
            <MD isBold style={{ marginBottom: '12px' }}>
              Choose a recommendation type:
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
                placeholder="Describe the specific automation recommendations you want to generate..."
                rows={4}
              />
            </Field>
          </GenerationStep>
        ) : (
          <PreviewStep>
            <MD isBold style={{ marginBottom: '12px' }}>
              Generated Recommendations ({generatedRecommendations.length})
            </MD>
            <RecommendationsList>
              {generatedRecommendations.map((rec, index) => (
                <RecommendationPreview key={rec.id || index}>
                  <div style={{ marginBottom: '8px' }}>
                    <SM isBold>{rec.action?.title}</SM>
                    <p style={{ fontSize: '12px', color: '#68737d', margin: '4px 0' }}>
                      {rec.numTickets} tickets ({Math.round(rec.percentTickets * 100)}% of total)
                    </p>
                  </div>
                  <div>
                    <SM style={{ fontSize: '11px', color: '#49545c' }}>Intents:</SM>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {rec.intent?.map((intent: any, i: number) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '10px',
                            backgroundColor: '#f8f9fa',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            border: '1px solid #e3e5e8',
                          }}
                        >
                          {intent.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </RecommendationPreview>
              ))}
            </RecommendationsList>
          </PreviewStep>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Modal.FooterItem>
          <Button onClick={handleClose}>Cancel</Button>
        </Modal.FooterItem>
        <Modal.FooterItem>
          {!showPreview ? (
            <Button isPrimary onClick={generateRecommendations} disabled={isGenerating || !customPrompt.trim()}>
              {isGenerating ? 'Generating...' : 'Generate Recommendations'}
            </Button>
          ) : (
            <Button isPrimary onClick={handleAcceptRecommendations}>
              Add {generatedRecommendations.length} Recommendations
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

const RecommendationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

const RecommendationPreview = styled.div`
  border: 1px solid #e3e5e8;
  border-radius: 6px;
  padding: 12px;
  background-color: #f8f9fa;
`;

export default AIRecommendationGenerator;
