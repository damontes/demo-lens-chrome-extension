import ExploreInterceptor from '@/models/exploreInterceptor';
import BarChatIcon from '@zendeskgarden/svg-icons/src/16/bar-chart-stroke.svg?react';
import GearIcon from '@zendeskgarden/svg-icons/src/16/gear-stroke.svg?react';
import SparkleIcon from '@zendeskgarden/svg-icons/src/16/sparkle-stroke.svg?react';
import PhoneIcon from '@zendeskgarden/svg-icons/src/16/phone-stroke.svg?react';
import CalendarIcon from '@zendeskgarden/svg-icons/src/16/calendar-stroke.svg?react';
import BotSparkleIcon from '@zendeskgarden/svg-icons/src/16/bot-sparkle-stroke.svg?react';
import HeadsetIcon from '@zendeskgarden/svg-icons/src/16/headset-stroke.svg?react';
import AdminInterceptor from '@/models/adminInterceptor';

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
  },
  ADMIN: {
    name: 'Admin',
    description: 'Manage your Zendesk applications and settings.',
    icon: GearIcon,
    status: CATEGORY_STATUS.active,
    subcategories: {
      OVERVIEW_COPILOT: {
        name: 'Overview Copilot',
        description: 'Get an overview of your Zendesk applications and performance.',
        icon: SparkleIcon,
        status: CATEGORY_STATUS.active,
        errorMessage: 'Make sure you are in the overview copilot admin view.',
        type: AdminInterceptor.getDashboardType(),
      },
    },
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
    status: CATEGORY_STATUS.comingSoon,
  },
  WFM: {
    name: 'WFM',
    description: 'Chat with your customers and support team.',
    icon: CalendarIcon,
    status: CATEGORY_STATUS.comingSoon,
  },
  SUPPORT: {
    name: 'Support',
    description: 'Get help and support for your Zendesk applications.',
    icon: HeadsetIcon,
    status: CATEGORY_STATUS.comingSoon,
  },
};
