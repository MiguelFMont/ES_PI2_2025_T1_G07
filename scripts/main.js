// main.js
document.addEventListener("DOMContentLoaded", () => {
    // --- LOGIN ---
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (usuario) {
        const nomeEl = document.querySelector(".titleUser h1");
        const emailEl = document.querySelector(".titleUser p");

        if (nomeEl) {
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

            nomeEl.textContent = nomeFormatado;
            nomeEl.style.whiteSpace = "nowrap";
        }

        if (emailEl) emailEl.textContent = usuario.email;
    } else {
        window.location.href = "../index.html";
        return;
    }

    // --- LOGOUT ---
    const logoutBtn = document.querySelector("#logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("usuarioLogado");
            window.location.href = "../index.html";
        });
    }

    // --- VARIÁVEIS GERAIS ---
    const links = document.querySelectorAll(".content ul li a");
    const paginas = {
        "dashboard": "./components/dashboard.html",
        "instituições": "./components/instituicoes.html",
        "diciplinas": "./components/diciplina.html",
        "turmas": "./components/turmas.html"
    };

    // --- FUNÇÃO PARA CARREGAR UMA PÁGINA ---
    async function carregarPagina(nome) {
        links.forEach(l => l.classList.remove("ativo"));

        const link = Array.from(links).find(l =>
            l.querySelector("p").textContent.trim().toLowerCase() === nome
        );
        if (link) link.classList.add("ativo");

        document.querySelectorAll(".pagesContent > div").forEach(div => {
            div.style.display = "none";
        });

        const divAtual = document.querySelector(`.${nome}`);
        if (divAtual) {
            divAtual.style.display = "block";

            try {
                const res = await fetch(paginas[nome]);
                const html = await res.text();
                divAtual.innerHTML = html;

                // 🔹 ativa o comportamento genérico em qualquer página carregada
                ativarCreateIdt();

            } catch (error) {
                console.error("Erro ao carregar página:", error);
                divAtual.innerHTML = "<p>Erro ao carregar página.</p>";
            }
        }
    }

    // --- FUNÇÃO GENÉRICA PARA CONTROLE DE CREATEIDT ---
    function ativarCreateIdt() {
        const allNewBtns = document.querySelectorAll(".newIdt");

        allNewBtns.forEach(btn => {
            const container = btn.closest(".idtBody");
            if (!container) return;

            const createIdt = container.querySelector(".createIdt");
            const closeBtn = container.querySelector("#xClosedCreate");
            const cancelBtn = container.querySelector("#cancelBtnIdt");
            const cardIdt = container.querySelector(".cardIdt")

            if (!createIdt) return;

            // começa escondido
            createIdt.classList.remove("show");

            // abrir
            btn.addEventListener("click", () => {
                createIdt.classList.add("show");
                cardIdt.style.border = "none"
            });

            // fechar com animação (botão X)
            if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                    createIdt.classList.remove("show");
                    cardIdt.style.border = "1px solid var(--greyBorder)"
                });
            }

            // fechar com animação (botão Cancelar)
            if (cancelBtn) {
                cancelBtn.addEventListener("click", () => {
                    createIdt.classList.remove("show");
                    cardIdt.style.border = "1px solid var(--greyBorder)"
                });
            }
        });
    }

    // --- EVENTOS DOS LINKS ---
    links.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const nome = link.querySelector("p").textContent.trim().toLowerCase();
            carregarPagina(nome);
        });
    });

    // --- AO INICIAR: CARREGAR "DASHBOARD" ---
    carregarPagina("dashboard");

    // --- LINK "CADASTRAR INSTITUIÇÃO" ---
    document.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (!link) return;

        const texto = link.textContent.toLowerCase();

        if (texto.includes("cadastrar instituição") || link.id === "instituicoes") {
            e.preventDefault();
            carregarPagina("instituições");
        }
    });
});