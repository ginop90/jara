// Variables para manejar extras
let extrasCount = 0;
const extras = [];

// Funciones para cambiar de página
function showPage(pageId) {
    document.getElementById('home-page').classList.add('hidden');
    document.getElementById('presupuesto-page').classList.add('hidden');
    document.getElementById('recibo-page').classList.add('hidden');
    
    document.getElementById(pageId).classList.remove('hidden');
}

// Establecer la fecha actual en los campos fecha
function setFechaActual() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    document.getElementById('presupuesto-fecha').value = formattedDate;
    document.getElementById('recibo-fecha').value = formattedDate;
}

// Agregar un extra
function agregarExtra() {
    extrasCount++;
    const extraId = `extra-${extrasCount}`;
    
    const extraDiv = document.createElement('div');
    extraDiv.className = 'extra-item';
    extraDiv.id = extraId;
    extraDiv.innerHTML = `
        <div class="form-group">
            <label for="${extraId}-desc">Descripción:</label>
            <input type="text" id="${extraId}-desc" placeholder="Descripción del extra" class="extra-descripcion">
        </div>
        <div class="form-group">
            <label for="${extraId}-importe">Importe:</label>
            <div class="amount-input">
                <input type="number" id="${extraId}-importe" placeholder="0" min="0" class="extra-importe" oninput="calcularTotalPresupuesto()">
            </div>
        </div>
        <div class="extra-controls">
            <button type="button" class="btn-remove-extra" onclick="eliminarExtra('${extraId}')">×</button>
        </div>
    `;
    
    document.getElementById('extras-container').appendChild(extraDiv);
    extras.push(extraId);
}

// Eliminar un extra
function eliminarExtra(extraId) {
    const extraElement = document.getElementById(extraId);
    if (extraElement) {
        extraElement.remove();
        
        // Eliminar del array
        const index = extras.indexOf(extraId);
        if (index > -1) {
            extras.splice(index, 1);
        }
        
        calcularTotalPresupuesto();
    }
}

// Calcular el total del presupuesto
function calcularTotalPresupuesto() {
    const importe = parseFloat(document.getElementById('presupuesto-importe').value) || 0;
    
    // Sumar todos los extras
    let totalExtras = 0;
    extras.forEach(extraId => {
        const extraImporte = document.getElementById(`${extraId}-importe`);
        if (extraImporte) {
            totalExtras += parseFloat(extraImporte.value) || 0;
        }
    });
    
    const total = importe + totalExtras;
    
    document.getElementById('presupuesto-total').textContent = `$${total.toLocaleString()}`;
}

// Formatear un número como moneda
function formatCurrency(value) {
    const number = parseFloat(value) || 0;
    return `$${number.toLocaleString()}`;
}

// Generar PDF de Presupuesto
function generarPDFPresupuesto() {
    // Obtener los valores del formulario
    const fecha = document.getElementById('presupuesto-fecha').value;
    const salon = document.getElementById('presupuesto-salon').value;
    const evento = document.getElementById('presupuesto-evento').value;
    const cliente = document.getElementById('presupuesto-cliente').value;
    const detalles = document.getElementById('presupuesto-detalles').value;
    const importe = document.getElementById('presupuesto-importe').value;
    
    // Actualizar contenido del PDF
    document.getElementById('pdf-presupuesto-fecha').textContent = formatDate(fecha);
    document.getElementById('pdf-presupuesto-salon').textContent = salon;
    document.getElementById('pdf-presupuesto-evento').textContent = evento;
    document.getElementById('pdf-presupuesto-cliente').textContent = cliente;
    document.getElementById('pdf-presupuesto-detalles').textContent = detalles;
    document.getElementById('pdf-presupuesto-importe').textContent = formatCurrency(importe);
    
    // Limpiar el contenedor de extras
    const pdfExtrasContainer = document.getElementById('pdf-extras-container');
    pdfExtrasContainer.innerHTML = '';
    
    // Agregar los extras al PDF
    let totalExtras = 0;
    extras.forEach(extraId => {
        const extraDesc = document.getElementById(`${extraId}-desc`).value;
        const extraImporte = parseFloat(document.getElementById(`${extraId}-importe`).value) || 0;
        
        if (extraDesc || extraImporte > 0) {
            const extraDiv = document.createElement('div');
            extraDiv.className = 'pdf-extra-row';
            extraDiv.innerHTML = `
                <div class="pdf-extra-name">${extraDesc}</div>
                <div class="pdf-extra-amount">${formatCurrency(extraImporte)}</div>
            `;
            pdfExtrasContainer.appendChild(extraDiv);
            
            totalExtras += extraImporte;
        }
    });
    
    const total = (parseFloat(importe) || 0) + totalExtras;
    document.getElementById('pdf-presupuesto-total').textContent = formatCurrency(total);
    
    // Generar PDF
    generatePDF('pdf-presupuesto', `Presupuesto_${cliente}_${formatDateFile(fecha)}`);
}

// Generar PDF de Recibo
function generarPDFRecibo() {
    // Obtener los valores del formulario
    const fecha = document.getElementById('recibo-fecha').value;
    const salon = document.getElementById('recibo-salon').value;
    const evento = document.getElementById('recibo-evento').value;
    const cliente = document.getElementById('recibo-cliente').value;
    const detalle = document.getElementById('recibo-detalle').value;
    const importe = document.getElementById('recibo-importe').value;
    
    // Actualizar contenido del PDF
    document.getElementById('pdf-recibo-fecha').textContent = formatDate(fecha);
    document.getElementById('pdf-recibo-salon').textContent = salon;
    document.getElementById('pdf-recibo-evento').textContent = evento;
    document.getElementById('pdf-recibo-cliente').textContent = cliente;
    document.getElementById('pdf-recibo-detalle').textContent = detalle;
    document.getElementById('pdf-recibo-importe').textContent = formatCurrency(importe);
    
    // Generar PDF
    generatePDF('pdf-recibo', `Recibo_${cliente}_${formatDateFile(fecha)}`);
}

// Función para generar PDF usando html2canvas y jsPDF
// Función optimizada para generar PDF
// Función optimizada para generar PDF
function generatePDF(elementId, filename) {
    const { jsPDF } = window.jspdf;
    
    // Mostrar temporalmente el elemento para capturarlo
    const element = document.getElementById(elementId);
    element.style.display = 'block';
    
    // Determinar escala óptima basada en el dispositivo
    const scale = isMobile() ? 1.5 : 2;
    
    // Crear PDF
    html2canvas(element, { 
        scale: scale,
        backgroundColor: '#000000',
        useCORS: true,
        allowTaint: true,
        logging: false, // Desactivar logs para mejor rendimiento
        // Solo capturar el elemento exacto
        onclone: function(clonedDoc) {
            const clonedElement = clonedDoc.getElementById(elementId);
            // Asegurarse que el contenedor tiene altura adecuada
            clonedElement.style.height = 'auto';
            clonedElement.style.width = '100%';
            clonedElement.style.maxWidth = '100%';
            // Eliminar cualquier padding excesivo
            clonedElement.style.paddingBottom = '0';
            clonedElement.style.margin = '0';
            
            // Asegurar que todos los elementos internos sean visibles
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach(el => {
                el.style.overflow = 'visible';
            });
        }
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        // Crear PDF con dimensiones apropiadas
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Calcular proporciones para mantener aspecto original
        const pdfWidth = 210; // Ancho de A4
        const pdfHeight = 297; // Alto de A4
        
        // Calcular tamaño de imagen ajustado al PDF con margen
        const margin = 10; // 10mm de margen
        const imgWidth = pdfWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Rellenar la página con negro
        pdf.setFillColor(0, 0, 0);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        
        // Añadir la imagen centrada con margen
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        
        // Manejar contenido que excede la página
        if (imgHeight > (pdfHeight - margin * 2)) {
            console.log("Ajustando contenido a la página...");
            // Reducir imagen para que quepa en una página con márgenes
            const aspectRatio = canvas.width / canvas.height;
            const newHeight = pdfHeight - (margin * 2);
            const newWidth = newHeight * aspectRatio;
            
            // Limpiar la página
            pdf.setFillColor(0, 0, 0);
            pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
            
            // Añadir imagen reescalada
            pdf.addImage(imgData, 'PNG', (pdfWidth - newWidth) / 2, margin, newWidth, newHeight);
        }
        
        pdf.save(`${filename}.pdf`);
        
        // Ocultar el elemento después de la captura
        element.style.display = 'none';
        
        // Si es móvil, intentar compartir el archivo
        if (isMobile()) {
            const blob = pdf.output('blob');
            const file = new File([blob], `${filename}.pdf`, { type: 'application/pdf' });
            
            if (navigator.share) {
                navigator.share({
                    files: [file],
                    title: filename,
                }).catch((error) => {
                    console.error('Error compartiendo archivo:', error);
                });
            }
        }
    }).catch(error => {
        console.error('Error al generar PDF:', error);
        alert('Hubo un problema al generar el PDF. Intente nuevamente.');
        element.style.display = 'none';
    });
}

// Detectar si es dispositivo móvil
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR');
}

// Formatear fecha para nombre de archivo
function formatDateFile(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

// Inicializar al cargar la página
window.onload = function() {
    setFechaActual();
    // Agregar un extra por defecto
    agregarExtra();
};
