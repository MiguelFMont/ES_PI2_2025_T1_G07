// Início do seu primeiro script (userSettings.js)
document.addEventListener("DOMContentLoaded", () => {
    // --- LOGIN ---
    const buttonSettings = document.querySelector("#userSettings");
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));


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
        const nomeInput = document.querySelector("#oldName");
        const nomeLabel = document.querySelector(".name label");
        const telefoneInput = document.querySelector("#telenofe");
        const telefoneLabel = document.querySelector(".tel label");
        const senhaLabel = document.querySelector(".password label");
        const emailEl = document.querySelector(".email p");

        // Preencher e formatar nome
        if (nomeInput && nomeLabel) {
            const partesNome = usuario.nome.trim().split(/\s+/);
            let primeiro = partesNome[0];
            let segundoMenor = "";

            if (partesNome.length > 1) {
                const restantes = partesNome.slice(1);
                const nomesValidos = restantes.filter(n => n.length >= 4);
                if (nomesValidos.length > 0) {
                    segundoMenor = nomesValidos.reduce((menor, atual) =>
                        atual.length < menor.length ? atual : menor
                    );
                } else {
                    segundoMenor = partesNome[partesNome.length - 1];
                }
            }

            const formatarNome = (nome) =>
                nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
            const nomeFormatado = segundoMenor
                ? `${formatarNome(primeiro)} ${formatarNome(segundoMenor)}`
                : formatarNome(primeiro);

            // Preencher o INPUT
            nomeInput.value = nomeFormatado;
            // Definir o texto do LABEL
            nomeLabel.textContent = "Nome";
            nomeLabel.style.whiteSpace = "nowrap";
        }

        // Preencher telefone (se existir)
        if (telefoneInput && telefoneLabel && usuario.telefone) {
            telefoneInput.value = usuario.telefone;
            telefoneLabel.textContent = "Telefone";
        } else if (telefoneLabel) {
            telefoneLabel.textContent = "Telefone";
        }

        // Definir label da senha
        if (senhaLabel) {
            senhaLabel.textContent = "Nova Senha";
        }

        // Preencher email
        if (emailEl) {
            emailEl.textContent = usuario.email;
        }
    }
});
