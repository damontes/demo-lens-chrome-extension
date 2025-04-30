import { MD, SM } from '@zendeskgarden/react-typography';
import { DEFAULT_THEME, ThemeProvider, ColorSchemeProvider, useColorScheme } from '@zendeskgarden/react-theming';
import styled from 'styled-components';
import { Tabs } from '@zendeskgarden/react-tabs';
import Dashboards from '../components/Dashboards';
import { useEffect, useState } from 'react';
import { getAppState, getCurrentTabDetails, setAppState } from '../lib/chromeExtension';
import { Spinner } from '@zendeskgarden/react-loaders';
import useAppState from '../storage';
import Configurations from '@/components/Configurations';
import { ToastProvider } from '@zendeskgarden/react-notifications';

const TABS = [
  { id: 'tab-1', title: 'Dashboards', content: Dashboards },
  { id: 'tab-2', title: 'Configurations', content: Configurations },
];
const Popup = () => {
  const { colorScheme } = useColorScheme();
  const [selectedTab, setSelectedTab] = useState(TABS[0].id);
  const [loading, setLoading] = useState(true);

  const setInitalState = useAppState((state: any) => state.setInitialState);

  const getInitialState = async () => {
    setLoading(true);
    const state = await getAppState();
    const dashboadDetails = await getCurrentTabDetails();
    setInitalState({ ...state, dashboadDetails });
    setLoading(false);
  };

  useEffect(() => {
    getInitialState();
    return () => {
      setAppState({
        currentDashboard: null,
      });
    };
  }, []);

  return (
    <ThemeProvider
      theme={{ ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, base: colorScheme, primaryHue: 'green' } }}
    >
      <ToastProvider zIndex={1}>
        <Container>
          <Header>
            <Image src="/icon_zendesk.png" alt="Zendesk logo" />
            <Title style={{ fontWeight: '900', color: '#eee' }}>DemoLens</Title>
          </Header>
        </Container>
        <Tabs selectedItem={selectedTab} onChange={setSelectedTab}>
          <Tabs.TabList style={{ display: 'flex' }}>
            {TABS.map((tab: any) => (
              <Tabs.Tab key={tab.id} item={tab.id} style={{ flex: 1 }}>
                {tab.title}
              </Tabs.Tab>
            ))}
          </Tabs.TabList>
          <Content>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Spinner size="large" />
                <SM>Loading...</SM>
              </div>
            ) : (
              TABS.map((tab: any) => (
                <Tabs.TabPanel key={tab.id} item={tab.id}>
                  <tab.content />
                </Tabs.TabPanel>
              ))
            )}
          </Content>
        </Tabs>
      </ToastProvider>
    </ThemeProvider>
  );
};

const withColorSchemeProvider = (Component: any) => {
  return () => {
    return (
      <ColorSchemeProvider initialColorScheme="light">
        <Component />
      </ColorSchemeProvider>
    );
  };
};

export default withColorSchemeProvider(Popup);

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: ${({ theme }) => theme.palette.black};

  padding: ${({ theme }) => theme.space.md};
`;

const Image = styled.img`
  width: 24px;
  height: 24px;
  aspect-ratio: 1;
  border-radius: 2px;
  overflow: hidden;
`;

const Container = styled.div`
  margin-bottom: 12px;
`;

const Content = styled.div`
  padding: 0 ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.md};
`;

const Title = styled(MD)`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;
