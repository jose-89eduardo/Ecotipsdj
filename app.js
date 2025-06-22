let usuario = "";
let tarea = "";
let stream;
let historial = [];

const tareasKey = "ecoTareas";
const historialKey = "ecoHistorial";

window.onload = () => {
  const path = window.location.pathname;

  if (path.endsWith("index.html")) {
    document.addEventListener("click", () => {
      const audio = document.getElementById("audioFondo");
      if (audio && audio.paused) {
        audio.play().catch(e => console.log("No se pudo reproducir el audio:", e));
      }
    }, { once: true });
  }

  if (path.endsWith("menu.html")) cargarMenu();
  if (path.endsWith("camara.html")) iniciarCamara();
  if (path.endsWith("historial.html")) mostrarHistorial();
};

function guardarNombre() {
  const nombre = document.getElementById("inputNombre").value.trim();
  if (nombre !== "") {
    localStorage.setItem("ecoUsuario", nombre);
    window.location.href = "menu.html";
  }
}

function cargarMenu() {
  const usuario = localStorage.getItem("ecoUsuario");
  if (!usuario) {
    alert("No has ingresado tu nombre.");
    window.location.href = "index.html";
    return;
  }
  document.getElementById("nombreUsuario").textContent = `👋 Hola, ${usuario}`;

  const tareas = JSON.parse(localStorage.getItem(tareasKey) || "[]");
  const contenedor = document.getElementById("tareasContainer");
  contenedor.innerHTML = "";

  tareas.forEach((tarea, index) => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ddd";
    div.style.padding = "16px";
    div.style.marginBottom = "16px";
    div.style.borderRadius = "16px";
    div.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    div.style.background = "linear-gradient(to right, #e0ffe0, #ffffff)";
    div.style.fontFamily = "'Poppins', sans-serif";
    div.style.transition = "transform 0.2s ease";
    div.onmouseover = () => div.style.transform = "scale(1.02)";
    div.onmouseout = () => div.style.transform = "scale(1)";

    const nombre = document.createElement("p");
    nombre.textContent = tarea.nombre;
    nombre.style.display = tarea.visible ? "block" : "none";
    nombre.style.fontSize = "20px";
    nombre.style.fontWeight = "bold";
    nombre.style.marginBottom = "12px";
    nombre.style.color = "#2c3e50";
    nombre.id = `nombre-${index}`;

    const botones = document.createElement("div");
    botones.style.display = "flex";
    botones.style.flexWrap = "wrap";
    botones.style.gap = "10px";

    const guardarBtn = document.createElement("button");
    guardarBtn.className = "boton";
    guardarBtn.textContent = "📸 Guardar";
    guardarBtn.onclick = () => {
      localStorage.setItem("ecoTarea", tarea.nombre);
      window.location.href = "camara.html";
    };

    const verOcultarBtn = document.createElement("button");
    verOcultarBtn.className = "boton";
    verOcultarBtn.textContent = tarea.visible ? "🙈 Ocultar" : "👁️ Ver";
    verOcultarBtn.onclick = () => {
      tarea.visible = !tarea.visible;
      localStorage.setItem(tareasKey, JSON.stringify(tareas));
      cargarMenu();
    };

    const borrarBtn = document.createElement("button");
    borrarBtn.className = "boton";
    borrarBtn.style.backgroundColor = "#ff4d4d";
    borrarBtn.style.color = "white";
    borrarBtn.textContent = "🗑️ Borrar";
    borrarBtn.onclick = () => {
      tareas.splice(index, 1);
      localStorage.setItem(tareasKey, JSON.stringify(tareas));
      cargarMenu();
    };

    botones.appendChild(guardarBtn);
    botones.appendChild(verOcultarBtn);
    botones.appendChild(borrarBtn);

    div.appendChild(nombre);
    div.appendChild(botones);

    contenedor.appendChild(div);
  });
}

function agregarActividad() {
  const nueva = document.getElementById("nuevaActividad").value.trim();
  if (nueva === "") return alert("Escribe una actividad");
  const tareas = JSON.parse(localStorage.getItem(tareasKey) || "[]");
  tareas.push({ nombre: nueva, visible: true });
  localStorage.setItem(tareasKey, JSON.stringify(tareas));
  document.getElementById("nuevaActividad").value = "";
  cargarMenu();
}

function irAHistorial() {
  window.location.href = "historial.html";
}

function iniciarCamara() {
  tarea = localStorage.getItem("ecoTarea") || "";
  usuario = localStorage.getItem("ecoUsuario") || "";

  const titulo = document.getElementById("tituloTarea");
  titulo.textContent = `Tarea: ${tarea}`;

  const video = document.getElementById("video");
  navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } })
    .then(s => {
      stream = s;
      video.srcObject = stream;
    })
    .catch(() => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          video.srcObject = stream;
        })
        .catch(() => alert("No se pudo acceder a ninguna cámara."));
    });
}

function capturar() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  if (!video.videoWidth || !video.videoHeight) {
    alert("La cámara aún no está lista. Espera un momento.");
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataURL = canvas.toDataURL("image/png");
  const usuario = localStorage.getItem("ecoUsuario") || "Usuario";
  const tarea = localStorage.getItem("ecoTarea") || "Tarea";

  const historial = JSON.parse(localStorage.getItem(historialKey) || "[]");
  historial.push({ tarea, imagen: dataURL });
  localStorage.setItem(historialKey, JSON.stringify(historial));

  localStorage.setItem("ecoUltimaImagen", dataURL);
  localStorage.setItem("ecoUltimaDescripcion", `${usuario} realizó la tarea: ${tarea}`);

  detenerCamara();
}

function detenerCamara() {
  const video = document.getElementById("video");
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  if (video) video.srcObject = null;
}

function mostrarHistorial() {
  historial = JSON.parse(localStorage.getItem(historialKey) || "[]");
  const contenedor = document.getElementById("historialFotos");
  contenedor.innerHTML = "";

  if (historial.length === 0) {
    contenedor.innerHTML = '<p>No hay tareas guardadas aún.</p>';
  } else {
    historial.forEach((item, index) => {
      const div = document.createElement("div");
      div.style.marginBottom = "20px";
      div.style.border = "1px solid #ccc";
      div.style.padding = "10px";
      div.style.borderRadius = "8px";
      div.innerHTML = `
        <p><strong>${item.tarea}</strong></p>
        <img src="${item.imagen}" class="imagenGuardada" style="max-width:100%; height:auto;">
        <br>
        <button onclick="borrarTarea(${index})" class="boton" style="background-color:#e74c3c; margin-top:8px;">Borrar</button>
      `;
      contenedor.appendChild(div);
    });
  }
}

function borrarTarea(indice) {
  historial.splice(indice, 1);
  localStorage.setItem(historialKey, JSON.stringify(historial));
  mostrarHistorial();
}

function irAlMenu() {
  window.location.href = "menu.html";
}
