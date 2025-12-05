import google.generativeai as genai
import inspect

print([m for m in dir(genai.protos) if "Search" in m])
