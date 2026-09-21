# Smart Kisan
AI-powered crop recommendation and agricultural assistance platform.

## Repository Structure
- frontend/ - React web application
- backend/ - FastAPI API
- backend/model/ - Crop prediction model

## Production Notes
- Configure environment variables through the deployment platform.
- Do not commit .env files or local databases.
- Configure REACT_APP_API_URL to the deployed backend URL.
- Configure backend CORS with the deployed frontend origin.
- Use PostgreSQL or another managed database for production persistence.
- FastAPI documentation is available at /docs.
- Backend health check is available at /health.
