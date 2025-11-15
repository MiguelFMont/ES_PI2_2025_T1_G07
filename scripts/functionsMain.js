// ============================================
// 1. ESTADO DA APLICAÇÃO (CACHE EM MEMÓRIA)
// ============================================
const AppState = {
    instituicoes: [],
    cursos: [],
    turmas: []
};

// ============================================
// 2. FUNÇÕES DE RENDERIZAÇÃO E ATUALIZAÇÃO DA UI
// (Funções que manipulam o DOM para exibir dados)
// ============================================

/**
 * Renderiza os cards de instituições na interface
 */
function renderizarCardsInstituicoes() {
    console.log("🎨 Renderizando cards de instituições...");

    const containerCards = document.querySelector("#instituicoesBody .cardsCreateIdt");
    const cardVazio = document.querySelector("#instituicoesBody .cardIdt");

    if (!containerCards) {
        console.error("❌ Container de cards não encontrado!");
        return;
    }

    // Limpa os cards existentes
    containerCards.innerHTML = "";

    if (AppState.instituicoes.length === 0) {
        // Mostra o card vazio
        mostrarCardVazioInstituicoes();
        return;
    }

    // Não esconde o cardVazio completamente, apenas o conteúdo visual
    // O modal DEVE permanecer acessível no DOM
    if (cardVazio) {
        //  elementos internos do card vazio
        const iconIdt = cardVazio.querySelector('.iconIdt');
        const h3 = cardVazio.querySelector('h3');
        const p = cardVazio.querySelector('p');

        if (iconIdt) iconIdt.style.display = "none";
        if (h3) h3.style.display = "none";
        if (p) p.style.display = "none";

        // Remove a borda do card vazio
        cardVazio.style.border = "none";
        cardVazio.style.height = "0";
        cardVazio.style.padding = "0";
        cardVazio.style.overflow = "visible"; // permite o modal aparecer

        // Garante que o modal está fechado
        const modal = cardVazio.querySelector('.createIdt');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    containerCards.style.display = "grid";
    containerCards.style.opacity = "1";
    containerCards.style.pointerEvents = "all";

    // Cria um card para cada instituição
    AppState.instituicoes.forEach(instituicao => {
        const card = document.createElement("div");
        card.className = "contentCardIdt";
        card.setAttribute("data-id", instituicao.id);

        // Monta a lista de cursos
        let cursosHTML = "";
        if (instituicao.cursos && instituicao.cursos.length > 0) {
            cursosHTML = instituicao.cursos.map(curso =>
                `<div class="linkDatailsIdt" style="display: inline-block;">${curso}</div>`
            ).join("");
        } else {
            cursosHTML = '<p style="font-size: 0.9rem; color: var(--grey); margin: 0;">Nenhum curso cadastrado</p>';
        }

        card.innerHTML = `
            <i class="ph ph-buildings"></i>
            <div class="textContentCardIdt">
                <h2>${instituicao.nome}</h2>
                <div class="viewDetailsIC">
                    ${cursosHTML}
                </div>
            </div>
            <div class="editAndDelet">
                <button class="addCurso" data-instituicao-id="${instituicao.id}">
                    <i class="ph ph-plus"></i>
                </button>
                <button class="editCard" data-instituicao-id="${instituicao.id}">
                    <i class="ph ph-pencil-simple"></i>
                </button>
                <button class="deletCard" data-instituicao-id="${instituicao.id}">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        `;

        containerCards.appendChild(card);
    });
    document.dispatchEvent(new CustomEvent('cardsInstituicoesRenderizados'));
}

/**
 * Renderiza os cards de cursos na interface
 */
function renderizarCardsCursos() {
    console.log("🎨 Renderizando cards de cursos...");

    const containerCards = document.querySelector("#cursosBody .cardsCreateIdt");
    const cardVazio = document.querySelector("#cursosBody .cardIdt");

    if (!containerCards) {
        console.error("❌ Container de cards de cursos não encontrado!");
        return;
    }

    // Limpa os cards existentes
    containerCards.innerHTML = "";

    if (AppState.cursos.length === 0) {
        // Mostra o card vazio
        mostrarCardVazioCursos();
        return;
    }

    // Esconde o card vazio
    if (cardVazio) {
        const iconIdt = cardVazio.querySelector('.iconIdt');
        const h3 = cardVazio.querySelector('h3');
        const p = cardVazio.querySelector('p');

        if (iconIdt) iconIdt.style.display = "none";
        if (h3) h3.style.display = "none";
        if (p) p.style.display = "none";

        cardVazio.style.border = "none";
        cardVazio.style.height = "0";
        cardVazio.style.padding = "0";
        cardVazio.style.overflow = "visible";

        const modal = cardVazio.querySelector('.createIdt');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    containerCards.style.display = "grid";
    containerCards.style.opacity = "1";
    containerCards.style.pointerEvents = "all";

    // Cria um card para cada curso
    AppState.cursos.forEach(curso => {
        const card = document.createElement("div");
        card.className = "contentCardIdt";
        card.setAttribute("data-id", curso.id);
        card.setAttribute("data-instituicao-id", curso.fk_id_instituicao);

        // Monta a lista de disciplinas
        let disciplinasHTML = "";
        if (curso.disciplinas && curso.disciplinas.length > 0) {
            disciplinasHTML = curso.disciplinas.map(disciplina =>
                `<div class="linkDatailsIdt" style="display: inline-block;">${disciplina.nome || disciplina}</div>`
            ).join("");
        } else {
            disciplinasHTML = '<p style="font-size: 0.9rem; color: var(--grey); margin: 0;">Nenhuma disciplina cadastrada</p>';
        }

        card.innerHTML = `
            <i class="ph ph-books" id="cursosIcon"></i>
            <div class="textContentCardIdt">
                <h2>${curso.curso}</h2>
                <p style="font-size: 0.85rem; color: var(--color6); margin: 5px 0;">${get.getNomeInstituicaoPorId(curso.fk_id_instituicao)}</p>
                <div class="viewDetailsIC">
                    ${disciplinasHTML}
                </div>
            </div>
            <div class="editAndDelet">
                <button class="addCurso" data-curso-id="${curso.id}">
                    <i class="ph ph-plus"></i>
                </button>
                <button class="editCard" data-curso-id="${curso.id}">
                    <i class="ph ph-pencil-simple"></i>
                </button>
                <button class="deletCard" data-curso-id="${curso.id}">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        `;

        containerCards.appendChild(card);
    });

    console.log(`✅ ${AppState.cursos.length} cards de cursos renderizados`);

    // Dispara evento customizado para vincular eventos
    document.dispatchEvent(new CustomEvent('cardsCursosRenderizados'));
}

/**
 * Mostra o card vazio quando não há instituições
 */
function mostrarCardVazioInstituicoes() {
    const containerCards = document.querySelector("#instituicoesBody .cardsCreateIdt");
    const cardVazio = document.querySelector("#instituicoesBody .cardIdt");

    if (containerCards) {
        containerCards.style.display = "none";
        containerCards.style.opacity = "0";
        containerCards.style.pointerEvents = "none";
    }

    if (cardVazio) {
        // Restaura a visibilidade do card vazio
        const iconIdt = cardVazio.querySelector('.iconIdt');
        const h3 = cardVazio.querySelector('h3');
        const p = cardVazio.querySelector('p');

        if (iconIdt) iconIdt.style.display = "flex";
        if (h3) h3.style.display = "block";
        if (p) p.style.display = "block";

        cardVazio.style.display = "flex";
        cardVazio.style.border = "1px dashed var(--lightgrey)";
        cardVazio.style.borderWidth = "2px";
        cardVazio.style.height = "250px";
        cardVazio.style.padding = "";

        // Garante que o modal dentro do cardVazio está fechado
        const modal = cardVazio.querySelector('.createIdt');
        if (modal) {
            modal.classList.remove('show');
        }
    }
}

/**
 * Mostra o card vazio quando não há cursos
 */
function mostrarCardVazioCursos() {
    const containerCards = document.querySelector("#cursosBody .cardsCreateIdt");
    const cardVazio = document.querySelector("#cursosBody .cardIdt");

    if (containerCards) {
        containerCards.style.display = "none";
        containerCards.style.opacity = "0";
        containerCards.style.pointerEvents = "none";
    }

    if (cardVazio) {
        const iconIdt = cardVazio.querySelector('.iconIdt');
        const h3 = cardVazio.querySelector('h3');
        const p = cardVazio.querySelector('p');

        if (iconIdt) iconIdt.style.display = "flex";
        if (h3) h3.style.display = "block";
        if (p) p.style.display = "block";

        cardVazio.style.display = "flex";
        cardVazio.style.border = "1px dashed var(--lightgrey)";
        cardVazio.style.borderWidth = "2px";
        cardVazio.style.height = "250px";
        cardVazio.style.padding = "";

        const modal = cardVazio.querySelector('.createIdt');
        if (modal) {
            modal.classList.remove('show');
        }
    }
}

/**
 * Cria o HTML de um card de instituição (função auxiliar)
 */
function criarCardInstituicao(instituicao) {
    const card = document.createElement("div");
    card.className = "contentCardIdt";
    card.setAttribute("data-id", instituicao.id);

    // Monta a lista de cursos
    let cursosHTML = "";
    if (instituicao.cursos && instituicao.cursos.length > 0) {
        cursosHTML = instituicao.cursos.map(curso =>
            `<div class="linkDatailsIdt" style="display: inline-block;">${curso}</div>`
        ).join("");
    } else {
        cursosHTML = '<p style="font-size: 0.9rem; color: var(--grey); margin: 0;">Nenhum curso cadastrado</p>';
    }

    card.innerHTML = `
        <i class="ph ph-buildings"></i>
        <div class="textContentCardIdt">
            <h2>${instituicao.nome}</h2>
            <div class="viewDetailsIC">
                ${cursosHTML}
            </div>
        </div>
        <div class="editAndDelet">
            <button class="addCurso" data-instituicao-id="${instituicao.id}">
                <i class="ph ph-plus"></i>
            </button>
            <button class="editCard" data-instituicao-id="${instituicao.id}">
                <i class="ph ph-pencil-simple"></i>
            </button>
            <button class="deletCard" data-instituicao-id="${instituicao.id}">
                <i class="ph ph-trash"></i>
            </button>
        </div>
    `;

    return card;
}

/**
 * Atualiza a visualização principal do Dashboard (atividades recentes)
 */
function atualizarDashboardView() {
    console.log("🔄 Atualizando visualização do Dashboard...");

    const viewVazia = document.querySelector('.viewTurmaInstituicao');
    const viewPreenchida = document.querySelector('.recentActivityDashboard');
    const listaInstituicoesEl = document.getElementById('recentInstituicoesList');
    const listaTurmasEl = document.getElementById('recentTurmasList');

    if (!viewVazia || !viewPreenchida || !listaInstituicoesEl || !listaTurmasEl) {
        console.error("❌ Elementos do dashboard não encontrados!");
        return;
    }

    const instituicoes = AppState.instituicoes || [];
    const turmas = AppState.turmas || [];

    console.log("📊 Dashboard - Instituições:", instituicoes.length, "| Turmas:", turmas.length);

    if (instituicoes.length === 0) {
        viewVazia.style.display = 'flex';
        viewPreenchida.style.display = 'none';
        console.log("✅ Dashboard em modo vazio");
    } else {
        viewVazia.style.display = 'none';
        viewPreenchida.style.display = 'grid';
        console.log("✅ Dashboard em modo preenchido");

        // Preencher Instituições
        listaInstituicoesEl.innerHTML = "";
        const maxInst = Math.min(instituicoes.length, 3);

        for (let i = 0; i < maxInst; i++) {
            const inst = instituicoes[i];

            console.log("🏢 Instituição:", inst.nome, "Cursos:", inst.cursos);

            const cursosTexto = inst.cursos && inst.cursos.length > 0
                ? inst.cursos.join(', ')
                : "Nenhum curso cadastrado";

            listaInstituicoesEl.innerHTML += `
                <div class="recentItem">
                    <h4>${inst.nome}</h4>
                    <p>${cursosTexto}</p>
                </div>
            `;
        }

        // Preencher Turmas
        listaTurmasEl.innerHTML = "";

        if (!turmas || turmas.length === 0) {
            listaTurmasEl.innerHTML = `
                <div style="text-align: center; padding: 30px; color: var(--color6);">
                    <p>Nenhuma turma ativa encontrada</p>
                </div>
            `;
        } else {
            const maxTurmas = Math.min(turmas.length, 3);

            for (let i = 0; i < maxTurmas; i++) {
                const turma = turmas[i];
                const nome = turma.nome_turma || turma.nome || "Turma sem nome";
                const periodo = turma.periodo || "Período não definido";

                listaTurmasEl.innerHTML += `
                    <div class="recentItem">
                        <h4>${nome}</h4>
                        <p>${periodo}</p>
                    </div>
                `;
            }
        }

        console.log(`✅ Dashboard atualizado com sucesso`);
    }
}

/**
 * Atualiza o contador visual de instituições no dashboard
 */
function atualizarContadorInstituicoes(quantidade) {
    const instituicoesCounter = document.querySelector("#instituicoes .titleOptionDashboard p");
    if (instituicoesCounter) {
        instituicoesCounter.textContent = quantidade;
        console.log("📊 Contador de Instituições atualizado:", quantidade);
    }
}

/**
 * Atualiza o contador visual de cursos no dashboard
 */
function atualizarContadorCursos(quantidade) {
    const counter = document.querySelector("#cursos .titleOptionDashboard p");
    if (counter) {
        counter.textContent = quantidade;
        console.log("📊 Contador de Cursos atualizado:", quantidade);
    }
}

/**
 * Atualiza o contador visual de turmas no dashboard
 */
function atualizarContadorTurmas(quantidade) {
    const counter = document.querySelector("#turmas .titleOptionDashboard p");
    if (counter) {
        counter.textContent = quantidade;
        console.log("📊 Contador de Turmas atualizado:", quantidade);
    }
}

// ============================================
// 3. FUNÇÕES DE CARREGAMENTO DE DADOS (READ)
// (Funções que buscam dados do DB e atualizam o AppState)
// ============================================

/**
 * Carrega instituições do banco de dados. (Ponto de entrada principal)
 */
function carregarInstituicoesFromDB() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || !usuarioLogado.id) {
        console.error("❌ Usuário não autenticado");
        mostrarAlerta("Erro: Usuário não autenticado. Faça login novamente.", "erro");
        return;
    }
    const id_docente = usuarioLogado.id;
    mostrarLoader('mostrar');

    fetch(`/instituicao/all/${id_docente}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(res => res.json())
        .then(dados => {
            console.log("📦 Dados recebidos (Instituições):", dados);
            let instituicoes = (Array.isArray(dados)) ? dados : (dados.instituicoes || []);

            if (instituicoes.length === 0) {
                console.log("⚠️ Nenhuma instituição foi cadastrada");
                AppState.instituicoes = [];
                mostrarAlerta("Cadastre uma instituição!", "aviso");
                atualizarContadorInstituicoes(0);

                // Mostra o card vazio
                mostrarCardVazioInstituicoes();

                mostrarLoader('esconder');
            } else {
                // ✅ SALVA INSTITUIÇÕES SEM CURSOS (serão vinculados depois)
                AppState.instituicoes = instituicoes.map(inst => ({
                    id: inst.id.toString(),
                    nome: inst.nome,
                    cursos: [] // Inicializa vazio
                }));

                console.log("✅ Instituições carregadas:", AppState.instituicoes);
                atualizarContadorInstituicoes(AppState.instituicoes.length);

                // Carrega cursos (que vai vincular às instituições e renderizar cards)
                carregarCursosFromDB();
            }
        })
        .catch(err => {
            console.error("❌ Erro ao carregar instituições:", err);
            mostrarAlerta("Erro ao carregar instituições do banco de dados.", "erro");
            mostrarLoader('esconder');
        });
}

/**
 * Carrega todos os cursos de todas as instituições do usuário.
 */
function carregarCursosFromDB() {
    const instituicoes = AppState.instituicoes;
    if (!instituicoes || instituicoes.length === 0) {
        console.log("ℹ️ Nenhuma instituição carregada. Pulando carregamento de Cursos.");
        AppState.cursos = [];
        atualizarContadorCursos(0);
        renderizarCardsCursos();
        carregarTurmasFromDB();
        return;
    }

    const idsInstituicoes = instituicoes.map(inst => inst.id);
    console.log("🔍 Buscando cursos para instituições:", idsInstituicoes);

    const fetchCursosPromises = idsInstituicoes.map((id, index) => {
        console.log(`📡 Fazendo requisição para /curso/all/${id}`);
        return fetch(`/curso/all/${id}`)
            .then(res => res.json())
            .then(data => {
                console.log(`📦 Resposta da API para instituição ${id}:`, data);
                return { instituicaoId: id, data };
            });
    });

    Promise.all(fetchCursosPromises)
        .then(resultados => {
            // Processa cada resultado mantendo o ID da instituição
            const todosCursos = resultados.flatMap(({ instituicaoId, data }) => {
                const cursos = data.cursos || [];
                // GARANTE que cada curso tenha o fk_id_instituicao
                return cursos.map(curso => ({
                    ...curso, // ... (spread operator) é basicamente um operador que da um push dos elementos de um array para outro
                    fk_id_instituicao: curso.fk_id_instituicao || instituicaoId
                }));
            });

            console.log("📚 Todos os cursos recebidos:", todosCursos);

            if (todosCursos.length === 0) {
                console.log("⚠️ Nenhum curso cadastrado");
                AppState.cursos = [];
                mostrarAlerta("Cadastre um curso!", "aviso");
            } else {
                // ✅ SALVA CURSOS COM FK_ID_INSTITUICAO GARANTIDO
                AppState.cursos = todosCursos.map(curso => {
                    const cursoFormatado = {
                        id: curso.id.toString(),
                        fk_id_instituicao: curso.fk_id_instituicao ? curso.fk_id_instituicao.toString() : null,
                        nome: curso.nome_instituicao || curso.instituicao || "",
                        curso: curso.nome || curso.nome_curso || "",
                        disciplinas: curso.disciplinas || []
                    };
                    console.log("📝 Curso formatado:", cursoFormatado);
                    return cursoFormatado;
                });
                console.log("✅ AppState.cursos atualizado:", AppState.cursos);

                // VINCULA OS CURSOS ÀS INSTITUIÇÕES
                vincularCursosNasInstituicoes(); //usado somente para renderizar os cards
            }
            vincularCursosNasInstituicoes()//mesmo não tendo cursos para vincular, precisa renderizar os cards
            renderizarCardsCursos();

            atualizarContadorCursos(AppState.cursos.length);
            atualizarDashboardView(); // Atualiza dashboard com cursos vinculados
            carregarTurmasFromDB();
        })
        .catch(err => {
            console.error("❌ Erro ao carregar cursos:", err);
            mostrarAlerta("Erro ao carregar cursos do banco de dados.", "erro");
            mostrarLoader('esconder');
        });
}

/**
 * Carrega todas as turmas de todos os cursos do usuário.
 */
function carregarTurmasFromDB() {
    const cursos = AppState.cursos;
    if (!cursos || cursos.length === 0) {
        console.log("ℹ️ Nenhum curso carregado. Pulando carregamento de Turmas.");
        AppState.turmas = [];
        atualizarContadorTurmas(0);
        atualizarDashboardView();
        mostrarLoader('esconder');
        return;
    }

    const idsCursos = cursos.map(curso => curso.id);

    const fetchTurmasPromises = idsCursos.map(id =>
        fetch(`/turma/all/${id}`).then(res => res.json())
    );

    Promise.all(fetchTurmasPromises)
        .then(resultados => {
            const todasTurmas = resultados.flatMap(resultado => resultado.turmas || []);

            if (todasTurmas.length === 0) {
                console.log("⚠️ Nenhuma turma cadastrada");
                AppState.turmas = [];
                mostrarAlerta("Cadastre uma turma!", "aviso");
            } else {
                AppState.turmas = todasTurmas.map(turma => ({
                    id: turma.id.toString(),
                    nome_turma: turma.nome || "Nome Turma",
                    periodo: turma.periodo ? `${turma.periodo}° Semestre` : "Período não definido",
                    fk_id_curso: turma.fk_id_curso
                }));
                console.log("✅ Turmas formatadas:", AppState.turmas);
            }

            atualizarContadorTurmas(AppState.turmas.length);
            atualizarDashboardView();
            mostrarLoader('esconder');
        })
        .catch(err => {
            console.error("❌ Erro ao carregar turmas:", err);
            mostrarLoader('esconder');
        });
}

// ============================================
// 4. FUNÇÕES DE CRIAÇÃO DE DADOS (CREATE)
// (Funções que salvam novos dados no DB)
// ============================================

/**
 * Salva nova instituição E o primeiro curso no banco de dados
 */
function salvarInstituicao() {
    const modal = document.querySelector("#instituicoesBody .createIdt");
    const inputNomeInstituicao = modal.querySelector("#nomeDaInstituicao");
    const inputNomeCurso = modal.querySelector("#nomeDoCurso");

    if (!modal || !inputNomeInstituicao || !inputNomeCurso) {
        console.error("❌ Elementos do modal de instituição não encontrados!");
        return;
    }

    const nomeInstituicao = inputNomeInstituicao.value.trim();
    const nomeCurso = inputNomeCurso.value.trim();

    // 1. VALIDAÇÃO: Nome da Instituição
    if (nomeInstituicao === "") {
        mostrarAlerta("Preencha o campo \"Nome da Instituição\"", "aviso");
        return;
    }

    // 2. NOVA VALIDAÇÃO: Curso Obrigatório
    if (nomeCurso === "") {
        mostrarAlerta("É obrigatório preencher o campo \"Nome do Curso\".", "aviso");
        return;
    }

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || !usuarioLogado.id) {
        mostrarAlerta("Erro: Usuário não autenticado. Faça login novamente.", "erro");
        return;
    }

    const id_docente = usuarioLogado.id;
    mostrarLoader("mostrar");

    // LOG: Dados que serão enviados na verificação
    console.log("📤 Verificando instituição:", {
        nome: nomeInstituicao,
        id_docente: id_docente
    });

    fetch("/instituicao/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome: nomeInstituicao,
            id_docente: id_docente
        })
    })
        .then(res => {
            console.log("📥 Status verificação:", res.status);
            return res.json();
        })
        .then(data => {
            console.log("📥 Resposta verificação:", data);

            if (!data.sucesso) {
                mostrarAlerta("Instituição já possui cadastro!", "aviso");
                throw new Error("Instituição duplicada");
            }

            console.log("✅ Instituição e Curso disponíveis para cadastro");

            console.log("📤 Enviando cadastro:", {
                nomeInstituicao: nomeInstituicao,
                nomeCurso: nomeCurso,
                id_docente: id_docente
            });

            return fetch("/instituicao/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nomeInstituicao: nomeInstituicao,
                    nomeCurso: nomeCurso,
                    id_docente: id_docente
                })
            });
        })
        .then(resCadastro => {
            console.log("📥 Status cadastro:", resCadastro.status);

            // Verifica se o status é 400
            if (resCadastro.status === 400) {
                return resCadastro.json().then(errData => {
                    console.error("❌ Erro 400 - Dados retornados:", errData);
                    throw new Error(`Erro 400: ${errData.mensagem || 'Dados inválidos'}`);
                });
            }

            return resCadastro.json();
        })
        .then(dados => {
            console.log("📥 Resposta cadastro:", dados);

            if (dados.sucesso) {
                mostrarAlerta("Cadastro realizado com sucesso", "sucesso");

                // Limpa os inputs
                inputNomeInstituicao.value = "";
                inputNomeCurso.value = "";

                modal.classList.remove("show");

                // Recarrega o AppState completo
                carregarInstituicoesFromDB();
            } else {
                mostrarAlerta(dados.mensagem || "Erro ao realizar o cadastro!", "erro");
            }
            mostrarLoader('esconder');
        })
        .catch(err => {
            console.error("❌ Erro completo:", err);

            if (err.message !== "Instituição duplicada") {
                mostrarAlerta(err.message || "Ocorreu um erro. Verifique o console.", "erro");
            }
            mostrarLoader('esconder');
        });
}

/**
 * Salva um novo curso (vinculado a uma instituição existente) no DB.
 */
function salvarCurso() {
    const modal = document.querySelector("#cursosBody .createIdt");
    if (!modal) {
        console.error("Modal não encontrado!");
        return;
    }

    const selectInstituicao = modal.querySelector("#instituicao");
    const inputNomeCurso = modal.querySelector("#nomeDoCurso");

    if (!selectInstituicao || !inputNomeCurso) {
        console.error("Inputs não encontrados!");
        return;
    }

    // Preenche o select com as instituições do AppState
    if (selectInstituicao.options.length <= 1) { // Se só tem a opção padrão ou está vazio
        selectInstituicao.innerHTML = '<option value="" disabled selected>Selecione a instituição</option>';

        AppState.instituicoes.forEach(inst => {
            const option = document.createElement("option");
            option.value = inst.id; // Usa o ID como value
            option.textContent = inst.nome;
            selectInstituicao.appendChild(option);
        });
    }

    const idInstituicao = selectInstituicao.value.trim();
    const nomeCurso = inputNomeCurso.value.trim();

    // Validações
    if (idInstituicao === "") {
        mostrarAlerta("Selecione uma instituição", "aviso");
        return;
    }

    if (nomeCurso === "") {
        mostrarAlerta("Preencha o campo \"Nome do Curso\"", "aviso");
        return;
    }

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || !usuarioLogado.id) {
        mostrarAlerta("Erro: Usuário não autenticado. Faça login novamente.", "erro");
        return;
    }

    const fk_id_instituicao = parseInt(idInstituicao);
    console.log("🏢 Instituição selecionada ID:", fk_id_instituicao);

    mostrarLoader("mostrar");

    // Verifica se já existe
    fetch("/curso/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fk_id_instituicao: fk_id_instituicao,
            nome: nomeCurso
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                // Pode cadastrar
                return fetch("/curso/cadastro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fk_id_instituicao: fk_id_instituicao,
                        nome: nomeCurso
                    })
                });
            } else {
                mostrarLoader('esconder');
                mostrarAlerta("Este curso já está cadastrado nesta instituição!", "aviso");
                throw new Error("Curso duplicado");
            }
        })
        .then(res => res.json())
        .then(dados => {
            if (dados.sucesso) {
                mostrarLoader('esconder');
                mostrarAlerta("Curso cadastrado com sucesso!", "sucesso");

                selectInstituicao.value = "";
                inputNomeCurso.value = "";
                modal.classList.remove("show");

                // Recarrega tudo para atualizar os vínculos
                carregarInstituicoesFromDB();
            } else {
                mostrarLoader('esconder');
                mostrarAlerta("Erro ao cadastrar o curso!", "erro");
            }
        })
        .catch(err => {
            if (err.message !== "Curso duplicado") {
                mostrarLoader('esconder');
                mostrarAlerta("Ocorreu um erro. Verifique o console.", "erro");
                console.error("Erro:", err);
            }
        });
}

/**
 * Salva uma nova disciplina (vinculada a um curso existente) no DB.
 */
function salvarDisciplina() {
    const modal = document.querySelector("#cursosBody .createIdt"); // ATENÇÃO: Verifique se este seletor está correto
    if (!modal) {
        console.error("Modal não encontrado!");
        return;
    }

    const inputCodigoDisciplina = modal.querySelector("#inputCodigoDisciplina");
    const inputNomeCurso = modal.querySelector("#cursoSelect");
    const inputNomeDisciplina = modal.querySelector("#inputNomeDisciplina");
    const inputPeriodo = modal.querySelector("periodoSelect"); // ATENÇÃO: Faltou o # ou .
    const inputSiglaDisciplina = modal.querySelector("#inputSiglaDisciplina");

    // ATENÇÃO: Verificação de inputs estava incorreta
    if (!inputCodigoDisciplina || !inputNomeCurso || !inputNomeDisciplina || !inputPeriodo || !inputSiglaDisciplina) {
        console.error("Inputs não encontrados! Verifique os IDs/Classes.", {
            inputCodigoDisciplina,
            inputNomeCurso,
            inputNomeDisciplina,
            inputPeriodo,
            inputSiglaDisciplina
        });
        return;
    }

    const codigoDisciplina = inputCodigoDisciplina.value.trim();
    const nomeCurso = inputNomeCurso.value.trim(); // Corrigido de cursoSelect.value
    const nomeDisciplina = inputNomeDisciplina.value.trim()
    const periodo = inputPeriodo.value.trim(); // Corrigido de periodoSelect.value
    const sigla = inputSiglaDisciplina.value.trim();

    if (nomeDisciplina === "") {
        mostrarAlerta("Preencha o campo \"Nome da Disciplina\"", "aviso");
        return;
    }

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || !usuarioLogado.id) {
        mostrarAlerta("Erro: Usuário não autenticado. Faça login novamente.", "erro");
        return;
    }

    // Busca o ID da instituição se foi selecionada
    let fk_id_curso = null;
    if (nomeCurso) {
        // ATENÇÃO: Buscando em 'disciplinaBody', deveria ser 'cursosBody'?
        const curso = JSON.parse(localStorage.getItem("cursosBody")) || []; // Corrigido para cursosBody
        const cursoEncontrada = curso.find(
            inst => inst.nome.toLowerCase() === nomeCurso.toLowerCase() // ATENÇÃO: inst.nome ou inst.curso?
        );

        if (cursoEncontrada) {
            fk_id_curso = parseInt(cursoEncontrada.id);
            console.log(fk_id_curso)
        } else {
            mostrarAlerta("Curso não encontrado. Selecione um curso válido.", "aviso");
            return;
        }
    }

    mostrarLoader("mostrar");

    // Verifica se já existe
    fetch("/disciplina/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome: nomeDisciplina,
            id_curso: fk_id_curso
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                // Pode cadastrar
                return fetch("/disciplina/cadastro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_curso: fk_id_curso,
                        nome: nomeDisciplina,
                        periodo: periodo,
                        sigla: sigla
                        // ATENÇÃO: Faltando 'codigoDisciplina'?
                    })
                });
            } else {
                mostrarLoader('esconder');
                mostrarAlerta("Esta disciplina já está cadastrada neste curso!", "aviso");
                throw new Error("Disciplina duplicada");
            }
        })
        .then(res => {
            return res.json();
        })
        .then(dados => {

            if (dados.sucesso) {
                mostrarLoader('esconder');
                mostrarAlerta("Disciplina cadastrada com sucesso!", "sucesso");

                // Limpa os inputs e fecha o modal
                inputCodigoDisciplina.value = "";
                inputNomeCurso.value = "";
                inputNomeDisciplina.value = "";
                inputPeriodo.value = "";
                inputSiglaDisciplina.value = "";
                modal.classList.remove("show");

                // Recarrega os cursos (para atualizar as disciplinas)
                carregarCursosFromDB(); 

            } else {
                mostrarLoader('esconder');
                mostrarAlerta("Erro ao cadastrar a disciplina!", "erro");
            }
        })
        .catch(err => {
            if (err.message !== "Disciplina duplicada") {
                mostrarLoader('esconder');
                mostrarAlerta("Ocorreu um erro. Verifique o console.", "erro");
                console.error("Erro:", err);
            }
        });
}

/**
 * Vincula um curso já existente a uma instituição (via modal "Adicionar Curso").
 */
function vincularCursoInstituicaoDB(idInstituicao, nomeCurso) {
    mostrarLoader("mostrar");

    // Verifica se já existe
    fetch("/curso/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fk_id_instituicao: idInstituicao,
            nome: nomeCurso
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                // Pode cadastrar
                return fetch("/curso/cadastro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fk_id_instituicao: idInstituicao,
                        nome: nomeCurso
                    })
                });
            } else {
                mostrarLoader('esconder');
                mostrarAlerta("Este curso já está cadastrado nesta instituição!", "aviso");
                throw new Error("Curso duplicado");
            }
        })
        .then(res => res.json())
        .then(dados => {
            if (dados.sucesso) {
                mostrarLoader('esconder');
                mostrarAlerta("Curso cadastrado com sucesso!", "sucesso");

                // ATENÇÃO: inputInstituicao, inputNomeCurso e modal não estão definidos neste escopo.
                // Esta função talvez devesse fechar o modal de *vincular*
                fecharModalAdicionarCurso(); 

                // Recarrega tudo para atualizar os vínculos
                carregarInstituicoesFromDB();
            } else {
                mostrarLoader('esconder');
                mostrarAlerta("Erro ao cadastrar o curso!", "erro");
            }
        })
        .catch(err => {
            if (err.message !== "Curso duplicado") {
                mostrarLoader('esconder');
                mostrarAlerta("Ocorreu um erro. Verifique o console.", "erro");
                console.error("Erro:", err);
            }
        });
}

// ============================================
// 5. FUNÇÕES DE EDIÇÃO DE DADOS (UPDATE)
// (Funções que atualizam dados existentes no DB - PLACEHOLDERS)
// ============================================

/**
 * Edita uma instituição (função placeholder)
 */
function editarInstituicao(id) {
    console.log("✏️ Editar instituição ID:", id);
    const instituicao = AppState.instituicoes.find(inst => inst.id == id);

    if (!instituicao) {
        mostrarAlerta("Instituição não encontrada!", "erro");
        return;
    }

    // Abre o modal de edição
    const modal = document.querySelector("#instituicoesBody .createIdt");
    const inputNome = document.querySelector("#nomeDaInstituicao");

    if (modal && inputNome) {
        inputNome.value = instituicao.nome;
        modal.classList.add("show");

        // Aqui você pode adicionar lógica para salvar a edição
        mostrarAlerta("Função de edição em desenvolvimento", "aviso");
    }
}

/**
 * Edita um curso (função placeholder)
 */
function editarCurso(id) {
    console.log("✏️ Editar curso ID:", id);
    const curso = AppState.cursos.find(c => c.id == id);

    if (!curso) {
        mostrarAlerta("Curso não encontrado!", "erro");
        return;
    }

    const modal = document.querySelector("#cursosBody .createIdt");
    const inputInstituicao = document.querySelector("#instituicao");
    const inputNomeCurso = document.querySelector("#nomeDoCurso");

    if (modal && inputInstituicao && inputNomeCurso) {
        // ATENÇÃO: O 'value' do select de instituição deve ser o ID
        inputInstituicao.value = curso.fk_id_instituicao; // Corrigido
        inputNomeCurso.value = curso.curso;
        modal.classList.add("show");

        mostrarAlerta("Função de edição em desenvolvimento", "aviso");
    }
}

// ============================================
// 6. FUNÇÕES DE DELEÇÃO DE DADOS (DELETE)
// (Funções que removem dados do DB)
// ============================================

/**
 * Deleta uma instituição do banco de dados
 */
function deletarInstituicaoDB(id) {
    console.log(`🗑️ Deletando instituição ID: ${id}`);
    mostrarLoader('mostrar');

    fetch("/instituicao/deletar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parseInt(id) })
    })
        .then(res => res.json())
        .then(dados => {
            console.log("✅ Resposta do servidor:", dados);

            if (dados.sucesso || dados.message) {
                mostrarAlerta("Instituição deletada com sucesso!", "sucesso");
                carregarInstituicoesFromDB();
            } else {
                throw new Error(dados.error || "Erro ao deletar");
            }
            mostrarLoader('esconder');
        })
        .catch(err => {
            console.error("❌ Erro ao deletar instituição:", err);
            mostrarAlerta("Erro ao deletar instituição do banco de dados.", "erro");
            mostrarLoader('esconder');
        });
}

/**
 * Deleta um curso do banco de dados
 */
function deletarCursoDB(id) {
    console.log(`🗑️ Deletando curso ID: ${id}`);
    mostrarLoader('mostrar');

    fetch("/curso/deletar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parseInt(id) })
    })
        .then(res => res.json())
        .then(dados => {
            console.log("✅ Resposta do servidor:", dados);

            if (dados.sucesso) {
                mostrarAlerta("Curso deletado com sucesso!", "sucesso");
                carregarInstituicoesFromDB();
            } else {
                throw new Error(dados.error || "Erro ao deletar");
            }
            mostrarLoader('esconder');
        })
        .catch(err => {
            console.error("❌ Erro ao deletar curso:", err);
            mostrarAlerta("Erro ao deletar curso do banco de dados.", "erro");
            mostrarLoader('esconder');
        });
}

// ============================================
// 7. GERENCIAMENTO DE MODAIS E UI AUXILIAR
// (Funções que controlam a abertura/fechamento de modais e preenchimento de selects)
// ============================================

/**
 * Abre modal para adicionar curso (na tela de Instituições)
 */
function abrirModalAdicionarCurso(idInstituicao) {
    console.log("➕ Adicionar curso à instituição ID:", idInstituicao);

    const instituicao = AppState.instituicoes.find(inst => inst.id == idInstituicao);

    if (!instituicao) {
        mostrarAlerta("Instituição não encontrada!", "erro");
        return;
    }

    // Abre o modal de adicionar curso
    const modalAdd = document.querySelector("#instituicoesBody .containerAddIdt");

    if (modalAdd) {
        modalAdd.style.display = "block";
        modalAdd.setAttribute("data-instituicao-id", idInstituicao);

        // Preenche o datalist com cursos disponíveis
        const datalist = document.getElementById("listCursosLink");
        if (datalist) {
            datalist.innerHTML = "";

            // Filtra cursos que NÃO pertencem a esta instituição
            const cursosDisponiveis = AppState.cursos.filter(
                curso => curso.fk_id_instituicao != idInstituicao
            );

            cursosDisponiveis.forEach(curso => {
                const option = document.createElement("option");
                option.value = curso.curso;
                option.setAttribute("data-curso-id", curso.id);
                datalist.appendChild(option);
            });
        }
    }
}

/**
 * Fecha modal de adicionar curso (na tela de Instituições)
 */
function fecharModalAdicionarCurso() {
    const modalAdd = document.querySelector("#instituicoesBody .containerAddIdt");
    if (modalAdd) {
        modalAdd.style.display = "none";
        modalAdd.removeAttribute("data-instituicao-id");
    }
}

/**
 * Abre modal para adicionar disciplina (na tela de Cursos)
 */
function abrirModalAdicionarDisciplina(idCurso) {
    console.log("➕ Adicionar disciplina ao curso ID:", idCurso);

    const curso = AppState.cursos.find(c => c.id == idCurso);

    if (!curso) {
        mostrarAlerta("Curso não encontrado!", "erro");
        return;
    }

    const modalAdd = document.querySelector("#cursosBody .containerAddIdt");

    if (modalAdd) {
        modalAdd.style.display = "block";
        modalAdd.setAttribute("data-curso-id", idCurso);

        // Aqui você pode preencher um datalist com disciplinas disponíveis
        const datalist = document.getElementById("listDisciplinasLink");
        if (datalist) {
            datalist.innerHTML = "";

            // Exemplo: preencher com disciplinas que não estão no curso
            // Você precisará ter um AppState.disciplinas ou buscar do servidor
        }
    }
}

/**
 * Fecha modal de adicionar disciplina (na tela de Cursos)
 */
function fecharModalAdicionarDisciplina() {
    const modalAdd = document.querySelector("#cursosBody .containerAddIdt");
    if (modalAdd) {
        modalAdd.style.display = "none";
        modalAdd.removeAttribute("data-curso-id");
    }
}

/**
 * Preenche o <select> de instituições no modal de Cursos
 */
function preencherSelectInstituicoes() {
    const selectInstituicao = document.querySelector("#cursosBody #instituicao");

    if (!selectInstituicao) {
        console.error("Select de instituições não encontrado!");
        return;
    }

    console.log("📝 Preenchendo select com", AppState.instituicoes.length, "instituições");

    // Limpa o select e adiciona a opção padrão
    selectInstituicao.innerHTML = '<option value="" disabled selected>Selecione a instituição</option>';

    // Adiciona cada instituição como uma option
    AppState.instituicoes.forEach(inst => {
        const option = document.createElement("option");
        option.value = inst.id; // Usa o ID como value
        option.textContent = inst.nome;
        selectInstituicao.appendChild(option);
    });

    console.log("✅ Select preenchido com sucesso!");
}

// ============================================
// 8. FUNÇÕES AUXILIARES E GETTERS DO ESTADO
// (Funções que leem o AppState ou manipulam o estado local)
// ============================================

/**
 * Módulo de funções "Get" para ler o AppState
 */
const get = (() => {

    /**
     * Retorna o nome da instituição pelo ID
     */
    function getNomeInstituicaoPorId(id) {
        const instituicao = AppState.instituicoes.find(inst => inst.id == id);
        return instituicao ? instituicao.nome : "Instituição não encontrada";
    }

    /**
     * Retorna o nome do curso pelo ID
     */
    function getNomeCursoPorId(id) {
        const curso = AppState.cursos.find(c => c.id == id);
        return curso ? curso.curso : "Curso não encontrado";
    }

    /**
     * Retorna o objeto completo da instituição pelo ID
     */
    function getInstituicaoPorId(id) {
        return AppState.instituicoes.find(inst => inst.id == id) || null;
    }

    /**
     * Retorna o objeto completo do curso pelo ID
     */
    function getCursoPorId(id) {
        return AppState.cursos.find(c => c.id == id) || null;
    }

    /**
     * Retorna todos os cursos de uma instituição específica
     */
    function getCursosPorInstituicao(idInstituicao) {
        return AppState.cursos.filter(curso => curso.fk_id_instituicao == idInstituicao);
    }

    /**
     * Retorna o nome da instituição de um curso específico
     */
    function getNomeInstituicaoDoCurso(idCurso) {
        const curso = AppState.cursos.find(c => c.id == idCurso);
        if (!curso) return "Instituição não encontrada";

        return getNomeInstituicaoPorId(curso.fk_id_instituicao);
    }

    return {
        getNomeInstituicaoPorId,
        getNomeCursoPorId,
        getInstituicaoPorId,
        getCursoPorId,
        getCursosPorInstituicao,
        getNomeInstituicaoDoCurso
    };
})();

/**
 * Vincula cursos às instituições no AppState (LOCALMENTE)
 * Usado para renderizar os cards de instituições com seus cursos.
 */
function vincularCursosNasInstituicoes() {

    AppState.instituicoes = AppState.instituicoes.map(inst => {

        // Filtra cursos que pertencem a esta instituição
        const cursosDaInstituicao = AppState.cursos.filter(curso => {

            const pertence = curso.fk_id_instituicao == inst.id;

            if (pertence) {
                console.log(`   ✅ Curso "${curso.curso}" VINCULADO à "${inst.nome}"`);
            }
            return pertence;
        });

        console.log(`📚 Total de cursos encontrados para "${inst.nome}": ${cursosDaInstituicao.length}`);

        return {
            ...inst,
            cursos: cursosDaInstituicao.map(c => c.curso)
        };
    });

    console.log("\n✅ Instituições com cursos vinculados:", AppState.instituicoes);

    // ✅ RENDERIZA OS CARDS DE INSTITUIÇÕES NA INTERFACE
    renderizarCardsInstituicoes();
}

// ============================================
// 9. INICIALIZAÇÃO DA APLICAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("🔧 Configurando integração com banco de dados...");

    // CADEIA DE CARREGAMENTO:
    // 1. carregarInstituicoesFromDB() → carrega instituições
    // 2. carregarCursosFromDB() → carrega cursos
    // 3. vincularCursosNasInstituicoes() → vincula cursos às instituições
    // 4. renderizarCardsInstituicoes() → renderiza os cards na interface
    // 5. carregarTurmasFromDB() → carrega turmas
    // 6. mostrarLoader('esconder') → finaliza

    carregarInstituicoesFromDB();
});