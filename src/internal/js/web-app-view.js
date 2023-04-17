const { ipcRenderer } = require("electron");
const { exec } = require("child_process");

var app_name = undefined
var app_data = undefined

function get_app_info () {
    $.getJSON('https://web-store.blendos.co/api/appview?id=' + window.location.hash.slice(1), function (data) {
        app_name = data.app.name
        app_data = data

        // Set app title.
        $('#app-title').css('color', data.app.accent)
        $('#app-title').text(app_name)

        // Load app icon.
        $('#app-icon').attr('src', `https://web-store.blendos.co/content/app_icons/${data.app.logo}`)

        // Load app category
        $('#app-category').text(data.app.category)

        // Load app summary
        $('#app-summary').text(data.app.summary)

        // Set colors
        $('#app-title').css('color', data.app.accent)
        $('#install_button').css('background-color', data.app.accent)
        $('#install_button').css('border-color', data.app.accent)

        exec(`test -f "\${HOME}/.local/share/applications/blend_wapp_${app_name.replaceAll(' ', '-')}.desktop"`, (error, stdout, stderr) => {
            if (!error) {
                if (stderr.trim() == '') {
                    $('#install_button').text('Remove this app')
                    $('#install_button').attr('onclick', 'remove()')
                }
            }
        })
    })
}

function install () {
    app_data.app.logo = `https://web-store.blendos.co/content/app_icons/${app_data.app.logo}`

    ipcRenderer.send('gen-install-wapp', app_data)
    $('#install_button').text('Installing...')
    $('#install_button').attr('disabled', 'disabled');
    $('#install_button').attr('onclick', '')
}

function remove () {
    ipcRenderer.send('remove-wapp', app_name.replaceAll(' ', '-').replaceAll('\'', ''))
    $('#install_button').text('Removing...')
    $('#install_button').attr('disabled', 'disabled');
    $('#install_button').attr('onclick', '')
}

ipcRenderer.on('is-wapp-installed', (event, wapp_status) => {
    if (wapp_status == true) {
        $('#install_button').text('Remove this app')
        $('#install_button').attr('onclick', 'remove()')
        $('#install_button').removeAttr('disabled')
    } else if (wapp_status == false) {
        $('#install_button').text('Install this app')
        $('#install_button').attr('onclick', `install()`)
        $('#install_button').removeAttr('disabled')
    }

    if (wapp_status == 'failed_install') {
        $('#install_button').text('Failed install')
        setTimeout(function(){
            $('#install_button').text('Install this app')
            $('#install_button').attr('onclick', `install()`)
            $('#install_button').removeAttr('disabled')
        }, 2000)
    }
})

get_app_info()