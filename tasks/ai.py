import json
import re
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    from openai import OpenAI
    client = OpenAI(api_key=api_key)
else:
    client = None



def extract_keyword(task_text):
    keyword = re.sub(
        r"\b(build|create|make|develop|implement|design)\b",
        "",
        task_text,
        flags=re.IGNORECASE,
    ).strip()

    return keyword if keyword else task_text


# 🔹 smart fallback
def smart_fallback(task_text):
    text = task_text.lower()
    keyword = extract_keyword(task_text).capitalize()

    if "login" in text or "auth" in text:
        return [
            {"title": "Design login UI", "assign": "frontend"},
            {"title": "Create auth API", "assign": "backend"},
            {"title": "Handle authentication", "assign": "backend"},
            {"title": "Connect UI to API", "assign": "frontend"},
            {"title": "Deploy auth service", "assign": "devops"},
        ]

    elif "dashboard" in text:
        return [
            {"title": "Design dashboard UI", "assign": "frontend"},
            {"title": "Create data API", "assign": "backend"},
            {"title": "Fetch dashboard data", "assign": "frontend"},
            {"title": "Optimize queries", "assign": "backend"},
            {"title": "Deploy dashboard", "assign": "devops"},
        ]

    elif "api" in text:
        return [
            {"title": "Design API structure", "assign": "backend"},
            {"title": "Implement endpoints", "assign": "backend"},
            {"title": "Add validation", "assign": "backend"},
            {"title": "Write API docs", "assign": "backend"},
            {"title": "Deploy API", "assign": "devops"},
        ]

    else:
        return [
            {"title": f"Design {keyword}", "assign": "frontend"},
            {"title": f"Build {keyword} API", "assign": "backend"},
            {"title": f"Connect {keyword}", "assign": "frontend"},
            {"title": f"Test {keyword}", "assign": "backend"},
            {"title": f"Deploy {keyword}", "assign": "devops"},
        ]


# 🔥 main function
def generate_subtasks(task_text):
    if client is None:
        return {"subtasks": smart_fallback(task_text)}
    try:
        prompt = f"""
You are a senior project manager.

Break the following task into at least 5 actionable subtasks.

Rules:
- DO NOT include analysis tasks
- DO NOT include tasks starting with "Analyze"
- Each subtask must be clear and executable
- Each subtask must be assigned to one of these roles:
  frontend, backend, devops
- Keep titles short (max 6 words)

Return ONLY a JSON array in this format:
[
  {{ "title": "task title", "assign": "frontend" }}
]

Task:
{task_text}
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful project manager AI."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )

        content = response.choices[0].message.content or ""
        content = content.strip()

       
        content = re.sub(r"```json|```", "", content).strip()

       
        match = re.search(r"\[.*\]", content, re.DOTALL)
        if match:
            content = match.group(0)

        data = json.loads(content)

        data = [
            t for t in data
            if not t["title"].lower().startswith("analyze")
        ]

        
        if len(data) < 3:
            data = smart_fallback(task_text)

    except Exception as e:
        print("❌ AI ERROR:", e)
        print("RAW RESPONSE:", content if 'content' in locals() else "NO CONTENT")

        # 🔥 fallback هوشمند
        data = smart_fallback(task_text)

    return {"subtasks": data}