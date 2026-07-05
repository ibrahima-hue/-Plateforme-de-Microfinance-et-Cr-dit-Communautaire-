import os
from flask import Flask, send_from_directory

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    dist = app.static_folder
    if path and os.path.exists(os.path.join(dist, path)):
        return send_from_directory(dist, path)
    return send_from_directory(dist, 'index.html')

if __name__ == '__main__':
    app.run(debug=False)
