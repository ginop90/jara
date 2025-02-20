// Establecer la fecha actual por defecto
function setFechaActual() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    document.getElementById('fecha').value = `${year}-${month}-${day}`;
}

// Formatear fecha para mostrar en PDF
function formatearFecha(fechaStr) {
    const [year, month, day] = fechaStr.split('-');
    return `${day}-${month}-${year}`;
}

// Llamar a la función cuando se carga la página
window.onload = setFechaActual;

function mostrarError(elemento, mensaje, duracion = 3000) {
    const errorMessage = elemento.parentElement.querySelector('.error-message');
    elemento.classList.add('error');
    errorMessage.textContent = mensaje;
    errorMessage.style.display = 'block';
    
    setTimeout(() => {
        elemento.classList.remove('error');
        errorMessage.style.display = 'none';
    }, duracion);
}

function agregarItem() {
    const itemsList = document.getElementById('items-list');
    const newRow = document.createElement('div');
    newRow.className = 'item-row';
    newRow.innerHTML = `
        <input type="text" placeholder="Descripción del trabajo" class="trabajo" required>
        <input type="number" placeholder="Importe" class="importe" step="0.01" required min="0">
        <div class="error-message"></div>
    `;
    itemsList.appendChild(newRow);

    // Agregar listeners para validación en tiempo real
    const trabajoInput = newRow.querySelector('.trabajo');
    const importeInput = newRow.querySelector('.importe');

    trabajoInput.addEventListener('input', () => validarCampo(trabajoInput));
    importeInput.addEventListener('input', () => {
        validarCampo(importeInput);
        calcularTotal();
    });
}

function validarCampo(campo) {
    if (!campo.value.trim()) {
        mostrarError(campo, 'Este campo es requerido');
        return false;
    }
    return true;
}

function mostrarErroresEnContenedor(errores) {
    const contenedor = document.querySelector('.error-container');
    const lista = contenedor.querySelector('.error-list');
    lista.innerHTML = ''; // Limpiar errores anteriores

    if (errores.length > 0) {
        errores.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            lista.appendChild(li);
        });
        contenedor.classList.add('active');

        // Ocultar después de 3 segundos
        setTimeout(() => {
            contenedor.classList.remove('active');
        }, 3000);
    } else {
        contenedor.classList.remove('active');
    }
}

function validarFormulario() {
    let isValid = true;
    const errores = [];
    const cliente = document.getElementById('cliente');
    const fecha = document.getElementById('fecha');
    const items = document.querySelectorAll('.item-row');

    // Validar fecha
    if (!fecha.value) {
        errores.push('La fecha es requerida');
        isValid = false;
    }

    // Validar cliente
    if (!cliente.value.trim()) {
        errores.push('El nombre del cliente es requerido');
        isValid = false;
    }

    // Validar items
    items.forEach((item, index) => {
        const trabajo = item.querySelector('.trabajo');
        const importe = item.querySelector('.importe');

        if (!trabajo.value.trim()) {
            errores.push(`Falta la descripción en el item ${index + 1}`);
            isValid = false;
        }
        if (!importe.value) {
            errores.push(`Falta el importe en el item ${index + 1}`);
            isValid = false;
        }
    });

    mostrarErroresEnContenedor(errores);
    return isValid;
}

// Actualizar la función de validación en tiempo real
function validarCampo(campo) {
    if (!campo.value.trim()) {
        campo.classList.add('error');
        return false;
    }
    campo.classList.remove('error');
    return true;
}

// Agregar validación en tiempo real para el cliente
document.getElementById('cliente').addEventListener('input', function() {
    validarCampo(this);
});

// Agregar validación en tiempo real para la fecha
document.getElementById('fecha').addEventListener('input', function() {
    validarCampo(this);
});

function validarYGenerarPDF() {
    if (validarFormulario()) {
        generarPDF();
    }
}

function calcularTotal() {
    const importes = document.querySelectorAll('.importe');
    let total = 0;
    importes.forEach(importe => {
        total += Number(importe.value) || 0;
    });
    document.getElementById('total').textContent = total.toFixed(2);
}

document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        agregarItem();
    }
});

// Agregar validación inicial para el primer item
document.querySelector('.trabajo').addEventListener('input', function() {
    validarCampo(this);
});

document.querySelector('.importe').addEventListener('input', function() {
    validarCampo(this);
    calcularTotal();
});

function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configuración de fuentes y colores
    doc.setFillColor(52, 152, 219);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Encabezado
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text('CARLOS HOMOLA', 20, 20);
    doc.setFontSize(16);
    doc.text('SERVICIOS INTEGRALES', 20, 30);
    
    // Logo
    doc.setFillColor(41, 128, 185);
    doc.circle(170, 20, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('CH', 165, 24);
    
    // Información del presupuesto
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(14);
    doc.text('PRESUPUESTO', 20, 50);
    
    // Línea divisoria
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);
    
    // Datos del cliente con fecha formateada
    doc.setFontSize(12);
    const fechaFormateada = formatearFecha(document.getElementById('fecha').value);
    doc.text(`Fecha: ${fechaFormateada}`, 20, 65);
    doc.text(`Cliente: ${document.getElementById('cliente').value}`, 20, 75);
    
    // Tabla de items
    let y = 90;
    doc.setFillColor(241, 196, 15);
    doc.rect(20, y - 10, 170, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text('DESCRIPCIÓN', 25, y - 2);
    doc.text('IMPORTE', 150, y - 2);
    
    const items = document.querySelectorAll('.item-row');
    items.forEach((item, index) => {
        const trabajo = item.querySelector('.trabajo').value;
        const importe = item.querySelector('.importe').value;
        if (trabajo && importe) {
            if (index % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(20, y, 170, 10, 'F');
            }
            doc.text(trabajo, 25, y + 7);
            doc.text(`$${Number(importe).toFixed(2)}`, 150, y + 7);
            y += 10;
        }
    });
    
    // Total
    doc.setFillColor(52, 152, 219);
    doc.rect(20, y + 5, 170, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(`TOTAL: $${document.getElementById('total').textContent}`, 25, y + 13);
    
    // Pie de página
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(10);
    doc.text('Carlos Homola', 20, y + 30);
    doc.text('San Rafael - 2604085532', 20, y + 35);
    
    // Generar y descargar PDF
    const pdfOutput = doc.output('blob');
    const url = URL.createObjectURL(pdfOutput);
    
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        const file = new File([pdfOutput], 'presupuesto.pdf', { type: 'application/pdf' });
        if (navigator.share) {
            navigator.share({
                files: [file],
                title: 'Presupuesto Carlos Homola'
            });
        }
    } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'presupuesto.pdf';
        link.click();
    }
}