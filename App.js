import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

export default function App() {
  const waterGoal = 2000; 
  const waterDrank = 500;
  const waterPercentage = (waterDrank / waterGoal) * 100; 
  const waterText = `${waterDrank}ml / ${waterGoal}ml`;
  const waterPercentageText = `${waterPercentage}%`;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - waterPercentage / 100);

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, getShadowStyles()]} onPress={() => console.log('Bluetooth button pressed')}>
          <Ionicons name="bluetooth" size={24} color="#5DCCFC"/>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.buttonWide, styles.buttonContainerWide, getShadowStyles()]} onPress={() => console.log('Today button pressed')}>
        <Ionicons name="calendar-clear-outline" size={24} color="#5DCCFC" style={styles.buttonIcon} />
        <Text style={[styles.buttonText, {color: "#5DCCFC"}]}>Today</Text>
      </TouchableOpacity>
      <View style={[styles.buttonContainer, styles.buttonContainerRight]}>
        <TouchableOpacity style={[styles.button, getShadowStyles()]} onPress={() => console.log('Person button pressed')}>
          <Ionicons name="person" size={24} color="#5DCCFC"/>
        </TouchableOpacity>
      </View>
      <View style={styles.waterContainer}>
        <Text style={styles.waterTitle}>Water</Text>
        <Svg height="200" width="200">
          {/* Ring Circle */}
          <Circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#8EDCFC" // Light blue color
            strokeWidth="10"
            opacity={0.5} // Opacity set to 50%
          />
          {/* Current Progress Circle */}
          <Circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#5DCCFC" // Dark blue color
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(90, 100, 100) scale(-1, 1) translate(-200, 0)" // Rotate, flip horizontally, and then move
          />
          <SvgText
            x="50%"
            y="50%"
            textAnchor="middle"
            fontSize="32"
            fill="#5DCCFC" // Dark blue color
            fontWeight="bold" // Bold font weight
          >
            {waterPercentageText}
          </SvgText>
          <SvgText
            x="50%"
            y="64%"
            textAnchor="middle"
            fontSize="10"
            fill="black"
          >
            {waterText}
          </SvgText>
        </Svg>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const commonButtonStyles = {
  padding: 4,
  borderRadius: 24,
  backgroundColor: 'white',
  alignItems: 'center',
  justifyContent: 'center',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    top: 72,
    left: 20,
  },
  buttonContainerRight: {
    left: 'auto',
    right: 20,
  },
  buttonContainerWide: {
    left: 'auto',
    right: 'auto',
  },
  button: {
    width: 40,
    height: 40,
    ...commonButtonStyles,
  },
  buttonWide: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    position: 'absolute',
    top: 72,
    left: 'auto',
    right: 'auto',
    ...commonButtonStyles,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  waterContainer: {
    position: 'absolute', // Change position to absolute
    top: 160, // Adjust marginTop to position just under the buttons
    alignItems: 'center',
  },
  waterTitle: {
    fontSize: 32, // Increased font size to 32
    fontWeight: 'bold', // Bold font weight
    marginBottom: 8,
    color: '#5DCCFC', // Light blue color
  },
});

const getShadowStyles = () => {
  if (Platform.OS === 'android') {
    return { elevation: 5 };
  } else if (Platform.OS === 'ios') {
    return {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    };
  } else {
    return {}; // Default to empty object for other platforms
  }
};
