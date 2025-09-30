const SETUP_TASKS = [
  {
    __typename: 'AdminAICenterSetupTask',
    id: 'intro',
    name: 'intro',
    completed: false,
    dismissed: false,
  },
  {
    __typename: 'AdminAICenterSetupTask',
    id: 'auto_assist',
    name: 'auto_assist',
    completed: false,
    dismissed: false,
  },
  {
    __typename: 'AdminAICenterSetupTask',
    id: 'entities',
    name: 'entities',
    completed: false,
    dismissed: false,
  },
  {
    __typename: 'AdminAICenterSetupTask',
    id: 'intents',
    name: 'intents',
    completed: false,
    dismissed: false,
  },
];

export interface AdminTemplate {
  id: string;
  name: string;
  description: string;
  industry: string[];
  configuration: {
    overviewCopilot: OverviewCopilotConfiguration;
    intentSuggestions: IntentSuggestionsConfig;
    automationPotential: AutomationPotentialConfig;
  };
}

export interface OverviewCopilotConfiguration {
  name: string;
  sourceName: string;
  type: 'admin';
  setupTasks: typeof SETUP_TASKS;
  metrics: {
    ticketsCountWithAIRules: MetricValue;
    ticketsCountWithAutoAssist: MetricValue;
    ticketsCountWithAISuggestions: MetricValue;
    agentsCountUsingAISuggestions: MetricValue;
  };
  recommendations: RecommendationConfig[];
}

export interface MetricValue {
  currentValue: number;
  historicalValue: number;
}

export interface RecommendationConfig {
  id: string;
  numTickets: number;
  percentTickets: number;
  action: {
    value: string;
    title: string;
  };
  intent: Array<{
    value: string;
    title: string;
  }>;
  actionType: string;
}

export interface IntentSuggestionsConfig {
  suggestions: IntentSuggestionItem[];
}

export interface IntentSuggestionItem {
  id: string;
  label: string;
  description: string;
  parentCategory: string; // References parent tags from INTENT_SUGGESTIONS_CATEGORIES
  childCategory: string; // References child tags from INTENT_SUGGESTIONS_CATEGORIES
}

export interface AutomationPotentialConfig {
  metrics: AutomationMetrics;
  topics: AutomationTopic[];
}

export interface AutomationMetrics {
  automationPotentialRatio: number;
  estimatedTotalCostSavings: number;
  estimatedTotalHandleTimeSaved: number;
}

export interface AutomationTopic {
  id: string;
  name: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  ticketCount: number; // Should be between 3 and 5
  metrics: AutomationMetrics;
  subtopics: AutomationSubtopic[];
}

export interface AutomationSubtopic {
  id: string;
  name: string;
  summary: string;
  canonicalRequest: string;
  llmSampleResponse: string | null;
  hasKnowledgeCoverage: boolean;
}
const DEFAULT_FINANCE_INTENT_SUGGESTIONS: IntentSuggestionsConfig = {
  suggestions: [
    {
      id: 'finance_account_activation',
      label: 'Account activation',
      description: 'New account setup, activation processes, and initial account configuration',
      parentCategory: 'account',
      childCategory: 'activation',
    },
    {
      id: 'finance_payment_processing',
      label: 'Payment processing',
      description: 'Payment method setup, transaction processing, and billing inquiries',
      parentCategory: 'billing',
      childCategory: 'payment_info',
    },
    {
      id: 'finance_insurance_claims',
      label: 'Insurance claims',
      description: 'Insurance claim submissions, claim status inquiries, and coverage questions',
      parentCategory: 'insurance',
      childCategory: 'claim',
    },
  ],
};

const DEFAULT_RETAIL_INTENT_SUGGESTIONS: IntentSuggestionsConfig = {
  suggestions: [
    {
      id: 'retail_order_status',
      label: 'Order status',
      description: 'Order tracking, shipping updates, and delivery information requests',
      parentCategory: 'order',
      childCategory: 'status',
    },
    {
      id: 'retail_billing_inquiry',
      label: 'Billing inquiry',
      description: 'Invoice questions, payment issues, and billing discrepancies',
      parentCategory: 'billing',
      childCategory: 'invoice',
    },
    {
      id: 'retail_customer_service',
      label: 'Customer service',
      description: 'General support requests, product questions, and assistance needs',
      parentCategory: 'misc',
      childCategory: 'feedback',
    },
  ],
};

const DEFAULT_SUPPORT_INTENT_SUGGESTIONS: IntentSuggestionsConfig = {
  suggestions: [
    {
      id: 'support_account_recovery',
      label: 'Account recovery',
      description: 'Account access issues, password resets, and account reactivation requests',
      parentCategory: 'account',
      childCategory: 'recovery',
    },
    {
      id: 'support_software_issues',
      label: 'Software problems',
      description: 'Software crashes, bugs, compatibility issues, and technical difficulties',
      parentCategory: 'software',
      childCategory: 'crash',
    },
  ],
};

const DEFAULT_HELPDESK_INTENT_SUGGESTIONS: IntentSuggestionsConfig = {
  suggestions: [
    {
      id: 'helpdesk_password_reset',
      label: 'Password reset',
      description: 'Password recovery, account lockout, and authentication issues',
      parentCategory: 'account',
      childCategory: 'recovery',
    },
    {
      id: 'helpdesk_software_install',
      label: 'Software installation',
      description: 'Software installation, setup, configuration, and deployment issues',
      parentCategory: 'software',
      childCategory: 'install',
    },
  ],
};

const DEFAULT_TELECOMMUNICATIONS_INTENT_SUGGESTIONS: IntentSuggestionsConfig = {
  suggestions: [
    {
      id: 'telecom_service_outage',
      label: 'Service outage',
      description: 'Network downtime, connectivity issues, and service disruption reports',
      parentCategory: 'network',
      childCategory: 'connection',
    },
    {
      id: 'telecom_plan_upgrade',
      label: 'Plan upgrade',
      description: 'Data plan upgrades, service add-ons, and package modifications',
      parentCategory: 'billing',
      childCategory: 'subscription_update',
    },
  ],
};

const DEFAULT_HEALTHCARE_INTENT_SUGGESTIONS: IntentSuggestionsConfig = {
  suggestions: [
    {
      id: 'healthcare_appointment_scheduling',
      label: 'Appointment scheduling',
      description: 'Booking appointments, rescheduling, and availability inquiries',
      parentCategory: 'service',
      childCategory: 'appointment',
    },
    {
      id: 'healthcare_insurance_verification',
      label: 'Insurance verification',
      description: 'Insurance coverage verification, benefits inquiry, and claims support',
      parentCategory: 'insurance',
      childCategory: 'claim',
    },
  ],
};

const DEFAULT_ECOMMERCE_INTENT_SUGGESTIONS: IntentSuggestionsConfig = {
  suggestions: [
    {
      id: 'ecommerce_order_tracking',
      label: 'Order tracking',
      description: 'Order status inquiries, shipping updates, and delivery tracking',
      parentCategory: 'order',
      childCategory: 'status',
    },
    {
      id: 'ecommerce_product_returns',
      label: 'Product returns',
      description: 'Return requests, refund inquiries, and exchange processes',
      parentCategory: 'order',
      childCategory: 'return',
    },
    {
      id: 'ecommerce_product_inquiry',
      label: 'Product inquiry',
      description: 'Product questions, specifications, availability, and recommendations',
      parentCategory: 'order',
      childCategory: 'product_details',
    },
  ],
};

const DEFAULT_AUTOMATION_POTENTIAL: AutomationPotentialConfig = {
  metrics: {
    automationPotentialRatio: 0.75,
    estimatedTotalCostSavings: 1200,
    estimatedTotalHandleTimeSaved: 1800,
  },
  topics: [
    {
      id: 'default_topic_1',
      name: 'Common Inquiries',
      impact: 'HIGH',
      ticketCount: 3,
      metrics: {
        automationPotentialRatio: 0.8,
        estimatedTotalCostSavings: 800,
        estimatedTotalHandleTimeSaved: 1200,
      },
      subtopics: [
        {
          id: 'subtopic_1',
          name: 'Account Questions',
          summary: 'Common account-related questions that can be automated',
          canonicalRequest: 'How do I reset my password?',
          llmSampleResponse:
            'To reset your password, please visit the login page and click "Forgot Password". Follow the instructions sent to your email.',
          hasKnowledgeCoverage: true,
        },
        {
          id: 'subtopic_2',
          name: 'Basic Information',
          summary: 'Requests for basic information and status updates',
          canonicalRequest: 'What are your business hours?',
          llmSampleResponse: 'Our customer service team is available Monday through Friday, 9 AM to 6 PM EST.',
          hasKnowledgeCoverage: true,
        },
      ],
    },
  ],
};

// Admin Templates
export const ADMIN_TEMPLATES: AdminTemplate[] = [
  // FINANCE INDUSTRY TEMPLATES
  {
    id: 'admin_finance_basic',
    name: 'Finance - Basic AI Copilot',
    description: 'Essential AI copilot setup for financial services with routing and priority automation',
    industry: ['finance'],
    configuration: {
      overviewCopilot: {
        name: 'Overview: Copilot - Finance - AI - Zendesk Admin Center',
        sourceName: 'Overview: Copilot - Finance - AI - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 856, historicalValue: 642 },
          ticketsCountWithAutoAssist: { currentValue: 23, historicalValue: 41 },
          ticketsCountWithAISuggestions: { currentValue: 67, historicalValue: 52 },
          agentsCountUsingAISuggestions: { currentValue: 18, historicalValue: 12 },
        },
        recommendations: [
          {
            id: 'rec_finance_routing_billing',
            numTickets: 234,
            percentTickets: 0.28,
            action: { value: 'billing_team_id', title: 'Billing Support Team' },
            intent: [
              { value: 'intent__billing__checkout__issue', title: 'Payment or checkout issue' },
              { value: 'intent__billing__refund__request', title: 'Refund request' },
            ],
            actionType: 'group_id',
          },
        ],
      },
      intentSuggestions: DEFAULT_FINANCE_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },
  // RETAIL INDUSTRY TEMPLATES
  {
    id: 'admin_retail_basic',
    name: 'Retail - Basic AI Copilot',
    description: 'Essential AI copilot setup for retail operations with customer service automation',
    industry: ['retail'],
    configuration: {
      overviewCopilot: {
        name: 'Overview: Copilot - Retail - AI - Zendesk Admin Center',
        sourceName: 'Overview: Copilot - Retail - AI - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 723, historicalValue: 589 },
          ticketsCountWithAutoAssist: { currentValue: 45, historicalValue: 67 },
          ticketsCountWithAISuggestions: { currentValue: 89, historicalValue: 71 },
          agentsCountUsingAISuggestions: { currentValue: 22, historicalValue: 17 },
        },
        recommendations: [
          {
            id: 'rec_retail_returns_team',
            numTickets: 187,
            percentTickets: 0.24,
            action: { value: 'returns_team_id', title: 'Returns & Exchanges' },
            intent: [
              { value: 'intent__order__return__want_return', title: 'Returns' },
              { value: 'intent__order__return__want_exchange', title: 'Exchange items' },
            ],
            actionType: 'group_id',
          },
        ],
      },
      intentSuggestions: DEFAULT_RETAIL_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },
  // SUPPORT INDUSTRY TEMPLATES
  {
    id: 'admin_support_basic',
    name: 'Support - Basic AI Copilot',
    description: 'Essential AI copilot setup for general support teams with ticket routing automation',
    industry: ['support'],
    configuration: {
      overviewCopilot: {
        name: 'Overview: Copilot - Support - AI - Zendesk Admin Center',
        sourceName: 'Overview: Copilot - Support - AI - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 645, historicalValue: 512 },
          ticketsCountWithAutoAssist: { currentValue: 34, historicalValue: 56 },
          ticketsCountWithAISuggestions: { currentValue: 78, historicalValue: 63 },
          agentsCountUsingAISuggestions: { currentValue: 19, historicalValue: 14 },
        },
        recommendations: [
          {
            id: 'rec_support_priority_urgent',
            numTickets: 156,
            percentTickets: 0.19,
            action: { value: 'high', title: 'High' },
            intent: [
              { value: 'intent__software__crash', title: 'Software crash' },
              { value: 'intent__network__connection', title: 'Connectivity' },
            ],
            actionType: 'priority',
          },
        ],
      },
      intentSuggestions: DEFAULT_SUPPORT_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },
  // HELPDESK INDUSTRY TEMPLATES
  {
    id: 'admin_helpdesk_basic',
    name: 'Helpdesk - Basic AI Copilot',
    description: 'Essential AI copilot setup for IT helpdesk with technical issue routing',
    industry: ['helpdesk'],
    configuration: {
      overviewCopilot: {
        name: 'Overview: Copilot - Helpdesk - AI - Zendesk Admin Center',
        sourceName: 'Overview: Copilot - Helpdesk - AI - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 892, historicalValue: 734 },
          ticketsCountWithAutoAssist: { currentValue: 112, historicalValue: 89 },
          ticketsCountWithAISuggestions: { currentValue: 95, historicalValue: 78 },
          agentsCountUsingAISuggestions: { currentValue: 26, historicalValue: 19 },
        },
        recommendations: [
          {
            id: 'rec_helpdesk_tech_specialist',
            numTickets: 267,
            percentTickets: 0.31,
            action: { value: 'tech_specialist_id', title: 'IT Specialist' },
            intent: [
              { value: 'intent__hardware', title: 'Hardware' },
              { value: 'intent__software__crash', title: 'Software crash' },
            ],
            actionType: 'assignee_id',
          },
        ],
      },
      intentSuggestions: DEFAULT_HELPDESK_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },
  // TELECOMMUNICATIONS INDUSTRY TEMPLATES
  {
    id: 'admin_telecommunications_basic',
    name: 'Telecommunications - Basic AI Copilot',
    description: 'Essential AI copilot setup for telecom with service and billing automation',
    industry: ['telecommunications'],
    configuration: {
      overviewCopilot: {
        name: 'Overview: Copilot - Telecommunications - AI - Zendesk Admin Center',
        sourceName: 'Overview: Copilot - Telecommunications - AI - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 1156, historicalValue: 923 },
          ticketsCountWithAutoAssist: { currentValue: 67, historicalValue: 89 },
          ticketsCountWithAISuggestions: { currentValue: 112, historicalValue: 94 },
          agentsCountUsingAISuggestions: { currentValue: 31, historicalValue: 24 },
        },
        recommendations: [
          {
            id: 'rec_telecom_network_team',
            numTickets: 334,
            percentTickets: 0.35,
            action: { value: 'network_team_id', title: 'Network Operations' },
            intent: [
              { value: 'intent__network__connection', title: 'Connectivity' },
              { value: 'intent__network__connection__slow_internet', title: 'Internet connection is slow' },
            ],
            actionType: 'group_id',
          },
        ],
      },
      intentSuggestions: DEFAULT_TELECOMMUNICATIONS_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },
  // HEALTHCARE INDUSTRY TEMPLATES
  {
    id: 'admin_healthcare_basic',
    name: 'Healthcare - Basic AI Copilot',
    description: 'Essential AI copilot setup for healthcare with privacy-compliant automation',
    industry: ['healthcare'],
    configuration: {
      overviewCopilot: {
        name: 'Overview: Copilot - Healthcare - AI - Zendesk Admin Center',
        sourceName: 'Overview: Copilot - Healthcare - AI - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 567, historicalValue: 445 },
          ticketsCountWithAutoAssist: { currentValue: 23, historicalValue: 34 },
          ticketsCountWithAISuggestions: { currentValue: 67, historicalValue: 52 },
          agentsCountUsingAISuggestions: { currentValue: 15, historicalValue: 11 },
        },
        recommendations: [
          {
            id: 'rec_healthcare_compliance_form',
            numTickets: 123,
            percentTickets: 0.18,
            action: { value: 'hipaa_form_id', title: 'HIPAA Compliance Form' },
            intent: [
              { value: 'intent__account__data_restrictions__list_own_data', title: 'Request to list user data' },
              {
                value: 'intent__account__data_restrictions__request_data_protection_details',
                title: 'Data protection policy',
              },
            ],
            actionType: 'ticket_form_id',
          },
        ],
      },
      intentSuggestions: DEFAULT_HEALTHCARE_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },
  // E-COMMERCE INDUSTRY TEMPLATES
  {
    id: 'admin_ecommerce_basic',
    name: 'E-commerce - Basic AI Copilot',
    description: 'Essential AI copilot setup for e-commerce with order and shipping automation',
    industry: ['ecommerce'],
    configuration: {
      overviewCopilot: {
        name: 'Overview: Copilot - E-commerce - AI - Zendesk Admin Center',
        sourceName: 'Overview: Copilot - E-commerce - AI - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 1124, historicalValue: 867 },
          ticketsCountWithAutoAssist: { currentValue: 78, historicalValue: 95 },
          ticketsCountWithAISuggestions: { currentValue: 134, historicalValue: 112 },
          agentsCountUsingAISuggestions: { currentValue: 28, historicalValue: 22 },
        },
        recommendations: [
          {
            id: 'rec_ecommerce_shipping_team',
            numTickets: 312,
            percentTickets: 0.31,
            action: { value: 'shipping_team_id', title: 'Shipping & Logistics' },
            intent: [
              { value: 'intent__order__delivery_info', title: 'Delivery information' },
              { value: 'intent__order__fulfilment__delivery_unsuccessful', title: 'Delivery unsuccessful' },
            ],
            actionType: 'group_id',
          },
        ],
      },
      intentSuggestions: DEFAULT_ECOMMERCE_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },
  {
    id: 'admin_finance_advanced',
    name: 'Finance - Advanced AI Copilot',
    description: 'Comprehensive AI copilot for financial services with advanced compliance and fraud detection',
    industry: ['finance'],
    configuration: {
      overviewCopilot: {
        name: 'Advanced Finance AI Copilot - Zendesk Admin Center',
        sourceName: 'Advanced Finance AI Copilot - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 1245, historicalValue: 934 },
          ticketsCountWithAutoAssist: { currentValue: 89, historicalValue: 62 },
          ticketsCountWithAISuggestions: { currentValue: 156, historicalValue: 98 },
          agentsCountUsingAISuggestions: { currentValue: 34, historicalValue: 23 },
        },
        recommendations: [
          {
            id: 'rec_finance_fraud_detection',
            numTickets: 89,
            percentTickets: 0.12,
            action: { value: 'fraud_team_id', title: 'Fraud Investigation Team' },
            intent: [
              { value: 'intent__account__data_restrictions__delete_account', title: 'Close or delete account' },
              { value: 'intent__billing__checkout__issue', title: 'Payment or checkout issue' },
            ],
            actionType: 'group_id',
          },
          {
            id: 'rec_finance_compliance_urgent',
            numTickets: 67,
            percentTickets: 0.08,
            action: { value: 'urgent', title: 'Urgent' },
            intent: [
              {
                value: 'intent__account__data_restrictions__request_data_protection_details',
                title: 'Data protection policy',
              },
              { value: 'intent__billing__documentation', title: 'Billing documentation' },
            ],
            actionType: 'priority',
          },
        ],
      },
      intentSuggestions: DEFAULT_FINANCE_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },

  // RETAIL INDUSTRY - ADVANCED
  {
    id: 'admin_retail_advanced',
    name: 'Retail - Advanced AI Copilot',
    description: 'Advanced AI copilot for retail with personalization and inventory management integration',
    industry: ['retail'],
    configuration: {
      overviewCopilot: {
        name: 'Advanced Retail AI Copilot - Zendesk Admin Center',
        sourceName: 'Advanced Retail AI Copilot - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 1089, historicalValue: 798 },
          ticketsCountWithAutoAssist: { currentValue: 134, historicalValue: 96 },
          ticketsCountWithAISuggestions: { currentValue: 198, historicalValue: 145 },
          agentsCountUsingAISuggestions: { currentValue: 42, historicalValue: 31 },
        },
        recommendations: [
          {
            id: 'rec_retail_vip_customers',
            numTickets: 145,
            percentTickets: 0.18,
            action: { value: 'vip_team_id', title: 'VIP Customer Team' },
            intent: [
              { value: 'intent__billing__loyalty_card', title: 'Loyalty card' },
              {
                value: 'intent__billing__loyalty_card__cant_use_loyalty_points',
                title: 'Unable to use loyalty points',
              },
            ],
            actionType: 'group_id',
          },
        ],
      },
      intentSuggestions: DEFAULT_RETAIL_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },

  // SUPPORT INDUSTRY - ADVANCED
  {
    id: 'admin_support_advanced',
    name: 'Support - Advanced AI Copilot',
    description: 'Advanced AI copilot for support teams with escalation management and sentiment analysis',
    industry: ['support'],
    configuration: {
      overviewCopilot: {
        name: 'Advanced Support AI Copilot - Zendesk Admin Center',
        sourceName: 'Advanced Support AI Copilot - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 987, historicalValue: 723 },
          ticketsCountWithAutoAssist: { currentValue: 156, historicalValue: 112 },
          ticketsCountWithAISuggestions: { currentValue: 213, historicalValue: 167 },
          agentsCountUsingAISuggestions: { currentValue: 38, historicalValue: 29 },
        },
        recommendations: [
          {
            id: 'rec_support_escalation_manager',
            numTickets: 78,
            percentTickets: 0.11,
            action: { value: 'escalation_manager_id', title: 'Escalation Manager' },
            intent: [
              { value: 'intent__billing__refund__denied', title: 'Refund denied' },
              { value: 'intent__software__crash', title: 'Software crash' },
            ],
            actionType: 'assignee_id',
          },
        ],
      },
      intentSuggestions: DEFAULT_SUPPORT_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },

  // HELPDESK INDUSTRY - ADVANCED
  {
    id: 'admin_helpdesk_advanced',
    name: 'Helpdesk - Advanced AI Copilot',
    description: 'Advanced AI copilot for IT helpdesk with automated diagnostics and knowledge base integration',
    industry: ['helpdesk'],
    configuration: {
      overviewCopilot: {
        name: 'Advanced Helpdesk AI Copilot - Zendesk Admin Center',
        sourceName: 'Advanced Helpdesk AI Copilot - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 1456, historicalValue: 1123 },
          ticketsCountWithAutoAssist: { currentValue: 234, historicalValue: 178 },
          ticketsCountWithAISuggestions: { currentValue: 189, historicalValue: 134 },
          agentsCountUsingAISuggestions: { currentValue: 45, historicalValue: 32 },
        },
        recommendations: [
          {
            id: 'rec_helpdesk_auto_resolution',
            numTickets: 287,
            percentTickets: 0.34,
            action: { value: 'closed', title: 'Closed' },
            intent: [
              { value: 'intent__software__login_issues__password_request_reset', title: 'Reset password' },
              { value: 'intent__software__compatibility', title: 'Software compatibility' },
            ],
            actionType: 'status',
          },
        ],
      },
      intentSuggestions: DEFAULT_HELPDESK_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },

  // TELECOMMUNICATIONS INDUSTRY - ADVANCED
  {
    id: 'admin_telecommunications_advanced',
    name: 'Telecommunications - Advanced AI Copilot',
    description: 'Advanced AI copilot for telecom with network issue detection and service optimization',
    industry: ['telecommunications'],
    configuration: {
      overviewCopilot: {
        name: 'Advanced Telecom AI Copilot - Zendesk Admin Center',
        sourceName: 'Advanced Telecom AI Copilot - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 1678, historicalValue: 1234 },
          ticketsCountWithAutoAssist: { currentValue: 298, historicalValue: 234 },
          ticketsCountWithAISuggestions: { currentValue: 234, historicalValue: 189 },
          agentsCountUsingAISuggestions: { currentValue: 56, historicalValue: 41 },
        },
        recommendations: [
          {
            id: 'rec_telecom_network_outage',
            numTickets: 156,
            percentTickets: 0.23,
            action: { value: 'network_ops_id', title: 'Network Operations' },
            intent: [
              { value: 'intent__network__connection', title: 'Connectivity' },
              { value: 'intent__network__connection__slow_internet', title: 'Internet connection is slow' },
            ],
            actionType: 'group_id',
          },
        ],
      },
      intentSuggestions: DEFAULT_TELECOMMUNICATIONS_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },

  // HEALTHCARE INDUSTRY - ADVANCED
  {
    id: 'admin_healthcare_advanced',
    name: 'Healthcare - Advanced AI Copilot',
    description: 'Advanced AI copilot for healthcare with HIPAA compliance and patient priority routing',
    industry: ['healthcare'],
    configuration: {
      overviewCopilot: {
        name: 'Advanced Healthcare AI Copilot - Zendesk Admin Center',
        sourceName: 'Advanced Healthcare AI Copilot - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 892, historicalValue: 678 },
          ticketsCountWithAutoAssist: { currentValue: 23, historicalValue: 34 }, // Lower due to compliance
          ticketsCountWithAISuggestions: { currentValue: 167, historicalValue: 123 },
          agentsCountUsingAISuggestions: { currentValue: 29, historicalValue: 21 },
        },
        recommendations: [
          {
            id: 'rec_healthcare_urgent_patient',
            numTickets: 89,
            percentTickets: 0.15,
            action: { value: 'urgent', title: 'Urgent' },
            intent: [
              { value: 'intent__account__documentation__sending_medical_prescription', title: 'Sending prescription' },
              {
                value: 'intent__account__data_restrictions__request_data_protection_details',
                title: 'Data protection policy',
              },
            ],
            actionType: 'priority',
          },
        ],
      },
      intentSuggestions: DEFAULT_HEALTHCARE_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },

  // ECOMMERCE INDUSTRY - ADVANCED
  {
    id: 'admin_ecommerce_advanced',
    name: 'E-commerce - Advanced AI Copilot',
    description: 'Advanced AI copilot for e-commerce with order intelligence and customer lifecycle management',
    industry: ['ecommerce'],
    configuration: {
      overviewCopilot: {
        name: 'Advanced E-commerce AI Copilot - Zendesk Admin Center',
        sourceName: 'Advanced E-commerce AI Copilot - Zendesk Admin Center',
        type: 'admin',
        setupTasks: SETUP_TASKS,
        metrics: {
          ticketsCountWithAIRules: { currentValue: 1567, historicalValue: 1134 },
          ticketsCountWithAutoAssist: { currentValue: 234, historicalValue: 189 },
          ticketsCountWithAISuggestions: { currentValue: 298, historicalValue: 234 },
          agentsCountUsingAISuggestions: { currentValue: 52, historicalValue: 38 },
        },
        recommendations: [
          {
            id: 'rec_ecommerce_high_value_order',
            numTickets: 234,
            percentTickets: 0.28,
            action: { value: 'premium_support_id', title: 'Premium Support Team' },
            intent: [
              {
                value: 'intent__billing__subscription_transfer__personal_to_business',
                title: 'Transfer account from personal to business',
              },
              { value: 'intent__billing__payment__change', title: 'Payment change' },
            ],
            actionType: 'group_id',
          },
          {
            id: 'rec_ecommerce_auto_refund',
            numTickets: 178,
            percentTickets: 0.21,
            action: { value: 'solved', title: 'Solved' },
            intent: [
              { value: 'intent__billing__refund__request', title: 'Refund request' },
              { value: 'intent__order__return__want_return', title: 'Returns' },
            ],
            actionType: 'status',
          },
        ],
      },
      intentSuggestions: DEFAULT_ECOMMERCE_INTENT_SUGGESTIONS,
      automationPotential: DEFAULT_AUTOMATION_POTENTIAL,
    },
  },
];

export const getAdminTemplatesByIndustry = (industry: string): AdminTemplate[] => {
  return ADMIN_TEMPLATES.filter((template) => template.industry.includes(industry));
};

export const getAdminTemplateById = (id: string): AdminTemplate | undefined => {
  return ADMIN_TEMPLATES.find((template) => template.id === id);
};
