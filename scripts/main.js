// AUTOR: Miguel Fernandes Monteiro - RA: 25014808

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
    //               NAVEGAÇÃO PRINCIPAL
    // ===================================================

    // 1. Seleciona todos os LINKS de navegação
    const navLinks = document.querySelectorAll('.sideBar .content ul li a');
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
            showPage(index);
        });
    });

    showPage(0); // Mostra a primeira página (Dashboard)

    // ===================================================
    //               CONTROLES DE MODAL (CRIAÇÃO)
    // ===================================================

    function fecharModal(modal) {
        if (modal) {
            modal.classList.remove('show');
            // Reseta o estilo do card "Nenhum..."
            const cardIdt = modal.closest('.cardIdt');
            if (cardIdt) {
                cardIdt.classList.remove('modal-open');
            }
        }
    }

    function abrirModal(modal) {
        if (modal) {
            modal.classList.add('show');
            // Adiciona classe ao card "Nenhum..."
            const cardIdt = modal.closest('.cardIdt');
            if (cardIdt) {
                cardIdt.classList.add('modal-open');
            }
        }
    }

    // Configura os modais de *criação* para cada página
    function setupModalControls(pageSelector) {
        const page = document.querySelector(pageSelector);
        if (!page) return;

        const btnNovo = page.querySelector('.newIdt');
        const modal = page.querySelector('.createIdt');
        const btnCancelar = page.querySelector('#cancelBtnIdt');
        const btnFecharX = page.querySelector('#xClosedCreate');

        // Botão "Novo..." (para ABRIR o modal)
        if (btnNovo && modal) {
            btnNovo.addEventListener('click', () => {
                abrirModal(modal);

                // Lógica específica para pré-popular selects
                if (pageSelector === "#cursosBody") {
                    preencherSelectInstituicoes();
                }
                if (pageSelector === "#disciplinasBody") {
                    preencherSelectCursos();
                }
                if (pageSelector === "#turmasBody") {
                    preencherSelectDisciplinas();
                }
            });
        }

        // Botão "Cancelar" (para FECHAR o modal)
        if (btnCancelar && modal) {
            btnCancelar.addEventListener('click', () => {
                fecharModal(modal);
            });
        }

        // Botão "X" (para FECHAR o modal)
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
    //          BOTÕES UTILIZADOS NO DASHBOARD
    // ===================================================

    const dashboardCardInstituicoes = document.querySelector('#instituicoes.itensOption');
    const dashboardCardCursos = document.querySelector('#cursos.itensOption');
    const dashboardCardDisciplinas = document.querySelector('#disciplinas.itensOption');
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
    //                BOTÕES DE CRIAÇÃO
    // ===================================================

    // --- Botão Criar Instituição ---
    const criarInstituicaoBtn = document.querySelector('#createBtnInstituicao');
    if (criarInstituicaoBtn) {
        criarInstituicaoBtn.addEventListener('click', () => {
            salvarInstituicao();
        });
    }

    // --- Botão Criar Curso ---
    const btnCriarCurso = document.querySelector("#cursosBody .createBtnIdt"); // ID corrigido
    if (btnCriarCurso) {
        btnCriarCurso.addEventListener("click", salvarCurso);
    }

    // --- Botão Criar Disciplina ---
    const criarDisciplinaBtn = document.querySelector('#createBtnDisciplina');
    if (criarDisciplinaBtn) {
        criarDisciplinaBtn.addEventListener('click', () => {
            salvarDisciplina();
        });
    }

    // --- Botão Criar Turma ---
    const criarTurmaBtn = document.querySelector('#createBtnTurma');
    if (criarTurmaBtn) {
        criarTurmaBtn.addEventListener('click', () => {
            salvarTurma();
        });
    }

    // ===================================================
    //            MODAIS DE "LINKAR" (Adicionar)
    // ===================================================

    // --- Modal: Linkar Curso (em Instituições) ---
    const btnFecharAddInstituicao = document.querySelector("#instituicoesBody #closedAdd");
    if (btnFecharAddInstituicao) {
        btnFecharAddInstituicao.addEventListener("click", fecharModalAdicionarCurso);
    }
    const btnCancelarAddInstituicao = document.querySelector("#instituicoesBody #cancelAddIdt");
    if (btnCancelarAddInstituicao) {
        btnCancelarAddInstituicao.addEventListener("click", fecharModalAdicionarCurso);
    }
    const btnSalvarAddInstituicao = document.querySelector("#instituicoesBody #saveAddIdt");
    if (btnSalvarAddInstituicao) {
        btnSalvarAddInstituicao.addEventListener("click", () => {
            const modalAdd = document.querySelector("#instituicoesBody .containerAddIdt");
            const idInstituicao = modalAdd?.getAttribute("data-instituicao-id");
            const inputCurso = modalAdd?.querySelector("input[list='listCursosLink']");
            if (!idInstituicao || !inputCurso) return;
            const nomeCurso = inputCurso.value.trim();
            if (!nomeCurso) {
                mostrarAlerta("Selecione um curso", "aviso");
                return;
            }
            const curso = AppState.cursos.find(c => c.curso === nomeCurso);
            if (!curso) {
                mostrarAlerta("Curso não encontrado", "erro");
                return;
            }
            vincularCursoInstituicaoDB(idInstituicao, nomeCurso);
            fecharModalAdicionarCurso();
        });
    }

    // --- Modal: Linkar Disciplina (em Cursos) ---
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
            if (!idCurso || !inputDisciplina) return;
            const nomeDisciplina = inputDisciplina.value.trim();
            if (!nomeDisciplina) {
                mostrarAlerta("Selecione uma disciplina", "aviso");
                return;
            }
            console.log(`Vinculando disciplina ${nomeDisciplina} ao curso ${idCurso}`);
            // Lógica de vincular disciplina aqui...
            // vincularDisciplinaCursoDB(idCurso, nomeDisciplina);
            fecharModalAdicionarDisciplina();
        });
    }

    // ===================================================
    //          DELEGAÇÃO DE EVENTOS (Otimizado)
    // ===================================================

    /**
     * ✅ NOVO: Vincula todos os eventos de clique principais usando delegação.
     */
    function vincularEventosGlobais() {
        console.log("🔗 Vinculando eventos globais (Delegação)...");

        const cardsContainer = document.querySelector(".pagesContent");
        if (!cardsContainer) return;

        cardsContainer.addEventListener('click', (e) => {

            // --- Eventos de Edição ---
            const btnEdit = e.target.closest('.editCard'); // Agora funciona para turmas tbm
            if (btnEdit) {
                e.preventDefault();
                e.stopPropagation();

                const card = btnEdit.closest('.contentCardIdt, .turma-card');
                if (!card) return;

                if (card.closest('#instituicoesBody')) {
                    const id = card.dataset.id;
                    console.log(`DELEGAÇÃO: Editar Instituição ${id}`);
                    requestAnimationFrame(() => editarInstituicao(id));

                } else if (card.closest('#cursosBody')) {
                    const id = card.dataset.id;
                    console.log(`DELEGAÇÃO: Editar Curso ${id}`);
                    requestAnimationFrame(() => editarCurso(id));

                } else if (card.closest('#disciplinasBody')) {
                    const codigo = card.dataset.codigo;
                    console.log(`DELEGAÇÃO: Editar Disciplina ${codigo}`);
                    requestAnimationFrame(() => editarDisciplina(codigo));

                } else if (card.closest('#turmasBody')) {
                    const id = card.dataset.id; // Pega o ID do card
                    console.log(`DELEGAÇÃO: Editar Turma ${id}`);
                    requestAnimationFrame(() => editarTurmaCard(id)); // Chama a função correta
                }
                return;
            }

            // --- Eventos de Deleção ---
            const btnDelete = e.target.closest('.deletCard'); // Agora funciona para turmas tbm
            if (btnDelete) {
                e.preventDefault();
                e.stopPropagation();

                const card = btnDelete.closest('.contentCardIdt, .turma-card');
                if (!card) return;

                if (card.closest('#instituicoesBody')) {
                    const id = card.dataset.id;
                    const cursosEmInstituicao = get.getCursosPorInstituicao(id);
                    if (cursosEmInstituicao.length > 0) {
                        mostrarAlerta("Não é possível deletar uma instituição que possui cursos vinculados.", "erro");
                        return;
                    }
                    mostrarConfirm(`Tem certeza que deseja deletar a instituição ${get.getNomeInstituicaoPorId(id)}?`, (confirmado) => {
                        if (confirmado) deletarInstituicaoDB(id);
                    });

                } else if (card.closest('#cursosBody')) {
                    const id = card.dataset.id;
                    const idInstituicao = card.dataset.instituicaoId;
                    // ✅ ADICIONADO: Verificação de segurança
                    const disciplinasEmCurso = get.getDisciplinasPorCurso(id);
                    if (disciplinasEmCurso.length > 0) {
                        mostrarAlerta("Não é possível deletar um curso que possui disciplinas vinculadas.", "erro");
                        return;
                    }
                    mostrarConfirm("Tem certeza que deseja deletar este curso?", (confirmado) => {
                        if (confirmado) deletarCursoDB(id, idInstituicao);
                    });

                } else if (card.closest('#disciplinasBody')) {
                    const codigo = card.dataset.codigo;
                    // ✅ ADICIONADO: Verificação de segurança
                    const turmasEmDisciplina = get.getTurmasPorDisciplina(codigo);
                    if (turmasEmDisciplina.length > 0) {
                        mostrarAlerta("Não é possível deletar uma disciplina que possui turmas vinculadas.", "erro");
                        return;
                    }
                    mostrarConfirm("Tem certeza que deseja deletar esta disciplina?", (confirmado) => {
                        if (confirmado) deletarDisciplinaDB(codigo);
                    });

                } else if (card.closest('#turmasBody')) {
                    // ✅ CORRIGIDO: Define o 'id' antes de usá-lo
                    const id = card.dataset.id;
                    deletarTurmaCard(id); // Chama a função de confirmação
                }
                return;
            }

            // --- Eventos de Adicionar (Linkar) ---
            const btnAdd = e.target.closest('.addCurso');
            if (btnAdd) {
                e.preventDefault();
                e.stopPropagation();

                const card = btnAdd.closest('.contentCardIdt');
                if (!card) return;

                if (card.closest('#instituicoesBody')) {
                    const id = card.dataset.id;
                    console.log(`DELEGAÇÃO: Abrir modal 'Adicionar Curso' para Instituição ${id}`);
                    abrirModalAdicionarCurso(id);
                } else if (card.closest('#cursosBody')) {
                    const id = card.dataset.id;
                    console.log(`DELEGAÇÃO: Abrir modal 'Adicionar Disciplina' para Curso ${id}`);
                    abrirModalAdicionarDisciplina(id);
                }
                return;
            }

            // --- Eventos de Gerenciar Notas ---
            const btnNotas = e.target.closest('.btn-notas');
            if (btnNotas) {
                e.preventDefault();
                e.stopPropagation();

                const idTurma = btnNotas.getAttribute('data-turma-id');
                console.log(`DELEGAÇÃO: Gerenciar Notas da Turma ${idTurma}`);
                selecionarTurmaParaNotas(idTurma);
                return;
            }
        });

        console.log("✅ Eventos globais (Delegação) vinculados com sucesso!");
    }

    // ✅ NOVO: Chama a função de delegação de eventos UMA VEZ.
    vincularEventosGlobais();

});