import google.generativeai as genai

try:
    tool = genai.protos.Tool(google_search=genai.protos.GoogleSearch())
    print("Successfully created Tool with google_search")
    print(tool)
except Exception as e:
    print(f"Error creating Tool: {e}")

try:
    tool2 = genai.protos.Tool(google_search_retrieval=genai.protos.GoogleSearchRetrieval())
    print("Successfully created Tool with google_search_retrieval")
    print(tool2)
except Exception as e:
    print(f"Error creating Tool2: {e}")
