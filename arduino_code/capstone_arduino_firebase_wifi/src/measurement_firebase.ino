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

// Define Firebase Data object
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Provide the token generation process info.
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert Firebase project API Key
#define API_KEY "AIzaSyCBAU1qcc-VEC441tEghLDnT1ARGP926YI"

// Insert RTDB URLefine the RTDB URL */
#define DATABASE_URL "https://esp32-firebase-demo-1866a-default-rtdb.firebaseio.com/"

/*=================================
          SCALE CONFIG
 ================================= */
// #include "HX711.h"
// // HX711 load cell amp
// const int LOADCELL_DOUT_PIN = 26;
// const int LOADCELL_SCK_PIN = 0;
// const float calibration_factor = -166800.0 / 187.0;
// HX711 scale;

/*=================================
          NEW SCALE CONFIG
 ================================= */
#include "M5UnitWeightI2C.h"

M5UnitWeightI2C weight_i2c;
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
#include "../../../../../../.platformio/packages/framework-arduinoespressif32/tools/sdk/esp32/include/esp_rom/include/esp32c3/rom/tjpgd.h"

// water measurement vars
double currentBottleOunces = 0.0;
double newOzDrank = 0.0;
double weight = 0.0;
// double prevWeight = 0.0;
double totalOzDrank = 0.0;
bool bottleReset = true;
double ozBeforeTare = 0.0;

double bottleWeight = 0.0;
double totalWeight = 0.0;
double currWeight = 0.0;
double prevWeight = 0.0;
double GRAMS_TO_OZ = 0.035274;
double currWeightOz = 0.0;
double mintolerance = 30.0;
double maxtolerance = 500.0;
double currBottleOz = 0.0;
bool waterMeasured = false;
// float BOTTLE_SCALE = 27.61f;
double CALIBRATION_FACTOR = 7.67263427;

// double waterWeight = 0.0;

// random varialbes for program
unsigned long sendDataPrevMillis = 0;
volatile int count = 0;
bool signupOK = false;
int counter = 0;
char info[100];

void setup()
{
  Serial.begin(115200);
  /*=================================
            M5 SETUP
   ================================= */
  auto cfg = M5.config();
  StickCP2.begin(cfg);

  display.begin();
  display.setRotation(3);
  canvas.setColorDepth(1); // mono color
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
  // scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  // The scale value is the adc value corresponding to 1g
  // scale.set_scale(27.61f);  // set scale
  // scale.set_scale(calibration_factor);
  // scale.tare(); // auto set offset
  while (!weight_i2c.begin(&Wire, 32, 33, DEVICE_DEFAULT_ADDR, 100000U))
  {
    Serial.println("weight i2c connect error");
    delay(100);
  }
  // weight_i2c.setOffset();
  /*=================================
          WIFI SETUP
 ================================= */
  Serial.print("Now beginning wifi setup.");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED)
  {
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

  firebaseSetup();

  Serial.println("Deleting nodes");
  // Firebase.RTDB.deleteNode(&fbdo, "/ouncesConsumed");
  Firebase.RTDB.deleteNode(&fbdo, "/ozBeforeTare");
  Firebase.RTDB.deleteNode(&fbdo, "/currentOuncesDrank");
  Firebase.RTDB.deleteNode(&fbdo, "/totalOz");
  Firebase.RTDB.setDouble(&fbdo, "/ozBeforeTare", 0.0);
  Firebase.RTDB.setDouble(&fbdo, "/currentOuncesDrank", 0.0);
  Firebase.RTDB.setDouble(&fbdo, "/totalOz", 0.0);

  initialTare();
  secondaryTare();
}

void initialTare()
{
  Serial.println("Please place bottle on a flat surface");
  Serial.println("Calibrating in 5 seconds");
  delay(5000); // wait for the user to place the bottle on a flat surface
  // scale.tare();
  weight_i2c.tare();
  weight_i2c.set_scale(CALIBRATION_FACTOR);

  StickCP2.Speaker.tone(4000, 500);
  delay(1000);
  Serial.println("Initial tare complete.");
}

void secondaryTare()
{
  Serial.println("Please place the bottle on a flat surface, then press the main button.");
  while (1)
  {
    StickCP2.update();
    if (M5.BtnA.pressedFor(2000))
    {
      break;
    }
    delay(10);
  }
  Serial.println("Main button pressed. Initiating bottle tare.");
  Serial.println("Please do not move the bottle until the beep.");
  delay(7500);
  // totalWeight = scale.get_units(10);
  totalWeight= weight_i2c.get_units(10);
  
  bottleWeight = totalWeight;
  Serial.print("Just got a bottle weight of: ");
  Serial.println(totalWeight);
  StickCP2.Speaker.tone(4000, 500);
  delay(1000);
  StickCP2.Speaker.tone(4000, 500);
  delay(1000);
  Serial.println("You are free to begin using the bottle.");
}
void firebaseSetup()
{
  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;

  /* Sign up */
  if (Firebase.signUp(&config, &auth, "", ""))
  {
    Serial.println("ok");
    signupOK = true;
  }
  else
  {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; // see addons/TokenHelper.h

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}
void grabAndPrintWeight()
{
  // TAKING MEASUREMENTS AND PRINTING
  canvas.fillSprite(BLACK);
  canvas.setTextSize(1);
  canvas.drawString("<-Tare", 30, 20);
  canvas.drawString("Calibration", 80, 120);
  // prevWeight = weight;
  // totalWeight = scale.get_units(10);
  // weight_i2c.set_scale(4.28f);  // set scale
  totalWeight = weight_i2c.get_units(10);
  
  currWeight = totalWeight - bottleWeight;
  currWeightOz = currWeight * GRAMS_TO_OZ;
  canvas.setTextSize(3);
  // if (weight != 0) {
  Serial.printf("currWeight: %.2f |bottleWeight: %.2f |totalWeight: %.2f\ncurrWeightOz: %.2f | prevWeight: %.2f | currBottleOz: %.2f \nTotalOzDrank: %.2f\n\n", currWeight, bottleWeight, totalWeight, currWeightOz, prevWeight, currBottleOz, totalOzDrank);
  // Serial.printf(bottle)
  canvas.drawString(String(currWeightOz, 2) + "g", 80, 60);

  // } else {
  // canvas.drawString("0.000g", 80, 60);
  // }
}

void tareButtonPress()
{
  // scale.tare();
  // weight_i2c.setOffset();
  weight_i2c.tare();
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
  if (Firebase.RTDB.setDouble(&fbdo, "/ozBeforeTare", ozBeforeTare))
  {
    Serial.println("just set value of ozBeforeTare:");
    prevWeight = weight;
  }
  else
  {
    Serial.println("FAILED");
    Serial.println("REASON: " + fbdo.errorReason());
  }

  delay(1000);
}

void calibrateButtonPress()
{
  long hund_g = 5;
  while (1)
  {
    StickCP2.update();
    canvas.fillSprite(BLACK);
    canvas.setTextSize(2);
    canvas.drawString("Cal:" + String(hund_g * 100) + "oz", 80, 60);
    canvas.setTextSize(1);
    canvas.drawString("<-change", 30, 20);
    canvas.drawString("BROKEN", 50, 50);
    canvas.drawString("long press comfirm", 80, 120);
    canvas.pushSprite(0, 0);
    if (M5.BtnB.pressedFor(2000))
    {
      break;
    }
    if (StickCP2.BtnA.wasReleased())
    {
      hund_g--;
    }
    if (StickCP2.BtnB.wasReleased())
    {
      hund_g++;
    }
    delay(10);
  }
  // long g_adc = scale.read_average(20);
  // g_adc = g_adc - scale.get_offset();
  // scale.set_scale(g_adc / (hund_g * 100.0));
}

void negativeWeight()
{
  // Serial.println("Negative weight");
  // if (waterMeasured == false){
    currBottleOz += (prevWeight - currWeight) * GRAMS_TO_OZ;
    waterMeasured = true;
  // }
  Serial.printf("Drink time! You have drank %.2f in this bottle of water.\n", currBottleOz);


}
void positiveWeight()
{
  
  //when the weight is positive, we are treating this as an inflow of water.
  //therefore, the total ounces should be incremented and the current bottle should be set to 0
  // Serial.println("Positive weight");

  totalOzDrank += currBottleOz;
  currBottleOz = 0.0;
  Serial.printf("Filling the bottle! You have now drank a total of:%.2f ounces of water. \n", totalOzDrank);
}
void neutralWeight()
{
  Serial.println("Neutral weight");
}
void loop()
{

  grabAndPrintWeight();

  StickCP2.update(); // Read the press state of the key

  if (StickCP2.BtnA.wasPressed())
  {
    tareButtonPress();
  }

  // #todo combine button presses
  if (StickCP2.BtnB.wasPressed())
  {
    calibrateButtonPress();
  }
  canvas.pushSprite(0, 0);
  // Serial.printf("Prev Weight: %.2f | CurrWeight: %.2f\n", prevWeight, currWeight);
  if (prevWeight - currWeight > mintolerance && prevWeight - currWeight < maxtolerance)
  {
    negativeWeight();
  }
  else if (prevWeight - currWeight < (-mintolerance) && prevWeight-currWeight > (-maxtolerance))
  {
    positiveWeight();
  }
  else
  {
    neutralWeight();
  }
  // printAllValues();
  delay(5000);
  prevWeight = currWeight;
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0))
  {
    sendDataPrevMillis = millis();
    // prevWeight = currWeight;
    // waterMeasured == false;

    Serial.println("Sending data to firebase");
    // Firebase.RTDB.setDouble(

    // scale.power_down(); // put the ADC in sleep mode
    delay(1000);
    // scale.power_up();
  }
}
