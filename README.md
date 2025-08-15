AI Video Project (Backend + Frontend)
====================================

Quick start:
1. Unzip and open a terminal.
2. Change directory to the backend folder:
   cd backend
3. Install dependencies:
   npm install
4. Create a .env file in the backend folder (use .env.example as reference) and add:
   OPENAI_API_KEY=sk-...
   RUNWAY_API_KEY=...
5. Start the server:
   npm start
6. Open the site in your browser:
   http://127.0.0.1:3000

Notes:
- This project serves frontend files from /frontend via Express to avoid Cross-Origin issues.
- Runway API endpoints and request body fields may vary by model/plan — check your Runway docs and adapt server.js if needed.
- The server will log API responses to the console for debugging.
