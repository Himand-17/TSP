const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');

// Protect all routes with authentication
router.use(authMiddleware);

// Get weather for a city
router.get('/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`
        );

        res.json({
            success: true,
            weather: {
                temperature: response.data.main.temp,
                humidity: response.data.main.humidity,
                conditions: response.data.weather[0].main,
                description: response.data.weather[0].description,
                icon: response.data.weather[0].icon
            }
        });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'City not found'
            });
        }
        console.error('Weather fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching weather data'
        });
    }
});

module.exports = router; 