import type { ForgeConfig } from '@electron-forge/shared-types';
import path from 'node:path';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { PublisherGithub } from '@electron-forge/publisher-github';

const config: ForgeConfig = {
  rebuildConfig: {},
  packagerConfig: {
    asar: true,
    icon: path.resolve(__dirname, 'assets', 'icon'),
    extraResource: ['resources'],
    appCategoryType: 'public.app-category.utilities',
  },
  makers: [
    new MakerDMG({
      format: 'ULFO',
      icon: 'assets/icon.icns',
      background: 'assets/background.png',
      contents: (opts) => [
        { x: 142, y: 245, type: 'file', path: opts.appPath },
        { x: 488, y: 245, type: 'link', path: '/Applications' },
      ],
      additionalDMGOptions: {
        window: { size: { width: 658, height: 498 } },
      },
    }),
    new MakerSquirrel({ iconUrl: 'assets/icon.ico' }),
    new MakerRpm({
      options: { icon: 'assets/icon.png', categories: ['Network', 'Utility'] },
    }),
    new MakerDeb({
      options: { icon: 'assets/icon.png', categories: ['Network', 'Utility'] },
    }),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'dohyeon-kinn',
        name: 'electron-example',
      },
      prerelease: process.env.PRE_RELEASE === 'true',
    }),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
