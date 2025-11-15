

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
        const cardIdt = page.querySelector('.cardIdt');

        // Ajusta o estilo do cardIdt quando o modal é aberto ou fechado
        if (cardIdt && modal && btnNovo) {
            btnNovo.addEventListener('click', () => {
                cardIdt.classList.add('modal-open');
                abrirModal(modal);
            });
        }

        // Botão "Novo..." (para ABRIR o modal)
        if (btnNovo && modal) {
            btnNovo.addEventListener('click', () => {
                abrirModal(modal);

                // Se for o modal de cursos, preenche o select
                if (pageSelector === "#cursosBody") {
                    preencherSelectInstituicoes();
                }
            });
        }

        if (cardIdt && modal && btnCancelar || btnFecharX) {
            cardIdt.classList.remove('modal-open');
            fecharModal(modal);
        }

        //  Botão "Cancelar" (para FECHAR o modal)
        if (btnCancelar && modal) {
            btnCancelar.addEventListener('click', () => {
                fecharModal(modal);
            });
        }

        //  Botão "X" (para FECHAR o modal)
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

    // Função para vincular eventos aos botões dos cards
    // ===================================================
    //    EVENTOS DOS CARDS DE INSTITUIÇÕES
    // ===================================================

    function vincularEventosCardsInstituicoes() {
        console.log("🔗 Vinculando eventos aos cards...");

        // Delegação de eventos no container
        const container = document.querySelector("#instituicoesBody .cardsCreateIdt");

        if (!container) {
            console.warn("⚠️ Container de cards não encontrado");
            return;
        }

        // Remove listeners antigos (se existirem)
        container.replaceWith(container.cloneNode(true));
        const novoContainer = document.querySelector("#instituicoesBody .cardsCreateIdt");

        // Adiciona listener único no container (delegação de eventos)
        novoContainer.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;

            const card = btn.closest(".contentCardIdt");
            if (!card) return;

            const idInstituicao = card.getAttribute("data-id");
            console.log("🎯 ID da instituição:", idInstituicao);

            if (btn.classList.contains("addCurso")) {
                console.log("➕ Botão adicionar clicado");
                abrirModalAdicionarCurso(idInstituicao);

            } else if (btn.classList.contains("editCard")) {
                console.log("✏️ Botão editar clicado");
                editarInstituicao(idInstituicao);
            } else if (btn.classList.contains("deletCard")) {
                console.log("🗑️ Botão deletar clicado");
                if (confirm("Tem certeza que deseja deletar esta instituição?")) {
                    deletarInstituicaoDB(idInstituicao);
                }
            }
        });

        console.log("✅ Eventos vinculados com sucesso!");
    }

    // Escuta quando os cards são renderizados
    document.addEventListener("cardsInstituicoesRenderizados", () => {
        console.log("📢 Cards renderizados! Vinculando eventos...");
        vincularEventosCardsInstituicoes();
    });

    // Vincula na primeira carga
    setTimeout(() => {
        vincularEventosCardsInstituicoes();
    }, 1000);


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
            console.log(`Vinculando curso ${nomeCurso} à instituição ${idInstituicao}`);
            vincularCursoInstituicaoDB(idInstituicao, nomeCurso);

            // Fecha o modal
            fecharModalAdicionarCurso();
        });
    }
    //==================================================
    //        BOTÕES DE CURSOS
    //==================================================

    console.log("🔧 Configurando eventos de cursos...");

    // Botão "Criar" do modal de cursos
    const btnCriarCurso = document.querySelector("#cursosBody .createBtnIdt");
    if (btnCriarCurso) {
        btnCriarCurso.addEventListener("click", salvarCurso);
    }

    // Botões do modal de adicionar disciplina
    const btnFecharAddDisciplina = document.querySelector("#cursosBody #closedAdd");
    if (btnFecharAddDisciplina) {
        btnFecharAddDisciplina.addEventListener("click", fecharModalAdicionarDisciplina);
    }

    const btnCancelarAddDisciplina = document.querySelector("#cursosBody #cancelAddIdt");
    if (btnCancelarAddDisciplina) {
        btnCancelarAddDisciplina.addEventListener("click", fecharModalAdicionarDisciplina);
    }

    const btnSalvarAddDisciplina = document.querySelector("#cursosBody #saveAddIdt");
    if (btnSalvarAddDisciplina) {
        btnSalvarAddDisciplina.addEventListener("click", () => {
            const modalAdd = document.querySelector("#cursosBody .containerAddIdt");
            const idCurso = modalAdd?.getAttribute("data-curso-id");
            const inputDisciplina = modalAdd?.querySelector("input[list='listDisciplinasLink']");

            if (!idCurso || !inputDisciplina) {
                mostrarAlerta("Erro ao adicionar disciplina", "erro");
                return;
            }

            const nomeDisciplina = inputDisciplina.value.trim();

            if (!nomeDisciplina) {
                mostrarAlerta("Selecione uma disciplina", "aviso");
                return;
            }

            console.log(`Vinculando disciplina ${nomeDisciplina} ao curso ${idCurso}`);

            // Aqui você implementaria a lógica para vincular a disciplina ao curso
            // vincularDisciplinaCursoDB(idCurso, nomeDisciplina);

            fecharModalAdicionarDisciplina();
        });
    }

    
    /**
     * Vincula eventos aos botões dos cards de cursos
     */
    function vincularEventosCardsCursos() {
        console.log("🔗 Vinculando eventos aos cards de cursos...");

        const container = document.querySelector("#cursosBody .cardsCreateIdt");

        if (!container) {
            console.warn("⚠️ Container de cards de cursos não encontrado");
            return;
        }

        // Remove listeners antigos
        container.replaceWith(container.cloneNode(true));
        const novoContainer = document.querySelector("#cursosBody .cardsCreateIdt");

        // Adiciona listener único no container
        novoContainer.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;

            const card = btn.closest(".contentCardIdt");
            if (!card) return;

            const idCurso = card.getAttribute("data-id");
            console.log("🎯 ID do curso:", idCurso);

            if (btn.classList.contains("addCurso")) {
                console.log("➕ Botão adicionar disciplina clicado");
                abrirModalAdicionarDisciplina(idCurso);

            } else if (btn.classList.contains("editCard")) {
                console.log("✏️ Botão editar curso clicado");
                editarCurso(idCurso);

            } else if (btn.classList.contains("deletCard")) {
                console.log("🗑️ Botão deletar curso clicado");
                if (confirm("Tem certeza que deseja deletar este curso?")) {
                    deletarCursoDB(idCurso);
                }
            }
        });

        console.log("✅ Eventos dos cards de cursos vinculados!");
    }

    // Escuta quando os cards são renderizados
    document.addEventListener("cardsCursosRenderizados", () => {
        console.log("📢 Cards de cursos renderizados! Vinculando eventos...");
        vincularEventosCardsCursos();
    });

    // Vincula na primeira carga (com delay para garantir que tudo está carregado)
    setTimeout(() => {
        vincularEventosCardsCursos();
    }, 1500);
});
