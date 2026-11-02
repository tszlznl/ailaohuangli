import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// RTL 的自动 cleanup 依赖全局 afterEach；本项目未开启 vitest globals，这里显式注册。
afterEach(cleanup);
