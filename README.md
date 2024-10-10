# Forest Fire Detection System
Created for Semester 7 Internet of Everything Lab- Mini Project  
This project is a Forest Fire Detection System that leverages a combination of hardware and software components to detect fire hazards in forest areas. The system utilizes various sensors, an ESP8266 for communication, and a React Native application for monitoring alerts.

## Technologies Used
### Hardware:
- ESP8266
- Flame Sensor
- MQ7 Gas Sensor
- DHT11 Temperature and Humidity Sensor
- Jumper Wires
- Breadboard
### Software:
- React Native (for mobile app)
- Flask (for backend server)
- Arduino IDE (for sensor code)
- ngrok (to connect server with app)

## Components
- APP Directory: Contains the React Native application code for monitoring alerts and displaying sensor data.
- Server Directory: Contains the Flask server code that handles incoming sensor data and serves the mobile app.
- FORESTFIREDETECTION.ino: Arduino code for interfacing with the sensors and sending data to the server.

## Screenshots
When forests are safe i.e. no fire:
<div style="display: flex; justify-content: center;">
<img src="https://github.com/user-attachments/assets/e91a9e36-5914-432c-965d-0669e9504975" alt="App when forests are safe, shows a full normal forest" width="300" style="margin-right: 10px;"/>
</div>
When there are fire like conditions detected
<div style="display: flex; justify-content: center;">

<img src="https://github.com/user-attachments/assets/d0a91eec-6953-4df1-a66c-c65656002905" alt="List of notifications when fire/dangerous condition detected" width="300" style="margin-right: 10px;"/>
<img src="https://github.com/user-attachments/assets/0093cd28-7f66-45a6-8187-7112bc76f427" alt="When there is fire, image changes to a burnign forest image" width="300"/>

</div>

