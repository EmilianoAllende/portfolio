import { render, screen } from '@testing-library/react';
import MarkoBotShell from './components/marko/MarkoBotShell.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

test('renders marko bot shell', () => {
  render(
    <ThemeProvider>
      <MarkoBotShell />
    </ThemeProvider>
  );
  expect(screen.getByText(/20 propuestas/i)).toBeInTheDocument();
  expect(screen.getByText(/aprobar y enviar/i)).toBeInTheDocument();
});
