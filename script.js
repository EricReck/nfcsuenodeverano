// Variables globales
let currentNFCId = null;
let isScanning = false;
const defaultData = {
    balance: 0,
    cena: 'no',
    pulseraEntregada: 'no',
    ropero: '',
    nombre: ''
};

// Elementos del DOM
const nfcReader = document.querySelector('.nfc-reader');
const cardInfo = document.querySelector('.card-info');
const nfcForm = document.getElementById('nfcForm');
const modal = document.getElementById('modal');
const addBalanceBtn = document.querySelector('.add-balance');
const confirmAddBtn = document.getElementById('confirmAdd');
const cancelAddBtn = document.getElementById('cancelAdd');
const addAmountInput = document.getElementById('addAmount');
const balanceInput = document.getElementById('balance');
const startScanBtn = document.getElementById('startScanBtn');
const scanStatus = document.getElementById('scanStatus');

// Sistema de Balance
class BalanceManager {
    constructor() {
        this.currentBalance = 0;
    }

    setBalance(amount) {
        this.currentBalance = parseFloat(amount) || 0;
        this.updateDisplay();
    }

    addBalance(amount) {
        const toAdd = parseFloat(amount) || 0;
        if (toAdd <= 0) {
            throw new Error('La cantidad debe ser mayor que 0');
        }
        this.currentBalance += toAdd;
        this.updateDisplay();
        return toAdd;
    }

    getBalance() {
        return this.currentBalance;
    }

    updateDisplay() {
        balanceInput.value = this.currentBalance.toFixed(2);
    }
}

const balanceManager = new BalanceManager();

// Función para actualizar el estado del escaneo
function updateScanStatus(message, type = 'normal') {
    scanStatus.textContent = message;
    scanStatus.className = 'scan-status';
    if (type === 'active') {
        scanStatus.classList.add('active');
        scanStatus.classList.add('scanning');
    } else if (type === 'error') {
        scanStatus.classList.add('error');
    }
}

// Función para iniciar el escaneo NFC
async function startNFCScan() {
    if (isScanning) return;
    
    try {
        if ('NDEFReader' in window) {
            isScanning = true;
            startScanBtn.disabled = true;
            updateScanStatus('Escaneando...', 'active');
            
            const ndef = new NDEFReader();
            await ndef.scan();
            
            ndef.addEventListener("reading", ({ serialNumber }) => {
                handleNFCRead(serialNumber);
            });

            ndef.addEventListener("error", (error) => {
                console.error(`Error al escanear: ${error}`);
                isScanning = false;
                startScanBtn.disabled = false;
                updateScanStatus('Error al leer la pulsera NFC', 'error');
                mostrarMensaje('Error al leer la pulsera NFC. Por favor, inténtalo de nuevo.', 'error');
            });
        } else {
            updateScanStatus('Este navegador no soporta NFC', 'error');
            mostrarMensaje('Este navegador no soporta NFC. Por favor, usa Chrome en Android.', 'error');
        }
    } catch (error) {
        console.error('Error al iniciar el escaneo NFC:', error);
        isScanning = false;
        startScanBtn.disabled = false;
        
        if (error.name === 'NotAllowedError') {
            updateScanStatus('NFC no permitido', 'error');
            mostrarMensaje('Por favor, activa NFC en tu dispositivo y permite el acceso.', 'error');
        } else if (!window.isSecureContext) {
            updateScanStatus('Se requiere HTTPS', 'error');
            mostrarMensaje('Esta aplicación requiere HTTPS. Por favor, usa una conexión segura.', 'error');
        } else {
            updateScanStatus('Error al iniciar NFC', 'error');
            mostrarMensaje('Error al iniciar NFC. Asegúrate de que NFC está activado.', 'error');
        }
    }
}

// Función para detener el escaneo
function stopNFCScan() {
    isScanning = false;
    startScanBtn.disabled = false;
    updateScanStatus('NFC desactivado');
}

// Función para mostrar mensajes al usuario
function mostrarMensaje(mensaje, tipo = 'info') {
    const mensajeExistente = document.querySelector('.mensaje');
    if (mensajeExistente) {
        mensajeExistente.remove();
    }

    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje ${tipo}`;
    mensajeDiv.textContent = mensaje;
    document.querySelector('.container').insertBefore(mensajeDiv, nfcReader);
    
    setTimeout(() => {
        if (mensajeDiv.parentNode) {
            mensajeDiv.remove();
        }
    }, 5000);
}

// Función para manejar la lectura de NFC
async function handleNFCRead(nfcId) {
    try {
        currentNFCId = nfcId;
        const data = await getNFCData(nfcId);
        displayNFCData(data);
        nfcReader.classList.add('hidden');
        cardInfo.classList.remove('hidden');
        stopNFCScan();
    } catch (error) {
        console.error('Error al manejar la lectura NFC:', error);
        mostrarMensaje('Error al procesar los datos de la pulsera.', 'error');
    }
}

// Función para obtener datos de la NFC
async function getNFCData(nfcId) {
    try {
        const storedData = localStorage.getItem(nfcId);
        if (storedData) {
            return JSON.parse(storedData);
        }
        return { ...defaultData };
    } catch (error) {
        console.error('Error al obtener datos:', error);
        return { ...defaultData };
    }
}

// Función para mostrar los datos en el formulario
function displayNFCData(data) {
    try {
        document.getElementById('nombre').value = data.nombre || '';
        balanceManager.setBalance(data.balance || 0);
        document.getElementById('cena').value = data.cena || 'no';
        document.getElementById('entregada').value = data.pulseraEntregada || 'no';
        document.getElementById('ropero').value = data.ropero || '';
    } catch (error) {
        console.error('Error al mostrar datos:', error);
        mostrarMensaje('Error al mostrar los datos.', 'error');
    }
}

// Función para guardar datos
async function saveNFCData(data) {
    if (!currentNFCId) {
        mostrarMensaje('No hay pulsera NFC seleccionada.', 'error');
        return;
    }
    
    try {
        localStorage.setItem(currentNFCId, JSON.stringify(data));
        mostrarMensaje('Datos guardados correctamente', 'success');
        resetView();
    } catch (error) {
        console.error('Error al guardar:', error);
        mostrarMensaje('Error al guardar los datos.', 'error');
    }
}

// Función para resetear la vista
function resetView() {
    currentNFCId = null;
    nfcForm.reset();
    balanceManager.setBalance(0);
    cardInfo.classList.add('hidden');
    nfcReader.classList.remove('hidden');
    startNFCScan();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Agregar estilos para los mensajes
    const style = document.createElement('style');
    style.textContent = `
        .mensaje {
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            text-align: center;
            animation: fadeIn 0.3s ease-in-out;
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2000;
            min-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .mensaje.error {
            background-color: #ffe5e5;
            color: #ff3333;
            border: 1px solid #ffcccc;
        }
        .mensaje.success {
            background-color: #e5ffe5;
            color: #33cc33;
            border: 1px solid #ccffcc;
        }
        .mensaje.info {
            background-color: #e5f2ff;
            color: #3399ff;
            border: 1px solid #cce5ff;
        }
    `;
    document.head.appendChild(style);
    
    // Verificar disponibilidad de NFC
    if ('NDEFReader' in window) {
        updateScanStatus('Listo para escanear');
    } else {
        updateScanStatus('NFC no soportado', 'error');
        startScanBtn.disabled = true;
    }
});

// Añadir evento al botón de escaneo
startScanBtn.addEventListener('click', startNFCScan);

nfcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        nombre: document.getElementById('nombre').value,
        balance: balanceManager.getBalance(),
        cena: document.getElementById('cena').value,
        pulseraEntregada: document.getElementById('entregada').value,
        ropero: document.getElementById('ropero').value
    };
    saveNFCData(data);
});

// Gestión del modal de balance
function showModal() {
    modal.classList.remove('hidden');
    modal.classList.add('visible');
    addAmountInput.value = '';
    addAmountInput.focus();
}

function hideModal() {
    modal.classList.remove('visible');
    modal.classList.add('hidden');
    addAmountInput.value = '';
}

addBalanceBtn.addEventListener('click', showModal);

confirmAddBtn.addEventListener('click', () => {
    try {
        const amount = parseFloat(addAmountInput.value);
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Por favor, introduce una cantidad válida');
        }
        
        const added = balanceManager.addBalance(amount);
        hideModal();
        mostrarMensaje(`Se han añadido ${added.toFixed(2)}€ al balance`, 'success');
    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
});

// Manejar el envío del formulario del modal con Enter
addAmountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        confirmAddBtn.click();
    }
});

cancelAddBtn.addEventListener('click', hideModal);

// Prevenir que el modal se cierre al hacer clic en su contenido
document.querySelector('.modal-content').addEventListener('click', (e) => {
    e.stopPropagation();
});

// Cerrar el modal al hacer clic fuera de él
modal.addEventListener('click', hideModal); 