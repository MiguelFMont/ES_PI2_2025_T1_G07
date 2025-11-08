
function mostrarAlerta(mensagem, tipo = 'sucesso') {

    document.body.classList.add('alert-active');

    let customAlert = document.querySelector(".alert");

    if (!customAlert) {
        customAlert = document.createElement('div');
        customAlert.className = 'alert';
        customAlert.innerHTML = `
            <button id="bntAlertClosed">
                <i class="ph ph-x"></i>
            </button>
            <p class="alert-message"></p>
        `;
        document.body.appendChild(customAlert);
    }

    customAlert.className = 'alert';

    const alertMessage = customAlert.querySelector('.alert-message') || customAlert.querySelector('p');
    const alertIcon = customAlert.querySelector('i');
    const iconColor = customAlert.querySelector('#bntAlertClosed i');

    if (alertMessage) alertMessage.textContent = mensagem;

    customAlert.classList.remove('alert-success', 'alert-warning', 'alert-error');

    switch (tipo.toLowerCase()) {
        case 'sucesso':
        case 'success':
            customAlert.classList.add('alert-success');
            customAlert.style.background = 'var(--color7)';
            if (iconColor) iconColor.style.color = 'var(--color7)';
            if (alertIcon) alertIcon.className = 'ph ph-check';
            break;

        case 'aviso':
        case 'warning':
        case 'notificacao':
            customAlert.classList.add('alert-warning');
            customAlert.style.background = 'var(--color5)';
            if (iconColor) iconColor.style.color = 'var(--color5)';
            if (alertIcon) alertIcon.className = 'ph ph-warning';
            break;

        case 'erro':
        case 'error':
            customAlert.classList.add('alert-error');
            customAlert.style.background = 'var(--color4)';
            if (iconColor) iconColor.style.color = 'var(--color4)';
            if (alertIcon) alertIcon.className = 'ph ph-x-circle';
            break;

        default:
            customAlert.style.background = 'var(--color7)';
            if (alertIcon) alertIcon.className = 'ph ph-check';
    }

    customAlert.style.display = 'flex';

    const btnClose = customAlert.querySelector('#bntAlertClosed');
    if (btnClose && !btnClose.hasAttribute('data-listener')) {
        btnClose.setAttribute('data-listener', 'true');
        btnClose.addEventListener('click', () => {
            customAlert.style.display = 'none';
        });
    }

    setTimeout(() => {
        if (customAlert.style.display === 'flex') {
            fecharAlerta(customAlert);
        }
    }, 5000);
}

function fecharAlerta(alertElement) {
    alertElement.className = 'hideAlert';
    
    // Aguarda a animação terminar antes de esconder
    setTimeout(() => {
        alertElement.style.display = 'none';
        document.body.classList.remove('alert-active');
    }, 300); // Tempo da animação
}