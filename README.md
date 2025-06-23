# Smart Route Planner

A full-stack web application for planning efficient travel routes using TSP algorithms.

## Features

- Secure user authentication (Login/Registration)
- Interactive map interface with Leaflet.js
- Real-time weather information using OpenWeatherMap API
- Two TSP solving algorithms:
  - Greedy (Nearest Neighbor)
  - Dynamic Programming (Held-Karp)
- Route history storage
- Weather conditions display for selected cities

## Tech Stack

- Frontend:
  - HTML, CSS, JavaScript
  - Leaflet.js for maps
  - Bootstrap for styling
- Backend:
  - Node.js
  - Express.js
  - MySQL
- APIs:
  - OpenWeatherMap API
  - OpenStreetMap

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     DB_HOST=your_database_host
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password
     DB_NAME=smart_route_planner
     OPENWEATHERMAP_API_KEY=your_api_key
     PORT=3000
     ```
4. Set up the database:
   ```bash
   npm run setup-db
   ```
5. Start the application:
   ```bash
   npm start
   ```

## Project Structure

```
smart-route-planner/
├── frontend/
│   ├── public/
│   │   ├── css/
│   │   ├── js/
│   │   └── index.html
│   └── views/
├── backend/
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── algorithms/
├── package.json
└── README.md
```

## Contributing

Feel free to submit issues and enhancement requests.

## License

MIT License 