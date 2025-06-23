class Routes {
    constructor() {
        this.cities = [];
        this.transportationCosts = {
            plane: 0.5, // $ per km
            train: 0.2, // $ per km
            car: 0.1    // $ per km
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        // City form submission
        document.getElementById('city-form').addEventListener('submit', (e) => this.handleAddCity(e));

        // Calculate route button
        document.getElementById('calculate-route').addEventListener('click', () => this.calculateRoute());

        // Navigation
        document.getElementById('nav-history').addEventListener('click', () => this.showRouteHistory());
        document.getElementById('nav-planner').addEventListener('click', () => this.showRoutePlanner());
    }

    async handleAddCity(e) {
        e.preventDefault();
        const cityInput = document.getElementById('city-name');
        const cityName = cityInput.value.trim();

        if (!cityName) return;

        try {
            // Get city weather (which also validates if the city exists)
            const response = await fetch(`/api/weather/${encodeURIComponent(cityName)}`, {
                headers: auth.getHeaders()
            });

            const data = await response.json();

            if (!data.success) {
                alert('City not found');
                return;
            }

            // Get city coordinates from OpenStreetMap Nominatim API
            const nominatimResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
            );
            const nominatimData = await nominatimResponse.json();

            if (!nominatimData.length) {
                alert('City location not found');
                return;
            }

            const city = {
                name: cityName,
                lat: parseFloat(nominatimData[0].lat),
                lon: parseFloat(nominatimData[0].lon),
                weather: data.weather
            };

            // Add city to list
            this.addCity(city);

            // Clear input
            cityInput.value = '';
        } catch (error) {
            console.error('Error adding city:', error);
            alert('Error adding city');
        }
    }

    addCity(city) {
        // Check if city already exists
        if (this.cities.some(c => c.name === city.name)) {
            alert('City already added');
            return;
        }

        this.cities.push(city);

        // Add to list
        const li = document.createElement('li');
        li.className = 'list-group-item city-item';
        li.innerHTML = `
            ${city.name}
            <span class="remove-city" data-city="${city.name}">&times;</span>
        `;
        li.querySelector('.remove-city').addEventListener('click', () => this.removeCity(city.name));
        document.getElementById('city-list').appendChild(li);

        // Add marker to map
        map.addMarker(city);

        // Enable calculate button if we have at least 2 cities
        document.getElementById('calculate-route').disabled = this.cities.length < 2;
    }

    removeCity(cityName) {
        this.cities = this.cities.filter(c => c.name !== cityName);
        
        // Remove from list
        const cityElements = document.querySelectorAll(`[data-city="${cityName}"]`);
        cityElements.forEach(el => el.parentElement.remove());

        // Remove from map
        map.removeMarker(cityName);

        // Disable calculate button if we have less than 2 cities
        document.getElementById('calculate-route').disabled = this.cities.length < 2;
    }

    async calculateRoute() {
        try {
            const algorithm = document.getElementById('algorithm').value;
            const transportMode = document.getElementById('transport-mode').value;

            const response = await fetch('/api/routes/calculate', {
                method: 'POST',
                headers: auth.getHeaders(),
                body: JSON.stringify({
                    cities: this.cities,
                    algorithm,
                    transportMode,
                    routeName: `Route ${new Date().toLocaleString()}`
                })
            });

            const data = await response.json();

            if (data.success) {
                // Draw route on map
                map.drawRoute(data.route.path);

                // Show route information
                this.displayRouteInfo(data.route);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error calculating route:', error);
            alert('Error calculating route');
        }
    }

    displayRouteInfo(route) {
        const routeInfo = document.getElementById('route-info');
        const routeDetails = document.getElementById('route-details');
        const transportMode = document.getElementById('transport-mode').value;
        const costPerKm = this.transportationCosts[transportMode];
        const totalCost = (route.distance * costPerKm).toFixed(2);

        routeDetails.innerHTML = `
            <p><strong>Total Distance:</strong> ${route.distance.toFixed(2)} km</p>
            <p><strong>Transportation Mode:</strong> ${transportMode.charAt(0).toUpperCase() + transportMode.slice(1)}</p>
            <p><strong>Cost per km:</strong> $${costPerKm.toFixed(2)}</p>
            <p><strong>Total Cost:</strong> $${totalCost}</p>
            <p><strong>Execution Time:</strong> ${route.executionTime.toFixed(2)} ms</p>
            <h6>Cities in Order:</h6>
            <ol>
                ${route.path.map(city => `
                    <li>
                        <div class="weather-info">
                            ${city.name}
                            <img class="weather-icon" src="https://openweathermap.org/img/w/${city.weather.icon}.png" alt="Weather icon">
                            ${city.weather.temperature}°C, ${city.weather.conditions}
                        </div>
                    </li>
                `).join('')}
            </ol>
        `;

        routeInfo.classList.remove('d-none');
    }

    async showRouteHistory() {
        try {
            const response = await fetch('/api/routes/history', {
                headers: auth.getHeaders()
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById('route-planner').classList.add('d-none');
                document.getElementById('route-history').classList.remove('d-none');

                const tbody = document.getElementById('history-table-body');
                tbody.innerHTML = data.routes.map(route => `
                    <tr>
                        <td>${route.route_name}</td>
                        <td>${JSON.parse(route.cities).map(c => c.name).join(', ')}</td>
                        <td>${route.total_distance.toFixed(2)} km</td>
                        <td>${route.algorithm_used}</td>
                        <td>${route.execution_time.toFixed(2)} ms</td>
                        <td>${new Date(route.created_at).toLocaleString()}</td>
                        <td>
                            <div class="route-actions">
                                <button class="btn btn-sm btn-danger" onclick="routes.deleteRoute(${route.id})">Delete</button>
                                <button class="btn btn-sm btn-primary" onclick="routes.loadRoute(${route.id})">Load</button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error fetching route history:', error);
            alert('Error fetching route history');
        }
    }

    showRoutePlanner() {
        document.getElementById('route-history').classList.add('d-none');
        document.getElementById('route-planner').classList.remove('d-none');
    }

    async deleteRoute(routeId) {
        if (!confirm('Are you sure you want to delete this route?')) return;

        try {
            const response = await fetch(`/api/routes/${routeId}`, {
                method: 'DELETE',
                headers: auth.getHeaders()
            });

            const data = await response.json();

            if (data.success) {
                this.showRouteHistory();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error deleting route:', error);
            alert('Error deleting route');
        }
    }

    loadRoute(routeId) {
        // Implementation for loading a saved route
        // This would clear current cities and add the saved ones
    }
}

// Create and export routes instance
const routes = new Routes(); 