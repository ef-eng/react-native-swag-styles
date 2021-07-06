import * as React from 'react';
import { useColorScheme } from 'react-native';

interface AppTheme {
  fgColor: string;
  bgColor: string;
}

const LIGHT_THEME: AppTheme = {
  fgColor: '#333',
  bgColor: '#FFF',
};

const DARK_THEME: AppTheme = {
  fgColor: '#EEE',
  bgColor: '#222',
};

const AppThemeContext = React.createContext<AppTheme>(LIGHT_THEME);

export const AppThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DARK_THEME : LIGHT_THEME;
  return (
    <AppThemeContext.Provider value={theme}>
      {children}
    </AppThemeContext.Provider>
  );
};

export const useAppTheme = (): AppTheme => React.useContext(AppThemeContext);
