/*
 * Complete project details at https://RandomNerdTutorials.com/esp32-load-cell-hx711/
 *
 * HX711 library for Arduino - example file
 * https://github.com/bogde/HX711
 *
 * MIT License
 * (c) 2018 Bogdan Necula
 *
**/





/*=================================
          WIFI CONFIG
 ================================= */

#include <WiFi.h>
// Insert your network credentials
// #define WIFI_SSID "SQ5-Resident"
#define WIFI_SSID "GTother"
// #define WIFI_PASSWORD "YamahaNoveltyIcon"

#define WIFI_PASSWORD "GeorgeP@1927"

/*=================================
          FIREBASE CONFIG
 ================================= */

#include <Firebase_ESP_Client.h>

//Define Firebase Data object
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;



//Provide the token generation process info.
#include "addons/TokenHelper.h"
//Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert Firebase project API Key
#define API_KEY "AIzaSyCBAU1qcc-VEC441tEghLDnT1ARGP926YI"

// Insert RTDB URLefine the RTDB URL */
#define DATABASE_URL "https://esp32-firebase-demo-1866a-default-rtdb.firebaseio.com/" 


/*=================================
          SCALE CONFIG
 ================================= */
#include "HX711.h"
// HX711 load cell amp 
const int LOADCELL_DOUT_PIN = 26;
const int LOADCELL_SCK_PIN = 0;
const float calibration_factor = -166800.0/187.0;
HX711 scale;

/*=================================
          M5 CONFIG
 ================================= */

#include <M5StickCPlus2.h>
#include <M5GFX.h>
M5GFX display;
M5Canvas canvas(&display);


/*=================================
          GENERAL CONFIG
 ================================= */
#include <Arduino.h>

//water measurement vars
double currentBottleOunces = 0.0;
double newOzDrank =0.0;
double weight = 0.0;
double prevWeight = 0.0;
double totalOzDrank = 0.0;
bool bottleReset = true;
double ozBeforeTare = 0.0;


//random varialbes for program
unsigned long sendDataPrevMillis = 0;
volatile int count = 0;
bool signupOK = false;
int counter = 0;
char info[100];

void setup() {
  Serial.begin(115200);
/*=================================
          M5 SETUP
 ================================= */
  auto cfg = M5.config();
  StickCP2.begin(cfg);

  display.begin();
  display.setRotation(3);
  canvas.setColorDepth(1);  // mono color
  canvas.createSprite(display.width(), display.height());
  canvas.setTextDatum(MC_DATUM);
  canvas.setPaletteColor(1, GREEN);
  canvas.drawString("Calibration sensor....", 80, 40);
  canvas.pushSprite(0, 0);
  

  // StickCP2.Display.setRotation(3);  // Rotate the screen. 将屏幕旋转
  // StickCP2.Display.fillScreen(BLACK);
  // StickCP2.Display.setTextSize(1);

  /*=================================
          SCALE SETUP
 ================================= */
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  // The scale value is the adc value corresponding to 1g
  // scale.set_scale(27.61f);  // set scale
  scale.set_scale(calibration_factor);
  scale.tare();             // auto set offset




  /*=================================
          WIFI SETUP
 ================================= */
  Serial.print("Now beginning wifi setup.");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  /*=================================
          FIREBASE SETUP
 ================================= */

  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;

  /* Sign up */
  if (Firebase.signUp(&config, &auth, "", "")){
    Serial.println("ok");
    signupOK = true;
  }
  else{
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
    
  Serial.println("Deleting nodes");
  // Firebase.RTDB.deleteNode(&fbdo, "/ouncesConsumed");
  Firebase.RTDB.deleteNode(&fbdo, "/ozBeforeTare");
  Firebase.RTDB.deleteNode(&fbdo, "/currentOuncesDrank");
  Firebase.RTDB.deleteNode(&fbdo, "/totalOz");
  Firebase.RTDB.setDouble(&fbdo, "/ozBeforeTare", 0.0);
  Firebase.RTDB.setDouble(&fbdo, "/currentOuncesDrank", 0.0);
  Firebase.RTDB.setDouble(&fbdo, "/totalOz", 0.0);
  
  /*=================================
          SCALE SETUP (LEGACY)
 ================================= */

  
  // Serial.println("HX711 Setup");

  // Serial.println("Initializing the scale");
  // Serial.println(calibration_factor);
  // scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);

  // Serial.println("Before setting up the scale:");
  // Serial.print("read: \t\t");
  // Serial.println(scale.read());      // print a raw reading from the ADC

  // Serial.print("read average: \t\t");
  // Serial.println(scale.read_average(20));   // print the average of 20 readings from the ADC

  // Serial.print("get value: \t\t");
  // Serial.println(scale.get_value(5));   // print the average of 5 readings from the ADC minus the tare weight (not set yet)

  // Serial.print("get units: \t\t");
  // Serial.println(scale.get_units(5), 1);  // print the average of 5 readings from the ADC minus tare weight (not set) divided
  //           // by the SCALE parameter (not set yet)
            
  // scale.set_scale(calibration_factor);
  // //scale.set_scale(-471.497);                      // this value is obtained by calibrating the scale with known weights; see the README for details
  // scale.tare();               // reset the scale to 0

  // Serial.println("After setting up the scale:");

  // Serial.print("read: \t\t");
  // Serial.println(scale.read());                 // print a raw reading from the ADC

  // Serial.print("read average: \t\t");
  // Serial.println(scale.read_average(20));       // print the average of 20 readings from the ADC

  // Serial.print("get value: \t\t");
  // Serial.println(scale.get_value(5));   // print the average of 5 readings from the ADC minus the tare weight, set with tare()

  // Serial.print("get units: \t\t");
  // Serial.println(scale.get_units(5), 1);        // print the average of 5 readings from the ADC minus tare weight, divided
  //           // by the SCALE parameter set with set_scale

  // Serial.println("Readings:");



}

void loop() {


  //TAKING MEASUREMENTS AND PRINTING
  canvas.fillSprite(BLACK);
  canvas.setTextSize(1);
  canvas.drawString("<-Tare", 30, 20);
  canvas.drawString("Calibration", 80, 120);
  // prevWeight = weight;
  weight = scale.get_units(10);
    // Serial.print("Weight:");
    // Serial.println(weight);
    // Serial.print("prev weight: ");
    // Serial.println(prevWeight);
  canvas.setTextSize(3);
  // if (weight != 0) {
  // Serial.println(weight);
  Serial.printf("%.2f\n", weight);
  canvas.drawString(String(weight, 2) + "g", 80, 60);
  // } else {
      // canvas.drawString("0.000g", 80, 60);
  // }
  StickCP2.update();  // Read the press state of the key
   if (StickCP2.BtnA.wasPressed()) {
        scale.tare();
        canvas.drawString("0g Cal", 80, 120);
        Serial.println("Just tared the scale");
        bottleReset = true;
      // Firebase.RTDB.deleteNode(&fbdo, "/ouncesConsumed");
        // Firebase.RTDB.deleteNode(&fbdo, "/ozBeforeTare");
        Firebase.RTDB.setDouble(&fbdo, "/currentOuncesDrank", 0.0);
        // Firebase.RTDB.deleteNode(&fbdo, "/totalOz");
        count = 0;
        ozBeforeTare = ozBeforeTare + newOzDrank;
        newOzDrank = 0;
        if (Firebase.RTDB.setDouble(&fbdo, "/ozBeforeTare", ozBeforeTare)){
          Serial.println("just set value of ozBeforeTare:");

          prevWeight = weight;
          }
          else {
            Serial.println("FAILED");
            Serial.println("REASON: " + fbdo.errorReason());
          }

        
        delay(1000);
        
    }
    if (StickCP2.BtnB.wasPressed()) {
        long hund_g = 5;
        while (1) {
            StickCP2.update();
            canvas.fillSprite(BLACK);
            canvas.setTextSize(2);
            canvas.drawString("Cal:" + String(hund_g * 100) + "g", 80, 60);
            canvas.setTextSize(1);
            canvas.drawString("<-change", 30, 20);
            canvas.drawString("long press comfirm", 80, 120);
            canvas.pushSprite(0, 0);
            if (M5.BtnB.pressedFor(2000)) {
                break;
            }
            if (StickCP2.BtnA.wasReleased()) {
                hund_g--;
            }
            if (StickCP2.BtnB.wasReleased()) {
                hund_g++;
            }
            delay(10);
        }
        long g_adc = scale.read_average(20);
        g_adc      = g_adc - scale.get_offset();
        scale.set_scale(g_adc / (hund_g * 100.0));
    }
    canvas.pushSprite(0, 0);
  
if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0)){
    // if(count == 0){
    //   if (Firebase.RTDB.setDouble(&fbdo, "/totalOz",0)){
    //     Serial.println("Pushed initial value to");
    //     Serial.println("PATH: " + fbdo.dataPath());
    // }
    // }
    sendDataPrevMillis = millis();
    // Write an Int number on the database path test/int
  

    // if (Firebase.RTDB.getJSON(&fbdo, "/totalOz")) {
    //   if(fbdo.dataType() =="json"){
    //     // ouncesConsumed = fbdo.doubleData();
    //     ouncesConsumed = fbdo.to<double>();


    //     Serial.print("Succesfully got X ounces: ");
    //     Serial.println(ouncesConsumed);
    //   }
    //   else{
    //     Serial.println("FBDO DATA TYE");
    //     Serial.println(fbdo.dataType());
    //   }
    // }
    // else {
    //   Serial.println(fbdo.errorReason());
    // }

// Write an Float number on the database path test/float
  

   
    

    // if (Firebase.RTDB.pushInt(&fbdo, "/counter", count)){
    //   // Serial.println("Pushed the count of " + count);
    //   Serial.println("PATH: " + fbdo.dataPath());
    //   Serial.println("TYPE: " + fbdo.dataType());
    // }
    // else {
    //   Serial.println("FAILED");
    //   Serial.println("REASON: " + fbdo.errorReason());
    // }
    // count++;




    
    // if (Firebase.RTDB.getDouble(&fbdo, "/currentOuncesDrank")) {
    //   // if(fbdo.dataType() =="json"){
    //     // Serial.println(fbdo);
    //     // ouncesConsumed = fbdo.doubleData();
    //   currentBottleOunces = fbdo.to<double>();


    //   Serial.print("Number of ounces drank in this bottle so far: ");
    //   Serial.println(currentBottleOunces);
    //     // Serial.println(type(prevOuncesConsumed));
    //   }
    //   else{
    //     Serial.println("FBDO DATA TYE");
    //     Serial.println(fbdo.dataType());
    //   }
    // }
    // else {
    //   Serial.println(fbdo.errorReason());
    // }

    
   // Serial.println()

   //TODO: maybe put tolerance to not adjust all the time
    newOzDrank = (-1* (weight));
    Serial.print("# oz recently drank: ");
    Serial.println(newOzDrank);
    // Serial.print("Ounces consumed:");
    // Serial.println(currentBottleOunces);
    // Serial.println("ABSOLUTE VALUE");
    Serial.print("weight: ");
    Serial.print(weight);
    Serial.print(" | prev. weight: ");
    Serial.println(prevWeight);
    
    // double test = weight - prevWeight;
    // Serial.println(test);
    if(abs(weight - prevWeight)>= 5){
      // if(bottleReset){
        // Serial.println("Initial reset! Setting bool to false");
        totalOzDrank = newOzDrank + ozBeforeTare;
        // bottleReset = false;
        if (Firebase.RTDB.setDouble(&fbdo, "/totalOz", totalOzDrank)){
          Serial.println("PASSED");
          Serial.println("PATH: " + fbdo.dataPath());
          Serial.println("TYPE: " + fbdo.dataType());
          prevWeight = weight;
        }
        else {
          Serial.println("FAILED");
          Serial.println("REASON: " + fbdo.errorReason());
        }
    
      }
      // else{
        // totalOzDrank = prevOuncesConsumed;
      // }
      // double totalOzDrank = newOzDrank;
      if (Firebase.RTDB.setDouble(&fbdo, "/currentOuncesDrank", newOzDrank)){
      
        Serial.println("just set the value of /currentOuncesDrank ");
        canvas.drawString("Sent value", 40, 40);
        StickCP2.update();
        delay(1000);
        canvas.drawString("          ", 40, 40);
        
      // Serial.println("PATH: " + fbdo.dataPath());
      // Serial.println("TYPE: " + fbdo.dataType());
     }
    else {
      Serial.println("FAILED");
      Serial.println("REASON: " + fbdo.errorReason());
    }
    }


    
   
    


    
    

    // if (Firebase.RTDB.updateNode(&fbdo, "/totalOz", totalOzDrank)){
    //   Serial.println("PATH: " + fbdo.dataPath());
    //   Serial.println("TYPE: " + fbdo.dataType());
    // }
    // else {
    //   Serial.println("FAILED");
    //   Serial.println("REASON: " + fbdo.errorReason());
    // }




  // }

    
    // if (Firebase.RTDB.pushInt(&fbdo, "counter", count)){
    //   Serial.println("Pushed the count of " + count);
    //   Serial.println("PATH: " + fbdo.dataPath());
    //   Serial.println("TYPE: " + fbdo.dataType());
    // }
    // else {
    //   Serial.println("FAILED");
    //   Serial.println("REASON: " + fbdo.errorReason());
    // }
  
  
  scale.power_down();             // put the ADC in sleep mode
  delay(1000);
  scale.power_up();
}
