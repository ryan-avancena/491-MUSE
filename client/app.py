from flask import Flask, render_template, request, jsonify
import subprocess
import json

app = Flask(__name__)

# Homepage route
@app.route('/')
def index():
    return render_template('index.html')

# Search route
@app.route('/search', methods=['GET'])
def search_song():
    query = request.args.get('query', '')

    if not query:
        return jsonify({'error': 'No query provided'}), 400

    try:
        # Run the Node.js script and pass the query as an argument
        result = subprocess.run(
            ['node', 'search_song.js', query],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            return jsonify({'error': 'Error executing search', 'details': result.stderr}), 500

        # Parse output to JSON
        search_results = json.loads(result.stdout)
        return jsonify(search_results)

    except Exception as e:
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)
