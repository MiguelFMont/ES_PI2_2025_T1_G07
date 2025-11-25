// AUTOR: Miguel Fernandes Monteiro - RA: 25014808
function mostrarLoader(tipo = 'mostrar') {
    let loader = document.querySelector(".load");
    if (!loader) {
        loader = document.createElement('div');
        loader.className = 'load';
        loader.innerHTML = `
        <div class="load" style="display: none;">
            <div class="loadCircle"></div>
        </div>`;
        document.body.appendChild(loader);
    }
    if (tipo === 'mostrar') {
        loader.style.display = 'flex';
    } else if (tipo === 'esconder') {
        loader.style.display = 'none';
    }
}
