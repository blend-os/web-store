function apps_search() {
    $.getJSON(`https://web-store.blendos.co/api/search?name=${encodeURI($('#search-text').val())}`, function (data) {
        window.apps = data.results

        // Clear apps
        $('.app-card').each(function (i) {
            this.style.display = 'none';
        })

        // Apps
        try { let app_checkout_accent_i = 0
            $('[id^="app-card"][id$="-checkout"]').each(function () {
                if (data.results[app_checkout_accent_i].accent != "#000" && data.results[app_checkout_accent_i].accent != "#000000") {
                    $('#' + this.id).css('background-color', data.results[app_checkout_accent_i].accent)
                }
                app_checkout_accent_i++
            }) } catch {}

        try {
            let app_title_i = 0
            $('[id^="app-card"][id$="-title"]').each(function () {
                $('#' + this.id).text(data.results[app_title_i].name)
                $(('#' + this.id).replace('-title', '-card')).css('display', 'flex')
                app_title_i++
            })
        } catch { }

        try {
            let app_img_i = 0
            $('[id^="app-card"][id$="-img"]').each(function () {
                $('#' + this.id).attr('src', `https://web-store.blendos.co/content/app_icons/${data.results[app_img_i].logo}`)
                app_img_i++
            })
        } catch { }

        try {
            let app_summary_i = 0
            $('[id^="app-card"][id$="-summary"]').each(function () {
                $('#' + this.id).text(truncateText(data.results[app_summary_i].summary, 36))
                app_summary_i++
            })
        } catch { }

        try {
            let app_category_i = 0
            $('[id^="app-card"][id$="-category"]').each(function () {
                $('#' + this.id).text(data.results[app_category_i].category)
                app_category_i++
            })
        } catch { }
    })
}

function check_out(i) {
    window.location = 'web-app-view.html#' + window.apps[i - 1]['id']
}

function search() {
    apps_search()
}

$('#search-text').on('input', function () { apps_search() })

show_app_cards(4, 3)