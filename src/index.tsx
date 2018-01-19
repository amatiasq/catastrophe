import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app/App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();

(Math as { TAU: number }).TAU = Math.PI * 2;

declare global {
  type Renderer2D = CanvasRenderingContext2D;
  type Canvas = HTMLCanvasElement;

  interface Math {
    readonly TAU: number;
  }
}
