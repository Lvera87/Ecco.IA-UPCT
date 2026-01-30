import httpx
import asyncio

async def test_dashboard():
    async with httpx.AsyncClient() as client:
        # 1. Login
        login_resp = await client.post(
            "http://localhost:8000/api/v1/auth/login",
            json={"username": "admin@uptc.edu.co", "password": "Password123!"}
        )
        token = login_resp.json()["access_token"]
        
        # 2. Get Dashboard
        print("Consultando dashboard global...")
        headers = {"Authorization": f"Bearer {token}"}
        resp = await client.get("http://localhost:8000/api/v1/campus/global-dashboard", headers=headers)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()}")

if __name__ == "__main__":
    asyncio.run(test_dashboard())
