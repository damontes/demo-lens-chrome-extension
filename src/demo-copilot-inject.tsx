import React from 'react';
import { createRoot } from 'react-dom/client';
import DemoCopilot from './demo-copilot/index';

// Create a container for the demo copilot
const container = document.createElement('div');
container.id = 'demo-copilot-root';
document.body.appendChild(container);

// Mount the React component
const root = createRoot(container);
root.render(<DemoCopilot />);
