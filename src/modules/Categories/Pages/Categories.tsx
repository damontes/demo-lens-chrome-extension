import { Tiles } from '@zendeskgarden/react-forms';
import { Tag } from '@zendeskgarden/react-tags';
import styled from 'styled-components';
import { useMemo } from 'react';
import useAppState from '@/storage';
import { useToast, Notification } from '@zendeskgarden/react-notifications';
import { useNavigate, useParams } from 'react-router';
import { CATEGORIES, CATEGORY_STATUS } from '../Utils/constants';

const Categories = () => {
  const dashboadDetails = useAppState((state: any) => state.dashboardDetails);
  const navigate = useNavigate();
  const params = useParams();
  const { addToast } = useToast();

  const categoryPath = params['*'];
  const buffer = categoryPath?.split('/').slice(1) ?? [];

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

      navigate(`/skeletons/new?categoryPath=${currentBuffer.join('.')}`);
      return;
    }

    navigate(`/skeletons/categories/${categoryPath}/${value}`);
  };

  const categories = useMemo(() => getCategories(buffer), [categoryPath]);

  return (
    <ListTiles name="categories" isCentered={false} onChange={onChange} value={buffer.at(-1) || ''}>
      {Object.entries(categories).map(([key, category]: any) => {
        const { name, description, status, icon: Icon } = category;
        const isDisabled = status === CATEGORY_STATUS.comingSoon || status === CATEGORY_STATUS.inactive;
        const isComingsoon = status === CATEGORY_STATUS.comingSoon;

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
