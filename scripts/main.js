

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

            setTimeout(() => {
                modal.style.position = '';
                modal.style.top = '';
                modal.style.left = '';
                modal.style.width = '';
            }, 300); // Tempo para a animação de fechamento
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
    setupModalControls("#disciplinasBody");
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

    // O modal em questão é o de LINKAR CURSO À INSTITUIÇÃO 
    // obs: só é possível linkar cursos já existentes na base de dados
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
                mostrarConfirm("Tem certeza que deseja deletar este curso?", (confirmado) => {
                    if (confirmado) {
                        const idInstituicao = card.getAttribute("data-instituicao-id");
                        deletarCursoDB(idCurso, idInstituicao);
                    }
                });
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

    //==================================================
    //       MODAL DE EDIÇÃO EXPANSÍVEL
    //==================================================

    /**
     * Vincula todos os eventos de clique para o modal expansível de INSTITUIÇÕES.
     * Esta função é chamada por 'renderizarCardsInstituicoes'.
     */
    function vincularEventosCardsInstituicoes() {
        console.log("🔗 Vinculando eventos aos cards de instituições...");

        const container = document.querySelector("#instituicoesBody .cardsCreateIdt");

        if (!container) {
            console.warn("⚠️ Container de cards não encontrado");
            return;
        }

        // IMPORTANTE: Remove listeners antigos (evita duplicação)
        const novoContainer = container.cloneNode(true);
        container.parentNode.replaceChild(novoContainer, container);

        // Adiciona listener único no container (delegação de eventos)
        novoContainer.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;

            const card = btn.closest(".contentCardIdt");
            if (!card) return;

            const idInstituicao = card.getAttribute("data-id");

            if (btn.classList.contains("addCurso")) {
                console.log("➕ Executando: Adicionar Curso");
                e.preventDefault();
                e.stopPropagation();
                abrirModalAdicionarCurso(idInstituicao);

            } else if (btn.classList.contains("editCard")) {
                console.log("✏️ Executando: Editar Instituição");
                e.preventDefault();
                e.stopPropagation();

                // CORREÇÃO: Aguarda um frame antes de abrir (evita conflitos)
                requestAnimationFrame(() => {
                    editarInstituicao(idInstituicao);
                });

            } else if (btn.classList.contains("deletCard")) {
                console.log("🗑️ Executando: Deletar Instituição");
                e.preventDefault();
                e.stopPropagation();
                const idInstituicao = card.getAttribute("data-id");
                const cursosEmInstituicao = get.getCursosPorInstituicao(idInstituicao);

                if (cursosEmInstituicao.length > 0) {
                    mostrarAlerta("Não é possível deletar uma instituição que possui cursos vinculados.", "erro");
                    return;
                }

                mostrarConfirm(`Tem certeza que deseja deletar a instituição ${get.getNomeInstituicaoPorId(idInstituicao)}?`, (confirmado) => {
                    if (confirmado) {
                        deletarInstituicaoDB(idInstituicao);
                    }
                });
            }
        });

        console.log("✅ Eventos vinculados com sucesso!");
    }

    // Escuta quando os cards são renderizados
    document.addEventListener("cardsInstituicoesRenderizados", () => {
        console.log("📢 Evento: Cards renderizados! Vinculando eventos...");

        // Aguarda um frame para garantir que o DOM está pronto
        requestAnimationFrame(() => {
            vincularEventosCardsInstituicoes();
        });
    });

    // Vincula na primeira carga COM DELAY
    setTimeout(() => {
        console.log("⏰ Vinculação inicial (timeout)");
        vincularEventosCardsInstituicoes();
    }, 1000);

    // NOVO: Vincula também quando a página de instituições fica visível
    const instituicoesNav = document.querySelectorAll('.sideBar .content ul li a')[1];
    if (instituicoesNav) {
        instituicoesNav.addEventListener('click', () => {
            setTimeout(() => {
                console.log("🔄 Re-vinculando eventos após navegação");
                vincularEventosCardsInstituicoes();
            }, 100);
        });
    }
    //==================================================
    //       BOTÕES DE DISCIPLINAS
    //==================================================

    const btnNovoDisciplina = document.querySelector('#disciplinasBody .newIdt');
    if (btnNovoDisciplina) {
        btnNovoDisciplina.addEventListener('click', preencherSelectCursos);
    }

    const criarDisciplinaBtn = document.querySelector('#createBtnDisciplina');
    if (criarDisciplinaBtn) {
        criarDisciplinaBtn.addEventListener('click', () => {
            salvarDisciplina();
        });
    }

    /**
     * Vincula eventos aos botões dos cards de disciplinas (VERSÃO CORRETA)
     */
    function vincularEventosCardsDisciplinas() {
        console.log("🔗 Vinculando eventos aos cards de disciplinas...");
        const container = document.querySelector("#disciplinasBody .cardsCreateIdt");

        if (!container) {
            console.warn("⚠️ Container de cards de disciplinas não encontrado");
            return;
        }

        // Remove listeners antigos
        container.replaceWith(container.cloneNode(true));
        const novoContainer = document.querySelector("#disciplinasBody .cardsCreateIdt");

        // Adiciona listener único no container
        novoContainer.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;

            const card = btn.closest(".contentCardIdt");
            if (!card) return;

            // CORREÇÃO: Usar data-codigo, que vem do banco
            const codigoDisciplina = card.getAttribute("data-codigo");
            console.log("🎯 Código da disciplina:", codigoDisciplina);

            if (btn.classList.contains("editCard")) {
                console.log("✏️ Botão editar disciplina clicado");
                requestAnimationFrame(() => {
                    editarDisciplina(codigoDisciplina); // Envia o código
                });

            } else if (btn.classList.contains("deletCard")) {
                console.log("🗑️ Botão deletar disciplina clicado");
                mostrarConfirm("Tem certeza que deseja deletar esta disciplina?", (confirmado) => {
                    if (confirmado) {
                        deletarDisciplinaDB(codigoDisciplina); // Envia o código
                    }
                });
            }
        });

        console.log("✅ Eventos dos cards de disciplinas vinculados!");
    }

    // Escuta quando os cards são renderizados
    document.addEventListener("cardsDisciplinasRenderizados", () => {
        console.log("📢 Cards de disciplinas renderizados! Vinculando eventos...");
        vincularEventosCardsDisciplinas();
    });

    // Vincula na primeira carga (com delay para garantir que tudo está carregado)
    setTimeout(() => {
        vincularEventosCardsDisciplinas();
    }, 1500);

    //==================================================
    //       BOTÕES DE TURMAS
    //==================================================

    const btnNovaRurma = document.querySelector('#turmasBody .newIdt');
    if (btnNovaRurma) {
        btnNovaRurma.addEventListener('click', () => {
            console.log("➕ Botão Nova Turma clicado");
            // Preencher datalist de cursos se necessário
        });
    }

    const criarTurmaBtn = document.querySelector('#createBtnTurma');
    if (criarTurmaBtn) {
        criarTurmaBtn.addEventListener('click', () => {
            console.log("💾 Botão Criar Turma clicado");
            // Implementar salvarTurma se necessário
        });
    }

    /**
     * Vincula eventos aos botões dos cards de turmas
     */
    function vincularEventosCardsTurmas() {
        console.log("🔗 Vinculando eventos aos cards de turmas...");

        const container = document.querySelector("#turmasBody .cardsCreateIdt");

        if (!container) {
            console.warn("⚠️ Container de cards de turmas não encontrado");
            return;
        }

        // Remove listeners antigos
        container.replaceWith(container.cloneNode(true));
        const novoContainer = document.querySelector("#turmasBody .cardsCreateIdt");

        // Adiciona listener único no container
        novoContainer.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;

            const card = btn.closest(".contentCardIdt");
            if (!card) return;

            const idTurma = card.getAttribute("data-turma-id");
            console.log("🎯 ID da turma:", idTurma);

            if (btn.classList.contains("editCard")) {
                console.log("✏️ Botão editar turma clicado");
                requestAnimationFrame(() => {
                    editarTurma(idTurma);
                });

            } else if (btn.classList.contains("deletCard")) {
                console.log("🗑️ Botão deletar turma clicado");
                mostrarConfirm("Tem certeza que deseja deletar esta turma?", (confirmado) => {
                    if (confirmado) {
                        deletarTurmaDB(idTurma);
                    }
                });
            }
        });

        console.log("✅ Eventos dos cards de turmas vinculados!");
    }

    // Escuta quando os cards são renderizados
    document.addEventListener("cardsTurmasRenderizados", () => {
        console.log("📢 Cards de turmas renderizados! Vinculando eventos...");
        vincularEventosCardsTurmas();
    });

    // Vincula na primeira carga (com delay para garantir que tudo está carregado)
    setTimeout(() => {
        vincularEventosCardsTurmas();
    }, 2000);

});
