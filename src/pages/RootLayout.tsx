import { MD } from '@zendeskgarden/react-typography';
import { NavLink, Outlet } from 'react-router';
import styled from 'styled-components';

const NAV_LINKS = [
  { id: 'tab-1', title: 'Skeletons', path: '/skeletons' },
  { id: 'tab-2', title: 'Scenarios', path: '/Scenarios' },
];

const RootLayout = () => {
  return (
    <main id="main-container" style={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative' }}>
      <Navigation>
        {NAV_LINKS.map((navLink: any) => (
          <NavigationLinkContainer key={navLink.id}>
            <NavLink key={navLink.id} to={navLink.path} className={({ isActive }) => (isActive ? 'active' : '')}>
              <MD>{navLink.title}</MD>
            </NavLink>
          </NavigationLinkContainer>
        ))}
      </Navigation>
      <Content>
        <Outlet />
      </Content>
    </main>
  );
};

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.palette.white};
  z-index: 1;
`;

const NavigationLinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex: 1;

  a {
    text-align: center;
    text-decoration: none;
    color: ${({ theme }) => theme.palette.black};
    position: abosolute;
    width: 100%;
    height: 100%;
    padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
    border-bottom: 3px solid transparent;
  }

  a.active {
    border-bottom: 3px solid ${({ theme }) => theme.palette.green[600]};
    color: ${({ theme }) => theme.palette.green[700]};
  }
`;

const Content = styled.div`
  padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.md};
  background-color: ${({ theme }) => theme.palette.grey[100]};
`;

export default RootLayout;
