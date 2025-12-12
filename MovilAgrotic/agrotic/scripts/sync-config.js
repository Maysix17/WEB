#!/usr/bin/env node

/**
 * Script para sincronizar la configuración de API URL desde app.json
 * hacia api-config.json para uso compartido entre proyectos
 */

const fs = require('fs');
const path = require('path');

const AGROTIC_ROOT = path.join(__dirname, '..');
const APP_JSON_PATH = path.join(AGROTIC_ROOT, 'app.json');
const API_CONFIG_PATH = path.join(AGROTIC_ROOT, 'config', 'api-config.json');

function detectEnvironment(apiUrl) {
  if (apiUrl.includes('ngrok-free.dev') || 
      apiUrl.includes('localhost') || 
      apiUrl.includes('192.168.') ||
      apiUrl.includes('127.0.0.1')) {
    return 'development';
  }
  if (apiUrl.includes('staging') || apiUrl.includes('test')) {
    return 'staging';
  }
  return 'production';
}

function syncConfig() {
  try {
    // Leer app.json
    if (!fs.existsSync(APP_JSON_PATH)) {
      console.error('❌ No se encontró app.json en:', APP_JSON_PATH);
      process.exit(1);
    }

    const appJsonContent = fs.readFileSync(APP_JSON_PATH, 'utf8');
    const appJson = JSON.parse(appJsonContent);
    
    const apiUrl = appJson?.expo?.extra?.apiUrl;
    if (!apiUrl) {
      console.error('❌ No se encontró apiUrl en app.json');
      process.exit(1);
    }

    // Crear configuración
    const config = {
      apiUrl: apiUrl,
      environment: detectEnvironment(apiUrl),
      lastUpdated: new Date().toISOString()
    };

    // Asegurar que el directorio config existe
    const configDir = path.dirname(API_CONFIG_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Escribir api-config.json
    fs.writeFileSync(API_CONFIG_PATH, JSON.stringify(config, null, 2));
    
    console.log('✅ Configuración sincronizada exitosamente:');
    console.log(`   API URL: ${apiUrl}`);
    console.log(`   Environment: ${config.environment}`);
    console.log(`   Archivo: ${API_CONFIG_PATH}`);
    
  } catch (error) {
    console.error('❌ Error sincronizando configuración:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  syncConfig();
}

module.exports = { syncConfig };