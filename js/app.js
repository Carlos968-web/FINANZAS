// CONFIGURACIÓN: La puerta de enlace con tu Google Sheets
const URL_API = "https://script.google.com/macros/s/AKfycbzoKAoGGdg-760pOkh24k7HxoJwKV-75jDz5xyQT8Y28G2fwaE3t4sg8hNhf8717wx86w/exec";

// VARIABLES GLOBALES (Memoria de la app)
let rSesion = []; // Aquí guardaremos todos los movimientos

/**
 * FUNCIÓN: Corregir el desfase de horas de Google
 * Aprenderás: Manipulación de fechas (Date Objects)
 */
function obtenerFechaCorrecta(isoString) {
    if(!isoString) return null;
    let d = new Date(isoString);
    // Si Google envía 22:00, sumamos 3 horas para que sea el día siguiente
    if (d.getHours() >= 22) d.setHours(d.getHours() + 3);
    return d;
}

/**
 * FUNCIÓN: Dibujar los deudores en pantalla
 * Aprenderás: "Bucles" (forEach) y "Codificación de URL" (encodeURIComponent)
 */
function renderizarDeudores() {
    const query = document.getElementById('searchDeuda').value.toLowerCase();
    const cont = document.getElementById('contenedor');
    cont.innerHTML = ""; // Limpiamos la pantalla antes de dibujar
    
    const resumenClientes = {}; // Objeto temporal para sumar deudas por nombre

    rSesion.forEach(fila => {
        const cliente = fila[2];
        const monto = Number(fila[6] || 0);
        
        // Lógica de agrupación: Si el cliente no existe en nuestro objeto, lo creamos
        if(!resumenClientes[cliente]) {
            resumenClientes[cliente] = { saldo: 0, mensaje: "" };
        }

        // Si el banco es CXC, sumamos a su deuda
        if(fila[9] === "CTAS POR COBRAR") {
            resumenClientes[cliente].saldo += monto;
            resumenClientes[cliente].mensaje += `%0A- ${fila[4]}: R$ ${monto}`;
        }
    });

    // Ahora dibujamos cada tarjeta de deuda
    Object.keys(resumenClientes).forEach(cli => {
        const d = resumenClientes[cli];
        if(d.saldo <= 0) return; // Si no debe nada, no lo mostramos

        // CODIFICACIÓN PARA WHATSAPP
        // Usamos encodeURIComponent para que los espacios y saltos de línea no rompan el link
        const linkWA = `https://wa.me/?text=${encodeURIComponent("Olá " + cli + d.mensaje)}`;

        const card = document.createElement('div');
        card.className = "card card-deuda";
        card.innerHTML = `<span>${cli}</span> <b>R$ ${d.saldo}</b> <a href="${linkWA}">Cobrar</a>`;
        cont.appendChild(card);
    });
}

// Iniciar la app al cargar la página
window.onload = cargarTodo;

