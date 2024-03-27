import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Modal, View, TouchableOpacity, TextInput, Platform, ScrollView} from 'react-native';
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

const drinkLogDataUpcoming = [
  { amount: 10.5, time: '12:15 PM' },
  { amount: 8, time: '2:00 PM' },
  { amount: 14, time: '6:45 PM' },
  // { amount: 16, time: '9:30 AM' },
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

  const [showProfile, setShowProfile] = useState(false);
  const [bluetoothColor, setBluetoothColor] = useState('white');
  const [bluetoothColor2, setBluetoothColor2] = useState('#5DCCFC');


  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const [BmodalVisible, setBModalVisible] = useState(false);
  const [ImodalVisible, setIModalVisible] = useState(false);

  const handleCancel = () => {
    setBModalVisible(false);
  };
  
  const handleOK = () => {
    setIModalVisible(false);
  };

  const handleConfirm = () => {
    // Logic for connecting to Bluetooth device
    // Change color of Bluetooth button
    setBModalVisible(false);
    setBluetoothColor('#5DCCFC');
    setBluetoothColor2('white');
  };
 
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
  } else if (showProfile) {
    return (
      <ProfileScreen
        userInfo={userInfo}
        medicalConditions={medicalConditions}
        toggleProfile={toggleProfile}
      />
    );
  } else return (
    <MainScreen
      waterGoal={waterGoal}
      toggleProfile={toggleProfile} 
      setBModalVisible={setBModalVisible}
      BmodalVisible={BmodalVisible}
      setIModalVisible={setIModalVisible}
      ImodalVisible={ImodalVisible}
      handleCancel={handleCancel}
      handleOK={handleOK}
      handleConfirm={handleConfirm}
      bluetoothColor={bluetoothColor}
      bluetoothColor2={bluetoothColor2}
      userInfo={userInfo}
      medicalConditions={medicalConditions}
    />
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

const MainScreen = ({ waterGoal, userInfo, medicalConditions, toggleProfile, setBModalVisible, BmodalVisible, setIModalVisible, ImodalVisible, handleCancel, handleOK, handleConfirm, bluetoothColor, bluetoothColor2 }) => {
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
        // fillShadowGradient: '#FFFFFF', // Fill with white to hide the area where data is 0
        fillShadowGradientOpacity: 1, // Set opacity to 1 to completely hide the area where data is 0
      },
    ],
  };

  return (
    <View style={[{ backgroundColor: '#F4F8FB' }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.container]}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, { backgroundColor: bluetoothColor }, getShadowStyles()]} onPress={() =>setBModalVisible(true)}>
              <Ionicons name="bluetooth" size={24} color={bluetoothColor2} />
            </TouchableOpacity>
            <BluetoothModal
              visible={BmodalVisible}
              onCancel={handleCancel}
              onConfirm={handleConfirm}
            />
            <InfoModal
              visible={ImodalVisible}
              onOK={handleOK}
              userInfo={userInfo}
              medicalConditions={medicalConditions}
            />
          </View>
          <TouchableOpacity style={[styles.buttonWide, styles.buttonContainerWide, getShadowStyles()]} onPress={() => console.log('Today button pressed')}>
            <Ionicons name="calendar-clear-outline" size={24} color="#5DCCFC" style={styles.buttonIcon} />
            <Text style={[styles.buttonText, { color: "#5DCCFC" }]}>Today</Text>
          </TouchableOpacity>
          <View style={[styles.buttonContainer, styles.buttonContainerRight]}>
          <TouchableOpacity
              style={[styles.button, getShadowStyles()]}   onPress={toggleProfile}>
              <Ionicons name="person" size={24} color="#5DCCFC" />
          </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.waterTitle}>Daily Goal</Text>
            <TouchableOpacity onPress={() =>setIModalVisible(true)}>
              <Ionicons name="information-circle-outline" size={20} color="#141A1E" style={{ marginLeft: 4, marginTop: 100 }} />
            </TouchableOpacity>
          </View>          
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
          <View style={styles.drinkLogSection}>
            <Text style={[styles.chartTitle, { marginBottom: 16 }]}>Upcoming</Text>
            {/* List of drink log items */}
            {drinkLogDataUpcoming.map((item, index) => (
              <View key={index} style={styles.drinkLogItemUpcoming}>
                <Text style={styles.drinkLogTimeUpcoming}>{item.time}</Text>
                <Text style={styles.drinkLogTextUpcoming}>Water</Text>
                <Text style={styles.drinkLogAmountUpcoming}>{item.amount} oz</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={[styles.plusButton, getShadowStyles()]} onPress={() => console.log('Plus button pressed')}>
            <Ionicons name="add-circle-outline" size={48} color="#5DCCFC" strokeWidth={200} />
          </TouchableOpacity>
          <StatusBar style="auto" />
        </View>
      </ScrollView>
    </View>
  );
};

const BluetoothModal = ({ visible, onCancel, onConfirm }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTextTitle}>Connect to Bluetooth attachment?</Text>
          <View style={styles.buttonContainer2}>
            <TouchableOpacity style={[styles.buttonBubble2, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.CancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonBubble} onPress={onConfirm}>
              <Text style={styles.ConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const InfoModal = ({ visible, onOK, userInfo, medicalConditions }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTextTitle}>Understanding your Daily Goal</Text>
          <Text style={styles.modalText}>The amount of water you should drink every day is calculated based on your age ({userInfo.age}), weight ({userInfo.weight} lbs), gender ({userInfo.gender}), activity level ({userInfo.weeklyWorkouts} weekly workouts), and any medical conditions that may affect your hydration{medicalConditions.length > 0 ? ` (${medicalConditions.join(', ')})` : ''}.</Text>
          <Text style={styles.modalText}>Please consult a medical professional for further questions.</Text>
          <TouchableOpacity style={styles.buttonBubble} onPress={onOK} >
            <Text style={styles.ConfirmText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


const ProfileScreen = ({ userInfo, toggleProfile }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.circularButton, styles.backButton]} onPress={toggleProfile}>
        <Ionicons name="chevron-back-outline" size={24} color="#5DCCFC" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.circularButton, styles.settingsButton]} onPress={() => console.log('Settings button pressed')}>
        <Ionicons name="settings-outline" size={24} color="#5DCCFC" />
      </TouchableOpacity>
      <View style={styles.profileCircle}>
        <View style={styles.profileInitialCircle}>
          <Text style={styles.initialText}>{userInfo.name.charAt(0)}</Text>
        </View>
        <Text style={styles.fullName}>{userInfo.name}</Text>
      </View>
    </View>
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
    // position: 'absolute',
    top: 72, // Adjust the top position as needed
    left: 'auto',
    right: 'auto',
    ...commonButtonStyles,
  },
  buttonIcon: {
    marginRight: 8,
  },
  waterContainer: {
    // position: 'absolute', // Change position to absolute
    // top: 160, // Adjust marginTop to position just under the buttons
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterTitle: {
    fontSize: 32, // Increased font size to 32
    fontWeight: 'bold', // Bold font weight
    marginBottom: 8,
    color: '#5DCCFC', // Light blue color
    marginTop: 108, // Adjust marginTop to position below the buttons
  },
  plusButton: {
    position: 'absolute',
    bottom: 750,
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
    marginBottom: 36,
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
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    top: -16,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
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
    // marginTop: 24, // Add top margin to create space between "Hourly Intake" and "Drink Log"
    width: '100%', // Full width
    paddingLeft: 20, // Left padding to align with the content
    paddingRight: 20, // Left padding to align with the content
  },
  drinkLogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: '#8EDCFC', // Light blue background color
    paddingVertical: 12, // Adjust padding as needed
    paddingHorizontal: 16, // Adjust padding as needed
    borderRadius: 24, // Add border radius for button-like shape
    borderWidth: 2,
    borderColor: '#5DCCFC',
  },
   drinkLogItemUpcoming: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: 'transparent', // Light blue background color
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
  drinkLogTextUpcoming: {
    fontSize: 16,
    color: '#5DCCFC', // White text color
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
  drinkLogTimeUpcoming: {
    flex: 1, // Take up remaining space
    textAlign: 'left', // Left align text
    color: '#5DCCFC', // White text color
    paddingLeft: 8, // Left padding to align with the content
  },
  drinkLogAmountUpcoming: {
    flex: 1, // Take up remaining space
    textAlign: 'right', // Right align text
    color: '#5DCCFC', // White text color
    paddingRight: 8, // Left padding to align with the content
  },
  circularButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 72,
  },
  backButton: {
    left: 20,
  },
  settingsButton: {
    right: 20,
  },
  profileCircle: {
    paddingTop: 36,
    marginTop: 100,
    flex: 1,
    alignItems: 'center',
  },
  profileInitialCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#5DCCFC', // Blue outline color
    backgroundColor: '#141A1E', // Black filling color
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
  },
  fullName: {
    marginTop: 16,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 24,
    borderWidth: 1,
    borderColor: '#384144', // Blue outline color
    alignItems: 'center',
    width: '75%',
  },
  buttonContainer2: {
    flexDirection: 'row',
  },
  buttonBubble: {
    backgroundColor: '#5DCCFC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },  
  buttonBubble2: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#5DCCFC',
  },
  cancelButton: {
    marginRight: 64,
  },
  CancelText: {
    color: '#5DCCFC', // Same text color as Continue and Login buttons
    fontSize: 16,
  },  
  ConfirmText: {
    color: 'white', // Same text color as Continue and Login buttons
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 36,
    textAlign: 'center',
  },
  modalTextTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 36,
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