from flask import Blueprint, request, jsonify
from google.cloud import firestore
import uuid

room_bp = Blueprint('room', __name__)
db = firestore.Client(project="muse491")

@room_bp.route('/create-room', methods=['POST'])
def create_room():
    data = request.get_json()
    host_id = data.get("host_id")

    if not host_id:
        return jsonify({"error": "Missing host_id"}), 400

    room_id = str(uuid.uuid4())[:8]  # Shortened UUID

    db.collection("rooms").document(room_id).set({
        "host": host_id,
        "users": []
    })

    return jsonify({"room_id": room_id, "host_id": host_id, "status": "Room created successfully"}), 200

@room_bp.route('/join-room', methods=['POST'])
def join_room():
    user_id = request.json.get("user_id")
    room_id = request.json.get("room_id")

    if not user_id or not room_id:
        return jsonify({"error": "Missing user_id or room_id"}), 400

    room_ref = db.collection("rooms").document(room_id)
    room_ref.update({"users": firestore.ArrayUnion([user_id])})

    return jsonify({"room_id": room_id, "status": "Joined successfully"}), 200
