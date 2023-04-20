var used_colors = []

const $ = require("jquery");

var used_colors = []

// https://stackoverflow.com/a/20114692 (Zaheer Ahmed)
function get_dark_color() {
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += Math.floor(Math.random() * 10);
    }

    if (used_colors.includes(color)) {
        color = get_dark_color()
        used_colors.push(color)
    } else {
        used_colors.push(color)
    }

    return color;
}

function truncateText(text, maxLength) {
    let truncated = text

    if (truncated.length > maxLength) {
        truncated = truncated.substr(0, maxLength) + '...';
    }

    return truncated;
}

function show_app_cards (rows, columns) {
    $('#container').append(`
        <div class="row mt-4"></div>
    `)

    // 'i' and 'ii' are counters and this is not minified JS.
    let i = 1;
    let app = 1;
    
    while (i <= rows) {
        let ii = 1;

        $('#container').append(`<div class='row mt-4' id="app_row` + i + `">`)

        while (ii <= columns) {
            $('#app_row' + i).append(`
                <div class="col">
                    <div id="app-card` + app + `-card" class="app-card card mb-3" style="width: 100%; border-radius: 10px; display: none;">
                        <div class="row g-0">
                            <div class="col-md-4">
                                <img id="app-card` + app + `-img" style="padding: 1.2rem;" class="img-fluid rounded-start" alt="app logo">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body card` + app + `-body">
                                    <h5 class="card-title card` + app + `-title" id="app-card` + app + `-title">Loading..</h5>
                                    <p class="card-text card` + app + `-text" id="app-card` + app + `-summary">Loading...</p>
                                    <p class="fw-bold card-text card` + app + `-category" id="app-card` + app + `-category">Loading...</p>
                                </div>
                            </div>
                        </div>
                        <button id="app-card` + app + `-checkout" onclick="check_out('` + app + `')" style="background-color: ${get_dark_color()}; border: none; padding-top: 10px; padding-bottom: 10px; font-weight: bold; border-top-left-radius: 0; border-top-right-radius: 0;" class="btn btn-primary install">View this app</button>
                    </div>
                </div>
            `)

            app++
            ii++
        }

        $('#container').append(`</div>`)

        i++
    }

    $('#container').append('<div class="row mt-4">')
}

function show_featured_cards (rows, columns) {
    $('#featured').append(`
        <div class="row mt-4"></div>
    `)

    // 'i' and 'ii' are counters and this is not minified JS.
    let i = 1;
    let app = 1;
    
    while (i <= rows) {
        let ii = 1;

        $('#featured').append(`<div class='row mt-4' id="featured_row` + i + `">`)

        while (ii <= columns) {
            $('#featured_row' + i).append(`
                <div class="col">
                    <div id="featured-card` + app + `-card" class="featured-card card mb-3" style="width: 100%; border-radius: 10px; display: none;">
                        <div class="row g-0">
                            <div class="col-md-4">
                                <img id="featured-card` + app + `-img" style="padding: 1.2rem;" class="img-fluid rounded-start" alt="app logo">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body featured-card` + app + `-body">
                                    <h5 class="card-title featured-card` + app + `-title" id="featured-card` + app + `-title">Loading..</h5>
                                    <p class="card-text featured-card` + app + `-text" id="featured-card` + app + `-summary">Loading...</p>
                                    <p class="fw-bold card-text featured-card` + app + `-category" id="featured-card` + app + `-category">Loading...</p>
                                </div>
                            </div>
                        </div>
                        <button id="featured-card` + app + `-checkout" onclick="featured_check_out('` + app + `')" style="background-color: #000; border: none; padding-top: 10px; padding-bottom: 10px; font-weight: bold; border-top-left-radius: 0; border-top-right-radius: 0;" class="btn btn-primary install">View this app</button>
                    </div>
                </div>
            `)

            app++
            ii++
        }

        $('#featured').append(`</div>`)

        i++
    }

    $('#featured').append('<div class="row mt-4">')
}

function check_out (i) {
    window.location = 'web-app-view.html#' + window.apps[i-1]['id']
}

function featured_check_out (i) {
    window.location = 'web-app-view.html#' + window.featured_apps[i-1]
}