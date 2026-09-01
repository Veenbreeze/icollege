iCollege
Initial workspace for the iCollege mobile application and API.
Structure

frontend/ - Expo / React Native mobile application
backend/  - Node.js / Express REST API
reqs/  - Product requirements and design references

Run locally

Install dependencies from the repository root:

powershell
npm --prefix frontend install
npm --prefix backend install


Start the mobile app:

powershell
npm run frontend


Start the API in a second terminal:

powershell
npm run backend


The API listens on `http://localhost:4000` and exposes `GET /api/health`.
