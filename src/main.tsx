import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against DOM NotFoundError caused by external DOM mutations (Leaflet, browser extensions, translate)
if (typeof Node !== 'undefined') {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (!child || child.parentNode !== this) {
      return child;
    }
    try {
      return originalRemoveChild.call(this, child) as T;
    } catch {
      return child;
    }
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      try {
        return this.appendChild(newNode) as T;
      } catch {
        return newNode;
      }
    }
    try {
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    } catch {
      try {
        return this.appendChild(newNode) as T;
      } catch {
        return newNode;
      }
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

