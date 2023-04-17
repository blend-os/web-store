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
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'src/app_preload.js'),
      webviewTag: true
    }
  })

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
}

app.whenReady().then(() => {
  app.commandLine.appendSwitch('ignore-gpu-blacklist')
  app.commandLine.appendSwitch('enable-gpu-rasterization')
  app.commandLine.appendSwitch('enable-accelerated-video')
  app.commandLine.appendSwitch('enable-accelerated-video-decode')
  app.commandLine.appendSwitch('use-gl', 'desktop')
  app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder')

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = "Chrome";
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  if (process.argv.includes('--class-name') && process.argv.includes('--url')) {
    app.setName(process.argv[process.argv.indexOf('--class-name') + 1])
    createAppWindow()

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
    });

    mainWindow.webContents.on('will-navigate', function (e, url) {
      orig_url = process.argv[process.argv.indexOf('--url') + 1]
      if (!/^https?:\/\//i.test(orig_url)) {
        orig_url = 'http://' + orig_url;
      }

      if (!url.includes(new URL(orig_url).hostname.replace('www.', ''))) {
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
