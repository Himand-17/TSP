class Map {
    constructor() {
        this.map = null;
        this.markers = [];
        this.polyline = null;
        this.initMap();
    }

    initMap() {
        // Initialize map
        this.map = L.map('map').setView([20, 0], 2);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }

    addMarker(city) {
        const marker = L.marker([city.lat, city.lon])
            .bindPopup(`
                <strong>${city.name}</strong><br>
                ${city.weather ? `
                    Temperature: ${city.weather.temperature}°C<br>
                    Humidity: ${city.weather.humidity}%<br>
                    Conditions: ${city.weather.conditions}
                ` : ''}
            `)
            .addTo(this.map);

        this.markers.push({
            city,
            marker
        });

        // Fit map to show all markers
        const bounds = L.latLngBounds(this.markers.map(m => [m.city.lat, m.city.lon]));
        this.map.fitBounds(bounds, { padding: [50, 50] });

        return marker;
    }

    removeMarker(cityName) {
        const index = this.markers.findIndex(m => m.city.name === cityName);
        if (index !== -1) {
            this.markers[index].marker.remove();
            this.markers.splice(index, 1);
        }

        // Update map view if there are remaining markers
        if (this.markers.length > 0) {
            const bounds = L.latLngBounds(this.markers.map(m => [m.city.lat, m.city.lon]));
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    clearMarkers() {
        this.markers.forEach(m => m.marker.remove());
        this.markers = [];
        if (this.polyline) {
            this.polyline.remove();
            this.polyline = null;
        }
    }

    drawRoute(cities) {
        // Remove existing polyline
        if (this.polyline) {
            this.polyline.remove();
        }

        // Create coordinates array for the route
        const coordinates = cities.map(city => [city.lat, city.lon]);
        
        // Add the first city again to complete the circuit
        coordinates.push(coordinates[0]);

        // Create and add the polyline
        this.polyline = L.polyline(coordinates, {
            color: 'blue',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(this.map);

        // Fit map to show the entire route
        this.map.fitBounds(this.polyline.getBounds(), { padding: [50, 50] });
    }

    updateMarkerWeather(city) {
        const marker = this.markers.find(m => m.city.name === city.name);
        if (marker) {
            marker.marker.setPopupContent(`
                <strong>${city.name}</strong><br>
                Temperature: ${city.weather.temperature}°C<br>
                Humidity: ${city.weather.humidity}%<br>
                Conditions: ${city.weather.conditions}
            `);
        }
    }
}

// Create and export map instance
const map = new Map(); 