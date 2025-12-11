PROYECTO, DOCUMENTACIÓN Y CODIGO ARDUINO ID
////////////////////////////////////////////////////////////
PROYECTOO
### 1. Instalar Dependencias

#### Backend (API_Nest_Agro_Tic)

cd API_Nest_Agro_Tic
npm install

#### Frontend (FrontEnd_AgroTic)

cd FrontEnd_AgroTic
npm install


### 2. Configurar el Backend

#### Levantar los Servicios con Docker

cd API_Nest_Agro_Tic
npm run docker:dev

Este comando levantará los contenedores de Docker necesarios (PostgreSQL, Redis, etc.).



#### Generar Migraciones

Ahora ejecutamos estos comando en una terminal aparte. Para que funcione debe estar el backend cooriendo

npm run docker:g

#### Ejecutar Migraciones

npm run docker:r


#### Ejecutar Seeders

npm run docker:seed


### 3. Configurar el Frontend

#### Ejecutar el Servidor de Desarrollo

cd FrontEnd_AgroTic
npm run dev


## Acceso al Sistema

Después de ejecutar los seeders, podrás acceder al sistema con las siguientes credenciales de prueba:

- **Administrador:**
  - Usuario: 123456789
  - Contraseña: admin123
//////////////////////////////////////////////////////////
### DOCUMENTACIÓN


1. cd astrosebas
2. npm install
3. npm run dev
////////////////////////////////////////////////////////////////////////////////////////////

### CODIGO ARDUINO ID

DOCUMENTACIÓN COMPLETA ARDUINO IDE– Proyecto ESP32 + Sensores + MQTT

##  Requisitos previos
Librerías necesarias (con versiones recomendadas)

### Instala las siguientes librerías desde el Administrador de Librerías del Arduino IDE:

PubSubClient – versión 2.8

DHT sensor library – versión 1.4.6

Adafruit Unified Sensor – versión 1.1.14

WiFi (incluida con ESP32 Core) – usa ESP32 Core versión 2.0.17 o superior

math.h – incluida por defecto

### Indicaciones para cambiar credenciales WiFi

En el código, edita esta parte:

const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";


### Reemplaza:

TU_WIFI → por el nombre de tu red WiFi

TU_PASSWORD → por la contraseña real del WiFi

### Indicaciones para cambiar el broker MQTT

Si usas otro broker:

const char* mqtt_server = "test.mosquitto.org";
const int mqtt_port = 1883;


Cambia mqtt_server y mqtt_port.

### CÓDIGO COMPLETO (PÉGALO TAL CUAL EN ARDUINO IDE)


#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"
#include <math.h>

/* ============================================================
 *                     CONFIGURACIÓN DE PINES
 * ============================================================ */
#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

#define RELE_PIN 6             
#define MQ4_PIN A1             
#define LDR_PIN A4             
#define HUMEDAD_PIN A6         

/* ============================================================
 *                  VARIABLES DE SENSORES
 * ============================================================ */
float temperatura, humedad;
int gasValue, ldrValue;

/* ============================================================
 *                CONFIGURACIÓN WIFI Y MQTT
 * ============================================================ */
const char* ssid     = "TU_WIFI";     
const char* password = "TU_PASSWORD";      

const char* mqtt_server = "test.mosquitto.org";
const int   mqtt_port   = 1883;

const char* topic_temp  = "agrotic/sensores/temperatura_amb";
const char* topic_hum   = "agrotic/sensores/humedad_amb";
const char* topic_gas   = "agrotic/sensores/gas_mq4";
const char* topic_ldr   = "agrotic/sensores/luz_ldr";
const char* topic_suelo = "agrotic/sensores/humedad_suelo";
const char* topic_bomba = "agrotic/actuadores/bomba";

WiFiClient espClient;
PubSubClient client(espClient);

/* ============================================================
 *               CALIBRACIÓN MQ-4 Y SENSOR DE LUZ
 * ============================================================ */
const float ADC_MAX = 4095.0;
const float VREF = 3.3;

const float RL_MQ4 = 10000.0;
float R0_MQ4 = 9830.0;

const float R_FIXED_LDR = 10000.0;

const float MQ4_A = 101.42;
const float MQ4_B = -2.786;

float ema_gas = -1.0;
float ema_ldr = -1.0;
const float ALPHA = 0.2;

/* ============================================================
 *           CALIBRACIÓN HUMEDAD DE SUELO
 * ============================================================ */
int valorSeco   = 4095;
int valorHumedo = 2549;

int humedadBaja = 20;     
int humedadAlta = 40;     

/* ============================================================
 *                    PUBLICACIÓN JSON
 * ============================================================ */
void publishJson(const char* topic, const String& json) {
  client.publish(topic, json.c_str());
}

void publishKeyValue(const char* topic, const String& key, const String& value) {
  String payload = String("{\"") + key + "\":\"" + value + "\"}";
  publishJson(topic, payload);
}

/* ============================================================
 *                FUNCIÓN MEJORADA WiFi
 * ============================================================ */
void conectarWiFi() {
  Serial.println("\nConectando a WiFi...");
  WiFi.begin(ssid, password);

  unsigned long inicio = millis();

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);

    if (millis() - inicio > 15000) {
      Serial.println("\nNo se pudo conectar al WiFi.");
      Serial.println("Reintentando en 5 segundos...");
      delay(5000);
      inicio = millis();
      WiFi.begin(ssid, password);
    }
  }

  Serial.println("\nWiFi conectado correctamente.");
  Serial.print("Dirección IP: ");
  Serial.println(WiFi.localIP());
}

/* ============================================================
 *           CONEXIÓN MQTT CON MENSAJES MEJORADOS
 * ============================================================ */
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.println("Intentando conectar al broker MQTT...");

    if (client.connect("ESP32_AgroTIC_ID_Unico")) {
      Serial.println("Conectado exitosamente al broker MQTT.");
    } else {
      Serial.print("Error al conectar. Código: ");
      Serial.println(client.state());
      Serial.println("Reintentando en 3 segundos...");
      delay(3000);
    }
  }
}

/* ============================================================
 *                           SETUP
 * ============================================================ */
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== Iniciando sistema AgroTIC ===");

  dht.begin();

  pinMode(RELE_PIN, OUTPUT);
  digitalWrite(RELE_PIN, LOW);

  pinMode(HUMEDAD_PIN, INPUT);
  pinMode(MQ4_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);

  /* ---------- WIFI CON MENSAJES ---------- */
  conectarWiFi();

  /* ---------- MQTT ---------- */
  client.setServer(mqtt_server, mqtt_port);

  /* ---------- CALIBRACIÓN MQ4 ---------- */
  Serial.println("Calibrando MQ-4...");
  R0_MQ4 = calibrateR0(50);
  Serial.print("R0 calibrado = ");
  Serial.println(R0_MQ4);
}

/* ============================================================
 *                           LOOP
 * ============================================================ */
void loop() {

  if (!client.connected()) reconnectMQTT();
  client.loop();

  Serial.println("\n------------------------------------");

  /* ----- HUMEDAD DE SUELO ----- */
  int lecturaSuelo = analogRead(HUMEDAD_PIN);

  int humedadSuelo = map(lecturaSuelo, valorSeco, valorHumedo, 0, 100);
  humedadSuelo = constrain(humedadSuelo, 0, 100);

  Serial.print("Sensor Suelo → ADC: ");
  Serial.print(lecturaSuelo);
  Serial.print(" | Humedad: ");
  Serial.print(humedadSuelo);
  Serial.println("%");

  if (humedadSuelo < humedadBaja) {
    digitalWrite(RELE_PIN, HIGH);
    Serial.println("Bomba: ENCENDIDA");
    publishKeyValue(topic_bomba, "Bomba", "ENCENDIDA");
  } 
  else if (humedadSuelo > humedadAlta) {
    digitalWrite(RELE_PIN, LOW);
    Serial.println("Bomba: APAGADA");
    publishKeyValue(topic_bomba, "Bomba", "APAGADA");
  }

  publishKeyValue(topic_suelo, "HumedadSuelo", String(humedadSuelo) + " %");

  /* ----- DHT11 ----- */
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  Serial.print("DHT11 → Temp: ");
  Serial.print(t);
  Serial.print(" C | Humedad: ");
  Serial.print(h);
  Serial.println(" %");

  if (!isnan(t)) publishKeyValue(topic_temp, "Temperatura", String(t,2) + " C");
  if (!isnan(h)) publishKeyValue(topic_hum, "Humedad", String(h,2) + " %");

  /* ----- MQ-4 ----- */
  gasValue = analogRead(MQ4_PIN);

  if (ema_gas < 0) ema_gas = gasValue;
  ema_gas = ALPHA * gasValue + (1 - ALPHA) * ema_gas;

  float Vout_gas = (ema_gas / ADC_MAX) * VREF;

  Serial.print("MQ-4 → ADC: ");
  Serial.print(gasValue);
  Serial.print(" | Voltaje: ");
  Serial.print(Vout_gas);
  Serial.println(" V");

  String gas_str = "invalid";
  if (Vout_gas > 0.01 && Vout_gas < VREF - 0.01) {
    float Rs = RL_MQ4 * (VREF / Vout_gas - 1.0);
    float ratio = Rs / R0_MQ4;
    float ppm = MQ4_A * pow(ratio, MQ4_B);
    gas_str = String(ppm, 2) + " ppm";

    Serial.print("MQ-4 PPM: ");
    Serial.println(gas_str);
  }

  publishKeyValue(topic_gas, "Gas", gas_str);

  /* ----- LDR ----- */
  ldrValue = analogRead(LDR_PIN);
  float Vout_ldr = (ldrValue / ADC_MAX) * VREF;

  float Rldr = R_FIXED_LDR * (Vout_ldr / (VREF - Vout_ldr));
  float lux = 25000000.0 * pow(Rldr, -1.406);

  Serial.print("LDR → ADC: ");
  Serial.print(ldrValue);
  Serial.print(" | Luz: ");
  Serial.print(lux);
  Serial.println(" lux");

  publishKeyValue(topic_ldr, "Luz", String(lux,2) + " lux");

  delay(3000);
}

/* ============================================================
 *                CALIBRACIÓN AUTOMÁTICA MQ-4
 * ============================================================ */
float calibrateR0(int samples) {
  long sumRs = 0;
  int valid = 0;

  for (int i = 0; i < samples; i++) {
    int a = analogRead(MQ4_PIN);
    float Vout = (a / ADC_MAX) * VREF;

    if (Vout > 0.01 && Vout < VREF - 0.01) {
      float Rs = RL_MQ4 * (VREF / Vout - 1.0);
      sumRs += Rs;
      valid++;
    }
    delay(100);
  }

  if (valid == 0) return R0_MQ4;
  return (float)sumRs / (float)valid;
}

Cómo verificar que los sensores están enviando datos
### 1️ Verificar en Arduino IDE

Abre:
Control + Shift + M
Herramientas → Monitor Serie
→ Selecciona 115200 baudios

Debes ver algo como:

Temperatura: 24.5 °C
Humedad Ambiente: 60 %
Gas MQ-4 ppm: 140.20
Luz: 30 %
Humedad Suelo: 45 %
Bomba: Apagada

2️ Verificar MQTT con MQTT Explorer 

Suscríbete a estos tópicos:

agrotic/sensores/temperatura
agrotic/sensores/humedad
agrotic/sensores/gas
agrotic/sensores/luz
agrotic/sensores/humedad_suelo
agrotic/actuadores/bomba


Si recibes datos → todo está funcionando.

 Uso del Monitor Serie

El Monitor Serie permite ver:

Valores en tiempo real de todos los sensores

Estado del WiFi

Estado del broker MQTT

Mensajes de depuración si algo falla