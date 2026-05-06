import os
from langchain_groq import ChatGroq

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def evaluate(quiz, user_answers):
    prompt = f"""
You are an expert quiz evaluator. Analyze the quiz and user answers carefully.

Quiz Data:
{quiz}

User Answers (format: question_index -> selected_option_letter):
{user_answers}

For EACH question, provide:
1. The full question text
2. The user's selected option letter AND the full text of that option
3. The correct option letter AND the full text of the correct answer
4. Whether the answer is correct (true/false)
5. A concise 1-2 sentence explanation of WHY the correct answer is right, using knowledge from the document context

Return ONLY valid JSON in this exact format:
{{
  "score": "X/Y",
  "details": [
    {{
      "question": "Full question text here",
      "user_answer_letter": "A",
      "user_answer_text": "Full text of user's selected option",
      "correct_answer_letter": "B", 
      "correct_answer_text": "Full text of the correct option",
      "correct": false,
      "explanation": "Brief explanation of why the correct answer is right based on the document content."
    }}
  ]
}}

Important:
- Always include the full option text, not just the letter
- Explanation should be educational and concise (1-2 sentences max)
- For correct answers, still provide a brief explanation reinforcing why it's correct
"""

    llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=GROQ_API_KEY, temperature=0)
    res = llm.invoke(prompt)
    return res.content