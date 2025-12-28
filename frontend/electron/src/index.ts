import type { CapacitorElectronConfig } from '@capacitor-community/electron';
import { getCapacitorElectronConfig, setupElectronDeepLinking } from '@capacitor-community/electron';
import type { MenuItemConstructorOptions } from 'electron';
import { app, MenuItem, shell, globalShortcut } from 'electron';
import electronIsDev from 'electron-is-dev';
import unhandled from 'electron-unhandled';
import { autoUpdater } from 'electron-updater';

import { ElectronCapacitorApp, setupContentSecurityPolicy, setupReloadWatcher } from './setup';

// Graceful handling of unhandled errors.
unhandled();

const isMac = process.platform === 'darwin';

// Define our menu templates (these are optional)
const trayMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [
  new MenuItem({ label: '播放/暂停', accelerator: 'Space', click: () => sendToRenderer('toggle-play') }),
  new MenuItem({ label: '上一首', accelerator: 'Left', click: () => sendToRenderer('prev-track') }),
  new MenuItem({ label: '下一首', accelerator: 'Right', click: () => sendToRenderer('next-track') }),
  new MenuItem({ type: 'separator' }),
  new MenuItem({ label: '退出汽水音乐', role: 'quit' }),
];

const appMenuBarMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [
  // App Menu (macOS only)
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' as const, label: '关于汽水音乐' },
            { type: 'separator' as const },
            { role: 'services' as const, label: '服务' },
            { type: 'separator' as const },
            { role: 'hide' as const, label: '隐藏汽水音乐' },
            { role: 'hideOthers' as const, label: '隐藏其他' },
            { role: 'unhide' as const, label: '显示全部' },
            { type: 'separator' as const },
            { role: 'quit' as const, label: '退出汽水音乐' },
          ],
        },
      ]
    : []),
  // File Menu
  {
    label: '文件',
    submenu: [
      {
        label: '搜索',
        accelerator: 'CmdOrCtrl+F',
        click: () => sendToRenderer('open-search'),
      },
      { type: 'separator' as const },
      isMac ? { role: 'close' as const, label: '关闭窗口' } : { role: 'quit' as const, label: '退出' },
    ],
  },
  // Playback Menu
  {
    label: '播放',
    submenu: [
      {
        label: '播放/暂停',
        accelerator: 'Space',
        click: () => sendToRenderer('toggle-play'),
      },
      {
        label: '上一首',
        accelerator: 'CmdOrCtrl+Left',
        click: () => sendToRenderer('prev-track'),
      },
      {
        label: '下一首',
        accelerator: 'CmdOrCtrl+Right',
        click: () => sendToRenderer('next-track'),
      },
      { type: 'separator' as const },
      {
        label: '音量增大',
        accelerator: 'CmdOrCtrl+Up',
        click: () => sendToRenderer('volume-up'),
      },
      {
        label: '音量减小',
        accelerator: 'CmdOrCtrl+Down',
        click: () => sendToRenderer('volume-down'),
      },
      {
        label: '静音',
        accelerator: 'CmdOrCtrl+M',
        click: () => sendToRenderer('toggle-mute'),
      },
      { type: 'separator' as const },
      {
        label: '随机播放',
        accelerator: 'CmdOrCtrl+S',
        click: () => sendToRenderer('toggle-shuffle'),
      },
      {
        label: '循环播放',
        accelerator: 'CmdOrCtrl+R',
        click: () => sendToRenderer('toggle-repeat'),
      },
    ],
  },
  // View Menu
  {
    label: '显示',
    submenu: [
      { role: 'reload' as const, label: '重新加载' },
      { role: 'forceReload' as const, label: '强制重新加载' },
      { role: 'toggleDevTools' as const, label: '开发者工具' },
      { type: 'separator' as const },
      { role: 'resetZoom' as const, label: '实际大小' },
      { role: 'zoomIn' as const, label: '放大' },
      { role: 'zoomOut' as const, label: '缩小' },
      { type: 'separator' as const },
      { role: 'togglefullscreen' as const, label: '进入全屏幕' },
    ],
  },
  // Window Menu
  {
    label: '窗口',
    submenu: [
      { role: 'minimize' as const, label: '最小化' },
      { role: 'zoom' as const, label: '缩放' },
      ...(isMac
        ? [
            { type: 'separator' as const },
            { role: 'front' as const, label: '全部置于顶层' },
            { type: 'separator' as const },
            { role: 'window' as const, label: '窗口' },
          ]
        : [{ role: 'close' as const, label: '关闭' }]),
    ],
  },
  // Help Menu
  {
    role: 'help' as const,
    label: '帮助',
    submenu: [
      {
        label: '访问官网',
        click: async () => {
          await shell.openExternal('https://music.163.com');
        },
      },
    ],
  },
];

// Helper function to send events to renderer
let mainApp: ElectronCapacitorApp | null = null;

function sendToRenderer(channel: string, ...args: any[]) {
  if (mainApp) {
    const win = mainApp.getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(channel, ...args);
    }
  }
}

// Get Config options from capacitor.config
const capacitorFileConfig: CapacitorElectronConfig = getCapacitorElectronConfig();

// Initialize our app. You can pass menu templates into the app here.
const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig, trayMenuTemplate, appMenuBarMenuTemplate);
mainApp = myCapacitorApp;

// If deeplinking is enabled then we will set it up here.
if (capacitorFileConfig.electron?.deepLinkingEnabled) {
  setupElectronDeepLinking(myCapacitorApp, {
    customProtocol: capacitorFileConfig.electron.deepLinkingCustomProtocol ?? 'sodamusic',
  });
}

// If we are in Dev mode, use the file watcher components.
if (electronIsDev) {
  setupReloadWatcher(myCapacitorApp);
}

// Run Application
(async () => {
  // Wait for electron app to be ready.
  await app.whenReady();

  // Register global shortcuts for media keys
  globalShortcut.register('MediaPlayPause', () => sendToRenderer('toggle-play'));
  globalShortcut.register('MediaPreviousTrack', () => sendToRenderer('prev-track'));
  globalShortcut.register('MediaNextTrack', () => sendToRenderer('next-track'));

  // Security - Set Content-Security-Policy based on whether or not we are in dev mode.
  setupContentSecurityPolicy(myCapacitorApp.getCustomURLScheme());
  // Initialize our app, build windows, and load content.
  await myCapacitorApp.init();
  // Check for updates if we are in a packaged app.
  autoUpdater.checkForUpdatesAndNotify();
})();

// Handle when all of our windows are close (platforms have their own expectations).
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// When the dock icon is clicked.
app.on('activate', async function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) {
    await myCapacitorApp.init();
  }
});

// Cleanup on quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Place all ipc or other electron api calls and custom functionality under this line
