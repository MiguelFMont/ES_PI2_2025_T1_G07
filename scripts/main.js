

document.addEventListener('DOMContentLoaded', () => {

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (usuario) {
        // --- Preenche o nome e email do usuário na barra lateral ---
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
        // Se não houver usuário, redireciona para a página de login
        window.location.href = "/";
        return; // Para a execução do script aqui
    }

    // --- LOGOUT ---
    const logoutBtn = document.querySelector("#logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("usuarioLogado");
            console.log("🔒 Usuário deslogado. Redirecionando...");
            window.location.href = "/";
        });
    }

    // -- userSettings --
    const userButton = document.querySelector("#userSettings");
    if (userButton) {
        userButton.addEventListener("click", () => {
            window.location.href = "/userSettings"; // Redireciona para as configurações
        });
    }

    // ===================================================
    //               NAVEGAÇÃO PRINCIPAL
    // ===================================================

    // 1. Seleciona todos os LINKS de navegação
    const navLinks = document.querySelectorAll('.sideBar .content ul li a'); // identifica as paginas pelo elemento <a>
    // OBS: o index do showPage() corresponde ao index do link (a) clicado

    // 2. Seleciona todos os contêineres de página
    const pageContents = document.querySelectorAll('.pagesContent > div');

    function showPage(index) {
        pageContents.forEach(page => {
            page.classList.remove('page-active');
        });
        navLinks.forEach(link => {
            link.classList.remove('ativo');
        });
        if (pageContents[index]) {
            pageContents[index].classList.add('page-active');
        }
        if (navLinks[index]) {
            navLinks[index].classList.add('ativo');
        }
    }

    navLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(index);  //basicamente 
        });
    });

    showPage(0);

    function fecharModal(modal) {
        if (modal) {
            modal.classList.remove('show');
        }
    }
    function abrirModal(modal) {
        if (modal) {
            modal.classList.add('show');
        }
    }

    // função para configurar os controles do modal em uma página específica
    function setupModalControls(pageSelector) {
        const page = document.querySelector(pageSelector);
        if (!page) return; // Se a página não existir, não faz nada

        const btnNovo = page.querySelector('.newIdt');
        const modal = page.querySelector('.createIdt');
        const btnCancelar = page.querySelector('#cancelBtnIdt');
        const btnFecharX = page.querySelector('#xClosedCreate');

        // 1. Botão "Novo..." (para ABRIR o modal)
        if (btnNovo && modal) {
            btnNovo.addEventListener('click', () => {
                abrirModal(modal);
            });
        }

        // 2. Botão "Cancelar" (para FECHAR o modal)
        if (btnCancelar && modal) {
            btnCancelar.addEventListener('click', () => {
                fecharModal(modal);
            });
        }

        // 3. Botão "X" (para FECHAR o modal)
        if (btnFecharX && modal) {
            btnFecharX.addEventListener('click', () => {
                fecharModal(modal);
            });
        }
    }

    setupModalControls("#instituicoesBody");
    setupModalControls("#cursosBody");
    setupModalControls("#diciplinasBody");
    setupModalControls("#turmasBody");

    // ===================================================
    //          BOTÕES UTILIZADOS NO DASHBOARD
    // ===================================================

    const dashboardCardInstituicoes = document.querySelector('#instituicoes.itensOption');
    const dashboardCardCursos = document.querySelector('#cursos.itensOption');
    const dashboardCardDisciplinas = document.querySelector('#diciplinas.itensOption');
    const dashboardCardTurmas = document.querySelector('#turmas.itensOption');
    const dashboardBtnCadastrar = document.querySelector('.viewTurmaInstituicao a');

    if (dashboardCardInstituicoes) {
        dashboardCardInstituicoes.addEventListener('click', (e) => { e.preventDefault(); showPage(1); });
    }
    if (dashboardCardCursos) {
        dashboardCardCursos.addEventListener('click', (e) => { e.preventDefault(); showPage(2); });
    }
    if (dashboardCardDisciplinas) {
        dashboardCardDisciplinas.addEventListener('click', (e) => { e.preventDefault(); showPage(3); });
    }
    if (dashboardCardTurmas) {
        dashboardCardTurmas.addEventListener('click', (e) => { e.preventDefault(); showPage(4); });
    }
    if (dashboardBtnCadastrar) {
        dashboardBtnCadastrar.addEventListener('click', (e) => { e.preventDefault(); showPage(1); });
    }

    // ===================================================
    //                BOTÕES DE INSTITUIÇÕES
    // ===================================================

    const criarInstituicaoBtn = document.querySelector('#createBtnInstituicao');
    if (criarInstituicaoBtn) {
        criarInstituicaoBtn.addEventListener('click', () => {
            salvarInstituicao();
        });
    }

    // ===================================================
    //        MODAL DE ADICIONAR CURSO À INSTITUIÇÃO
    // ===================================================

    // Botão "X" para fechar o modal de adicionar curso
    const btnFecharAddInstituicao = document.querySelector("#instituicoesBody #closedAdd");
    if (btnFecharAddInstituicao) {
        btnFecharAddInstituicao.addEventListener("click", fecharModalAdicionarCurso);
    }

    // Botão "Cancelar" do modal de adicionar curso
    const btnCancelarAddInstituicao = document.querySelector("#instituicoesBody #cancelAddIdt");
    if (btnCancelarAddInstituicao) {
        btnCancelarAddInstituicao.addEventListener("click", fecharModalAdicionarCurso);
    }

    // Botão "Adicionar" do modal de adicionar curso
    const btnSalvarAddInstituicao = document.querySelector("#instituicoesBody #saveAddIdt");
    if (btnSalvarAddInstituicao) {
        btnSalvarAddInstituicao.addEventListener("click", () => {
            const modalAdd = document.querySelector("#instituicoesBody .containerAddIdt");
            const idInstituicao = modalAdd?.getAttribute("data-instituicao-id");
            const inputCurso = modalAdd?.querySelector("input[list='listCursosLink']");

            if (!idInstituicao || !inputCurso) {
                mostrarAlerta("Erro ao adicionar curso", "erro");
                return;
            }

            const nomeCurso = inputCurso.value.trim();

            if (!nomeCurso) {
                mostrarAlerta("Selecione um curso", "aviso");
                return;
            }

            // Encontra o curso selecionado
            const curso = AppState.cursos.find(c => c.curso === nomeCurso);

            if (!curso) {
                mostrarAlerta("Curso não encontrado", "erro");
                return;
            }

            // Aqui você implementaria a lógica para vincular o curso à instituição no backend
            console.log(`Vinculando curso ${curso.id} à instituição ${idInstituicao}`);
            mostrarAlerta("Funcionalidade em desenvolvimento", "aviso");

            // Fecha o modal
            fecharModalAdicionarCurso();
        });
    }
});
