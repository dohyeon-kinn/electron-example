import { HashRouter, Navigate, Routes as ReactRoutes, Route } from 'react-router';

import { PATH } from '@/constants/path';
import { Index } from './index';

export function Routes() {
  return (
    <HashRouter>
      <ReactRoutes>
        <Route path={PATH.INDEX} element={<Index />} />
        <Route path="*" element={<Navigate to={PATH.INDEX} replace />} />
      </ReactRoutes>
    </HashRouter>
  );
}
