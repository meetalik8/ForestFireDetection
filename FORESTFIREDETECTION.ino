#include <ESP8266WiFi.h>
#include <DHT.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "WIFINAME";
const char* password = "WIFIPASS";
const char* serverUrl = "URLFORSERVER/alert";

#define DHTPIN D1
#define MQ7PIN A0
#define FLAMEPIN D3
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  
  dht.begin();
  pinMode(MQ7PIN, INPUT);
  pinMode(FLAMEPIN, INPUT);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi!");
}

void loop() {
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  int mq7_value = analogRead(MQ7PIN);
  int flame_value = digitalRead(FLAMEPIN);
  
  if (isnan(temp) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  if (flame_value == LOW || temp > 60 || mq7_value > 300) {
    Serial.println("Fire or dangerous condition detected!");
    sendAlert(temp, humidity, mq7_value);  
  } else {
    Serial.println("No fire detected. Normal conditions.");
  }

  Serial.printf("Temperature: %.2f°C, Humidity: %.2f%%, CO Level: %d\n", temp, humidity, mq7_value);
  
  delay(5000); 
}

void sendAlert(float temperature, float humidity, int co_level) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
  
    http.begin(client, serverUrl);  
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["co_level"] = co_level;
    doc["message"] = "Fire or dangerous condition detected!";

    String jsonPayload;
    serializeJson(doc, jsonPayload);
                         
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      String response = http.getString();  
      Serial.printf("HTTP Response code: %d\n", httpResponseCode);
      Serial.println(response);
    } else {
      Serial.printf("Error sending alert. Error: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();  
  } else {
    Serial.println("WiFi Disconnected. Unable to send alert.");
  }
}
void clearAlert() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
  
    http.begin(client, "URLFORSERVER/clear_alert");  // Use a clear alert route
    int httpResponseCode = http.GET();  // A simple GET request to clear the alert

    if (httpResponseCode > 0) {
      Serial.printf("HTTP Response code: %d\n", httpResponseCode);
    } else {
      Serial.printf("Error clearing alert. Error: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected. Unable to clear alert.");
  }
}