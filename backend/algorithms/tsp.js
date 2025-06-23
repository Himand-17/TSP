/**
 * Implementation of TSP algorithms
 */

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

/**
 * Greedy (Nearest Neighbor) Algorithm
 * Time Complexity: O(n^2)
 */
function greedyTSP(cities) {
    const n = cities.length;
    if (n < 2) return { path: cities, distance: 0 };

    const visited = new Array(n).fill(false);
    const path = [0]; // Start from first city
    visited[0] = true;
    let totalDistance = 0;

    for (let i = 1; i < n; i++) {
        let lastCity = path[path.length - 1];
        let nextCity = -1;
        let minDistance = Infinity;

        // Find nearest unvisited city
        for (let j = 0; j < n; j++) {
            if (!visited[j]) {
                const distance = calculateDistance(
                    cities[lastCity].lat,
                    cities[lastCity].lon,
                    cities[j].lat,
                    cities[j].lon
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    nextCity = j;
                }
            }
        }

        visited[nextCity] = true;
        path.push(nextCity);
        totalDistance += minDistance;
    }

    // Add return to starting city
    totalDistance += calculateDistance(
        cities[path[n-1]].lat,
        cities[path[n-1]].lon,
        cities[0].lat,
        cities[0].lon
    );
    
    return {
        path: path.map(i => cities[i]),
        distance: totalDistance
    };
}

/**
 * Dynamic Programming (Held-Karp) Algorithm
 * Time Complexity: O(n^2 * 2^n)
 */
function dynamicProgrammingTSP(cities) {
    const n = cities.length;
    if (n < 2) return { path: cities, distance: 0 };

    // Create distance matrix
    const dist = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            dist[i][j] = calculateDistance(
                cities[i].lat,
                cities[i].lon,
                cities[j].lat,
                cities[j].lon
            );
        }
    }

    // Initialize DP table
    const VISITED_ALL = (1 << n) - 1;
    const dp = Array(1 << n).fill().map(() => Array(n).fill(Infinity));
    const parent = Array(1 << n).fill().map(() => Array(n).fill(-1));
    
    // Base case
    dp[1][0] = 0;

    // Fill DP table
    for (let mask = 1; mask < (1 << n); mask++) {
        for (let curr = 0; curr < n; curr++) {
            if (!(mask & (1 << curr))) continue;

            for (let next = 0; next < n; next++) {
                if (mask & (1 << next)) continue;

                const newMask = mask | (1 << next);
                const newDist = dp[mask][curr] + dist[curr][next];

                if (newDist < dp[newMask][next]) {
                    dp[newMask][next] = newDist;
                    parent[newMask][next] = curr;
                }
            }
        }
    }

    // Find optimal cost and reconstruct path
    let optimalCost = Infinity;
    let lastCity = -1;
    for (let i = 1; i < n; i++) {
        const cost = dp[VISITED_ALL][i] + dist[i][0];
        if (cost < optimalCost) {
            optimalCost = cost;
            lastCity = i;
        }
    }

    // Reconstruct path
    const path = [];
    let currMask = VISITED_ALL;
    let curr = lastCity;
    while (curr !== -1) {
        path.unshift(curr);
        const temp = curr;
        curr = parent[currMask][curr];
        currMask ^= (1 << temp);
    }
    path.unshift(0);

    return {
        path: path.map(i => cities[i]),
        distance: optimalCost
    };
}

module.exports = {
    greedyTSP,
    dynamicProgrammingTSP
}; 