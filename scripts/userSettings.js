// Início do seu primeiro script (userSettings.js)
document.addEventListener("DOMContentLoaded", () => {
    // --- LOGIN ---
    const buttonSettings = document.querySelector("#userSettings");
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    const updateBtn = document.querySelector("#upInformacoes")

    console.log(usuario)

    if (buttonSettings) {
        buttonSettings.addEventListener("click", (e) => {
            if (e) e.preventDefault();
            window.location.href = "/userSettings"
        });
    }
    if (!usuario) { // <<< Adicione esta verificação
        window.location.href = "/"; // Redireciona para a página de login
        return; // Para a execução do script
    } if (usuario) {
        const nomeInput = document.querySelector("#name");
        const nomeLabel = document.querySelector(".name label");
        const telefoneInput = document.querySelector("#telenofe");
        const telefoneLabel = document.querySelector(".tel label");
        const senhaLabel = document.querySelector(".password label");
        const emailEl = document.querySelector(".email p");

        if (telefoneLabel) {
            telefoneLabel.textContent = usuario.telefone;
        }

        if (nomeLabel) {
            nomeLabel.textContent = usuario.nome;
        }

        // Definir label da senha
        if (senhaLabel) {
            senhaLabel.textContent = usuario.senha;
        }

        // Preencher email
        if (emailEl) {
            emailEl.textContent = usuario.email;
        }

        if (telefoneInput) {
            telefoneInput.addEventListener('input', () => formatarTelefone(telefoneInput)); //funções salvas no auth
        }
        if (nomeInput) {
            nomeInput.addEventListener('input', () => formatarNome(nomeInput));//funções salvas no auth
        }
        const campos = [nomeInput, telefoneInput];
        let algumErro = false;

        const nomeDigitado = nomeInput.value.trim();
        const telefoneDigitado = telefoneInput.value.trim();

        campos.forEach(limparErroCampo);

        if (validarCamposVazios(campos)) return;

        // ... (validações individuais) ...
        const nomeValido = nomeDigitado.split(" ").filter(p => p.length > 0).length >= 2;
        if (!nomeValido) { marcarErroCampo(inputNome, "Digite nome e sobrenome"); algumErro = true; }

        const telefoneLimpo = telefoneDigitado.replace(/[^\d]/g, "");
        const telefoneValido = telefoneLimpo.length >= 8;
        if (!telefoneValido) { marcarErroCampo(inputTelefone, "Telefone inválido"); algumErro = true; }

        if (algumErro) {
            errorMessage.style.display = "block";
            erroAtivo = true;
            return;
        }
        mostrarLoader('mostrar');
        }

    });
