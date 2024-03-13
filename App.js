import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Platform, ScrollView} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { LineChart } from 'react-native-chart-kit';
import { db } from './config';
import { ref, onValue } from 'firebase/database';

const drinkLogData = [
  { amount: 12.5, time: '6:45 AM' },
  { amount: 16, time: '9:30 AM' },
  // { amount: 8, time: '12:15 PM' },
  // { amount: 20, time: '3:00 PM' },
];


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    weeklyWorkouts: '',
  });

 
  const [todoData, setTodoData] = useState([]);
  const [waterGoal, setWaterGoal] = useState(0); // Initialize waterGoal state


  useEffect(() => {
    const startCountRef = ref(db, 'totalOz/');
    onValue(startCountRef, (snapshot) => {
      const data = snapshot.val();
      const totalOzValue = data; // Assuming 'totalOz' contains only one value
      console.log("Fetched data:", totalOzValue); // Log fetched data
      setTodoData(totalOzValue);
    });
  }, []);
  

  const handleInputChange = (text) => {
    // Ensure text length is 1 and the value is between 0 and 7
    if (/^[0-7]$/.test(text)) {
      // Input is valid, update the state with the valid value
      setInputValue(text);
    }
    // Input is invalid or empty, do not update the state (thus, the input value won't change)
  };
  

  const handleLogin = () => {
    // Add authentication logic here
    setIsLoggedIn(true);
  };

  const handleContinue = () => {
    let waterGoal = (userInfo.weight / 2) + (32 * (userInfo.weeklyWorkouts / 7));
    if (userInfo.gender === 'male') {
      waterGoal *= 1.1;
    }
    if (userInfo.age > 25) {
      waterGoal += (0.005 * (userInfo.age - 25)) * (userInfo.weight / 2);
    }
    if (medicalConditions.includes('POTS') && waterGoal < 85) {
      waterGoal = 85;
    }
    if (medicalConditions.includes('Kidney Stones') && waterGoal < 100) {
      waterGoal = 100;
    }
    if (medicalConditions.includes('UTI') && waterGoal > 100) {
      waterGoal = 100;
    }
    else if (medicalConditions.includes('UTI') && waterGoal < 68) {
      waterGoal = 68;
    }
      console.log('Final waterGoal:', waterGoal); // Log final waterGoal
    setWaterGoal(Math.trunc(waterGoal));
    setOnboardingComplete(true);
  };
  
  
  const toggleMedicalCondition = (condition) => {
    if (medicalConditions.includes(condition)) {
      setMedicalConditions(medicalConditions.filter((c) => c !== condition));
    } else {
      setMedicalConditions([...medicalConditions, condition]);
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container0}>
        {/* <FetchData todoData={todoData} /> */}
        <Text style={styles.title}>
          <Text style={styles.createText}>  Create{'\n'}</Text>
          <Text style={styles.accountText}>Account</Text>
        </Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={30} color="#141A1E" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={30} color="#141A1E" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Create</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    );
  } else if (!onboardingComplete) {
    return (
      <OnboardingScreen
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        handleContinue={handleContinue}
        toggleMedicalCondition={toggleMedicalCondition}
        inputValue={inputValue}
        handleInputChange={handleInputChange}
        medicalConditions={medicalConditions}
      />
    );
  }

  return (
    <MainScreen waterGoal={waterGoal} />
  );  

  }

const OnboardingScreen = ({ userInfo, setUserInfo, handleContinue, toggleMedicalCondition, inputValue, handleInputChange, medicalConditions }) => {
  return (
    <View style={styles.container2}>
      <Text style={styles.onboardingTitle}>The following information is needed{'\n'}to personalize your hydration goals</Text>
      <View style={styles.inputRow}>
        <Ionicons name="person-outline" size={24} color="#5DCCFC"/>
        <Text style={styles.inputCategory}>Name</Text>
        <TextInput
          style={styles.inputField}
          value={userInfo.name}
          onChangeText={(name) => setUserInfo({...userInfo, name})}
        />
      </View>
      <View style={styles.inputRow}>
        <Ionicons name="calendar-clear-outline" size={24} color="#5DCCFC"/>
        <Text style={styles.inputCategory}>Age</Text>
        <TextInput
          style={styles.inputField}
          keyboardType="numeric"
          value={userInfo.age}
          onChangeText={(age) => setUserInfo({...userInfo, age})}
        />
      </View>
      <View style={styles.inputRow}>
        <Ionicons name="accessibility-outline" size={24} color="#5DCCFC"/>
        <Text style={styles.inputCategory}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity style={[styles.genderOption, userInfo.gender === 'male' && styles.genderOptionSelected]} onPress={() => setUserInfo({...userInfo, gender: 'male'})}>
            <Text style={[styles.genderOptionText, userInfo.gender === 'male' && styles.selectedText]}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.genderOption, userInfo.gender === 'female' && styles.genderOptionSelected]} onPress={() => setUserInfo({...userInfo, gender: 'female'})}>
            <Text style={[styles.genderOptionText, userInfo.gender === 'female' && styles.selectedText]}>Female</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.genderOption, userInfo.gender === 'other' && styles.genderOptionSelected]} onPress={() => setUserInfo({...userInfo, gender: 'other'})}>
            <Text style={[styles.genderOptionText, userInfo.gender === 'other' && styles.selectedText]}>Other</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.inputRow}>
        <Ionicons name="scale-outline" size={24} color="#5DCCFC"/>
        <Text style={styles.inputCategory}>Weight</Text>
        <TextInput
          style={styles.inputField}
          keyboardType="numeric"
          value={userInfo.weight}
          onChangeText={(weight) => setUserInfo({...userInfo, weight})}
        />
      </View>
      <View style={styles.inputRow}>
        <Ionicons name="barbell-outline" size={24} color="#5DCCFC"/>
        <Text style={styles.inputCategory}>Weekly Workouts</Text>
        <TextInput
          style={styles.inputField}
          keyboardType="numeric"
          maxLength={1} // Limit input to one character
          value={userInfo.weeklyWorkouts}
          onChangeText={(weeklyWorkouts) => setUserInfo({...userInfo, weeklyWorkouts})}
        />
      </View>
      <View style={styles.inputRowL}>
        <Ionicons name="medkit-outline" size={24} color="#5DCCFC"/>
        <Text style={[styles.inputCategory]}>Medical Condition(s)</Text>
      </View>
      <View style={[styles.medicalButtonsContainer, { marginLeft: 0 }]}>
        <TouchableOpacity
          style={[styles.medicalButton, medicalConditions.includes('POTS') && styles.medicalButtonSelected]}
          onPress={() => toggleMedicalCondition('POTS')}
        >
          <Text style={[styles.medicalButtonText, medicalConditions.includes('POTS') && { color: 'white' }]}>POTS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.medicalButton, medicalConditions.includes('UTI') && styles.medicalButtonSelected]}
          onPress={() => toggleMedicalCondition('UTI')}
        >
          <Text style={[styles.medicalButtonText, medicalConditions.includes('UTI') && { color: 'white' }]}>UTI</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.medicalButton, medicalConditions.includes('Kidney Stones') && styles.medicalButtonSelected]}
          onPress={() => toggleMedicalCondition('Kidney Stones')}
        >
          <Text style={[styles.medicalButtonText, medicalConditions.includes('Kidney Stones') && { color: 'white' }]}>Kidney Stones</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.medicalButton, medicalConditions.includes('Pregnant') && styles.medicalButtonSelected]}
          onPress={() => toggleMedicalCondition('Pregnant')}
        >
          <Text style={[styles.medicalButtonText, medicalConditions.includes('Pregnant') && { color: 'white' }]}>Pregnant</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.continueButtonContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
};

const MainScreen = ({ waterGoal }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const waterDrank = 50;
  const waterPercentage = Math.trunc((waterDrank / waterGoal) * 100); // Calculate percentage based on waterGoal prop
  const waterText = `${waterDrank}oz / ${waterGoal}oz`;
  const waterPercentageText = `${waterPercentage}%`;
  const strokeDashoffset = circumference * (1 - waterPercentage / 100)

  // Adjusted data array for the line chart
  const chartData = {
    labels: ['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p', '12a'],
    datasets: [
      {
        data: [0, 0, 0, 0, 10, 22, 28, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Adjusted data array
        color: (opacity = 1) => `rgba(93, 204, 252, ${opacity})`, // Light blue color
        strokeWidth: 2, // Width of the line
        withDots: false, // Hide dots
        withShadow: false, // Hide shadow
        fillShadowGradient: '#FFFFFF', // Fill with white to hide the area where data is 0
        fillShadowGradientOpacity: 1, // Set opacity to 1 to completely hide the area where data is 0
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        {/* Sticky buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, getShadowStyles()]} onPress={() => console.log('Bluetooth button pressed')}>
            <Ionicons name="bluetooth" size={24} color="#5DCCFC" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.buttonWide, styles.buttonContainerWide, getShadowStyles()]} onPress={() => console.log('Today button pressed')}>
          <Ionicons name="calendar-clear-outline" size={24} color="#5DCCFC" style={styles.buttonIcon} />
          <Text style={[styles.buttonText, { color: "#5DCCFC" }]}>Today</Text>
        </TouchableOpacity>
        <View style={[styles.buttonContainer, styles.buttonContainerRight]}>
          <TouchableOpacity style={[styles.button, getShadowStyles()]} onPress={() => console.log('Person button pressed')}>
            <Ionicons name="person" size={24} color="#5DCCFC" />
          </TouchableOpacity>
        </View>

        {/* Rest of your content */}
        {/* Water title, SVG, Line Chart, etc. */}

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
            fill="#141A1E"
          >
            {waterText}
          </SvgText>
        </Svg>
        
        {/* Line Chart */}
        <View style={styles.chartTitleContainer}>
          <Text style={styles.chartTitle}>Hourly Intake</Text>
        </View>
        <View style={styles.chartContainer}>
          <View style={{ right: 12 }}>
            <LineChart
              data={chartData}
              width={300}
              height={200}
              yAxisSuffix="oz"
              yAxisInterval={10} // Interval between each y-axis label
              chartConfig={{
                backgroundGradientFrom: '#F4F8FB',
                backgroundGradientTo: '#F4F8FB',
                decimalPlaces: 0,
                // DOESNT BELOW, BUT SHOULD BE FIXED
                yAxisMax: waterGoal,
                color: (opacity = 1) => `rgba(93, 204, 252, ${opacity})`, // Dark blue color
                labelColor: (opacity = 1) => `rgba(20, 26, 30, ${opacity})`, // Text color
                propsForDots: {
                  r: '3',
                  strokeWidth: '2',
                  stroke: '#5DCCFC', // Dark blue color
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>
        <TouchableOpacity style={[styles.shareButton, getShadowStyles()]} onPress={() => console.log('Share button pressed')}>
          <Ionicons name="share-outline" size={24} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
        <View style={styles.drinkLogSection}>
          <Text style={[styles.chartTitle, { marginBottom: 16 }]}>Drink Log</Text>
          {/* List of drink log items */}
          {drinkLogData.map((item, index) => (
            <View key={index} style={styles.drinkLogItem}>
              <Text style={styles.drinkLogTime}>{item.time}</Text>
              <Text style={styles.drinkLogText}>Water</Text>
              <Text style={styles.drinkLogAmount}>{item.amount} oz</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[styles.plusButton, getShadowStyles()]} onPress={() => console.log('Plus button pressed')}>
          <Ionicons name="add-circle-outline" size={48} color="#5DCCFC" strokeWidth={200} />
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
};



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
    // justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative', // Make container relative for absolute positioning of the button
  },
  container0: {
    flex: 1,
    backgroundColor: '#F4F8FB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container2: {
    flex: 1,
    backgroundColor: '#F4F8FB',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 64,
  },
  onboardingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#141A1E',
    textAlign: 'center',
    marginBottom: 64,
    marginTop: 64,
  },
  createText: {
    color: '#141A1E',
  },
  accountText: {
    color: '#5DCCFC',
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: '#141A1E',
    borderWidth: 1,
    marginBottom: 0,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  inputIcon: {
    marginRight: 8, // Adjust the space between the icon and the input field as needed
  },
  inputRowL: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'left',
    // marginBottom: 32,
  },
  inputCategory: {
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    height: 32,
    borderColor: '#141A1E',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  genderOption: {
    borderWidth: 1,
    borderColor: '#141A1E',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  genderOptionSelected: {
    backgroundColor: '#5DCCFC',
    borderColor:'#5DCCFC',
  },
  genderOptionText: {
    fontSize: 12,
    color: '#141A1E',
  },
  selectedText: {
    color: 'white',
  },
  medicalButtonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  medicalButton: {
    borderWidth: 1,
    borderColor: '#141A1E',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  medicalButtonSelected: {
    backgroundColor: '#5DCCFC',
    borderColor:'#5DCCFC',
  },
  medicalButtonText: {
    fontSize: 12,
    color: '#141A1E',
  },
  loginButton: {
    backgroundColor: '#5DCCFC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 48,
  },
  continueButton: {
    backgroundColor: '#5DCCFC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 64,
  },
  continueButtonContainer: {
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'absolute',
    top: 72, // Adjust the top position as needed
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
    top: 72, // Adjust the top position as needed
    left: 'auto',
    right: 'auto',
    ...commonButtonStyles,
  },
  buttonIcon: {
    marginRight: 8,
  },
  waterContainer: {
    position: 'absolute', // Change position to absolute
    // top: 160, // Adjust marginTop to position just under the buttons
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterTitle: {
    fontSize: 32, // Increased font size to 32
    fontWeight: 'bold', // Bold font weight
    marginBottom: 8,
    color: '#5DCCFC', // Light blue color
    marginTop: 160, // Adjust marginTop to position below the buttons
  },
  plusButton: {
    position: 'absolute',
    bottom: 600,
    right: 80,
    width: 60,
    height: 60,
    padding: 4,
    borderRadius: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    marginBottom: 40,
    paddingHorizontal: 16,
    width: '90%', // Adjust the width to occupy 90% of the container width
    // alignItems: 'center', // Center the content horizontally
    borderWidth: 2, // Add blue border
    borderColor: '#5DCCFC', // Blue color
    borderRadius: 8, // Add 8 corner radius
    alignSelf: 'center', // Center the container horizontally within its parent
  },
  chartTitleContainer: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 16,
  },
  chartTitle: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    // position: 'absolute',
    // top: 16 + 200 + 16, // 16px below chartContainer
    // left: '50%',
    // transform: [{ translateX: -75 }], // Center horizontally
    ...commonButtonStyles,
    backgroundColor: '#5DCCFC', // Same background color as Continue and Login buttons
  },
  buttonText: {
    color: 'white', // Same text color as Continue and Login buttons
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    width: '100%', // Full width
    paddingHorizontal: 20, // Horizontal padding to match the container
  },
  drinkLogSection: {
    marginTop: 24, // Add top margin to create space between "Hourly Intake" and "Drink Log"
    width: '100%', // Full width
    paddingLeft: 20, // Left padding to align with the content
    paddingRight: 20, // Left padding to align with the content
  },
  drinkLogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#8EDCFC', // Light blue background color
    paddingVertical: 12, // Adjust padding as needed
    paddingHorizontal: 16, // Adjust padding as needed
    borderRadius: 24, // Add border radius for button-like shape
    borderWidth: 2,
    borderColor: '#5DCCFC',
  },
  drinkLogText: {
    fontSize: 16,
    color: 'white', // White text color
    fontWeight: 'bold',
    textAlign: 'center', // Center text horizontally
    flex: 1, // Take up remaining space
  },
  drinkLogTime: {
    flex: 1, // Take up remaining space
    textAlign: 'left', // Left align text
    color: 'white', // White text color
    paddingLeft: 8, // Left padding to align with the content
  },
  drinkLogAmount: {
    flex: 1, // Take up remaining space
    textAlign: 'right', // Right align text
    color: 'white', // White text color
    paddingRight: 8, // Left padding to align with the content
  },
  
});

const FetchData = ({ todoData }) => {
  console.log("Todo data in FetchData:", todoData); // Log todoData in FetchData
  return (
    <View style={styles.container0}>
      {/* Render the single value */}
      <Text>{todoData}</Text>
    </View>
  );
};




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