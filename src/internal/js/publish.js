var $ = require('jquery')
var bcrypt = require("bcrypt");

async function publish() {
    $(".is-invalid").removeClass("is-invalid")

    var isValid = true
    $('input').each(function () {
        if ($(this).val() === '' && !$(this).attr('placeholder').includes('(you can leave this blank)')) {
            $(this).addClass('is-invalid')
            isValid = false
            return false
        }

        if (this.id == 'website' && $(id).val().length < 4) {
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
        }).fail(function () {
            alert('An error occured.')
        })
    }
}