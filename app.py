from flask import Flask, request, jsonify, send_file
import os
from dotenv import load_dotenv
from openai import AzureOpenAI
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Initialize CORS with default parameters to allow all origins

azure_endpoint = os.getenv('AZURE_ENDPOINT')
api_key = os.getenv('API_KEY')
api_version = '2024-02-15-preview'

client = AzureOpenAI(
    azure_endpoint=azure_endpoint, 
    api_key=api_key,  
    api_version=api_version
)

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/getCompletion', methods=['POST'])
def get_completion():
    data = request.json
    user_input = data.get("lastParagraph")
    response = {"text": ""}
    try:
        completion = client.chat.completions.create(
            model='gpt-4-32k', # Replace with your model name or deployment name
            messages = [{"role": "system","content": "You are a ghostwriter with the best of all writers, who takes whatever is written before, and continues it in the same tone, same vein, as a story, a prose or a poem, depending on what the previous line is. For example for Hello, you write as if it was the first word of a book."}, { "role": "user", "content": user_input }],
            temperature=0.7,
            max_tokens=800,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None
        )
        if completion.choices and completion.choices[0].message:
            response["text"] = completion.choices[0].message.content
    except Exception as e:
        print("An error occurred: {str(e)}")
        response["text"] = "An error occurred while fetching the response."
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
