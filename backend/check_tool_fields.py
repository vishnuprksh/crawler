import google.generativeai as genai
import google.ai.generativelanguage as glm

print("Available fields in Tool proto:")
print(glm.Tool.meta.fields.keys())
