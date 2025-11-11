// auth.js — Login e Cadastro unificados com localStorage
// --- Chave localStorage --
// -

const STORAGE_KEY = "usuariosNotaDez";

// --- Carrega usuários do localStorage ou inicializa com padrão ---
let usuarios = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    { email: "teste123@gmail.com", senha: "12345", nome: "João Teste", telefone: "(11)12345-6789" }
];

// --- Seleção de inputs ---
const inputEmail = document.querySelector("#email");
const inputSenha = document.querySelector("#password");
const inputNome = document.querySelector("#name");
const inputTelefone = document.querySelector("#telefone");

// --- Botões ---
const botaoLogin = document.querySelector(".buttonLogin"); // index.html
const botaoCadastro = document.querySelector(".buttonSignUp"); // pageCadastro.html
const botaoVerify = document.querySelector(".verify-btn"); // pageVerification.html
const botaoModificar = document.querySelector(".modify-btn"); // pageRecoveryPassword.html
const botaoSolicitarLink = document.querySelector(".solicitar-btn"); // pageEmailToModifyPassword.html
const resendCodeBtn = document.querySelector(".resend-code-btn"); // pageVerification.html
// const loader = document.querySelector(".load"); // ⬅️ SELETOR DO LOADER

// --- Labels originais ---
const originalLabels = {
    email: "Endereço de e-mail",
    password: "Senha",
    name: "Nome",
    telefone: "Telefone"
};

// --- Mensagem de erro centralizada ---
let errorMessage = document.querySelector(".auth-error-message");
if (!errorMessage) {
    errorMessage = document.createElement("p");
    errorMessage.className = "auth-error-message";
    errorMessage.textContent = "Dados incorretos ou incompletos.";
    errorMessage.style.color = "var(--color4)";
    errorMessage.style.textAlign = "center";
    errorMessage.style.display = "none";
    errorMessage.style.marginTop = "10px";
    const buttonsCheck = document.querySelector(".buttonsCheck");
    if (buttonsCheck) buttonsCheck.after(errorMessage);
}

// estado de erro
let erroAtivo = false;

// --- Foco e digitação ---

[inputEmail, inputSenha, inputNome, inputTelefone].forEach((input) => {
    if (!input) return;

    input.addEventListener("focus", () => {
        const label = input.parentElement ? input.parentElement.querySelector("label") : null;
        if (label && label.textContent.includes("Campo não preenchido")) {
            label.textContent = originalLabels[input.id] || originalLabels[input.name] || label.textContent;
            label.style.color = "";
        }

        if (erroAtivo || input.parentElement.classList.contains("error")) {
            if (input.parentElement) input.parentElement.classList.remove("error");
            if (label) label.style.color = "";
        }
    });

    input.addEventListener("input", () => {
        if (input.value.trim() !== "" && input.parentElement) {
            input.parentElement.classList.remove("error");
            const label = input.parentElement.querySelector("label");
            if (label) {
                label.textContent = originalLabels[input.id] || originalLabels[input.name] || label.textContent;
                label.style.color = "";
            }
        }
    });
});

function marcarErroCampo(input, msg) {
    if (!input || !input.parentElement) return;
    const parent = input.parentElement; // A div (.mail, .password, etc)
    const label = parent.querySelector("label");

    // ✅ Adiciona classe de erro na DIV (parent)
    parent.classList.add("error");

    if (label) {
        label.textContent = msg;
        label.style.color = "var(--color4)";
    }
}

function limparErroCampo(input) {
    if (!input || !input.parentElement) return;
    const parent = input.parentElement;
    const label = parent.querySelector("label");

    // ✅ Remove classe de erro da DIV (parent)
    parent.classList.remove("error");

    if (label) {
        label.textContent = originalLabels[input.id] || originalLabels[input.name] || label.textContent;
        label.style.color = "";
    }
}
function validarCamposVazios(campos) {
    let erro = false;
    campos.forEach((input) => {
        if (!input) return;
        if (input.value.trim() === "") {
            marcarErroCampo(input, "Campo não preenchido");
            erro = true;
        }
    });
    return erro;
}

function salvarUsuarios() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}


// Olhos de mostrar/ocultar senha do pageRecovery.html
function eyePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('ph-eye-slash', 'ph-eye');
    } else if (input.type === 'text') {
        input.type = 'password';
        icon.classList.replace('ph-eye', 'ph-eye-slash');
    }
}

// ========================================
// VALIDAÇÃO DE CAMPOS
// ========================================

function validarSenha(senha) {
    if (senha.length < 8) {
        return { valida: false, mensagem: "deve ter no mínimo 8 caracteres" };
    }
    if (!/[A-Z]/.test(senha)) {
        return { valida: false, mensagem: "deve conter pelo menos uma letra maiúscula" };
    }
    if (!/[a-z]/.test(senha)) {
        return { valida: false, mensagem: "deve conter pelo menos uma letra minúscula" };
    }
    if (!/[0-9]/.test(senha)) {
        return { valida: false, mensagem: "deve conter pelo menos um número" };
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/.test(senha)) {
        return { valida: false, mensagem: "deve conter pelo menos um símbolo (!@#$%^&*)" };
    }
    return { valida: true, mensagem: "Senha válida!" };
}

// ========================================
// FORMATAÇÃO
// ========================================
function formatarNome(input) {
    let valor = input.value;
    let cursorPos = input.selectionStart;
    valor = valor.toLowerCase().replace(/(?:^|\s)\S/g, letra => letra.toUpperCase());
    input.value = valor;
    input.setSelectionRange(cursorPos, cursorPos);
}

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
if (inputTelefone) {
    inputTelefone.addEventListener('input', () => formatarTelefone(inputTelefone));
}
if (inputNome) {
    inputNome.addEventListener('input', () => formatarNome(inputNome));
}

// ========================================
// MOSTRAR/OCULTAR SENHA
// ========================================
function eyePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('ph-eye-slash', 'ph-eye');
    } else if (input.type === 'text') {
        input.type = 'password';
        icon.classList.replace('ph-eye', 'ph-eye-slash');
    }
}

//--LOGIN--//
if (botaoLogin) {
    botaoLogin.addEventListener("click", (e) => {
        if (e) e.preventDefault();
        [inputEmail, inputSenha].forEach(limparErroCampo);
        if (validarCamposVazios([inputEmail, inputSenha])) return;

        const emailDigitado = inputEmail.value.trim();
        const senhaDigitada = inputSenha.value.trim();

        mostrarLoader('mostrar');
        console.log("📤 Verificando email:", emailDigitado);

        fetch("/verificar-docente", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailDigitado, senha: senhaDigitada })
        })
            .then(res => {
                console.log("📥 Status da resposta:", res.status, res.ok);
                return res.json();
            })
            .then(data => {
                console.log("📥 Dados recebidos:", data);

                if (data.sucesso && data.nome && data.email) {
                    mostrarLoader('esconder');
                    mostrarAlerta("Login bem-sucedido! Redirecionando...", "sucesso");
                    console.log("✅ Login bem-sucedido! Nome:", data.nome, "Email:", data.email);

                    errorMessage.style.display = "none";
                    erroAtivo = false;

                    // ✅ LIMPAR O CACHE DO USUÁRIO ANTERIOR ANTES DE SALVAR O NOVO
                    localStorage.removeItem("instituicoesBody");
                    localStorage.removeItem("cursosBody");
                    localStorage.removeItem("diciplinasBody");
                    localStorage.removeItem("turmasBody");
                    console.log("🗑️ Cache do usuário anterior limpo");

                    // Agora salva o novo usuário
                    localStorage.setItem("usuarioLogado", JSON.stringify({
                        id: data.id,
                        nome: data.nome,
                        email: data.email,
                        telefone: data.telefone
                    }));

                    const salvou = localStorage.getItem("usuarioLogado");
                    console.log("💾 Novo usuário salvo no localStorage:", salvou);
                    setTimeout(() => {
                        window.location.href = "../pages/mainPage.html";
                    }, 6000);

                } else {
                    mostrarLoader('esconder');
                    mostrarAlerta("Login falhou. Verifique suas credenciais.", "erro");
                    console.log("❌ Login falhou - dados incompletos");
                    throw new Error("Dados de resposta inválidos");
                }
            })
            .catch(err => {
                console.error("❌ Erro no login:", err);
                marcarErroCampo(inputEmail, originalLabels.email);
                marcarErroCampo(inputSenha, originalLabels.password);
                errorMessage.style.display = "block";
                erroAtivo = true;
            });
    });
}

// --- CADASTRO ---
if (botaoCadastro) {
    botaoCadastro.addEventListener("click", (e) => {
        if (e) e.preventDefault();

        const campos = [inputNome, inputEmail, inputTelefone, inputSenha];
        let algumErro = false;

        const nomeDigitado = inputNome.value.trim();
        const emailDigitado = inputEmail.value.trim();
        const telefoneDigitado = inputTelefone.value.trim();
        const senhaDigitada = inputSenha.value.trim();

        campos.forEach(limparErroCampo);

        if (validarCamposVazios(campos)) return;

        // ... (validações individuais) ...
        const nomeValido = nomeDigitado.split(" ").filter(p => p.length > 0).length >= 2;
        if (!nomeValido) { marcarErroCampo(inputNome, "Digite nome e sobrenome"); algumErro = true; }

        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDigitado);
        if (!emailValido) { marcarErroCampo(inputEmail, "Email inválido"); algumErro = true; }

        const telefoneLimpo = telefoneDigitado.replace(/[^\d]/g, "");
        const telefoneValido = telefoneLimpo.length >= 8;
        if (!telefoneValido) { marcarErroCampo(inputTelefone, "Telefone inválido"); algumErro = true; }

        const senhaCheck = validarSenha(senhaDigitada);
        if (!senhaCheck.valida) {
            marcarErroCampo(inputSenha, senhaCheck.mensagem);
            algumErro = true;
        }

        if (algumErro) {
            errorMessage.style.display = "block";
            erroAtivo = true;
            return;
        }
        mostrarLoader('mostrar');
        // Salva os dados temporários
        localStorage.setItem("cadastroTemp", JSON.stringify({
            nome: nomeDigitado,
            email: emailDigitado,
            telefone: telefoneDigitado,
            senha: senhaDigitada
        }));
        fetch("/verificar-docente/cadastro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailDigitado })
        })
            .then(res => {
                console.log("📥 Status da verificação de cadastro:", res.status);
                return res.json();
            })
            .then(data => {
                console.log("📥 Dados da verificação de cadastro:", data)
                if (!data.sucesso) {
                    mostrarLoader('esconder');
                    // Se falhar (ex: email duplicado), joga um erro para o .catch
                    console.log("❌ Email já cadastrado:", emailDigitado);
                    mostrarAlerta("Email já cadastrado. Tente fazer login.", "aviso");
                    throw new Error("Email já cadastrado");
                } else {
                    // Se tiver sucesso, faz o segundo fetch
                    console.log("✅ Email disponível para cadastro:", emailDigitado);
                    return fetch("/enviar-codigo", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            nome: nomeDigitado,
                            email: emailDigitado
                        })
                    });
                }
            })
            .then(res => res.json())
            .then(data => {
                console.log("📥 Dados do envio de código:", data)
                if (!data.sucesso) {
                    mostrarLoader('esconder');
                    mostrarAlerta("Falha ao enviar o código", "erro");
                    // Se falhar, joga um erro para o .catch
                    throw new Error("Falha ao enviar o código");
                } else {
                    mostrarLoader('esconder');
                    mostrarAlerta("Código enviado! Verifique seu e-mail. Você será redirecionado para a página de verificação.", "sucesso");
                    console.log("✅ Código enviado para:", emailDigitado);

                    // Redireciona após 5 segundos
                    setTimeout(() => {
                        window.location.href = "/verificacao";
                    }, 6000);
                }
            })
            .catch(err => {
                // ❌ TRATAMENTO DE ERRO CENTRALIZADO ❌
                mostrarLoader('esconder');
                console.error("❌ Erro no cadastro:", err);
            });
    });
}


// pageVerification.html - Manter o email preenchido

const inputsCodigo = [
    document.getElementById("num1"),
    document.getElementById("num2"),
    document.getElementById("num3"),
    document.getElementById("num4"),
    document.getElementById("num5"),
    document.getElementById("num6")
];

inputsCodigo.forEach((input, index) => {
    if (!input) return;

    // Navegação ao digitar
    input.addEventListener("input", () => {

        if (input.value.length > 0 && index < inputsCodigo.length - 1) {
            inputsCodigo[index + 1].focus();
        }
    });

    // Navegação com Backspace
    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value.length === 0 && index > 0) {
            inputsCodigo[index - 1].focus();
        }
    });

    // ✅ EVENTO DE COLAR
    input.addEventListener("paste", (e) => {
        e.preventDefault(); // Previne o comportamento padrão

        const pastedData = e.clipboardData.getData("text").trim();
        const digitos = pastedData.replace(/\D/g, ""); // Remove tudo que não é número

        // Distribui os dígitos nos inputs
        for (let i = 0; i < inputsCodigo.length; i++) {
            if (digitos[i]) {
                inputsCodigo[i].value = digitos[i];
            }
        }

        // Foca no último input preenchido ou no último disponível
        const ultimoIndex = Math.min(digitos.length, inputsCodigo.length) - 1;
        if (inputsCodigo[ultimoIndex]) {
            inputsCodigo[ultimoIndex].focus();
        }
    });
});

// ✅ COLAR DE FORA (clicando externamente)
document.addEventListener("paste", (e) => {
    // Verifica se o foco está fora dos inputs
    const focoNosInputs = inputsCodigo.some(input => input === document.activeElement);

    if (!focoNosInputs) {
        e.preventDefault();

        const pastedData = e.clipboardData.getData("text").trim();
        const digitos = pastedData.replace(/\D/g, "");

        // Preenche os inputs
        for (let i = 0; i < inputsCodigo.length; i++) {
            if (digitos[i]) {
                inputsCodigo[i].value = digitos[i];
            }
        }

        // Foca no primeiro input
        if (inputsCodigo[0]) {
            inputsCodigo[0].focus();
        }
    }
});

// --- VERIFICAÇÃO DE CÓDIGO ---
if (botaoVerify) {
    botaoVerify.addEventListener("click", (e) => {
        if (e) e.preventDefault();

        const cadastroTemp = JSON.parse(localStorage.getItem("cadastroTemp"));

        if (!cadastroTemp) {
            mostrarAlerta("Dados de cadastro não encontrados. Por favor, refaça o cadastro.", "erro")
            window.location.href = "/cadastro";
            return;
        }
        mostrarLoader('mostrar');

        const { nome, email, telefone, senha } = cadastroTemp;

        console.log("Dados recuperados:", { nome, email, telefone });

        let codigoCompleto = '';

        for (let i = 0; i < inputsCodigo.length; i++) {
            codigoCompleto += inputsCodigo[i] ? inputsCodigo[i].value.trim() : '';
        }

        if (inputsCodigo.some(input => !input || input.value.trim() === '')) {
            mostrarLoader('esconder');
            mostrarAlerta("Por favor, preencha todos os campos do código.", "erro");
            console.warn("⚠️ Código incompleto fornecido");
            return;
        }

        console.log("1. Verificando código:", codigoCompleto);

        fetch("/verificar-codigo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codigo: codigoCompleto })
        })
            .then(res => {
                console.log("2. Resposta da verificação:", res.status, res.ok);
                return res.json();
            })
            .then(data => {
                console.log("3. Dados da verificação:", data);
                if (data.sucesso) {
                    mostrarLoader('esconder');
                    mostrarAlerta("Código válido! Cadastrando docente...", "sucesso");
                    console.log("4. Código válido! Cadastrando docente...");
                    return fetch("/docente", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            nome: nome,
                            email: email,
                            telefone: telefone,
                            senha: senha
                        })
                    });
                } else {
                    mostrarLoader('esconder');
                    mostrarAlerta("Código inválido. Tente novamente.", "erro");
                }
            })
            .then(res => {
                if (!res) return;
                console.log("5. Resposta do cadastro:", res.status, res.ok);
                return res.json();
            })
            .then(data => {
                if (!data) return;
                console.log("6. Dados do cadastro:", data);
                if (data.sucesso) {
                    // ✅ LIMPAR O CACHE ANTES DE SALVAR O NOVO USUÁRIO
                    localStorage.removeItem("instituicoesBody");
                    localStorage.removeItem("cursosBody");
                    localStorage.removeItem("diciplinasBody");
                    localStorage.removeItem("turmasBody");
                    console.log("🗑️ Cache limpo para novo usuário");
                    
                    localStorage.setItem("usuarioLogado", JSON.stringify({
                        id: data.id,
                        nome: cadastroTemp.nome,
                        email: cadastroTemp.email,
                        telefone: cadastroTemp.telefone
                    }));
                    console.log("✅ Docente cadastrado e logado:", cadastroTemp.email);
                    localStorage.removeItem("cadastroTemp");
                    mostrarLoader('esconder');
                    mostrarAlerta("Docente cadastrado com sucesso! Você será redirecionado para a página inicial.", "sucesso");
                    setTimeout(() => {
                        window.location.href = "../pages/mainPage.html";
                    }, 6000);
                } else {
                    console.log("❌ Erro ao cadastrar docente:", data.message);
                    mostrarLoader('esconder');
                    mostrarAlerta("Erro ao cadastrar docente. Tente novamente.", "erro");
                }
            })
            .catch(err => {
                console.error("❌ ERRO CAPTURADO:", err);
                console.error("❌ Detalhes do erro:", err.message, err.stack);
                mostrarLoader('esconder');
                mostrarAlerta("Ocorreu um erro. Verifique o console para mais detalhes.", "erro");
            });
    });
}

// --- Mostrar o e-mail do cadastro na verificação ---
document.addEventListener("DOMContentLoaded", () => {
    const emailView = document.getElementById("mailView");
    if (!emailView) return;

    const cadastroTemp = JSON.parse(localStorage.getItem("cadastroTemp"));

    if (cadastroTemp && cadastroTemp.email) {
        emailView.textContent = `Código enviado para: ${cadastroTemp.email}`;
        console.log("🟢 Email exibido na verificação:", cadastroTemp.email);
    } else {
        emailView.textContent = "Código enviado para: (email não encontrado)";
        console.warn("⚠️ Nenhum email encontrado em cadastroTemp");
    }
});


// ======================================
//        PAGE EMAIL TO MODIFY
// ======================================

if (botaoSolicitarLink) {
    botaoSolicitarLink.addEventListener("click", (e) => {
        if (e) e.preventDefault();
        const emailDigitado = inputEmail.value.trim();
        localStorage.setItem("emailParaRecuperacao", emailDigitado);
        if (emailDigitado === "") {
            mostrarAlerta("Por favor, insira seu e-mail para solicitar o link de alteração de senha.", "aviso")
            console.warn("⚠️ E-mail não fornecido.");
            return;
        }
        // Enviar solicitação de link de alteração de senha
        mostrarLoader('mostrar');
        fetch("/link-alterar-senha", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailDigitado })
        })
            .then(res => {
                console.log("📥 Resposta do servidor:", res.status, res.ok);
                return res.json();
            })
            .then(data => {
                console.log("📥 Dados recebidos:", data);
                if (data.sucesso) {
                    mostrarLoader('esconder');
                    mostrarAlerta("Link de alteração enviado! Verifique seu e-mail.", "sucesso");
                    console.log("🟢 Link de alteração enviado para:", emailDigitado);
                    inputEmail.value = "";
                } else {
                    mostrarLoader('esconder');
                    mostrarAlerta("Erro ao enviar e-mail de recuperação. Tente novamente.", "erro");
                    console.warn("⚠️ Falha ao enviar link de alteração para:", emailDigitado);
                }
            })
            .catch(err => {
                console.error("❌ ERRO CAPTURADO:", err);
                console.error("❌ Detalhes do erro:", err.message, err.stack);
                mostrarLoader('esconder');
                mostrarAlerta("Ocorreu um erro. Verifique o console para mais detalhes.", "erro");
            });
    });
}


if (botaoModificar) {
    botaoModificar.addEventListener("click", (e) => {
        if (e) e.preventDefault();
        const inputNewPassword = document.getElementById("newPassword");
        const inputConfirmPassword = document.getElementById("confirmPassword");
        let algumErro = false;

        // limpa erros anteriores
        [inputNewPassword, inputConfirmPassword].forEach(limparErroCampo);
        if (validarCamposVazios([inputNewPassword, inputConfirmPassword])) return;

        const novaSenha = inputNewPassword.value.trim();
        const confirmarSenha = inputConfirmPassword.value.trim();
        const emailRecuperacao = localStorage.getItem("emailParaRecuperacao");
        // validações individuais
        const senhaValida = novaSenha.length >= 8;
        if (!senhaValida) { marcarErroCampo(inputNewPassword, "Senha deve ter 8+ caracteres"); algumErro = true; }
        if (novaSenha !== confirmarSenha) {
            marcarErroCampo(inputConfirmPassword, "Senhas não coincidem"); algumErro = true;
        }
        if (algumErro) {
            errorMessage.style.display = "block";
            erroAtivo = true;
            return;
        }
        mostrarLoader('mostrar');
        // 🟢 Enviar nova senha para o servidor
        console.log("📤 Enviando nova senha para o servidor")
        fetch("/modificar-senha", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailRecuperacao, novaSenha: novaSenha })
        })
            .then(res => {
                console.log("📥 Resposta do servidor:", res.status, res.ok);
                return res.json();
            })
            .then(data => {
                console.log("📥 Dados recebidos:", data);
                if (data.sucesso) {

                    mostrarLoader('esconder');
                    mostrarAlerta("Senha modificada com sucesso! Você será redirecionado para o login.", "sucesso");
                    console.log("🟢 Senha modificada com sucesso");
                    localStorage.removeItem("emailParaRecuperacao");
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 6000);
                } else {
                    mostrarLoader('esconder');
                    mostrarAlerta("Erro ao modificar a senha. Tente novamente.", "erro");
                    console.warn("⚠️ Falha ao modificar a senha");
                }
            }
            );
    })
        .catch(err => {
            console.error("❌ ERRO CAPTURADO:", err);
            console.error("❌ Detalhes do erro:", err.message, err.stack);
            mostrarLoader('esconder');
            mostrarAlerta("Ocorreu um erro. Verifique o console para mais detalhes.", "erro");
        });
}


// --- Reenviar código de verificação ---
if (resendCodeBtn) {
    resendCodeBtn.addEventListener("click", (e) => {
        if (e) e.preventDefault();
        const cadastroTemp = JSON.parse(localStorage.getItem("cadastroTemp"));

        if (!cadastroTemp) {
            // mostrarLoader('esconder');
            mostrarAlerta("Dados de cadastro não encontrados. Por favor, refaça o cadastro.", "erro");
            console.warn("⚠️ Dados de cadastro não encontrados no localStorage");
            return;
        }
        mostrarLoader('mostrar');
        // 🟢 Reenviar código de verificação
        console.log("📤 Reenviando código de verificação para:", cadastroTemp);
        fetch("/reenviar-codigo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome: cadastroTemp.nome, email: cadastroTemp.email })
        })
            .then(res => {
                console.log("📥 Resposta do servidor:", res.status, res.ok);
                return res.json();
            })
            .then(data => {
                console.log("📥 Dados recebidos:", data);
                if (data.sucesso) {
                    mostrarLoader('esconder');
                    mostrarAlerta("Código de verificação reenviado com sucesso!", "sucesso");
                    console.log("🟢 Código de verificação reenviado com sucesso");
                } else {
                    mostrarLoader('esconder');
                    mostrarAlerta("Erro ao reenviar código de verificação. Tente novamente.", "erro");
                    console.warn("⚠️ Falha ao reenviar código de verificação");
                }
            })
            .catch(err => {
                console.error("❌ ERRO CAPTURADO:", err);
                console.error("❌ Detalhes do erro:", err.message, err.stack);
                mostrarLoader('esconder');
                mostrarAlerta("Ocorreu um erro. Verifique o console para mais detalhes.", "erro");
            });
    });
}