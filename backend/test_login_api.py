import httpx
import asyncio

async def test_login():
    async with httpx.AsyncClient() as client:
        try:
            print("Enviando petición de login...")
            response = await client.post(
                "http://localhost:8000/api/v1/auth/login",
                json={"username": "admin@uptc.edu.co", "password": "Password123!"},
                timeout=10.0
            )
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_login())
