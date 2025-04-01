from flask import Blueprint, request, jsonify
import subprocess
import json

search_bp = Blueprint('search', __name__)

@search_bp.route('/search', methods=['GET'])
def search_song():
    try:
        query = request.args.get('query')  
        result = subprocess.run(['node', '../server/search_song.js', query], capture_output=True, text=True)

        if result.returncode != 0:
            return jsonify({'error': 'Error executing search', 'details': result.stderr}), 500

        try:
            output = json.loads(result.stdout)
            return jsonify(output)
        except json.JSONDecodeError as e:
            return jsonify({'error': 'Invalid JSON returned from Node.js', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'Error running Node.js script', 'details': str(e)}), 500
