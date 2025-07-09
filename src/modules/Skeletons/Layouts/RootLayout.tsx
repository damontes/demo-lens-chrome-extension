import { Breadcrumb } from '@zendeskgarden/react-breadcrumbs';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import ArrowLeftIcon from '@zendeskgarden/svg-icons/src/16/arrow-left-stroke.svg?react';
import styled from 'styled-components';
import { IconButton } from '@zendeskgarden/react-buttons';
import { getCategory } from '@/modules/Categories/Utils/handlers';
import useAppState from '@/storage';

const LABELS: Record<string, string> = {
  'skeletons/categories': 'Categories',
  'skeletons/new': 'New',
};

const SkeletonsLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { skeletonId } = useParams();
  const dashboards = useAppState((state) => state.dashboards);

  const links = location.pathname.split('/').filter(Boolean);

  const getLabel = (path: string) => {
    if (LABELS[path]) {
      return LABELS[path];
    }

    if (path.startsWith('skeletons/categories')) {
      const categories = path.split('/').slice(2);
      const category = getCategory(categories);
      return category?.name || 'Not found';
    }

    if (path.startsWith('skeletons') && skeletonId) {
      const skeleton = dashboards[skeletonId];
      return skeleton?.name || 'Skeleton to update';
    }

    return path;
  };

  const handleBack = () => {
    if (window.history.length <= 1) {
      navigate('/skeletons');
    } else {
      navigate(-1);
    }
  };

  return (
    <div>
      {links.length < 2 ? null : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px' }}>
          <IconButton size="small" aria-label="Go back" onClick={handleBack}>
            <ArrowLeftIcon />
          </IconButton>

          <Breadcrumb style={{ display: 'flex', alignItems: 'center' }}>
            {links.map((key: any, index: number) => {
              const path = links.slice(0, index + 1).join('/');
              if (index === links.length - 1) {
                return <span key={key}>{getLabel(path)}</span>;
              }

              return (
                <CustomLink key={key} to={`/${path}`}>
                  {!index ? 'Home' : getLabel(path)}
                </CustomLink>
              );
            })}
          </Breadcrumb>
        </div>
      )}
      <Outlet />
    </div>
  );
};

const CustomLink = styled(Link)`
  text-decoration: none;
  color: ${(props) => props.theme.palette.green[700]};

  &:hover {
    color: ${(props) => props.theme.palette.green[600]};
  }
`;

export default SkeletonsLayout;
