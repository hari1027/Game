/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App';
import { ThemeProvider } from './ThemeContext';

const Main = () => (
    <ThemeProvider>
        <App />
    </ThemeProvider>
);

AppRegistry.registerComponent(appName, () => Main);
