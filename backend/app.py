import os
import replicate
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- START OF FIX ---
# Check for the Replicate API token on startup
if not os.environ.get("REPLICATE_API_TOKEN"):
    raise Exception("REPLICATE_API_TOKEN environment variable not set. Please create a .env file and add your token.")
# --- END OF FIX ---

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Route to handle video generation
@app.route('/generate-video', methods=['POST'])
def generate_video():
    """
    Handles a POST request to generate a video based on a user prompt.
    """
    try:
        data = request.get_json()
        prompt = data.get('prompt')

        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400

        output = replicate.run(
            "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
            input={"prompt": prompt}
        )

        video_url = output[0]
        return jsonify({'video_url': video_url})

    # --- START OF FIX ---
    # Specific error handling for Replicate API errors
    except replicate.exceptions.ReplicateError as e:
        # This will catch authentication errors (bad API key) and other Replicate issues
        return jsonify({'error': f"Replicate API Error: {e}"}), 500
    # --- END OF FIX ---
    
    except Exception as e:
        # Handle any other errors
        return jsonify({'error': str(e)}), 500

# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
