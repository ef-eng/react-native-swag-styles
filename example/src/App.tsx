import * as React from 'react';
import { Example } from './Example';

import { AppThemeProvider } from './AppTheme';

export const App = () => (
  <AppThemeProvider>
    <Example />
  </AppThemeProvider>
);
