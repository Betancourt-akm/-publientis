/**
 * Script para limpiar el rate limit de una IP específica
 * Útil durante desarrollo cuando te bloqueas por intentos
 * 
 * USO:
 * node scripts/clear-rate-limit.js
 */

console.log('🔧 Script de Limpieza de Rate Limit');
console.log('===================================\n');

console.log('ℹ️  Rate Limit se almacena en memoria del servidor.');
console.log('ℹ️  Para limpiar el rate limit, simplemente reinicia el servidor.\n');

console.log('📋 Opciones para limpiar rate limit:\n');

console.log('1️⃣  REINICIAR SERVIDOR (Recomendado):');
console.log('   - Ctrl + C en la terminal del backend');
console.log('   - npm start\n');

console.log('2️⃣  ESPERAR 15 MINUTOS:');
console.log('   - El rate limit se limpia automáticamente\n');

console.log('3️⃣  CAMBIAR NAVEGADOR/IP:');
console.log('   - Usar modo incógnito');
console.log('   - Usar otro navegador');
console.log('   - Desconectar/reconectar WiFi (cambia IP)\n');

console.log('✅ SOLUCIÓN PERMANENTE:');
console.log('   - Ya se actualizó security.js');
console.log('   - En desarrollo: 100 intentos permitidos');
console.log('   - En producción: 5 intentos (seguridad)\n');

console.log('🚀 REINICIA EL SERVIDOR para aplicar cambios.');
