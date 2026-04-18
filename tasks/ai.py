import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))



def generate_subtasks(task_text):
    return {
        "subtasks": [
            f"Analyze: {task_text}",
            "Design solution",
            "Implement backend",
            "Implement frontend",
            "Test system"
        ]
    }