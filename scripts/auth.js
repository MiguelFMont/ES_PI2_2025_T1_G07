// auth.js — Login e Cadastro unificados com localStorage

// --- Chave localStorage ---
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

// const telefoneInput = document.getElementById('telefone');
// ... (código da máscara de telefone comentado) ...

// --- Botões ---
const botaoLogin = document.querySelector(".buttonLogin"); // index.html
const botaoCadastro = document.querySelector(".buttonSignUp"); // pageCadastro.html
const botaoVerify = document.querySelector(".verify-btn"); // pageVerification.html
const botaoModificar = document.querySelector(".modify-btn"); // pageRecoveryPassword.html
const botaoSolicitarLink = document.querySelector(".solicitar-btn"); // pageEmailToModifyPassword.html
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

// --- Helpers --- //////////////////////////////////////////////////////////////////////////////////////////////

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
    if (!input) return; // Garante que o input existe (evita erros)
    input.addEventListener("input", () => {
        if (input.value.length > 0 && index < inputsCodigo.length - 1) {
            inputsCodigo[index + 1].focus();
        }
    });
    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value.length === 0 && index > 0) {
            inputsCodigo[index - 1].focus();
        }
    });
});

// --- Foco e digitação ---


[inputEmail, inputSenha, inputNome, inputTelefone].forEach((input) => {
    if (!input) return;

    input.addEventListener("focus", () => {
        const label = input.parentElement ? input.parentElement.querySelector("label") : null;
        if (label && label.textContent.includes("Campo não preenchido")) {
            label.textContent = originalLabels[input.id] || originalLabels[input.name] || label.textContent;
            label.style.color = "";
        }

        if (erroAtivo) {
            if (input.parentElement) input.parentElement.classList.remove("error");
            // if (input) input.value = "";
            if (label) label.style.color = "";
        }
    });

    input.addEventListener("input", () => {
        if (input.value.trim() !== "" && input.parentElement) {
            input.parentElement.classList.remove("error");
            const label = input.parentElement.querySelector("label");
            if (label) label.style.color = "";
        }
    });
});

function marcarErroCampo(input, msg) {
    if (!input || !input.parentElement) return;
    const parent = input.parentElement;
    const label = parent.querySelector("label");
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
    parent.classList.remove("error");
    if (label) {
        label.textContent = originalLabels[input.id] || originalLabels[input.name] || label.textContent;
        label.style.color = "";
    }
}

function salvarUsuarios() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
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

function mostrarLoader(tipo = 'mostrar') {
    const loader = document.querySelector(".load");
    if (!loader) return;

    if (tipo === 'mostrar') {
        loader.style.display = 'flex';
    } else {
        loader.style.display = 'none';
    }
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

function mostrarAlerta(mensagem, tipo = 'sucesso') {
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

    const alertMessage = customAlert.querySelector('.alert-message') || customAlert.querySelector('p');
    const alertIcon = customAlert.querySelector('i');
    
    if (alertMessage) alertMessage.textContent = mensagem;

    customAlert.classList.remove('alert-success', 'alert-warning', 'alert-error');

    switch(tipo.toLowerCase()) {
        case 'sucesso':
        case 'success':
            customAlert.classList.add('alert-success');
            customAlert.style.background = 'var(--color7)';
            if (alertIcon) alertIcon.className = 'ph ph-check';
            break;
            
        case 'aviso':
        case 'warning':
        case 'notificacao':
            customAlert.classList.add('alert-warning');
            customAlert.style.background = 'var(--color5)';
            if (alertIcon) alertIcon.className = 'ph ph-warning';
            break;
            
        case 'erro':
        case 'error':
            customAlert.classList.add('alert-error');
            customAlert.style.background = 'var(--color4)';
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
            customAlert.style.display = 'none';
        }
    }, 5000);
}

// ========================================
// VALIDAÇÃO DE CAMPOS
// ========================================
function marcarErroCampo(input, msg) {
    if (!input || !input.parentElement) return;
    const parent = input.parentElement;
    const label = parent.querySelector("label");
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

// --- LOGIN ---
if (botaoLogin) {
    botaoLogin.addEventListener("click", (e) => {
        if (e) e.preventDefault();
        [inputEmail, inputSenha].forEach(limparErroCampo);
        if (validarCamposVazios([inputEmail, inputSenha])) return;

        const emailDigitado = inputEmail.value.trim();
        const senhaDigitada = inputSenha.value.trim();


        console.log("📤 Enviando login para:", emailDigitado);
        fetch("/verificar-docente", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailDigitado, senha: senhaDigitada })
        })
            .then(res => {
                console.log("📥 Status da resposta:", res.status, res.ok);
                if (!res.ok) {
                    throw new Error("Credenciais inválidas");
                }
                return res.json();
            })
            .then(data => {
                console.log("📥 Dados recebidos:", data);

                if (data.sucesso && data.nome && data.email) {
                    console.log("✅ Login bem-sucedido! Nome:", data.nome, "Email:", data.email);

                    errorMessage.style.display = "none";
                    erroAtivo = false;

                    localStorage.setItem("usuarioLogado", JSON.stringify({
                        nome: data.nome,
                        email: data.email
                    }));

                    const salvou = localStorage.getItem("usuarioLogado");
                    console.log("💾 Salvou no localStorage:", salvou);

                    window.location.href = "/inicio";
                } else {
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

        // (Esta verificação local é boa, mas a do servidor é a principal)
        if (usuarios.some(u => u.email === emailDigitado)) {
            marcarErroCampo(inputEmail, "Email já cadastrado");
            algumErro = true;
        }

        if (algumErro) {
            errorMessage.style.display = "block";
            erroAtivo = true;
            return; 
        }
        
        // 🟢 MOSTRA O LOADER E AGENDA OS EVENTOS
        
        // 1. Mostra o loader
        mostrarLoader('mostrar');

        // 2. Salva os IDs dos timers para podermos cancelá-los
        let alertTimer = null;
        let redirectTimer = null;


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
                console.log("📥 Status da verificação de cadastro:", res.status, res.ok);
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
                    redirectTimer = setTimeout(() => {
                        window.location.href = "/verificacao";
                    }, 5000);
                }
            })
            .catch(err => {
                // ❌ TRATAMENTO DE ERRO CENTRALIZADO ❌
                
                // 1. PARA OS TIMERS AGENDADOS!
                clearTimeout(alertTimer);
                clearTimeout(redirectTimer);

                // 2. Esconde o loader e o alerta
                mostrarLoader('esconder');
                if (customAlert) customAlert.style.display = "none";

                // 3. Loga o erro
                console.error("❌ Erro no cadastro:", err);
            });
    });
}

if (botaoVerify) {
    botaoVerify.addEventListener("click", (e) => {
        if (e) e.preventDefault();

        const cadastroTemp = JSON.parse(localStorage.getItem("cadastroTemp"));

        if (!cadastroTemp) {
            alert("Dados de cadastro não encontrados. Por favor, refaça o cadastro.");
            window.location.href = "../index.html";
            return;
        }

        const { nome, email, telefone, senha } = cadastroTemp;

        console.log("Dados recuperados:", { nome, email, telefone });

        let codigoCompleto = '';

        for (let i = 0; i < inputsCodigo.length; i++) {
            codigoCompleto += inputsCodigo[i] ? inputsCodigo[i].value.trim() : '';
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
                    alert("Código inválido. Tente novamente.");
                    throw new Error("Código inválido");
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
                    localStorage.setItem("usuarioLogado", JSON.stringify({
                        nome: cadastroTemp.nome,
                        email: cadastroTemp.email
                    }));
                    console.log("✅ Docente cadastrado e logado:", cadastroTemp.email);
                    localStorage.removeItem("cadastroTemp");
                    alert("Docente cadastrado com sucesso! Você será redirecionado para a página inicial.");
                    window.location.href = "../pages/mainPage.html";
                } else {
                    console.log("❌ Erro ao cadastrar docente:", data.message);
                    alert("Erro ao cadastrar o docente.");
                }
            })
            .catch(err => {
                console.error("❌ ERRO CAPTURADO:", err);
                console.error("❌ Detalhes do erro:", err.message, err.stack);
                alert("Ocorreu um erro. Verifique o console para mais detalhes.");
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
            alert("Por favor, insira seu e-mail para solicitar o link de alteração de senha.");
            console.warn("⚠️ E-mail não fornecido.");
            return;
        }
        // Enviar solicitação de link de alteração de senha
        if (loader) loader.style.display = "flex";
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
                    if (loader) loader.style.display = "none";
                    console.log("🟢 Link de alteração enviado para:", emailDigitado);
                    alert("E-mail de recuperação enviado com sucesso!");
                    inputEmail.value = "";
                } else {
                    alert("Erro ao enviar e-mail de recuperação. Tente novamente.");
                    if (loader) loader.style.display = "none";
                    console.warn("⚠️ Falha ao enviar link de alteração para:", emailDigitado);
                }
            })
            .catch(err => {
                console.error("❌ ERRO CAPTURADO:", err);
                console.error("❌ Detalhes do erro:", err.message, err.stack);
                alert("Ocorreu um erro. Verifique o console para mais detalhes.");
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
        if (loader) loader.style.display = "flex";
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

                    if (loader) loader.style.display = "none";
                    alert("Senha modificada com sucesso! Você será redirecionado para o login.");
                    console.log("🟢 Senha modificada com sucesso");
                    localStorage.removeItem("emailParaRecuperacao");
                    window.location.href = "../index.html";
                } else {

                    if (loader) loader.style.display = "none";
                    alert("Erro ao modificar a senha. Tente novamente.");
                    console.warn("⚠️ Falha ao modificar a senha");
                }
            }
            );
    })
        .catch(err => {
            console.error("❌ ERRO CAPTURADO:", err);
            console.error("❌ Detalhes do erro:", err.message, err.stack);
            alert("Ocorreu um erro. Verifique o console para mais detalhes.");
        });
}