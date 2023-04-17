#!/usr/bin/python3

from flask import Flask, request, send_file

import json, os, sys, tempfile, bcrypt

os.chdir(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__, static_url_path='/content', static_folder='data/content',)

@app.route("/api/home")
def home():
    with open('data/applist.json') as applist_file:
        applist = json.load(applist_file)
        data = { 'featured_apps': applist['featured_apps'], 'latest_apps': [] }
        for app in list(applist['apps'])[-20:]:
            applist['apps'][app]['id'] = app
            data['latest_apps'].insert(0, applist['apps'][app])
        return data

@app.route("/api/appview")
def appview():
    with open('data/applist.json') as applist_file:
        applist = json.load(applist_file)
        return { 'app': applist['apps'][str(request.args['id'])] }

@app.route("/api/search")
def search():
    with open('data/applist.json') as applist_file:
        data = { 'results': [] }

        if len(request.args['name']) < 1:
            return data

        not_so_relevant = []
        applist = json.load(applist_file)
        for app in applist['apps']:
            app_id = app
            app = applist['apps'][app]
            app['id'] = app_id
            if ''.join(app['name'].split()).lower().find(''.join(request.args['name'].split()).lower()) != -1:
                if ''.join(app['name'].split()).lower().startswith(''.join(request.args['name'].split()).lower()):
                    data['results'].append(app)
                else:
                    not_so_relevant.append(app)
        data['results'] += not_so_relevant
        return data

@app.route("/api/suggest", methods = ['POST'])
def suggest_app():
    with open('data/suggestions.json', 'r+') as suggestions_file:
        suggestionlist = json.load(suggestions_file)
        new_app = {
            'name': request.form['name'],
            'website': request.form['website'],
            'summary': request.form['summary'],
        }
        suggestionlist['apps'].append(new_app)
        suggestions_file.seek(0)
        json.dump(suggestionlist, suggestions_file, indent=4)
        suggestions_file.truncate()
        return { 'success': 'yes' }

def direct_delete(id):
    with open('data/applist.json', 'r+') as applist_file:
        applist = json.load(applist_file)
        del applist['apps'][id]
        applist_file.seek(0)
        json.dump(applist, applist_file, indent=4)
        applist_file.truncate()

if __name__ == "__main__" and sys.argv[1] == "start":
    app.run(debug=False, port=2250, host='0.0.0.0')
elif sys.argv[1] == "direct_delete" and sys.argv[2] is not None:
    direct_delete(sys.argv[2])