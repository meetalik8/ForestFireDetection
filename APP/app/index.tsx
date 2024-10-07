import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import * as Notifications from "expo-notifications";
import { Button } from "react-native-paper";

const API_URL =
  "https://b97b-2409-4080-118d-67fa-cd31-b8f1-c59c-f305.ngrok-free.app"; // Replace with your ngrok URL

interface Alert {
  temperature: number;
  humidity: number;
  co_level: number;
  message: string;
}

interface AlertResponse {
  alert: Alert | null; // Allow alert to be null when no fire detected
  timestamp: number;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [lastChecked, setLastChecked] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    const registerForPushNotifications = async () => {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Push notification token:", token);
    };

    registerForPushNotifications();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    const checkForAlerts = async () => {
      try {
        const response = await fetch(`${API_URL}/get_alert`);
        if (response.ok) {
          const data: AlertResponse = await response.json();
          if (data.timestamp > lastChecked) {
            setLastChecked(data.timestamp);

            if (data.alert) {
              // Only update the alert if it's not null
              setAlert(data.alert);
              sendPushNotification(data.alert);
            } else {
              // Clear the alert if the data is null (normal conditions)
              setAlert(null);
            }
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setError(null); // Clear any previous errors
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching alerts:", error.message);
          setError(`Failed to fetch alerts: ${error.message}`);
        } else {
          console.error("An unknown error occurred:", error);
          setError("An unknown error occurred");
        }
      }
    };

    // Check for alerts immediately and then every 5 seconds
    checkForAlerts();
    const intervalId = setInterval(checkForAlerts, 5000);

    return () => clearInterval(intervalId);
  }, [lastChecked]);

  const sendPushNotification = async (alert: Alert) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Fire Alert!",
        body: `Temperature: ${alert.temperature}°C, Humidity: ${alert.humidity}%, CO Level: ${alert.co_level}`,
      },
      trigger: null,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {alert ? "Fire Alert! Forests aren't Safe" : "Forests are Safe"}
      </Text>
      <Image
        source={
          alert
            ? require("../assets/burning-forest.png")
            : require("../assets/normal-forest.png")
        }
        style={styles.image}
      />
      {alert && (
        <View style={styles.alertContainer}>
          <Text style={styles.alertText}>
            Temperature: {alert.temperature}°C
          </Text>
          <Text style={styles.alertText}>Humidity: {alert.humidity}%</Text>
          <Text style={styles.alertText}>CO Level: {alert.co_level}</Text>
          <Text style={styles.alertMessage}>{alert.message}</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  image: {
    marginTop: 20,
    width: "100%",
    height: 350,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 20,
  },
  alertContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    width: "100%",
  },
  alertText: {
    fontSize: 16,
    marginBottom: 5,
  },
  alertMessage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
  },
  errorContainer: {
    backgroundColor: "#ffcccc",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
  },
  errorText: {
    color: "#ff0000",
    fontSize: 14,
  },
});
