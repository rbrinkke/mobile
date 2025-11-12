import React from 'react';
import { UniversalPageRenderer } from '../sdui';

/**
 * Demo Screen - Shows SDUI System in Action!
 *
 * This screen uses UniversalPageRenderer to display a page
 * defined entirely by the backend (structure.json).
 *
 * Zero hardcoded UI - everything comes from the backend!
 */
export default function DemoScreen() {
  // Use "demo" page from backend structure
  return <UniversalPageRenderer pageId="demo" />;
}
