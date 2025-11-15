// userSettings.js - COMPLETO E CORRIGIDO
document.addEventListener("DOMContentLoaded", () => {
    // --- VERIFICAÇÃO DE LOGIN ---
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuario) {
        window.location.href = "/";
        return;
    }

    // --- ELEMENTOS DO DOM ---
    const nomeInput = document.querySelector("#name");
    const telefoneInput = document.querySelector("#telenofe");
    const emailEl = document.querySelector(".email p");
    const senhaLabel = document.querySelector(".password");
    const updateBtn = document.querySelector("#upInformacoes");
    const solicitarLinkBtn = document.querySelector(".solicitar-btn-interno");
    const botaoModificar = document.querySelector(".modify-btn-user");
    const botaoVoltar = document.querySelector(".voltar");

    const nomeContainer = document.querySelector(".name");
    const telefoneContainer = document.querySelector(".tel");
    const nomeLabel = nomeContainer ? nomeContainer.querySelector("label") : null;
    const telefoneLabel = telefoneContainer ? telefoneContainer.querySelector("label") : null;

    console.log("👤 Usuário logado:", usuario);

    // --- FUNÇÕES DE FORMATAÇÃO ---
    function formatarTelefone(input) {
        let valor = input.value.replace(/\D/g, '');
        let cursorPos = input.selectionStart;
        let valorAnterior = input.value.replace(/\D/g, '').length;

        if (valor.length === 0) {
            input.value = '';
            return;
        }

        valor = valor.substring(0, 11);

        if (valor.length <= 2) {
            valor = valor.replace(/(\d{1,2})/, '($1');
        } else if (valor.length <= 6) {
            valor = valor.replace(/(\d{2})(\d{1,4})/, '($1) $2');
        } else if (valor.length <= 10) {
            valor = valor.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
        } else {
            valor = valor.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
        }

        input.value = valor;

        let valorNovo = valor.replace(/\D/g, '').length;
        if (valorNovo > valorAnterior) {
            input.setSelectionRange(cursorPos + 1, cursorPos + 1);
        }
    }

    function formatarNome(input) {
        let valor = input.value;
        let cursorPos = input.selectionStart;
        valor = valor.toLowerCase().replace(/(?:^|\s)\S/g, letra => letra.toUpperCase());
        input.value = valor;
        input.setSelectionRange(cursorPos, cursorPos);
    }

    // --- PREENCHER CAMPOS COM DADOS DO USUÁRIO ---
    if (nomeInput && nomeLabel) {
        nomeLabel.textContent = usuario.nome;
    }

    if (telefoneInput && telefoneLabel) {
        // Formata o telefone ao exibir
        const telefoneFormatado = usuario.telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3') ||
            usuario.telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3') ||
            usuario.telefone;
        telefoneLabel.textContent = telefoneFormatado;
    }

    if (emailEl) {
        emailEl.textContent = usuario.email;
    }

    if (senhaLabel && usuario.senha) {
        senhaLabel.textContent = usuario.senha + '****';
    }

    // --- FORMATAÇÃO EM TEMPO REAL ---
    if (telefoneInput) {
        telefoneInput.addEventListener('input', () => {
            formatarTelefone(telefoneInput);
        });

        // Aplica formatação inicial se houver valor
        if (telefoneInput.value) {
            formatarTelefone(telefoneInput);
        }
    }

    if (nomeInput) {
        nomeInput.addEventListener('input', () => {
            formatarNome(nomeInput);
        });

        // Aplica formatação inicial se houver valor
        if (nomeInput.value) {
            formatarNome(nomeInput);
        }
    }

    // --- FUNÇÃO PARA MARCAR ERRO ---
    function marcarErroCampo(container, mensagem) {
        if (!container) return;
        container.classList.add('error');
        console.error(mensagem);

        // Remove erro após 3 segundos
        setTimeout(() => {
            container.classList.remove('error');
        }, 3000);
    }

    // --- FUNÇÃO PARA REMOVER ERROS ---
    function limparErros() {
        if (nomeContainer) nomeContainer.classList.remove('error');
        if (telefoneContainer) telefoneContainer.classList.remove('error');
    }

    // --- EVENTO DO BOTÃO ATUALIZAR ---
    if (updateBtn) {
        updateBtn.addEventListener("click", (e) => {
            e.preventDefault();
            limparErros();

            const nomeDigitado = nomeInput ? nomeInput.value.trim() : "";
            const telefoneDigitado = telefoneInput ? telefoneInput.value.trim() : "";

            let algumErro = false;

            // Verifica se pelo menos um campo foi preenchido
            if (!nomeDigitado && !telefoneDigitado) {
                if (typeof mostrarAlerta === 'function') {
                    mostrarAlerta("Preencha pelo menos um campo para atualizar.", "aviso");
                }
                return;
            }

            // Validar nome completo (SOMENTE SE FOI PREENCHIDO)
            if (nomeDigitado) {
                const nomeValido = nomeDigitado.split(" ").filter(p => p.length > 0).length >= 2;
                if (!nomeValido) {
                    marcarErroCampo(nomeContainer, "Digite nome e sobrenome");
                    algumErro = true;
                }
            }

            // Validar telefone (SOMENTE SE FOI PREENCHIDO)
            let telefoneLimpo = "";
            if (telefoneDigitado) {
                telefoneLimpo = telefoneDigitado.replace(/[^\d]/g, "");
                const telefoneValido = telefoneLimpo.length >= 10;
                if (!telefoneValido) {
                    marcarErroCampo(telefoneContainer, "Telefone inválido (mínimo 10 dígitos)");
                    algumErro = true;
                }
            }

            if (algumErro) {
                return;
            }

            if (typeof mostrarLoader === 'function') {
                mostrarLoader('mostrar');
            }

            // Prepara os dados para enviar (apenas os campos preenchidos)
            const dadosParaAtualizar = { id: usuario.id };
            if (nomeDigitado) dadosParaAtualizar.nome = nomeDigitado;
            if (telefoneDigitado) dadosParaAtualizar.telefone = telefoneLimpo;

            console.log("📤 Enviando dados para atualizar:", dadosParaAtualizar);

            // Chamada para o backend
            fetch("/atualizar/docente", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosParaAtualizar)
            })
                .then(res => res.json())
                .then(dados => {
                    if (typeof mostrarLoader === 'function') {
                        mostrarLoader('esconder');
                    }

                    if (dados.sucesso) {
                        // Atualiza localStorage SOMENTE com os campos que foram alterados
                        if (nomeDigitado) usuario.nome = nomeDigitado;
                        if (telefoneDigitado) usuario.telefone = telefoneLimpo;
                        localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

                        console.log("✅ Dados atualizados:", usuario);

                        if (typeof mostrarAlerta === 'function') {
                            mostrarAlerta("Informações atualizadas com sucesso!", "sucesso");
                        }

                        // Atualiza os labels SOMENTE dos campos que foram alterados
                        if (nomeDigitado && nomeLabel) {
                            nomeLabel.textContent = nomeDigitado;
                        }
                        if (telefoneDigitado && telefoneLabel) {
                            const telefoneFormatado = telefoneLimpo.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3') ||
                                telefoneLimpo.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
                            telefoneLabel.textContent = telefoneFormatado;
                        }

                        // Limpa os inputs após atualização bem-sucedida
                        if (nomeInput) nomeInput.value = "";
                        if (telefoneInput) telefoneInput.value = "";
                    } else {
                        if (typeof mostrarAlerta === 'function') {
                            mostrarAlerta("Erro ao atualizar informações.", "erro");
                        }
                    }
                })
                .catch(err => {
                    console.error("❌ Erro ao atualizar:", err);
                    if (typeof mostrarLoader === 'function') {
                        mostrarLoader('esconder');
                    }
                    if (typeof mostrarAlerta === 'function') {
                        mostrarAlerta("Erro ao atualizar informações.", "erro");
                    }
                });
        });
    }

    // --- EVENTO DO BOTÃO SOLICITAR LINK ---
    if (solicitarLinkBtn) {
        solicitarLinkBtn.addEventListener("click", (e) => {
            e.preventDefault();

            sessionStorage.setItem("recoveryFlow", "user");//adicionado para verificar se a solicitação foi feita pelo User ou Login

            localStorage.setItem("emailParaRecuperacao", usuario.email);

            localStorage.setItem("solicitacao", JSON.stringify({
                byUserSettings: true
            }));


            if (typeof mostrarLoader === 'function') {
                mostrarLoader('mostrar');
            }

            // Chama a função para enviar o link de alteração de senha
            fetch("/link-alterar-senha", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: usuario.email })
            })
                .then(res => res.json())
                .then(dados => {
                    if (typeof mostrarLoader === 'function') {
                        mostrarLoader('esconder');
                    }

                    if (dados.sucesso) {
                        if (typeof mostrarAlerta === 'function') {
                            mostrarAlerta("Link enviado para o seu e-mail!", "sucesso");
                        }

                    } else {
                        if (typeof mostrarAlerta === 'function') {
                            mostrarAlerta("Erro ao enviar link. Tente novamente.", "erro");
                        }
                    }
                })
                .catch(err => {
                    console.error("❌ Erro:", err);
                    if (typeof mostrarLoader === 'function') {
                        mostrarLoader('esconder');
                    }
                    if (typeof mostrarAlerta === 'function') {
                        mostrarAlerta("Erro ao enviar link.", "erro");
                    }
                });
        });
    }

    if (botaoModificar) {
        botaoModificar.addEventListener("click", (e) => {
            if (e) e.preventDefault();

            console.log("🔍 Botão modificar senha clicado");

            const inputNewPassword = document.getElementById("newPassword");
            const inputConfirmPassword = document.getElementById("confirmPassword");

            if (!inputNewPassword || !inputConfirmPassword) {
                console.error("❌ Inputs de senha não encontrados");
                return;
            }

            let algumErro = false;

            // Limpa erros anteriores
            const limparErroCampo = (input) => {
                if (!input || !input.parentElement) return;
                const parent = input.parentElement;
                parent.classList.remove("error");
                const label = parent.querySelector("label");
                if (label) {
                    label.style.color = "";
                }
            };

            const marcarErroCampo = (input, msg) => {
                if (!input || !input.parentElement) return;
                const parent = input.parentElement;
                const label = parent.querySelector("label");
                parent.classList.add("error");
                if (label) {
                    label.textContent = msg;
                    label.style.color = "var(--color4)";
                }
            };

            [inputNewPassword, inputConfirmPassword].forEach(limparErroCampo);

            if (!inputNewPassword.value.trim() || !inputConfirmPassword.value.trim()) {
                if (!inputNewPassword.value.trim()) marcarErroCampo(inputNewPassword, "Campo obrigatório");
                if (!inputConfirmPassword.value.trim()) marcarErroCampo(inputConfirmPassword, "Campo obrigatório");
                return;
            }

            const novaSenha = inputNewPassword.value.trim();
            const confirmarSenha = inputConfirmPassword.value.trim();
            const emailRecuperacao = localStorage.getItem("emailParaRecuperacao");

            console.log("📧 Email de recuperação:", emailRecuperacao);

            if (!emailRecuperacao) {
                if (typeof mostrarAlerta === 'function') {
                    mostrarAlerta("Email de recuperação não encontrado.", "aviso");
                }
                console.error("❌ emailParaRecuperacao não existe no localStorage");
                return;
            }

            // Validações
            if (novaSenha.length < 8) {
                marcarErroCampo(inputNewPassword, "Senha deve ter 8+ caracteres");
                algumErro = true;
            }

            if (novaSenha !== confirmarSenha) {
                marcarErroCampo(inputConfirmPassword, "Senhas não coincidem");
                algumErro = true;
            }

            if (algumErro) return;

            if (typeof mostrarLoader === 'function') {
                mostrarLoader('mostrar');
            }

            console.log("📤 Enviando nova senha para o servidor");

        });
    }

    if (botaoVoltar) {
        botaoVoltar.addEventListener("click", () => {
            window.location.href = "/pages/mainPage.html"
        });
    }

    // --- LISTENER PARA ATUALIZAÇÃO DE SENHA (quando volta da outra aba) ---
    window.addEventListener('focus', () => {
        // Verifica se há uma flag indicando que a senha foi alterada
        const senhaAlterada = localStorage.getItem('senhaAlteradaSucesso');

        if (senhaAlterada === 'true') {
            console.log("🔄 Detectada alteração de senha, atualizando página...");

            // Remove a flag
            localStorage.removeItem('senhaAlteradaSucesso');

            // Mostra mensagem de sucesso
            if (typeof mostrarAlerta === 'function') {
                mostrarAlerta("Senha atualizada com sucesso!", "sucesso");
            }

            // Atualiza os dados do usuário (senha mascarada)
            const usuarioAtualizado = JSON.parse(localStorage.getItem("usuarioLogado"));
            if (usuarioAtualizado && senhaLabel) {
                senhaLabel.textContent = usuarioAtualizado.senha ? usuarioAtualizado.senha + '****' : '****';
            }

            console.log("✅ Dados de senha atualizados na interface");
        }
    });
});

console.log("✅ userSettings.js carregado!");