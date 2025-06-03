import { Tiles } from '@zendeskgarden/react-forms';
import { Tag } from '@zendeskgarden/react-tags';
import BarChatIcon from '@zendeskgarden/svg-icons/src/16/bar-chart-stroke.svg?react';
import GearIcon from '@zendeskgarden/svg-icons/src/16/gear-stroke.svg?react';
import SparkleIcon from '@zendeskgarden/svg-icons/src/16/sparkle-stroke.svg?react';
import PhoneIcon from '@zendeskgarden/svg-icons/src/16/phone-stroke.svg?react';
import CalendarIcon from '@zendeskgarden/svg-icons/src/16/calendar-stroke.svg?react';
import BotSparkleIcon from '@zendeskgarden/svg-icons/src/16/bot-sparkle-stroke.svg?react';
import HeadsetIcon from '@zendeskgarden/svg-icons/src/16/headset-stroke.svg?react';
import styled from 'styled-components';
import { useMemo, useState } from 'react';
import { Breadcrumb } from '@zendeskgarden/react-breadcrumbs';
import ExploreInterceptor from '@/models/exploreInterceptor';
import AdminInterceptor from '@/models/adminInterceptor';
import CreateDashboard from '../Dashboards/CreateDashboard';
import useAppState from '@/storage';
import { useToast, Notification } from '@zendeskgarden/react-notifications';

const STATUS = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  comingSoon: 'COMING_SOON',
};

const CATEGORIES: any = {
  EXPLORE: {
    name: 'Explore',
    description: 'Explore your data with powerful tools and insights.',
    status: STATUS.active,
    icon: BarChatIcon,
    type: ExploreInterceptor.getDashboardType(),
    errorMessage: 'Make sure you are in explore dashboard.',
  },
  ADMIN: {
    name: 'Admin',
    description: 'Manage your Zendesk applications and settings.',
    icon: GearIcon,
    status: STATUS.active,
    subcategories: {
      OVERVIEW_COPILOT: {
        name: 'Overview Copilot',
        description: 'Get an overview of your Zendesk applications and performance.',
        icon: SparkleIcon,
        status: STATUS.active,
        errorMessage: 'Make sure you are in the overview copilot admin view.',
        type: AdminInterceptor.getDashboardType(),
      },
    },
  },
  TALK: {
    name: 'Talk',
    description: 'Configure your Zendesk applications and preferences.',
    icon: PhoneIcon,
    status: STATUS.comingSoon,
  },
  AI_AGENTS: {
    name: 'AI Agents',
    description: 'Manage your sales and customer relationships.',
    icon: BotSparkleIcon,
    status: STATUS.comingSoon,
  },
  WFM: {
    name: 'WFM',
    description: 'Chat with your customers and support team.',
    icon: CalendarIcon,
    status: STATUS.comingSoon,
  },
  SUPPORT: {
    name: 'Support',
    description: 'Get help and support for your Zendesk applications.',
    icon: HeadsetIcon,
    status: STATUS.comingSoon,
  },
};

type Props = {
  onClose: () => void;
};

const Categories = ({ onClose }: Props) => {
  const [buffer, setBuffer] = useState<any>([]);

  const saveDashboard = useAppState((state: any) => state.saveDashboard);
  const dashboadDetails = useAppState((state: any) => state.dashboardDetails);
  const setDashboardToAnalyze = useAppState((state: any) => state.setDashboardToAnalyze);

  const dashboardToAnalyze = useAppState((state: any) => state.dashboardToAnalyze);

  const { addToast } = useToast();

  const getCategories = (currentBuffer: any[]) => {
    let currentCategories = CATEGORIES;

    for (const value of currentBuffer) {
      const category = currentCategories[value];
      if (category?.subcategories) {
        currentCategories = category.subcategories;
      } else {
        return null;
      }
    }

    return currentCategories;
  };

  const getCategory = (currentBuffer: string[]) => {
    let category = null;
    let categories = CATEGORIES;

    for (const val of currentBuffer) {
      category = categories[val];
      categories = category?.subcategories || {};
    }

    return category;
  };

  const onChangeBuffer = (index: number) => {
    setBuffer((prev: any) => prev.slice(0, index));
  };

  const onChange = async (event: any) => {
    const value = event.target.value;
    const currentBuffer = [...buffer, value];
    const subcategories = getCategories(currentBuffer);

    if (!subcategories) {
      const url = new URL(dashboadDetails.url);
      const host = url.host;

      if (!host.startsWith('z3n')) {
        addToast(
          ({ close }) => (
            <Notification type="warning">
              <Notification.Title>Warning</Notification.Title>
              <p style={{ maxWidth: '320px', margin: 0 }}>
                Make sure you are in a "z3n" Zendesk subdomain instance and you are already logged in.
              </p>
              <Notification.Close aria-label="Close" onClick={close} />
            </Notification>
          ),
          { placement: 'top-end' },
        );
        return;
      }

      const category = getCategory(currentBuffer);
      setDashboardToAnalyze(category);
      return;
    }

    setBuffer((prev: any) => [...prev, value]);
  };

  const onCreateDashboard = async (id: string, newDashboard: any) => {
    saveDashboard(id, newDashboard);
    onClose();
  };

  const categories = useMemo(() => getCategories(buffer), [buffer.length]);

  if (dashboardToAnalyze) {
    return <CreateDashboard onClose={() => setDashboardToAnalyze(null)} handleSubmit={onCreateDashboard} />;
  }

  return (
    <>
      <Breadcrumb style={{ paddingBottom: '16px' }}>
        <Anchor onClick={onClose}>Home</Anchor>
        {buffer.map((key: any, index: number) => {
          const category = getCategory(buffer.slice(0, index + 1));
          return (
            <Anchor key={key} onClick={() => onChangeBuffer(index)}>
              {category?.name || key}
            </Anchor>
          );
        })}
      </Breadcrumb>
      <ListTiles name="categories" isCentered={false} onChange={onChange} value={buffer.at(-1) || ''}>
        {Object.entries(categories).map(([key, category]: any) => {
          const { name, description, status, icon: Icon } = category;
          const isDisabled = status === STATUS.comingSoon || status === STATUS.inactive;
          const isComingsoon = status === STATUS.comingSoon;

          return (
            <Tiles.Tile value={key} disabled={isDisabled} key={key}>
              <Tiles.Icon>
                <Icon />
              </Tiles.Icon>
              <TileLabel>
                {name}
                {isComingsoon && (
                  <Tag isPill>
                    <span>Coming soon</span>
                  </Tag>
                )}
              </TileLabel>
              <Tiles.Description>{description}</Tiles.Description>
            </Tiles.Tile>
          );
        })}
      </ListTiles>
    </>
  );
};

const ListTiles = styled(Tiles)`
  display: flex;
  flex-direction: column;
  gap: 12px;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const TileLabel = styled(Tiles.Label)`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Anchor = styled.button`
  text-decoration: none;
  color: ${({ theme }) => theme.palette.green[600]};
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease-in-out;

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.palette.green[700]};
  }
`;

export default Categories;
