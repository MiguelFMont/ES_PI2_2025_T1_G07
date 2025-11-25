// AUTOR: Miguel Fernandes Monteiro - RA: 25014808

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

function mostrarConfirm(mensagem, callback, tipo = 'warning') {
    // Cria o overlay se não existir
    let overlay = document.querySelector('.confirm-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        document.body.appendChild(overlay);
    }

    // Define o ícone baseado no tipo
    let iconeClass = 'ph-warning';
    let tipoClass = 'warning';
    
    switch (tipo.toLowerCase()) {
        case 'success':
        case 'sucesso':
            iconeClass = 'ph-check';
            tipoClass = 'success';
            break;
        case 'danger':
        case 'erro':
        case 'error':
            iconeClass = 'ph-x-circle';
            tipoClass = 'danger';
            break;
        case 'warning':
        case 'aviso':
        default:
            iconeClass = 'ph-warning';
            tipoClass = 'warning';
    }

    // Cria o modal
    const modal = document.createElement('div');
    modal.className = `confirm-modal ${tipoClass}`;
    modal.innerHTML = `
        <div class="confirm-content">
            <div class="confirm-icon">
                <i class="ph ${iconeClass}"></i>
            </div>
            <p class="confirm-message">${mensagem}</p>
        </div>
        <div class="confirm-buttons">
            <button class="confirm-btn confirm-btn-cancel">Cancelar</button>
            <button class="confirm-btn confirm-btn-confirm">Confirmar</button>
        </div>
    `;

    overlay.appendChild(modal);
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Função para fechar o modal
    const fecharModal = (resultado) => {
        modal.classList.add('closing');
        overlay.classList.add('closing');
        
        setTimeout(() => {
            overlay.classList.remove('show', 'closing');
            if (overlay.contains(modal)) {
                overlay.removeChild(modal);
            }
            document.body.style.overflow = '';
            
            // Chama o callback com o resultado
            if (callback && typeof callback === 'function') {
                callback(resultado);
            }
        }, 200);
    };

    // Eventos dos botões
    const btnCancelar = modal.querySelector('.confirm-btn-cancel');
    const btnConfirmar = modal.querySelector('.confirm-btn-confirm');

    btnCancelar.addEventListener('click', () => fecharModal(false));
    btnConfirmar.addEventListener('click', () => fecharModal(true));

    // Fechar ao clicar fora do modal
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            fecharModal(false);
        }
    });

    // Fechar com ESC
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            fecharModal(false);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}