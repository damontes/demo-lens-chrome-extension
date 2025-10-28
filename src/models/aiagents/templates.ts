// AI Agents KPI Templates for Ultimate.ai Analytics
// Following the same structure as admin templates

export interface AIAgentsTemplate {
  id: string;
  name: string;
  description: string;
  industry: string[];
  configuration: {
    kpis: KPIConfiguration;
    contactReasons: ContactReasonsConfiguration;
    suggestions: SuggestionsConfiguration;
  };
}

// KPI Configuration is a flat object with field names (without "bi_conversations." prefix)
// The inflatePayload function will add the prefix when matching fields
export interface KPIConfiguration {
  // BSAT Metrics
  bsat_response_rate: number | null;
  bsat_response_count: number;
  bsat_percentage: number | null;
  bsat_conversations_count: number;

  // Conversation Metrics
  total_volume: number;
  understood_conversations_rate: number;
  understood_conversations: number;

  // Performance Metrics
  processed_conversations: number;
  processed_conversations_rate: number;
  ai_agent_handled_conversations: number;
  ai_agent_handled_conversations_rate: number;
  escalated_conversations_rate: number;
  escalated_conversations: number;
  assisted_conversations: number;
  assisted_conversations_rate: number;
  // Feedback Rating Breakdown (special case - returns array of objects)
  // When this field is requested, it returns multiple rows (one per rating: 1-5)
  feedback_rating_breakdown?: FeedbackRatingBreakdown[];
}

export interface FeedbackRatingBreakdown {
  feedback_last_rating: 1 | 2 | 3 | 4 | 5;
  bsat_response_count: number;
  total_feedback_response_rate: number;
}

// ============================================
// CONTACT REASONS CONFIGURATION
// ============================================

export interface ContactReasonsConfiguration {
  useCases: UseCase[];
  knowledgeSources: KnowledgeSource[];
}

export interface UseCase {
  intent_id: string;
  bot_id: string;
  intent_name: string;
  bot_name: string;
  channel: 'chat' | 'ticket';
  reply_method: 'Dialogues' | 'Procedures';
  conversations_count: number;
  automated_resolutions_rate: number;
  custom_resolutions_rate: number;
  escalated_conversations_rate: number;
  bsat_percent: number | null;
}

export interface KnowledgeSource {
  article_name: string;
  kb_source_type: string;
  kb_name: string;
  usage_rate: number;
  automated_resolutions_rate: number;
  escalated_conversations_rate: number;
  bsat_percent: number | null;
  total_conversations_count: number;
}

// ============================================
// SUGGESTIONS CONFIGURATION
// ============================================

export interface SuggestionsConfiguration {
  suggestions: IntentSuggestion[];
}

export interface IntentSuggestion {
  name: string;
  description: string;
  numberOfConversations: number;
}

// ============================================
// CONTACT REASONS CONFIGURATIONS - Industry-specific
// ============================================

// Finance Industry Contact Reasons - High Volume
const FINANCE_HIGH_VOLUME_CONTACT_REASONS: ContactReasonsConfiguration = {
  useCases: [
    {
      intent_id: 'fin_001_account_balance',
      bot_id: 'finance_bot_hv_001',
      intent_name: 'Account balance inquiry',
      bot_name: 'finance-high-volume-bot',
      channel: 'chat',
      reply_method: 'Dialogues',
      conversations_count: 245,
      automated_resolutions_rate: 0.92,
      custom_resolutions_rate: 0.05,
      escalated_conversations_rate: 0.03,
      bsat_percent: 4.5,
    },
    {
      intent_id: 'fin_002_transaction_dispute',
      bot_id: 'finance_bot_hv_002',
      intent_name: 'Transaction dispute',
      bot_name: 'finance-high-volume-bot',
      channel: 'ticket',
      reply_method: 'Procedures',
      conversations_count: 156,
      automated_resolutions_rate: 0.45,
      custom_resolutions_rate: 0.15,
      escalated_conversations_rate: 0.4,
      bsat_percent: 3.9,
    },
  ],
  knowledgeSources: [
    {
      article_name: 'Account balance check procedures',
      kb_source_type: 'internal_docs',
      kb_name: 'Finance Operations KB',
      usage_rate: 0.78,
      automated_resolutions_rate: 0.95,
      escalated_conversations_rate: 0.02,
      bsat_percent: 4.7,
      total_conversations_count: 892,
    },
    {
      article_name: 'Transaction dispute resolution guide',
      kb_source_type: 'zendesk_guide',
      kb_name: 'Customer Service KB',
      usage_rate: 0.56,
      automated_resolutions_rate: 0.67,
      escalated_conversations_rate: 0.25,
      bsat_percent: 4.1,
      total_conversations_count: 334,
    },
  ],
};

// Finance Industry Contact Reasons - Moderate
const FINANCE_MODERATE_CONTACT_REASONS: ContactReasonsConfiguration = {
  useCases: [
    {
      intent_id: 'fin_mod_001_loan_inquiry',
      bot_id: 'finance_bot_mod_001',
      intent_name: 'Loan status inquiry',
      bot_name: 'finance-moderate-bot',
      channel: 'chat',
      reply_method: 'Dialogues',
      conversations_count: 89,
      automated_resolutions_rate: 0.67,
      custom_resolutions_rate: 0.12,
      escalated_conversations_rate: 0.21,
      bsat_percent: 4.2,
    },
    {
      intent_id: 'fin_mod_002_card_replacement',
      bot_id: 'finance_bot_mod_002',
      intent_name: 'Card replacement request',
      bot_name: 'finance-moderate-bot',
      channel: 'ticket',
      reply_method: 'Procedures',
      conversations_count: 67,
      automated_resolutions_rate: 0.78,
      custom_resolutions_rate: 0.08,
      escalated_conversations_rate: 0.14,
      bsat_percent: 4.4,
    },
  ],
  knowledgeSources: [
    {
      article_name: 'Loan application process',
      kb_source_type: 'confluence',
      kb_name: 'Financial Products KB',
      usage_rate: 0.45,
      automated_resolutions_rate: 0.72,
      escalated_conversations_rate: 0.18,
      bsat_percent: 4.3,
      total_conversations_count: 178,
    },
    {
      article_name: 'Card services troubleshooting',
      kb_source_type: 'internal_docs',
      kb_name: 'Banking Operations KB',
      usage_rate: 0.62,
      automated_resolutions_rate: 0.85,
      escalated_conversations_rate: 0.09,
      bsat_percent: 4.6,
      total_conversations_count: 245,
    },
  ],
};

// Retail/Ecommerce Contact Reasons - High Volume
const RETAIL_HIGH_VOLUME_CONTACT_REASONS: ContactReasonsConfiguration = {
  useCases: [
    {
      intent_id: 'retail_001_order_status',
      bot_id: 'retail_bot_hv_001',
      intent_name: 'Order status inquiry',
      bot_name: 'retail-high-volume-bot',
      channel: 'chat',
      reply_method: 'Dialogues',
      conversations_count: 567,
      automated_resolutions_rate: 0.89,
      custom_resolutions_rate: 0.07,
      escalated_conversations_rate: 0.04,
      bsat_percent: 4.3,
    },
    {
      intent_id: 'retail_002_return_request',
      bot_id: 'retail_bot_hv_002',
      intent_name: 'Return/refund request',
      bot_name: 'retail-high-volume-bot',
      channel: 'ticket',
      reply_method: 'Procedures',
      conversations_count: 234,
      automated_resolutions_rate: 0.72,
      custom_resolutions_rate: 0.18,
      escalated_conversations_rate: 0.1,
      bsat_percent: 4.1,
    },
  ],
  knowledgeSources: [
    {
      article_name: 'Order tracking and delivery info',
      kb_source_type: 'zendesk_guide',
      kb_name: 'Customer Support KB',
      usage_rate: 0.85,
      automated_resolutions_rate: 0.94,
      escalated_conversations_rate: 0.03,
      bsat_percent: 4.5,
      total_conversations_count: 1234,
    },
    {
      article_name: 'Return policy and procedures',
      kb_source_type: 'confluence',
      kb_name: 'Retail Operations KB',
      usage_rate: 0.67,
      automated_resolutions_rate: 0.78,
      escalated_conversations_rate: 0.15,
      bsat_percent: 4.2,
      total_conversations_count: 456,
    },
  ],
};

// Retail/Ecommerce Contact Reasons - Seasonal Peak
const RETAIL_SEASONAL_PEAK_CONTACT_REASONS: ContactReasonsConfiguration = {
  useCases: [
    {
      intent_id: 'retail_peak_001_gift_cards',
      bot_id: 'retail_bot_sp_001',
      intent_name: 'Gift card issues',
      bot_name: 'retail-seasonal-bot',
      channel: 'chat',
      reply_method: 'Dialogues',
      conversations_count: 423,
      automated_resolutions_rate: 0.84,
      custom_resolutions_rate: 0.12,
      escalated_conversations_rate: 0.04,
      bsat_percent: 4.4,
    },
    {
      intent_id: 'retail_peak_002_shipping_delays',
      bot_id: 'retail_bot_sp_002',
      intent_name: 'Shipping delays inquiry',
      bot_name: 'retail-seasonal-bot',
      channel: 'ticket',
      reply_method: 'Procedures',
      conversations_count: 678,
      automated_resolutions_rate: 0.56,
      custom_resolutions_rate: 0.25,
      escalated_conversations_rate: 0.19,
      bsat_percent: 3.7,
    },
  ],
  knowledgeSources: [
    {
      article_name: 'Holiday shipping guidelines',
      kb_source_type: 'zendesk_guide',
      kb_name: 'Seasonal Operations KB',
      usage_rate: 0.92,
      automated_resolutions_rate: 0.75,
      escalated_conversations_rate: 0.18,
      bsat_percent: 4.0,
      total_conversations_count: 2145,
    },
    {
      article_name: 'Gift card activation and troubleshooting',
      kb_source_type: 'internal_docs',
      kb_name: 'Payment Systems KB',
      usage_rate: 0.71,
      automated_resolutions_rate: 0.88,
      escalated_conversations_rate: 0.08,
      bsat_percent: 4.5,
      total_conversations_count: 892,
    },
  ],
};

// Support/Helpdesk Contact Reasons - Balanced
const SUPPORT_BALANCED_CONTACT_REASONS: ContactReasonsConfiguration = {
  useCases: [
    {
      intent_id: 'support_001_password_reset',
      bot_id: 'support_bot_bal_001',
      intent_name: 'Password reset request',
      bot_name: 'support-balanced-bot',
      channel: 'chat',
      reply_method: 'Dialogues',
      conversations_count: 178,
      automated_resolutions_rate: 0.89,
      custom_resolutions_rate: 0.06,
      escalated_conversations_rate: 0.05,
      bsat_percent: 4.6,
    },
    {
      intent_id: 'support_002_software_issue',
      bot_id: 'support_bot_bal_002',
      intent_name: 'Software bug report',
      bot_name: 'support-balanced-bot',
      channel: 'ticket',
      reply_method: 'Procedures',
      conversations_count: 134,
      automated_resolutions_rate: 0.42,
      custom_resolutions_rate: 0.38,
      escalated_conversations_rate: 0.2,
      bsat_percent: 3.9,
    },
  ],
  knowledgeSources: [
    {
      article_name: 'Password and account recovery',
      kb_source_type: 'zendesk_guide',
      kb_name: 'Technical Support KB',
      usage_rate: 0.87,
      automated_resolutions_rate: 0.93,
      escalated_conversations_rate: 0.04,
      bsat_percent: 4.7,
      total_conversations_count: 567,
    },
    {
      article_name: 'Common software issues and fixes',
      kb_source_type: 'confluence',
      kb_name: 'Product Documentation',
      usage_rate: 0.54,
      automated_resolutions_rate: 0.68,
      escalated_conversations_rate: 0.22,
      bsat_percent: 4.1,
      total_conversations_count: 298,
    },
  ],
};

// Support/Helpdesk Contact Reasons - High Complexity
const SUPPORT_HIGH_COMPLEXITY_CONTACT_REASONS: ContactReasonsConfiguration = {
  useCases: [
    {
      intent_id: 'support_hc_001_integration_issue',
      bot_id: 'support_bot_hc_001',
      intent_name: 'API integration problem',
      bot_name: 'support-complex-bot',
      channel: 'chat',
      reply_method: 'Dialogues',
      conversations_count: 89,
      automated_resolutions_rate: 0.25,
      custom_resolutions_rate: 0.45,
      escalated_conversations_rate: 0.3,
      bsat_percent: 3.8,
    },
    {
      intent_id: 'support_hc_002_data_migration',
      bot_id: 'support_bot_hc_002',
      intent_name: 'Data migration assistance',
      bot_name: 'support-complex-bot',
      channel: 'ticket',
      reply_method: 'Procedures',
      conversations_count: 67,
      automated_resolutions_rate: 0.15,
      custom_resolutions_rate: 0.55,
      escalated_conversations_rate: 0.3,
      bsat_percent: 4.0,
    },
  ],
  knowledgeSources: [
    {
      article_name: 'Advanced API troubleshooting',
      kb_source_type: 'internal_docs',
      kb_name: 'Developer Resources KB',
      usage_rate: 0.34,
      automated_resolutions_rate: 0.45,
      escalated_conversations_rate: 0.42,
      bsat_percent: 3.9,
      total_conversations_count: 156,
    },
    {
      article_name: 'Enterprise migration procedures',
      kb_source_type: 'confluence',
      kb_name: 'Enterprise Solutions KB',
      usage_rate: 0.28,
      automated_resolutions_rate: 0.32,
      escalated_conversations_rate: 0.48,
      bsat_percent: 3.7,
      total_conversations_count: 89,
    },
  ],
};

// Telecommunications Contact Reasons - High Automation
const TELECOM_HIGH_AUTOMATION_CONTACT_REASONS: ContactReasonsConfiguration = {
  useCases: [
    {
      intent_id: 'telecom_001_service_status',
      bot_id: 'telecom_bot_ha_001',
      intent_name: 'Service status check',
      bot_name: 'telecom-automation-bot',
      channel: 'chat',
      reply_method: 'Dialogues',
      conversations_count: 456,
      automated_resolutions_rate: 0.94,
      custom_resolutions_rate: 0.04,
      escalated_conversations_rate: 0.02,
      bsat_percent: 4.5,
    },
    {
      intent_id: 'telecom_002_bill_inquiry',
      bot_id: 'telecom_bot_ha_002',
      intent_name: 'Billing inquiry',
      bot_name: 'telecom-automation-bot',
      channel: 'ticket',
      reply_method: 'Procedures',
      conversations_count: 298,
      automated_resolutions_rate: 0.87,
      custom_resolutions_rate: 0.08,
      escalated_conversations_rate: 0.05,
      bsat_percent: 4.3,
    },
  ],
  knowledgeSources: [
    {
      article_name: 'Network status and outage info',
      kb_source_type: 'internal_docs',
      kb_name: 'Network Operations KB',
      usage_rate: 0.89,
      automated_resolutions_rate: 0.96,
      escalated_conversations_rate: 0.02,
      bsat_percent: 4.6,
      total_conversations_count: 1456,
    },
    {
      article_name: 'Billing and account management',
      kb_source_type: 'zendesk_guide',
      kb_name: 'Customer Service KB',
      usage_rate: 0.76,
      automated_resolutions_rate: 0.91,
      escalated_conversations_rate: 0.06,
      bsat_percent: 4.4,
      total_conversations_count: 678,
    },
  ],
};

// Telecommunications Contact Reasons - Network Issues
const TELECOM_NETWORK_ISSUES_CONTACT_REASONS: ContactReasonsConfiguration = {
  useCases: [
    {
      intent_id: 'telecom_ni_001_outage_report',
      bot_id: 'telecom_bot_ni_001',
      intent_name: 'Network outage report',
      bot_name: 'telecom-issues-bot',
      channel: 'chat',
      reply_method: 'Dialogues',
      conversations_count: 789,
      automated_resolutions_rate: 0.34,
      custom_resolutions_rate: 0.28,
      escalated_conversations_rate: 0.38,
      bsat_percent: 3.2,
    },
    {
      intent_id: 'telecom_ni_002_speed_complaint',
      bot_id: 'telecom_bot_ni_002',
      intent_name: 'Internet speed complaint',
      bot_name: 'telecom-issues-bot',
      channel: 'ticket',
      reply_method: 'Procedures',
      conversations_count: 567,
      automated_resolutions_rate: 0.28,
      custom_resolutions_rate: 0.45,
      escalated_conversations_rate: 0.27,
      bsat_percent: 3.5,
    },
  ],
  knowledgeSources: [
    {
      article_name: 'Network troubleshooting guide',
      kb_source_type: 'internal_docs',
      kb_name: 'Technical Support KB',
      usage_rate: 0.67,
      automated_resolutions_rate: 0.45,
      escalated_conversations_rate: 0.38,
      bsat_percent: 3.4,
      total_conversations_count: 2345,
    },
    {
      article_name: 'Service disruption procedures',
      kb_source_type: 'confluence',
      kb_name: 'Emergency Response KB',
      usage_rate: 0.54,
      automated_resolutions_rate: 0.39,
      escalated_conversations_rate: 0.42,
      bsat_percent: 3.3,
      total_conversations_count: 1234,
    },
  ],
};

// Healthcare Contact Reasons - Appointments
const HEALTHCARE_APPOINTMENTS_CONTACT_REASONS: ContactReasonsConfiguration = {
  useCases: [
    {
      intent_id: 'health_app_001_schedule',
      bot_id: 'health_bot_app_001',
      intent_name: 'Schedule appointment',
      bot_name: 'healthcare-appointments-bot',
      channel: 'chat',
      reply_method: 'Dialogues',
      conversations_count: 345,
      automated_resolutions_rate: 0.78,
      custom_resolutions_rate: 0.15,
      escalated_conversations_rate: 0.07,
      bsat_percent: 4.3,
    },
    {
      intent_id: 'health_app_002_reschedule',
      bot_id: 'health_bot_app_002',
      intent_name: 'Reschedule appointment',
      bot_name: 'healthcare-appointments-bot',
      channel: 'ticket',
      reply_method: 'Procedures',
      conversations_count: 234,
      automated_resolutions_rate: 0.82,
      custom_resolutions_rate: 0.12,
      escalated_conversations_rate: 0.06,
      bsat_percent: 4.4,
    },
  ],
  knowledgeSources: [
    {
      article_name: 'Appointment scheduling procedures',
      kb_source_type: 'internal_docs',
      kb_name: 'Healthcare Operations KB',
      usage_rate: 0.83,
      automated_resolutions_rate: 0.89,
      escalated_conversations_rate: 0.07,
      bsat_percent: 4.5,
      total_conversations_count: 789,
    },
    {
      article_name: 'Patient portal guide',
      kb_source_type: 'zendesk_guide',
      kb_name: 'Patient Support KB',
      usage_rate: 0.65,
      automated_resolutions_rate: 0.76,
      escalated_conversations_rate: 0.18,
      bsat_percent: 4.2,
      total_conversations_count: 456,
    },
  ],
};

// Healthcare Contact Reasons - Insurance & Claims
const HEALTHCARE_INSURANCE_CONTACT_REASONS: ContactReasonsConfiguration = {
  useCases: [
    {
      intent_id: 'health_ins_001_verification',
      bot_id: 'health_bot_ins_001',
      intent_name: 'Insurance verification',
      bot_name: 'healthcare-insurance-bot',
      channel: 'chat',
      reply_method: 'Dialogues',
      conversations_count: 198,
      automated_resolutions_rate: 0.65,
      custom_resolutions_rate: 0.25,
      escalated_conversations_rate: 0.1,
      bsat_percent: 4.1,
    },
    {
      intent_id: 'health_ins_002_claims_status',
      bot_id: 'health_bot_ins_002',
      intent_name: 'Claims status inquiry',
      bot_name: 'healthcare-insurance-bot',
      channel: 'ticket',
      reply_method: 'Procedures',
      conversations_count: 167,
      automated_resolutions_rate: 0.58,
      custom_resolutions_rate: 0.28,
      escalated_conversations_rate: 0.14,
      bsat_percent: 3.9,
    },
  ],
  knowledgeSources: [
    {
      article_name: 'Insurance coverage and benefits',
      kb_source_type: 'confluence',
      kb_name: 'Insurance Documentation',
      usage_rate: 0.72,
      automated_resolutions_rate: 0.69,
      escalated_conversations_rate: 0.21,
      bsat_percent: 4.0,
      total_conversations_count: 567,
    },
    {
      article_name: 'Claims processing procedures',
      kb_source_type: 'internal_docs',
      kb_name: 'Claims Management KB',
      usage_rate: 0.59,
      automated_resolutions_rate: 0.61,
      escalated_conversations_rate: 0.26,
      bsat_percent: 3.8,
      total_conversations_count: 345,
    },
  ],
};

// ============================================
// SUGGESTIONS CONFIGURATIONS - Industry-specific
// ============================================

// Default/Universal Suggestions
const DEFAULT_SUGGESTIONS_CONFIG: SuggestionsConfiguration = {
  suggestions: [
    {
      name: 'Account assistance',
      description: 'Customer needs help with account-related issues',
      numberOfConversations: 125,
    },
    {
      name: 'Service inquiry',
      description: 'Customer is asking about available services',
      numberOfConversations: 89,
    },
  ],
};

// Finance Industry Suggestions - High Volume
const FINANCE_HIGH_VOLUME_SUGGESTIONS: SuggestionsConfiguration = {
  suggestions: [
    {
      name: 'Credit card application status',
      description: 'Customer inquiring about their credit card application progress',
      numberOfConversations: 156,
    },
    {
      name: 'Investment portfolio review',
      description: 'Customer wants to review their investment portfolio performance',
      numberOfConversations: 134,
    },
  ],
};

// Finance Industry Suggestions - Moderate
const FINANCE_MODERATE_SUGGESTIONS: SuggestionsConfiguration = {
  suggestions: [
    {
      name: 'Mortgage pre-approval inquiry',
      description: 'Customer seeking information about mortgage pre-approval process',
      numberOfConversations: 67,
    },
    {
      name: 'Personal loan eligibility',
      description: 'Customer checking their eligibility for personal loans',
      numberOfConversations: 52,
    },
  ],
};

// Retail/Ecommerce Suggestions - High Volume
const RETAIL_HIGH_VOLUME_SUGGESTIONS: SuggestionsConfiguration = {
  suggestions: [
    {
      name: 'Product size exchange',
      description: 'Customer wants to exchange product for different size',
      numberOfConversations: 298,
    },
    {
      name: 'Loyalty program benefits',
      description: 'Customer inquiring about loyalty program benefits and points',
      numberOfConversations: 234,
    },
  ],
};

// Retail/Ecommerce Suggestions - Seasonal Peak
const RETAIL_SEASONAL_PEAK_SUGGESTIONS: SuggestionsConfiguration = {
  suggestions: [
    {
      name: 'Holiday gift wrap options',
      description: 'Customer asking about gift wrapping services for holiday orders',
      numberOfConversations: 456,
    },
    {
      name: 'Express shipping availability',
      description: 'Customer checking for expedited shipping options during peak season',
      numberOfConversations: 567,
    },
  ],
};

// Support/Helpdesk Suggestions - Balanced
const SUPPORT_BALANCED_SUGGESTIONS: SuggestionsConfiguration = {
  suggestions: [
    {
      name: 'Two-factor authentication setup',
      description: 'Customer needs help setting up two-factor authentication',
      numberOfConversations: 145,
    },
    {
      name: 'Browser compatibility issues',
      description: 'Customer experiencing issues with browser compatibility',
      numberOfConversations: 98,
    },
  ],
};

// Support/Helpdesk Suggestions - High Complexity
const SUPPORT_HIGH_COMPLEXITY_SUGGESTIONS: SuggestionsConfiguration = {
  suggestions: [
    {
      name: 'API rate limit configuration',
      description: 'Customer needs help configuring API rate limits for their application',
      numberOfConversations: 34,
    },
    {
      name: 'Custom webhook implementation',
      description: 'Customer requires assistance with custom webhook setup and troubleshooting',
      numberOfConversations: 27,
    },
  ],
};

// Telecommunications Suggestions - High Automation
const TELECOM_HIGH_AUTOMATION_SUGGESTIONS: SuggestionsConfiguration = {
  suggestions: [
    {
      name: '5G coverage area inquiry',
      description: 'Customer asking about 5G network coverage in their area',
      numberOfConversations: 234,
    },
    {
      name: 'Device upgrade eligibility',
      description: 'Customer checking eligibility for device upgrade programs',
      numberOfConversations: 198,
    },
  ],
};

// Telecommunications Suggestions - Network Issues
const TELECOM_NETWORK_ISSUES_SUGGESTIONS: SuggestionsConfiguration = {
  suggestions: [
    {
      name: 'Signal booster request',
      description: 'Customer requesting information about signal boosters for poor coverage areas',
      numberOfConversations: 345,
    },
    {
      name: 'Network maintenance notification',
      description: 'Customer wanting to be notified about scheduled network maintenance',
      numberOfConversations: 278,
    },
  ],
};

// Healthcare Suggestions - Appointments
const HEALTHCARE_APPOINTMENTS_SUGGESTIONS: SuggestionsConfiguration = {
  suggestions: [
    {
      name: 'Telehealth consultation request',
      description: 'Patient requesting to schedule a telehealth consultation',
      numberOfConversations: 167,
    },
    {
      name: 'Vaccination appointment booking',
      description: 'Patient wanting to book vaccination appointments',
      numberOfConversations: 134,
    },
  ],
};

// Healthcare Suggestions - Insurance & Claims
const HEALTHCARE_INSURANCE_SUGGESTIONS: SuggestionsConfiguration = {
  suggestions: [
    {
      name: 'Pre-authorization request status',
      description: 'Patient checking the status of their pre-authorization request',
      numberOfConversations: 89,
    },
    {
      name: 'Explanation of benefits inquiry',
      description: 'Patient needs help understanding their explanation of benefits',
      numberOfConversations: 76,
    },
  ],
};

// ============================================
// DEFAULT KPI CONFIGURATION - Used by ALL templates
// ============================================

const DEFAULT_KPI_CONFIG: KPIConfiguration = {
  // BSAT Metrics
  bsat_response_rate: 0.45,
  bsat_response_count: 15,
  bsat_percentage: 0.75,
  bsat_conversations_count: 0,

  // Conversation Metrics
  total_volume: 125,
  understood_conversations_rate: 0.544,
  understood_conversations: 68,

  // Performance Metrics
  processed_conversations: 27,
  processed_conversations_rate: 0.216,
  ai_agent_handled_conversations: 48,
  ai_agent_handled_conversations_rate: 0.384,
  escalated_conversations_rate: 0.296,
  escalated_conversations: 37,
  assisted_conversations: 40,
  assisted_conversations_rate: 0.3,
  // Feedback Rating Breakdown (returns array of 2 ratings as example), the maximum number can be 5 as each feedback_last_rating represent 1,2,3,4,5 so this can be the key
  feedback_rating_breakdown: [
    {
      feedback_last_rating: 5,
      bsat_response_count: 13,
      total_feedback_response_rate: 50,
    },
    {
      feedback_last_rating: 4,
      bsat_response_count: 77,
      total_feedback_response_rate: 50,
    },
  ],
};

// ============================================
// AI AGENTS TEMPLATES ARRAY
// ============================================

export const AI_AGENTS_TEMPLATES: AIAgentsTemplate[] = [
  // FINANCE INDUSTRY TEMPLATES
  {
    id: 'aiagents_finance_high_volume',
    name: 'Finance - High Volume',
    description: 'KPI configuration for high-volume financial services with strong automation rates',
    industry: ['finance'],
    configuration: {
      kpis: DEFAULT_KPI_CONFIG,
      contactReasons: FINANCE_HIGH_VOLUME_CONTACT_REASONS,
      suggestions: FINANCE_HIGH_VOLUME_SUGGESTIONS,
    },
  },
  {
    id: 'aiagents_finance_moderate',
    name: 'Finance - Moderate Activity',
    description: 'Balanced KPI configuration for moderate financial service operations',
    industry: ['finance'],
    configuration: {
      kpis: DEFAULT_KPI_CONFIG,
      contactReasons: FINANCE_MODERATE_CONTACT_REASONS,
      suggestions: FINANCE_MODERATE_SUGGESTIONS,
    },
  },

  // RETAIL/ECOMMERCE TEMPLATES
  {
    id: 'aiagents_retail_high_volume',
    name: 'Retail - High Volume',
    description: 'KPI configuration for high-traffic retail operations with consistent automation',
    industry: ['retail', 'ecommerce'],
    configuration: {
      kpis: DEFAULT_KPI_CONFIG,
      contactReasons: RETAIL_HIGH_VOLUME_CONTACT_REASONS,
      suggestions: RETAIL_HIGH_VOLUME_SUGGESTIONS,
    },
  },
  {
    id: 'aiagents_retail_seasonal_peak',
    name: 'Retail - Seasonal Peak',
    description: 'KPI configuration optimized for peak shopping seasons with increased volume',
    industry: ['retail', 'ecommerce'],
    configuration: {
      kpis: DEFAULT_KPI_CONFIG,
      contactReasons: RETAIL_SEASONAL_PEAK_CONTACT_REASONS,
      suggestions: RETAIL_SEASONAL_PEAK_SUGGESTIONS,
    },
  },

  // SUPPORT/HELPDESK TEMPLATES
  {
    id: 'aiagents_support_balanced',
    name: 'Support - Balanced',
    description: 'Balanced KPI configuration for general support operations',
    industry: ['support', 'helpdesk'],
    configuration: {
      kpis: DEFAULT_KPI_CONFIG,
      contactReasons: SUPPORT_BALANCED_CONTACT_REASONS,
      suggestions: SUPPORT_BALANCED_SUGGESTIONS,
    },
  },
  {
    id: 'aiagents_support_high_complexity',
    name: 'Support - High Complexity',
    description: 'KPI configuration for complex support scenarios with higher escalation rates',
    industry: ['support', 'helpdesk'],
    configuration: {
      kpis: DEFAULT_KPI_CONFIG,
      contactReasons: SUPPORT_HIGH_COMPLEXITY_CONTACT_REASONS,
      suggestions: SUPPORT_HIGH_COMPLEXITY_SUGGESTIONS,
    },
  },

  // TELECOMMUNICATIONS TEMPLATES
  {
    id: 'aiagents_telecom_high_automation',
    name: 'Telecom - High Automation',
    description: 'KPI configuration for telecom operations with excellent automation rates',
    industry: ['telecommunications'],
    configuration: {
      kpis: DEFAULT_KPI_CONFIG,
      contactReasons: TELECOM_HIGH_AUTOMATION_CONTACT_REASONS,
      suggestions: TELECOM_HIGH_AUTOMATION_SUGGESTIONS,
    },
  },
  {
    id: 'aiagents_telecom_network_issues',
    name: 'Telecom - Network Issues',
    description: 'KPI configuration for periods with network disruptions and increased complexity',
    industry: ['telecommunications'],
    configuration: {
      kpis: DEFAULT_KPI_CONFIG,
      contactReasons: TELECOM_NETWORK_ISSUES_CONTACT_REASONS,
      suggestions: TELECOM_NETWORK_ISSUES_SUGGESTIONS,
    },
  },

  // HEALTHCARE TEMPLATES
  {
    id: 'aiagents_healthcare_appointments',
    name: 'Healthcare - Appointments',
    description: 'KPI configuration focused on appointment scheduling and routine inquiries',
    industry: ['healthcare'],
    configuration: {
      kpis: DEFAULT_KPI_CONFIG,
      contactReasons: HEALTHCARE_APPOINTMENTS_CONTACT_REASONS,
      suggestions: HEALTHCARE_APPOINTMENTS_SUGGESTIONS,
    },
  },
  {
    id: 'aiagents_healthcare_insurance',
    name: 'Healthcare - Insurance & Claims',
    description: 'KPI configuration for insurance verification and claims processing',
    industry: ['healthcare'],
    configuration: {
      kpis: DEFAULT_KPI_CONFIG,
      contactReasons: HEALTHCARE_INSURANCE_CONTACT_REASONS,
      suggestions: HEALTHCARE_INSURANCE_SUGGESTIONS,
    },
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getAIAgentsTemplatesByIndustry = (industry: string): AIAgentsTemplate[] => {
  return AI_AGENTS_TEMPLATES.filter((template) => template.industry.includes(industry));
};

export const getAIAgentsTemplateById = (id: string): AIAgentsTemplate | undefined => {
  return AI_AGENTS_TEMPLATES.find((template) => template.id === id);
};
