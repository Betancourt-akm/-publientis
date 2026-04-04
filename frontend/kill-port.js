const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function killProcessOnPort(port) {
  try {
    console.log(`🔍 Buscando procesos en puerto ${port}...`);
    
    // Buscar procesos usando el puerto
    const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
    
    if (!stdout.trim()) {
      console.log(`✅ Puerto ${port} está libre.`);
      return;
    }
    
    // Extraer PIDs de los procesos
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        pids.add(pid);
      }
    });
    
    if (pids.size === 0) {
      console.log(`✅ No se encontraron procesos usando el puerto ${port}.`);
      return;
    }
    
    console.log(`🔄 Terminando ${pids.size} proceso(s) en puerto ${port}...`);
    
    // Terminar cada proceso
    for (const pid of pids) {
      try {
        await execPromise(`taskkill /PID ${pid} /F`);
        console.log(`✅ Proceso ${pid} terminado.`);
      } catch (error) {
        console.warn(`⚠️ No se pudo terminar el proceso ${pid}:`, error.message);
      }
    }
    
    console.log(`🎉 Puerto ${port} liberado exitosamente.`);
    
  } catch (error) {
    console.warn(`⚠️ Error al liberar puerto ${port}:`, error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const port = process.argv[2] || 3000;
  killProcessOnPort(port);
}

module.exports = { killProcessOnPort };
