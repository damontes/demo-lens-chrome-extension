import { DEFAULT_THEME } from '@zendeskgarden/react-theming';

type GardenTheme = typeof DEFAULT_THEME;

declare module 'styled-components' {
  export interface DefaultTheme extends GardenTheme {}
}
