import ExploreInterceptor from '@/models/explore/interceptor';
import BarChatIcon from '@zendeskgarden/svg-icons/src/16/bar-chart-stroke.svg?react';
import GearIcon from '@zendeskgarden/svg-icons/src/16/gear-stroke.svg?react';
import ClipBoardCheckIcon from '@zendeskgarden/svg-icons/src/16/clipboard-check-stroke.svg?react';
import PhoneIcon from '@zendeskgarden/svg-icons/src/16/phone-stroke.svg?react';
import CalendarIcon from '@zendeskgarden/svg-icons/src/16/calendar-stroke.svg?react';
import BotSparkleIcon from '@zendeskgarden/svg-icons/src/16/bot-sparkle-stroke.svg?react';
import HeadsetIcon from '@zendeskgarden/svg-icons/src/16/headset-stroke.svg?react';
import AdminInterceptor from '@/models/admin/interceptor';
import WFMInterceptor from '@/models/wfm/interceptor';
import AIAgentsInterceptor from '@/models/aiagents/interceptor';

export const CATEGORY_STATUS = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  comingSoon: 'COMING_SOON',
};

export const CATEGORIES: any = {
  EXPLORE: {
    name: 'Explore',
    description: 'Explore your data with powerful tools and insights.',
    status: CATEGORY_STATUS.active,
    icon: BarChatIcon,
    type: ExploreInterceptor.getDashboardType(),
    errorMessage: 'Make sure you are in explore dashboard.',
    needAnalyze: true,
  },
  ADMIN: {
    name: 'Admin',
    description: 'Manage your Zendesk applications and settings.',
    icon: GearIcon,
    status: CATEGORY_STATUS.active,
    errorMessage: 'Make sure you are in the admin view.',
    type: AdminInterceptor.getDashboardType(),
    needAnalyze: false,
  },
  TALK: {
    name: 'Talk',
    description: 'Configure your Zendesk applications and preferences.',
    icon: PhoneIcon,
    status: CATEGORY_STATUS.comingSoon,
  },
  AI_AGENTS: {
    name: 'AI Agents',
    description: 'Manage your sales and customer relationships.',
    icon: BotSparkleIcon,
    status: CATEGORY_STATUS.active,
    type: AIAgentsInterceptor.getDashboardType(),
  },
  WFM: {
    name: 'WFM',
    description: 'Workforce management and scheduling tools.',
    icon: CalendarIcon,
    status: CATEGORY_STATUS.active,
    errorMessage: 'Make sure you are in the WFM view.',
    type: WFMInterceptor.getDashboardType(),
    needAnalyze: false,
  },
  QA: {
    name: 'QA',
    description: 'Quality Assurance tools and insights.',
    icon: ClipBoardCheckIcon,
    status: CATEGORY_STATUS.comingSoon,
    needAnalyze: false,
  },
  SUPPORT: {
    name: 'Support',
    description: 'Get help and support for your Zendesk applications.',
    icon: HeadsetIcon,
    status: CATEGORY_STATUS.comingSoon,
  },
};
