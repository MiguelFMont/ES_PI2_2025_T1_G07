

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

// telefoneInput.addEventListener('input', (e) => {
//     let valor = e.target.value.replace(/\D/g, ''); // só números

//     // Se o campo estiver vazio, não mostra nada
//     if (valor.length === 0) {
//         e.target.value = '';
//         return;
//     }

//     // Remove tudo que não for número
//     valor = valor.replace(/\D/g, '');

//     // Aplica a máscara (99) 99999-9999 ou (99) 9999-9999
//     if (valor.length > 10) {
//         // Celular com 11 dígitos
//         valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
//     } else if (valor.length > 6) {
//         // Telefone fixo com 10 dígitos
//         valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
//     } else if (valor.length > 2) {
//         // Só DDD e começo do número
//         valor = valor.replace(/(\d{2})(\d{0,5})/, '($1) $2');
//     } else {
//         // Apenas começando a digitar o DDD
//         valor = valor.replace(/(\d*)/, '($1');
//     }

//     e.target.value = valor;
// });

// --- Botões ---
const botaoLogin = document.querySelector(".buttonLogin");
const botaoCadastro = document.querySelector(".buttonSignUp");
const botaoVerify = document.querySelector(".verify-btn");

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

// --- LOGIN ---
if (botaoLogin) {
    botaoLogin.addEventListener("click", (e) => {
        if (e) e.preventDefault();
        [inputEmail, inputSenha].forEach(limparErroCampo);
        if (validarCamposVazios([inputEmail, inputSenha])) return;

        const emailDigitado = inputEmail.value.trim();
        const senhaDigitada = inputSenha.value.trim();

        // const usuario = usuarios.find(u => u.email === emailDigitado && u.senha === senhaDigitada);

        // if (usuario) {
        //     errorMessage.style.display = "none";
        //     erroAtivo = false;

        //     // 🟢 Salva nome e email do usuário logado
        //     localStorage.setItem("usuarioLogado", JSON.stringify({
        //         nome: usuario.nome,
        //         email: usuario.email
        //     }));

        //     window.location.href = "pages/mainPage.html";
        // } else {
        //     marcarErroCampo(inputEmail, originalLabels.email);
        //     marcarErroCampo(inputSenha, originalLabels.password);
        //     errorMessage.style.display = "block";
        //     erroAtivo = true;
        // }


        console.log("📤 Enviando login para:", emailDigitado);

        fetch("http://localhost:3000/verificar-docente", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailDigitado, senha: senhaDigitada })
        })
            .then(res => {
                console.log("📥 Status da resposta:", res.status, res.ok);
                // 🟢 IMPORTANTE: Verifica se a resposta foi bem-sucedida
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

                    // Salva no localStorage
                    localStorage.setItem("usuarioLogado", JSON.stringify({
                        nome: data.nome,
                        email: data.email
                    }));

                    // Confirma que salvou
                    const salvou = localStorage.getItem("usuarioLogado");
                    console.log("💾 Salvou no localStorage:", salvou);

                    window.location.href = "pages/mainPage.html";
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

        // limpa erros anteriores
        campos.forEach(limparErroCampo);

        if (validarCamposVazios(campos)) return;

        // validações individuais
        const nomeValido = nomeDigitado.split(" ").filter(p => p.length > 0).length >= 2;
        if (!nomeValido) { marcarErroCampo(inputNome, "Digite nome e sobrenome"); algumErro = true; }

        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDigitado);
        if (!emailValido) { marcarErroCampo(inputEmail, "Email inválido"); algumErro = true; }

        const telefoneLimpo = telefoneDigitado.replace(/[^\d]/g, "");
        const telefoneValido = telefoneLimpo.length >= 8;
        if (!telefoneValido) { marcarErroCampo(inputTelefone, "Telefone inválido"); algumErro = true; }

        const senhaValida = senhaDigitada.length >= 8;
        if (!senhaValida) { marcarErroCampo(inputSenha, "Senha deve ter 8+ caracteres"); algumErro = true; }

        // email já cadastrado
        if (usuarios.some(u => u.email === emailDigitado)) {
            marcarErroCampo(inputEmail, "Email já cadastrado");
            algumErro = true;
        }

        if (algumErro) {
            errorMessage.style.display = "block";
            erroAtivo = true;
            return;
        }

        // // cadastro válido
        // usuarios.push({ nome: nomeDigitado, email: emailDigitado, telefone: telefoneDigitado, senha: senhaDigitada });


        // salvarUsuarios();

        // errorMessage.style.display = "none";
        // alert("Cadastro realizado com sucesso! Você será redirecionado para o login.");
        // window.location.href = "../index.html";

        localStorage.setItem("cadastroTemp", JSON.stringify({
            nome: nomeDigitado,
            email: emailDigitado,
            telefone: telefoneDigitado,
            senha: senhaDigitada
        }));
        fetch("http://localhost:3000/verificar-docente/cadastro", {
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
                    alert("Email já cadastrado. Tente fazer login."); ///////////////////////////////////////////////////////////////////////////////////
                    throw new Error("Email já cadastrado");
                } else {
                    console.log("✅ Email disponível para cadastro:", emailDigitado);
                    fetch("http://localhost:3000/enviar-codigo", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            nome: nomeDigitado,
                            email: emailDigitado
                        })
                    })
                        .then(res => res.json())
                        .then(data => {
                            console.log(data.message);
                            alert("Cadastro realizado e e-mail enviado com sucesso!");
                            // redireciona após o sucesso
                            window.location.href = "../pages/pageVerification.html";
                        })
                        .catch(err => {
                            console.error("Erro ao enviar e-mail:", err);
                            alert("Cadastro feito, mas ocorreu erro ao enviar o e-mail.");
                        });
                }
            })
            .catch(err => {
                console.error("❌ Erro no cadastro:", err);
            });
    });
}

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
            // limpa somente o campo que o usuário clicou
            if (input.parentElement) input.parentElement.classList.remove("error");
            if (input) input.value = "";
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

        console.log("Dados recuperados:", { nome, email, telefone }); // Para debug

        let codigoCompleto = '';

        for (let i = 0; i < inputsCodigo.length; i++) {
            codigoCompleto += inputsCodigo[i] ? inputsCodigo[i].value.trim() : '';
        }

        console.log("1. Verificando código:", codigoCompleto);

        fetch("http://localhost:3000/verificar-codigo", {
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

                    // Cadastrar o docente com os dados recuperados
                    return fetch("http://localhost:3000/docente", {
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
                    // 🟢 SALVE OS DADOS DO USUÁRIO LOGADO
                    localStorage.setItem("usuarioLogado", JSON.stringify({
                        nome: cadastroTemp.nome,
                        email: cadastroTemp.email
                    }));
                    // 🟢 LIMPE OS DADOS TEMPORÁRIOS APÓS O SUCESSO
                    localStorage.removeItem("cadastroTemp");
                    alert("Docente cadastrado com sucesso! Você será redirecionado para a página inicial.");
                    window.location.href = "../pages/mainPage.html";
                } else {
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

// auth.js
// --- Mostrar o e-mail do cadastro na verificação ---
document.addEventListener("DOMContentLoaded", () => {
    const emailView = document.getElementById("mailView");
    if (!emailView) return;

    // Tenta pegar o e-mail salvo temporariamente no cadastro
    const cadastroTemp = JSON.parse(localStorage.getItem("cadastroTemp"));

    if (cadastroTemp && cadastroTemp.email) {
        emailView.textContent = `Código enviado para: ${cadastroTemp.email}`;
        console.log("🟢 Email exibido na verificação:", cadastroTemp.email);
    } else {
        emailView.textContent = "Código enviado para: (email não encontrado)";
        console.warn("⚠️ Nenhum email encontrado em cadastroTemp");
    }
});

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