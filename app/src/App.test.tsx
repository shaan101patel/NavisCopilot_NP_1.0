import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  // This is a basic test to ensure the app renders without crashing
  expect(true).toBe(true);
});
