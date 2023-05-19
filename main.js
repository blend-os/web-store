const { app, BrowserWindow, Menu, ipcMain, shell, Notification, session } = require('electron')
const { exec, spawn } = require("child_process")
const path = require('path')

var mainWindow = undefined

function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 1000,
    minHeight: 600,
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    }
  })

  mainWindow.setMenu(null)

  mainWindow.loadFile('src/index.html')
}

function createAppWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src/app_preload.js'),
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: false,
      allowRunningInsecureContent: false
    }
  })

  let ua = mainWindow.webContents.userAgent;
  ua = ua.replace(/Chrome\/[0-9\.-]*/,'');
  ua = ua.replace(/Electron\/*/,'');
  mainWindow.webContents.userAgent = ua;

  let menuTemplate = [
    {
      label: 'App',
      submenu: [
        {
          label: 'Quit', accelerator: 'CmdOrCtrl+Q',
          click: function () {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Back',
      click: function () {
        mainWindow.webContents.goBack()
      }
    },
    {
      label: 'Reload',
      click: function () {
        mainWindow.reload()
      }
    }
  ]

  mainWindow.setMenu(Menu.buildFromTemplate(menuTemplate))

  url = process.argv[process.argv.indexOf('--url') + 1]

  if (!/^https?:\/\//i.test(url)) {
    url = 'http://' + url;
  }

  mainWindow.loadURL(url)

  // workaround: https://github.com/electron/electron/issues/9995#issuecomment-314999042
  var cookies = session.defaultSession.cookies;
  cookies.on('changed', function(event, cookie, cause, removed) {
    if (cookie.session && !removed) {
      var url = util.format('%s://%s%s', (!cookie.httpOnly && cookie.secure) ? 'https' : 'http', cookie.domain, cookie.path);
      console.log('url', url);
      cookies.set({
        url: url,
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        expirationDate: Math.floor(new Date().getTime() / 1000) + 30*24*60*60
      }, function(err) {
        if (err) {
          log.error('Error trying to persist cookie', err, cookie);
        }
      });
    }
  })
}

app.whenReady().then(() => {
  app.commandLine.appendSwitch('ignore-gpu-blacklist')
  app.commandLine.appendSwitch('enable-gpu-rasterization')
  app.commandLine.appendSwitch('enable-accelerated-video')
  app.commandLine.appendSwitch('enable-accelerated-video-decode')
  app.commandLine.appendSwitch('use-gl', 'desktop')
  app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder')

  if (process.argv.includes('--class-name') && process.argv.includes('--url')) {
    app.setName(process.argv[process.argv.indexOf('--class-name') + 1])
    createAppWindow()

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      orig_url = process.argv[process.argv.indexOf('--url') + 1]
      if (!/^https?:\/\//i.test(orig_url)) {
        orig_url = 'http://' + orig_url;
      }

      // For apps like Canva, that allow for authentication using Google and Facebook accounts
      if (!url.includes(new URL(orig_url).hostname.replace('www.', ''))) {
        e.preventDefault();
        shell.openExternal(url);
      } else {
        let menuTemplate = [
          {
            label: 'App',
            submenu: [
              {
                label: 'Quit', accelerator: 'CmdOrCtrl+Q',
                click: function () {
                  app.quit()
                }
              }
            ]
          },
          {
            label: 'Back',
            click: function () {
              mainWindow.webContents.goBack()
            }
          },
          {
            label: 'Reload',
            click: function () {
              mainWindow.reload()
            }
          }
        ]

        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            autoHideMenuBar: true
          }
        }
      }
    });

    mainWindow.webContents.on('will-navigate', function (e, url) {
      orig_url = process.argv[process.argv.indexOf('--url') + 1]
      if (!/^https?:\/\//i.test(orig_url)) {
        orig_url = 'http://' + orig_url;
      }

      // For apps like Canva, that allow for authentication using Google accounts
      if (!url.includes(new URL(orig_url).hostname.replace('www.', '')) && !url.includes('accounts.google.com')) {
        e.preventDefault();
        shell.openExternal(url);
      }
    });
  } else {
    createWindow()
  }
})

ipcMain.on('gen-install-wapp', (event, app_data) => {
  let web_app_inst = spawn('blend-wapp-inst', [app_data['app']['name'], app_data['app']['category'], app_data['app']['summary'], app_data['app']['name'].replaceAll(' ', '-').replace("'", ""), app_data['app']['logo'], 'Network;BlendWebApp;', 'Web;App;', app_data['app']['pwa_url']])
  web_app_inst.on('close', code => {
    if (code != 0) {
      mainWindow.webContents.executeJavaScript("webview.send('is-wapp-installed', 'failed_install')")
    } else {
      mainWindow.webContents.executeJavaScript("webview.send('is-wapp-installed', true)")
    }
  })
})

ipcMain.on('remove-wapp', (event, wapp_name) => {
  exec(`rm -f "\${HOME}/.local/share/applications/blend_wapp_${wapp_name}.desktop"`, (error, stdout, stderr) => {
    if (error) {
      console.log(stderr)
      new Notification({ title: 'Web Apps', body: 'There was an error while removing the web app.' }).show()
      mainWindow.webContents.executeJavaScript("webview.send('is-wapp-installed', true)")
    } else {
      mainWindow.webContents.executeJavaScript("webview.send('is-wapp-installed', false)")
    }
  })
})

app.on('window-all-closed', function () {
  app.quit()
})
