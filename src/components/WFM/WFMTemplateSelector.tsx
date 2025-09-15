import React, { useState, useEffect } from 'react';
import { WFM_TEMPLATES, WFMTemplate, getTemplatesByIndustry } from '@/models/wfm/templates';
import { VERTICAL_DATA } from '@/models/wfm/inflatePayload';
import useAppState from '../../storage';
import styled, { useTheme } from 'styled-components';
import { Button } from '@zendeskgarden/react-buttons';
import { Tag } from '@zendeskgarden/react-tags';
import { LG, MD, SM } from '@zendeskgarden/react-typography';
import SparkleIcon from '@zendeskgarden/svg-icons/src/16/sparkle-stroke.svg?react';
import TrashIcon from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg?react';
import Collapsable from '../ui/Collapsable';
import ConfirmationModal from '../ui/ConfirmationModal';

interface WFMTemplateSelectorProps {
  selectedTemplate: string | null;
  onTemplateSelect: (template: WFMTemplate | any) => void; // any to handle both predefined and user templates
  selectedIndustry: string;
}

const AI_PROMPTS = [
  {
    id: 'high-volume',
    title: 'High Volume Operations',
    description: 'Optimize for high-volume workloads with intelligent forecasting and agent scheduling',
    prompt:
      'Create a WFM template optimized for high-volume operations. Include forecasting for peak demand patterns, efficient agent scheduling, and performance metrics tracking. Consider seasonal variations, peak hours, and service level targets.',
  },
  {
    id: 'quality-focused',
    title: 'Quality & Performance',
    description: 'Balance productivity with quality metrics and performance optimization',
    prompt:
      'Design a WFM template focused on quality and performance optimization. Include balanced forecasting, quality-driven scheduling, performance tracking, and efficiency metrics. Focus on maintaining service quality while optimizing resource utilization.',
  },
  {
    id: 'flexible-operations',
    title: 'Flexible Operations',
    description: 'Adapt to changing demands with flexible resource allocation and scheduling',
    prompt:
      'Build a WFM template for flexible operations that can adapt to changing demands. Include dynamic forecasting, flexible resource planning, capacity optimization, and productivity tracking. Consider workflow adaptability and resource constraints.',
  },
];

const TemplateCard = styled.div<{ $isSelected: boolean }>`
  border: 1px solid ${(props) => (props.$isSelected ? props.theme.palette.green[600] : '#e3e5e8')};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  background-color: ${(props) => (props.$isSelected ? props.theme.palette.green[100] : 'white')};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.$isSelected ? props.theme.palette.green[100] : '#f9fafb')};
  }
`;

const PromptCard = styled.div<{ $isSelected: boolean }>`
  border: 1px solid ${(props) => (props.$isSelected ? props.theme.palette.green[600] : '#d8dcde')};
  border-radius: 6px;
  padding: 12px;
  background-color: ${(props) => (props.$isSelected ? '#f0f8ff' : 'white')};
  cursor: pointer;
  transition: all 0.2s ease;
`;

const AIBadge = styled.span`
  background-color: ${(props) => props.theme.palette.green[600]};
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
`;

const DefaultBadge = styled.span`
  background-color: ${(props) => props.theme.palette.blue[600]};
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.palette.red[600]};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.palette.red[100]};
  }
`;

const WFMTemplateSelector: React.FC<WFMTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
  selectedIndustry,
}) => {
  const [predefinedTemplates, setPredefinedTemplates] = useState<WFMTemplate[]>([]);
  const [userTemplates, setUserTemplates] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<any | null>(null);
  const { getTemplatesByType, saveTemplate, removeTemplate } = useAppState();
  const theme = useTheme();

  useEffect(() => {
    // Load predefined templates for the selected industry
    const templates = getTemplatesByIndustry(selectedIndustry);
    setPredefinedTemplates(templates);

    // Load user-created templates
    loadUserTemplates();
  }, [selectedIndustry]);

  const loadUserTemplates = async () => {
    try {
      const templates = getTemplatesByType('wfm');
      setUserTemplates(templates);
    } catch (error) {
      console.error('Failed to load user templates:', error);
    }
  };

  const handlePromptSelect = (promptData: (typeof AI_PROMPTS)[0]) => {
    setCustomPrompt(promptData.prompt);
    setSelectedPromptId(promptData.id);
  };

  const generateAITemplate = async () => {
    if (!customPrompt.trim()) {
      alert('Please enter a prompt or select a template example.');
      return;
    }

    setIsGenerating(true);

    try {
      // Get a sample template to use as structure example but exclude schedule
      const exampleTemplate = WFM_TEMPLATES[0]; // Use the first template as an example
      const templateStructureExample = {
        name: exampleTemplate.name,
        description: exampleTemplate.description,
        configuration: exampleTemplate.configuration,
      };

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
              content: `You are a Workforce Management expert. Create detailed WFM templates with realistic metrics, forecasting parameters, and agent activity configurations. 

IMPORTANT: Return ONLY a valid JSON object that follows this exact structure. Here's an example template to follow:

${JSON.stringify(templateStructureExample, null, 2)}

INDUSTRY DATA EXAMPLES: Here are the typical organizational structures for different industries that you can reference when creating templates:

${JSON.stringify(VERTICAL_DATA, null, 2)}

CONFIGURATION OPTIONS:

REPORTS CONFIGURATION - Use these exact values:
- performanceLevel: Must be one of: "low", "average", "high", "excellent"
  * "low" = 0.7 multiplier (crisis/difficult periods)
  * "average" = 1.0 multiplier (normal operations)  
  * "high" = 1.2 multiplier (good performance periods)
  * "excellent" = 1.4 multiplier (exceptional performance)

- adherenceTarget: Number between 0.8 and 0.98 (affects adherence metrics)
  * 0.8-0.85 = relaxed adherence (crisis periods)
  * 0.85-0.9 = normal adherence 
  * 0.9-0.95 = high adherence
  * 0.95-0.98 = strict adherence (compliance-heavy industries)

- efficiencyLevel: Must be one of: "low", "average", "high"
  * "low" = longer handle times, slower responses (complex issues, training periods)
  * "average" = standard efficiency levels
  * "high" = optimized handle times, fast responses

- qualityTarget: Number between 0.7 and 0.95 (affects resolution rates and bounce rates)
  * 0.7-0.8 = acceptable quality (high volume periods)
  * 0.8-0.85 = good quality
  * 0.85-0.9 = high quality
  * 0.9-0.95 = excellent quality (compliance/financial services)

- workloadIntensity: Must be one of: "light", "moderate", "heavy", "peak"
  * "light" = low volume periods
  * "moderate" = normal business volume
  * "heavy" = busy periods, seasonal increases
  * "peak" = extreme volume (emergencies, major events)

- productiveTimePercentage: Number between 0.6 and 0.9 (affects time distribution)
  * 0.6-0.7 = lower productivity (training, complex issues)
  * 0.7-0.8 = normal productivity
  * 0.8-0.85 = high productivity 
  * 0.85-0.9 = optimal productivity

DASHBOARD CONFIGURATION - Use these exact values:
- performanceLevel: Must be one of: "low", "average", "high", "excellent"
  * Same as reports performanceLevel above

- volumeIntensity: Must be one of: "light", "moderate", "heavy", "peak"
  * Same as reports workloadIntensity above

- responseSpeed: Must be one of: "urgent", "fast", "normal", "extended"
  * "urgent" = immediate response needed (emergencies, critical issues)
  * "fast" = quick response expected (competitive markets, customer service)
  * "normal" = standard response times
  * "extended" = longer response times acceptable (complex technical issues)

NOTES:
- DO NOT include 'schedule' configuration - this is generated automatically
- Focus on agentActivity, forecastVsActual, forecast, reports, and dashboards configurations
- Adjust values based on industry-specific requirements
- Include realistic working hours, activity patterns, volume forecasts, and SLA targets
- Set appropriate forecast algorithms and staffing parameters
- Include relevant volumeAdjustments for seasonal patterns or business cycles
- If the user request suggests specific organizational needs (locations, teams, organizations), reference the industry examples above but keep them minimal or omit if not specifically requested
- Focus primarily on the core configuration rather than organizational structure

Do not include the 'id', 'industry', or any other metadata fields as these will be added automatically.`,
            },
            {
              role: 'user',
              content: `Create a WFM template for: ${customPrompt}

Industry: ${selectedIndustry}

Requirements:
- Adjust agent numbers, working hours, and activity levels based on the industry and use case
- Set realistic volume adjustments and SLA targets for this scenario
- Include appropriate forecast algorithm and staffing parameters
- Consider industry-specific metrics (e.g., handle times, occupancy rates)

Return only the JSON object following the exact structure provided in the system message.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response format');
      }

      let templateData;
      try {
        const content = data.choices[0].message.content.trim();
        // Remove any markdown code blocks if present
        const cleanContent = content.replace(/```json\n?|\n?```/g, '');
        templateData = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('Failed to parse template data:', data.choices[0].message.content);
        throw new Error('Invalid JSON response from AI');
      }

      // Validate required fields
      if (!templateData.name || !templateData.description || !templateData.configuration) {
        throw new Error('AI response missing required template fields');
      }

      // Create AI template object following the exact structure
      const template = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'wfm',
        createdAt: Date.now(),
        name: templateData.name || 'Custom AI Template',
        description: templateData.description || 'AI generated template',
        industry: [selectedIndustry],
        configuration: {
          // Generate schedule config dynamically - not from AI
          schedule: {
            agentsNumber: 20, // Default sensible value
            agentGroups: [],
            tasks: [],
            workstreams: [],
          },
          ...templateData.configuration,
        },
      };

      // Save the template
      saveTemplate(template);

      // Reload user templates
      loadUserTemplates();

      // Auto-select the generated template
      onTemplateSelect(template);

      // Clear the prompt
      setCustomPrompt('');
      setSelectedPromptId(null);
    } catch (error) {
      console.error('Failed to generate AI template:', error);
      alert('Failed to generate template. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateSelect = (template: WFMTemplate | any) => {
    onTemplateSelect(template);
  };

  const handleDeleteTemplate = (template: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent template selection when clicking delete
    setTemplateToDelete(template);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteTemplate = () => {
    if (templateToDelete) {
      removeTemplate(templateToDelete.id);

      // If the deleted template was selected, clear the selection
      if (selectedTemplate === templateToDelete.id) {
        onTemplateSelect(null);
      }

      // Reload user templates to update the UI
      loadUserTemplates();

      // Close confirmation modal
      setDeleteConfirmationOpen(false);
      setTemplateToDelete(null);
    }
  };

  const cancelDeleteTemplate = () => {
    setDeleteConfirmationOpen(false);
    setTemplateToDelete(null);
  };

  return (
    <div>
      <LG isBold style={{ marginBottom: '16px' }}>
        Select a Template
      </LG>

      {/* Combined Templates Section */}
      {(predefinedTemplates.length > 0 || userTemplates.length > 0) && (
        <div style={{ marginBottom: '24px' }}>
          <MD isBold style={{ marginBottom: '12px' }}>
            Templates
          </MD>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px',
            }}
          >
            {/* Predefined Templates */}
            {predefinedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                $isSelected={selectedTemplate === template.id}
                onClick={() => handleTemplateSelect(template)}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <DefaultBadge>Default</DefaultBadge>
                  <SM isBold style={{ margin: 0 }}>
                    {template.name}
                  </SM>
                </div>
                <p style={{ fontSize: '12px', color: '#68737d', margin: 0, lineHeight: '1.4' }}>
                  {template.description}
                </p>
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#8a94a0' }}>
                  Industry: {template.industry.join(', ')}
                </div>
              </TemplateCard>
            ))}

            {/* User Created Templates */}
            {userTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                $isSelected={selectedTemplate === template.id}
                onClick={() => handleTemplateSelect(template)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AIBadge>AI</AIBadge>
                    <SM isBold style={{ margin: 0 }}>
                      {template.name}
                    </SM>
                  </div>
                  <DeleteButton onClick={(e) => handleDeleteTemplate(template, e)} title="Delete template">
                    <TrashIcon style={{ width: '14px', height: '14px' }} />
                  </DeleteButton>
                </div>
                <p style={{ fontSize: '12px', color: '#68737d', margin: 0, lineHeight: '1.4' }}>
                  {template.description}
                </p>
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#8a94a0' }}>
                  Created: {new Date(template.createdAt).toLocaleDateString()}
                </div>
              </TemplateCard>
            ))}
          </div>
        </div>
      )}

      {/* AI Template Generation Section */}
      <div style={{ marginBottom: '24px' }}>
        <Collapsable
          isActive={false}
          headerContent={
            <div>
              <MD
                isBold
                style={{
                  marginBottom: '4px',
                  marginTop: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <SparkleIcon style={{ width: '16px', height: '16px', color: theme.palette.green[600] }} />
                Generate with AI
                <Tag hue="orange" size="small" style={{ marginLeft: '8px' }}>
                  BETA
                </Tag>
              </MD>
              <p style={{ fontSize: '12px', color: '#68737d', margin: 0 }}>
                Create a custom template using AI based on your specific needs
              </p>
            </div>
          }
        >
          <div style={{ padding: '0 16px 16px 16px' }}>
            {/* Template Prompt Examples */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Template Examples (click to use):
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '8px',
                }}
              >
                {AI_PROMPTS.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    $isSelected={selectedPromptId === prompt.id}
                    onClick={() => handlePromptSelect(prompt)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <AIBadge>AI</AIBadge>
                      <SM isBold style={{ margin: 0 }}>
                        {prompt.title}
                      </SM>
                    </div>
                    <p style={{ fontSize: '11px', color: '#68737d', margin: 0, lineHeight: '1.4' }}>
                      {prompt.description}
                    </p>
                  </PromptCard>
                ))}
              </div>
            </div>

            {/* Custom Prompt Textarea */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Custom Prompt:
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe the WFM template you want to create..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  border: '1px solid #d8dcde',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  boxSizing: 'border-box',
                  ...({ fieldSizing: 'content' } as any),
                }}
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateAITemplate}
              disabled={isGenerating || !customPrompt.trim()}
              size="medium"
              style={{ width: '100%' }}
            >
              {isGenerating ? 'Generating Template...' : 'Generate Template'}
            </Button>
          </div>
        </Collapsable>
      </div>

      {predefinedTemplates.length === 0 && userTemplates.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#68737d',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e3e5e8',
          }}
        >
          <p>No templates available for "{selectedIndustry}"</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>
            Try generating a custom template with AI using the options above
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationOpen && (
        <ConfirmationModal
          onClose={cancelDeleteTemplate}
          handleSubmit={confirmDeleteTemplate}
          title="Delete Template"
          description={`Are you sure you want to delete "<strong>${templateToDelete?.name}</strong>"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default WFMTemplateSelector;
