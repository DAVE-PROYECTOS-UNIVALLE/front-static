// 1. VARIABLES GLOBALES (Accesibles por todas las funciones)
const API_URL = window.env?.API_URL || "ESPERANDO_URL";

let tareasLocales = JSON.parse(localStorage.getItem('tareas_cache')) || [];

// 2. FUNCIÓN PRINCIPAL AL CARGAR LA PÁGINA
async function loadTasks() {
    if (API_URL === "ESPERANDO_URL") {
        console.log("Trabajando en modo local (Sin API Gateway)");
        renderTasks(tareasLocales);
        return;
    }

    // Si ya hay API, intentamos traer los datos reales de AWS
    try {
        const response = await fetch(API_URL);
        const tareas = await response.json();
        renderTasks(tareas);
    } catch (error) {
        console.log("Error conectando a la API, usando respaldo local.");
        renderTasks(tareasLocales);
    }
}

// 3. FUNCIÓN PARA AGREGAR TAREAS
async function addTask() {
    const input = document.getElementById('taskInput');
    const texto = input.value.trim();
    if (!texto) return;

    const nuevaTarea = { id: Date.now().toString(), texto: texto };
    
    // MODO LOCAL: Si no hay backend, guardamos directo en el navegador
    if (API_URL === "ESPERANDO_URL") {
        tareasLocales.push(nuevaTarea);
        localStorage.setItem('tareas_cache', JSON.stringify(tareasLocales));
        input.value = '';
        renderTasks(tareasLocales); // Volver a pintar la lista actualizada
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "texto": texto })
        });

        if (response.ok) {
            input.value = '';
            loadTasks(); // Recargar desde el Backend real
        }
    } catch (error) {
        console.error("Error llamando a la API:", error);
    }
}

// 4. FUNCIÓN AUXILIAR PARA PINTAR LAS TAREAS EN EL HTML
function renderTasks(arregloTareas) {
    const list = document.getElementById('taskList');
    if (!list) return;
    
    list.innerHTML = '';
    arregloTareas.forEach(t => {
        const li = document.createElement('li');
        li.textContent = t.texto;
        list.appendChild(li);
    });
}

// Ejecutar la carga inicial apenas el navegador esté listo
window.onload = loadTasks;