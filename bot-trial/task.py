from retrieval import RetrievalEngine, RetrievalResult, RetrievalError

# Step 2: Create one retrieval engine
retrieval_engine = RetrievalEngine()
user_query = "english deparment staff"

result = retrieval_engine.retrieve(user_query)
print(result)