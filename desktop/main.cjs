// Electron 主进程：以自定义安全协议托管纯静态页面，保证 ES Module、Worker 与 IndexedDB 正常工作。
const { app, BrowserWindow, protocol, shell, session, dialog, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const DIST = path.join(__dirname, '..', 'outputs', 'afterimage-studio', 'dist');
const SCHEME = 'afterimage';
const ORIGIN = `${SCHEME}://app/`;

protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true },
  },
]);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

async function serve(request) {
  const url = new URL(request.url);
  let rel = decodeURIComponent(url.pathname);
  if (!rel || rel === '/') rel = '/index.html';
  const filePath = path.normalize(path.join(DIST, rel));
  if (filePath !== DIST && !filePath.startsWith(DIST + path.sep)) {
    return new Response('Forbidden', { status: 403 });
  }
  try {
    const data = await fs.readFile(filePath);
    return new Response(data, {
      headers: {
        'content-type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-cache',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#15121a',
    show: false,
    autoHideMenuBar: true,
    title: '余像 AFTERIMAGE',
    icon: path.join(DIST, 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  win.once('ready-to-show', () => win.show());
  win.loadURL(`${ORIGIN}index.html`);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith(ORIGIN)) return;
    event.preventDefault();
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
  });

  return win;
}

function setupDownloads(mainWindow) {
  session.defaultSession.on('will-download', (_event, item) => {
    const suggested = path.join(app.getPath('downloads'), item.getFilename());
    const filePath = dialog.showSaveDialogSync(mainWindow, { title: '保存作品', defaultPath: suggested });
    if (!filePath) item.cancel();
    else item.setSavePath(filePath);
  });
}

const locked = app.requestSingleInstanceLock();
if (!locked) {
  app.quit();
} else {
  app.setAppUserModelId('studio.afterimage.app');
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });

  app.whenReady().then(() => {
    protocol.handle(SCHEME, serve);
    Menu.setApplicationMenu(null);
    const win = createWindow();
    setupDownloads(win);
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
