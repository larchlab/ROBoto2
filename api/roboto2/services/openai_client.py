from openai import OpenAI
import os

apiKey = os.getenv("OPENAI_API_KEY")

def create_client():
    return OpenAI(
    api_key=apiKey,
    default_headers={"api-key": apiKey},
)

def get_completion(prompt, model="gpt-3.5-turbo"):
    client = create_client()

    if model == None:
        model = "gpt-3.5-turbo"
    
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model=model,
    )
    
    try:
        return chat_completion
    except Exception as e:
        print("Error: ", e)
        return None