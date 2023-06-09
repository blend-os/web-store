$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    require('electron').shell.openExternal(this.href);
});

function get_featured_apps () {
    $.getJSON(`https://web-store.blendos.co/api/home`, function (data) {
        window.featured_apps = data.featured_apps

        // Clear apps
        $('.featured-card').each(function(i) {
            this.style.display = 'none';
        })

        data.featured_apps.forEach((app_id, i) => {
            let card_i = i + 1

            $.getJSON(`https://web-store.blendos.co/api/appview?id=${app_id}`, function (data) {
                app_name = data.app.name
                app_data = data

                // Set app button color
                if (data.app.accent != "#000" && data.app.accent != "#000000") {
                    $('#featured-card' + card_i + '-checkout').css('background-color', data.app.accent)
                }

                // Show app.
                $('#featured-card' + card_i + '-card').css('display', 'flex')

                // Set app title.
                $('#featured-card' + card_i + '-title').text(data.app.name)
                $('#featured-card' + card_i + '-title').css('color', data.app.accent)
                console.log(data.app.accent)

                // Load app icon.
                $('#featured-card' + card_i + '-img').attr('src', `https://web-store.blendos.co/content/app_icons/${data.app.logo}`)

                // Load app category
                $('#featured-card' + card_i + '-category').text(data.app.category)

                // Load app summary
                $('#featured-card' + card_i + '-summary').text(truncateText(data.app.summary, 36))
            })
        });
    })
}

function get_top_apps () {
    $.getJSON(`https://web-store.blendos.co/api/home`, function (data) {
        window.apps = data.latest_apps

        // Clear apps
        $('.app-card').each(function(i) {
            this.style.display = 'none';
        })

        // Apps
        try { let app_checkout_accent_i = 0
            $('[id^="app-card"][id$="-checkout"]').each(function () {
                if (data.latest_apps[app_checkout_accent_i].accent != "#000" && data.latest_apps[app_checkout_accent_i].accent != "#000000") {
                    $('#' + this.id).css('background-color', data.latest_apps[app_checkout_accent_i].accent)
                }
                app_checkout_accent_i++
            }) } catch {}

        try { let app_title_i = 0
        $('[id^="app-card"][id$="-title"]').each(function () {
            $('#' + this.id).text(data.latest_apps[app_title_i].name)
            $(('#' + this.id).replace('-title', '-card')).css('display', 'flex')
            $('#' + this.id).css('color', data.latest_apps[app_title_i].accent)
            app_title_i++
        }) } catch {}

        try { let app_img_i = 0
        $('[id^="app-card"][id$="-img"]').each(function () {
            $('#' + this.id).attr('src', `https://web-store.blendos.co/content/app_icons/${data.latest_apps[app_img_i].logo}`)
            app_img_i++
        }) } catch {}

        try { let app_summary_i = 0
        $('[id^="app-card"][id$="-summary"]').each(function () {
            $('#' + this.id).text(truncateText(data.latest_apps[app_summary_i].summary, 36))
            app_summary_i++
        }) } catch {}

        try { let app_category_i = 0
        $('[id^="app-card"][id$="-category"]').each(function () {
            $('#' + this.id).text(data.latest_apps[app_category_i].category)
            app_category_i++
        }) } catch {}
    })
}

show_featured_cards(2, 3)
show_app_cards(4, 3)

get_featured_apps()
get_top_apps()