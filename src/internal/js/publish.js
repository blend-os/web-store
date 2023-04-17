var $ = require('jquery')
var bcrypt = require("bcrypt");
const { ipcRenderer } = require('electron');

async function publish() {
    $(".is-invalid").removeClass("is-invalid")

    var isValid = true
    $('input').each(function () {
        if ($(this).val() === '' && !$(this).attr('placeholder').includes('(you can leave this blank)')) {
            $(this).addClass('is-invalid')
            isValid = false
            return false
        }

        if (this.id == 'website' && $(this).val().length < 4) {
            $(this).addClass('is-invalid')
            isValid = false
            return false
        }
    });

    if (isValid) {
        summary = 'No summary provided.'

        if ($('#summary').val() != '') {
            summary = $('#summary').val()
        }

        $.post('https://web-store.blendos.co/api/suggest', {
            'name': $('#name').val(),
            'website': $('#website').val(),
            'summary': summary,
        }).fail(() => {
            alert('An error occured.')
        }).done(() => {
            $('#publish-button').attr('disabled', 'disabled')
            $('#publish-button').text('Submitted')
            setTimeout(() => { ipcRenderer.sendToHost('page', 'web') }, 1500)
        })
    }
}