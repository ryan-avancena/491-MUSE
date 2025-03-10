import subprocess
import json
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Homepage route
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['GET'])
def search_song():
    try:
        query = request.args.get('query')  # Get the query parameter from the URL

        # Run your Node.js script and capture the result
        result = subprocess.run(['node', '../server/search_song.js', query], capture_output=True, text=True)
        
        print("Raw Node.js stdout:", repr(result.stdout))
        print("Raw Node.js stderr:", repr(result.stderr))       
        
        if result.returncode != 0:
            return jsonify({'error': 'Error executing search', 'details': result.stderr}), 500
        
        # Try to parse the JSON output from Node.js
        try:
            output = json.loads(result.stdout)  # Parse the JSON output
            return jsonify(output)  # Return as valid Flask response (JSON)
        except json.JSONDecodeError as e:
            return jsonify({'error': 'Invalid JSON returned from Node.js', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'Error running Node.js script', 'details': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=3000)
