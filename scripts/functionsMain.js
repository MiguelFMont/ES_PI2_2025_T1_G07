// ============================================
// 1. ESTADO DA APLICAÇÃO (CACHE EM MEMÓRIA)
// ============================================
const AppState = {
    instituicoes: [],
    cursos: [],
    disciplinas: [],
    turmas: []
};

const EdicaoState = {
    cursosParaAdicionar: [],
    cursosParaDeletar: [],
    instituicaoOriginal: null,
};

const EdicaoStateCurso = {
    disciplinasParaAdicionar: [],
    disciplinasParaDeletar: [],
    cursoOriginal: null,
};

const EdicaoStateDisciplina = {
    disciplinaOriginal: null,
};

const EdicaoStateTurma = {
    turmaOriginal: null,
};

// ============================================
// 2. FUNÇÕES DE RENDERIZAÇÃO E ATUALIZAÇÃO DA UI
// (Funções que manipulam o DOM para exibir dados)
// ============================================

/**
 * Renderiza os cards de instituições na interface (OTIMIZADO)
 */
function renderizarCardsInstituicoes() {
    console.log("🎨 Renderizando cards de instituições...");

    const containerCards = document.querySelector("#instituicoesBody .cardsCreateIdt");
    const cardVazio = document.querySelector("#instituicoesBody .cardIdt");

    if (!containerCards) {
        console.error("❌ Container de cards não encontrado!");
        return;
    }

    containerCards.innerHTML = "";

    if (AppState.instituicoes.length === 0) {
        mostrarCardVazioInstituicoes();
        return;
    }

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

    // ✅ OTIMIZAÇÃO: Cria um fragmento
    const fragmento = document.createDocumentFragment();

    AppState.instituicoes.forEach(instituicao => {
        const card = document.createElement("div");
        card.className = "contentCardIdt";
        card.setAttribute("data-id", instituicao.id);

        let cursosHTML = "";
        if (instituicao.cursos && instituicao.cursos.length > 0) {
            cursosHTML = instituicao.cursos.map(curso =>
                `<div class="linkDatailsIdt" style="display: inline-block;">${curso}</div>`
            ).join("");
        } else {
            cursosHTML = '<p style="font-size: 0.9rem; color: var(--grey); margin: 0;">Nenhum curso cadastrado</p>';
        }

        // ✅ OTIMIZAÇÃO: Removidos data-ids dos botões
        card.innerHTML = `
            <i class="ph ph-buildings"></i>
            <div class="textContentCardIdt">
                <h2>${instituicao.nome}</h2>
                <div class="viewDetailsIC">
                    ${cursosHTML}
                </div>
            </div>
            <div class="editAndDelet">
                <button class="addCurso">
                    <i class="ph ph-plus"></i>
                </button>
                <button class="editCard">
                    <i class="ph ph-pencil-simple"></i>
                </button>
                <button class="deletCard">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        `;

        // ✅ OTIMIZAÇÃO: Adiciona ao fragmento
        fragmento.appendChild(card);
    });

    // ✅ OTIMIZAÇÃO: Adiciona ao DOM de uma vez
    containerCards.appendChild(fragmento);
}

/**
 * Renderiza os cards de cursos na interface (OTIMIZADO)
 */
function renderizarCardsCursos() {
    console.log("🎨 Renderizando cards de cursos...");

    const containerCards = document.querySelector("#cursosBody .cardsCreateIdt");
    const cardVazio = document.querySelector("#cursosBody .cardIdt");

    if (!containerCards) {
        console.error("❌ Container de cards de cursos não encontrado!");
        return;
    }

    containerCards.innerHTML = "";

    if (AppState.cursos.length === 0) {
        mostrarCardVazioCursos();
        return;
    }

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

    const fragmento = document.createDocumentFragment();

    AppState.cursos.forEach(curso => {
        const card = document.createElement("div");
        card.className = "contentCardIdt";
        card.setAttribute("data-id", curso.id);
        card.setAttribute("data-instituicao-id", curso.fk_id_instituicao);

        let disciplinasHTML = "";
        if (curso.disciplinas && curso.disciplinas.length > 0) {
            disciplinasHTML = curso.disciplinas.map(disciplina =>
                `<div class="linkDatailsIdt" style="display: inline-block;">${disciplina.nome || disciplina}</div>`
            ).join("");
        } else {
            disciplinasHTML = '<p style="font-size: 0.9rem; color: var(--grey); margin: 0;">Nenhuma disciplina cadastrada</p>';
        }

        // ✅ OTIMIZAÇÃO: Removidos data-ids dos botões
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
                <button class="addCurso">
                    <i class="ph ph-plus"></i>
                </button>
                <button class="editCard">
                    <i class="ph ph-pencil-simple"></i>
                </button>
                <button class="deletCard">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        `;

        fragmento.appendChild(card);
    });

    containerCards.appendChild(fragmento);
}

/**
 * Renderiza os cards de disciplinas na interface (OTIMIZADO)
 */
function renderizarCardsDisciplinas() {
    console.log("🎨 Renderizando cards de disciplinas...");

    const containerCards = document.querySelector("#disciplinasBody .cardsCreateIdt");
    const cardVazio = document.querySelector("#disciplinasBody .cardIdt");

    if (!containerCards) {
        console.error("❌ Container de cards de disciplinas não encontrado!");
        return;
    }

    containerCards.innerHTML = "";
    const todasDisciplinas = AppState.disciplinas || [];
    console.log(`📚 Total de disciplinas no AppState: ${todasDisciplinas.length}`);
    atualizarContadorDisciplinas(todasDisciplinas.length);

    if (todasDisciplinas.length === 0) {
        mostrarCardVazioDisciplinas();
        return;
    }

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

    // ✅ OTIMIZAÇÃO: Cria um fragmento
    const fragmento = document.createDocumentFragment();

    todasDisciplinas.forEach(disciplina => {
        const curso = AppState.cursos.find(c => c.id == disciplina.id_curso);
        const nomeCurso = curso ? curso.curso : "Curso não encontrado";
        const nomeInstituicao = curso ? get.getNomeInstituicaoPorId(curso.fk_id_instituicao) : "Instituição não encontrada";

        const card = document.createElement("div");
        card.className = "contentCardIdt";
        card.setAttribute("data-codigo", disciplina.codigo);
        card.setAttribute("data-curso-id", disciplina.id_curso);

        // ✅ OTIMIZAÇÃO: Removidos data-ids dos botões
        card.innerHTML = `
            <i class="ph ph-book-open" id="disciplinasIcon"></i>
            <div class="textContentCardIdt">
                <h2>${disciplina.nome}</h2>
                <p style="font-size: 0.85rem; color: var(--color6); margin: 5px 0;">
                    ${nomeCurso} - ${nomeInstituicao}
                </p>
                <div class="viewDetails">
                    <div class="code">${disciplina.codigo || 'N/A'}</div>
                    <div class="acronym">${disciplina.sigla || 'N/A'}</div>
                    <div class="period">${disciplina.periodo || '?'}°</div>
                </div>
            </div>
            <div class="editAndDelet">
                <button class="editCard">
                    <i class="ph ph-pencil-simple"></i>
                </button>
                <button class="deletCard">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        `;
        
        // ✅ OTIMIZAÇÃO: Adiciona ao fragmento
        fragmento.appendChild(card);
    });

    console.log(`✅ ${todasDisciplinas.length} cards de disciplinas renderizados`);
    
    // ✅ OTIMIZAÇÃO: Adiciona ao DOM de uma vez
    containerCards.appendChild(fragmento);
    
    // ❌ REMOVIDO: Evento 'cardsDisciplinasRenderizados'
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
 * Mostra o card vazio quando não há disciplinas
 */
function mostrarCardVazioDisciplinas() {
    const containerCards = document.querySelector("#disciplinasBody .cardsCreateIdt");
    const cardVazio = document.querySelector("#disciplinasBody .cardIdt");

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
 * Renderiza os cards de turmas na interface
 */
function renderizarCardsTurmas() {
    console.log("🎨 Renderizando cards de turmas...");
    // ... Sua lógica de renderização de turmas (com DocumentFragment) ...

    // Dispara evento customizado (se o main.js ainda depender dele)
    document.dispatchEvent(new CustomEvent('cardsTurmasRenderizados'));
    console.log(`✅ Evento de turmas disparado`);
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

    if (instituicoes.length === 0) {
        viewVazia.style.display = 'flex';
        viewPreenchida.style.display = 'none';
    } else {
        viewVazia.style.display = 'none';
        viewPreenchida.style.display = 'grid';

        // Preencher Instituições
        listaInstituicoesEl.innerHTML = "";
        const maxInst = Math.min(instituicoes.length, 3);
        for (let i = 0; i < maxInst; i++) {
            const inst = instituicoes[i];
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
    }
    console.log(`✅ Dashboard atualizado`);
}

/**
 * Atualiza o contador visual de instituições no dashboard
 */
function atualizarContadorInstituicoes(quantidade) {
    const instituicoesCounter = document.querySelector("#instituicoes .titleOptionDashboard p");
    if (instituicoesCounter) {
        instituicoesCounter.textContent = quantidade;
    }
}

/**
 * Atualiza o contador visual de cursos no dashboard
 */
function atualizarContadorCursos(quantidade) {
    const counter = document.querySelector("#cursos .titleOptionDashboard p");
    if (counter) {
        counter.textContent = quantidade;
    }
}

/**
 * Atualiza o contador visual de disciplinas no dashboard
 */
function atualizarContadorDisciplinas(quantidade) {
    const counter = document.querySelector("#disciplinas .titleOptionDashboard p");
    if (counter) {
        counter.textContent = quantidade;
    }
}

/**
 * Atualiza o contador visual de turmas no dashboard
 */
function atualizarContadorTurmas(quantidade) {
    const counter = document.querySelector("#turmas .titleOptionDashboard p");
    if (counter) {
        counter.textContent = quantidade;
    }
}

// ============================================
// 3. FUNÇÕES DE CARREGAMENTO DE DADOS (READ)
// (Funções que buscam dados do DB e atualizam o AppState)
// ============================================

/**
 * Carrega instituições (MODIFICADO)
 * Agora é async e retorna uma Promise. Não chama mais 'carregarCursos' ou 'renderizar'.
 */
async function carregarInstituicoesFromDB() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || !usuarioLogado.id) {
        console.error("❌ Usuário não autenticado");
        return Promise.reject(new Error("Usuário não autenticado"));
    }
    const id_docente = usuarioLogado.id;
    
    // ✅ MODIFICADO: Retorna o fetch (Promise)
    return fetch(`/instituicao/all/${id_docente}`, {
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
            AppState.cursos = [];
            AppState.disciplinas = [];
        } else {
            AppState.instituicoes = instituicoes.map(inst => ({
                id: inst.id.toString(),
                nome: inst.nome,
                cursos: [] 
            }));
            console.log("✅ Instituições carregadas:", AppState.instituicoes);
        }
        atualizarContadorInstituicoes(AppState.instituicoes.length);
        
        // ❌ REMOVIDO: Chamadas de renderização e carregamento em cadeia
    })
    .catch(err => {
        console.error("❌ Erro ao carregar instituições:", err);
        mostrarAlerta("Erro ao carregar instituições do banco de dados.", "erro");
        throw err; // Re-lança o erro
    });
}

/**
 * Carrega cursos (MODIFICADO)
 * Agora é async e retorna uma Promise.
 */
async function carregarCursosFromDB() {
    const instituicoes = AppState.instituicoes;
    if (!instituicoes || instituicoes.length === 0) {
        console.log("ℹ️ Nenhuma instituição carregada. Pulando carregamento de Cursos.");
        AppState.cursos = [];
        AppState.disciplinas = [];
        atualizarContadorCursos(0);
        return Promise.resolve(); // Retorna Promise resolvida
    }

    const idsInstituicoes = instituicoes.map(inst => inst.id);
    console.log("🔍 Buscando cursos para instituições:", idsInstituicoes);

    const fetchCursosPromises = idsInstituicoes.map((id) => {
        return fetch(`/curso/all/${id}`).then(res => res.json()).then(data => ({ instituicaoId: id, data }));
    });

    // ✅ MODIFICADO: Retorna o Promise.all
    return Promise.all(fetchCursosPromises)
        .then(resultados => {
            const todosCursos = resultados.flatMap(({ instituicaoId, data }) => {
                const cursos = data.cursos || [];
                return cursos.map(curso => ({
                    ...curso,
                    fk_id_instituicao: curso.fk_id_instituicao || instituicaoId,
                }));
            });

            console.log("📚 Todos os cursos recebidos:", todosCursos);

            if (todosCursos.length === 0) {
                console.log("⚠️ Nenhum curso cadastrado");
                AppState.cursos = [];
            } else {
                AppState.cursos = todosCursos.map(curso => ({
                    id: curso.id.toString(),
                    fk_id_instituicao: curso.fk_id_instituicao ? curso.fk_id_instituicao.toString() : null,
                    nome: curso.nome_instituicao || curso.instituicao || "",
                    curso: curso.nome || curso.nome_curso || "",
                    disciplinas: []
                }));
                console.log("✅ AppState.cursos atualizado:", AppState.cursos);
            }
            atualizarContadorCursos(AppState.cursos.length);

            // ❌ REMOVIDO: Chamadas de renderização e carregamento em cadeia
        })
        .catch(err => {
            console.error("❌ Erro ao carregar cursos:", err);
            mostrarAlerta("Erro ao carregar cursos do banco de dados.", "erro");
            throw err;
        });
}

/**
 * Carrega disciplinas (MODIFICADO)
 * Agora é async e retorna uma Promise.
 */
async function carregarDisciplinasFromDB() {
    console.log("📚 Carregando disciplinas...");

    if (!AppState.cursos || AppState.cursos.length === 0) {
        console.log("⚠️ Nenhum curso carregado. Pulando carregamento de disciplinas.");
        AppState.disciplinas = [];
        atualizarContadorDisciplinas(0);
        return Promise.resolve(); // Retorna Promise resolvida
    }

    const idsCursos = AppState.cursos.map(curso => curso.id);

    // ✅ MODIFICADO: Retorna o fetch
    return fetch("/disciplina/all", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(res => {
        if (res.status === 404) return [];
        if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
        return res.json();
    })
    .then(data => {
        let todasDisciplinas = (Array.isArray(data)) ? data : (data.disciplinas || []);

        if (todasDisciplinas.length === 0) {
            console.log("⚠️ Nenhuma disciplina cadastrada no sistema");
            AppState.disciplinas = [];
            atualizarContadorDisciplinas(0);
            return;
        }

        const disciplinasDoUsuario = todasDisciplinas.filter(disc => {
            const idCursoDisc = disc.id_curso ? disc.id_curso.toString() : null;
            return idsCursos.includes(idCursoDisc);
        });

        AppState.disciplinas = disciplinasDoUsuario.map(disc => ({
            id: disc.id ? disc.id.toString() : null,
            codigo: disc.codigo,
            nome: disc.nome,
            sigla: disc.sigla,
            periodo: disc.periodo,
            id_curso: disc.id_curso ? disc.id_curso.toString() : null
        }));

        console.log(`✅ ${AppState.disciplinas.length} disciplinas salvas no AppState`);
        atualizarContadorDisciplinas(AppState.disciplinas.length);
        
        // ❌ REMOVIDO: Chamadas de renderização e carregamento em cadeia
    })
    .catch(err => {
        console.error("❌ Erro ao carregar disciplinas:", err);
        AppState.disciplinas = [];
        atualizarContadorDisciplinas(0);
        throw err;
    });
}

/**
 * Carrega turmas (MODIFICADO)
 * Agora é async e retorna uma Promise.
 */
async function carregarTurmasFromDB() {
    const disciplinas = AppState.disciplinas;
    if (!disciplinas || disciplinas.length === 0) {
        console.log("ℹ️ Nenhuma disciplina carregada. Pulando carregamento de Turmas.");
        AppState.turmas = [];
        atualizarContadorTurmas(0);
        return Promise.resolve(); // Retorna Promise resolvida
    }

    // ✅ MODIFICADO: Retorna o fetch
    return fetch(`/turma/all`) // Assumindo que /turma/all retorna todas as turmas
        .then(res => {
            if (res.status === 404) return [];
            if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            let todasTurmas = (Array.isArray(data)) ? data : (data.turmas || []);

            if (todasTurmas.length === 0) {
                console.log("⚠️ Nenhuma turma cadastrada");
                AppState.turmas = [];
            } else {
                const codigosDisciplinas = new Set(AppState.disciplinas.map(d => d.codigo));
                const turmasDoUsuario = todasTurmas.filter(t => codigosDisciplinas.has(t.fk_disciplina_codigo));

                AppState.turmas = turmasDoUsuario.map(turma => ({
                    id: turma.id.toString(),
                    nome_turma: turma.nome || "Nome Turma",
                    periodo: turma.periodo ? `${turma.periodo}° Semestre` : "Período não definido",
                    fk_disciplina_codigo: turma.fk_disciplina_codigo,
                    codigo: turma.codigo || ""
                }));
                console.log("✅ Turmas formatadas:", AppState.turmas);
            }
            atualizarContadorTurmas(AppState.turmas.length);

            // ❌ REMOVIDO: Chamadas de renderização e carregamento em cadeia
        })
        .catch(err => {
            console.error("❌ Erro ao carregar turmas:", err);
            mostrarAlerta("Erro ao carregar turmas do banco de dados.", "erro");
            throw err;
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

    if (!modal || !inputNomeInstituicao || !inputNomeCurso) { /*... validação ...*/ return; }
    const nomeInstituicao = inputNomeInstituicao.value.trim();
    const nomeCurso = inputNomeCurso.value.trim();
    if (nomeInstituicao === "" || nomeCurso === "") { /*... validação ...*/ return; }
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || !usuarioLogado.id) { /*... validação ...*/ return; }
    const id_docente = usuarioLogado.id;
    mostrarLoader("mostrar");

    fetch("/instituicao/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeInstituicao, id_docente: id_docente })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.sucesso) {
            mostrarAlerta("Instituição já possui cadastro!", "aviso");
            throw new Error("Instituição duplicada");
        }
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
        if (resCadastro.status === 400) {
            return resCadastro.json().then(errData => {
                throw new Error(`Erro 400: ${errData.mensagem || 'Dados inválidos'}`);
            });
        }
        return resCadastro.json();
    })
    .then(dados => {
        if (dados.sucesso) {
            mostrarAlerta("Cadastro realizado com sucesso", "sucesso");
            inputNomeInstituicao.value = "";
            inputNomeCurso.value = "";
            modal.classList.remove("show");

            // ✅ MODIFICADO: Chama o orquestrador central
            carregarTodaAplicacao();
        } else {
            mostrarAlerta(dados.mensagem || "Erro ao realizar o cadastro!", "erro");
            mostrarLoader('esconder');
        }
    })
    .catch(err => {
        console.error("❌ Erro completo:", err);
        if (err.message !== "Instituição duplicada") {
            mostrarAlerta(err.message || "Ocorreu um erro.", "erro");
        }
        mostrarLoader('esconder');
    });
}

/**
 * Salva um novo curso (vinculado a uma instituição existente) no DB.
 */
function salvarCurso() {
    const modal = document.querySelector("#cursosBody .createIdt");
    if (!modal) { /*...*/ return; }
    const selectInstituicao = modal.querySelector("#instituicao");
    const inputNomeCurso = modal.querySelector("#nomeDoCurso");
    if (!selectInstituicao || !inputNomeCurso) { /*...*/ return; }
    const idInstituicao = selectInstituicao.value.trim();
    const nomeCurso = inputNomeCurso.value.trim();
    if (idInstituicao === "" || nomeCurso === "") { /*...*/ return; }
    const fk_id_instituicao = parseInt(idInstituicao);
    mostrarLoader("mostrar");

    fetch("/curso/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fk_id_instituicao: fk_id_instituicao, nome: nomeCurso })
    })
    .then(res => res.json())
    .then(data => {
        if (data.sucesso) {
            return fetch("/curso/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fk_id_instituicao: fk_id_instituicao, nome: nomeCurso })
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
            mostrarAlerta("Curso cadastrado com sucesso!", "sucesso");
            selectInstituicao.value = "";
            inputNomeCurso.value = "";
            modal.classList.remove("show");

            // ✅ MODIFICADO: Chama o orquestrador central
            carregarTodaAplicacao();
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
    const modal = document.querySelector("#disciplinasBody .createIdt");
    if (!modal) { /*...*/ return; }
    const selectCurso = modal.querySelector("#curso");
    const inputNomeDisciplina = modal.querySelector("#inputNomeDisciplina");
    const inputSiglaDisciplina = modal.querySelector("#inputSiglaDisciplina");
    const selectPeriodo = modal.querySelector("#periodoSelect");
    const inputCodigoDisciplina = modal.querySelector("#inputCodigoDisciplina");
    if (!selectCurso || !inputNomeDisciplina || !inputSiglaDisciplina || !selectPeriodo || !inputCodigoDisciplina) { /*...*/ return; }
    const idCurso = selectCurso.value.trim();
    const nomeDisciplina = inputNomeDisciplina.value.trim();
    const siglaDisciplina = inputSiglaDisciplina.value.trim();
    const periodo = selectPeriodo.value.trim();
    const codigoDisciplina = inputCodigoDisciplina.value.trim();
    if (idCurso === "" || nomeDisciplina === "" || siglaDisciplina === "" || periodo === "" || codigoDisciplina === "") { /*...*/ return; }
    const fk_id_curso = parseInt(idCurso);
    mostrarLoader("mostrar");

    fetch("/disciplina/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeDisciplina, id_curso: fk_id_curso })
    })
    .then(res => res.json())
    .then(data => {
        if (data.sucesso) {
            return fetch("/disciplina/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    codigo: codigoDisciplina,
                    id_curso: fk_id_curso,
                    nome: nomeDisciplina,
                    periodo: periodo,
                    sigla: siglaDisciplina
                })
            });
        } else {
            mostrarLoader('esconder');
            mostrarAlerta("Esta disciplina já está cadastrada neste curso!", "aviso");
            throw new Error("Disciplina duplicada");
        }
    })
    .then(res => res.json())
    .then(dados => {
        if (dados.message || dados.codigo) {
            mostrarAlerta("Disciplina cadastrada com sucesso!", "sucesso");
            selectCurso.value = "";
            inputNomeDisciplina.value = "";
            inputSiglaDisciplina.value = "";
            selectPeriodo.value = "";
            inputCodigoDisciplina.value = "";
            modal.classList.remove("show");

            // ✅ MODIFICADO: Chama o orquestrador central
            carregarTodaAplicacao();
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
 * Salva uma nova turma (vinculada a uma disciplina existente) no DB.
 */
function salvarTurma() {
    const modal = document.querySelector("#turmasBody .createIdt");
    if (!modal) { /*...*/ return; }
    const selectDisciplina = modal.querySelector("#inputDisciplinaTurma");
    const inputNomeTurma = modal.querySelector("#inputNomeTurma");
    const inputLocalAula = modal.querySelector("#inputLocalAula");
    const inputDiaSemana = modal.querySelector("#diaSemanaSelect");
    const inputHora = modal.querySelector("#inputHoraAula");
    if (!selectDisciplina || !inputNomeTurma) { /*...*/ return; }
    const nomeDisciplina = selectDisciplina.value.trim();
    const nomeTurma = inputNomeTurma.value.trim();
    const localAula = inputLocalAula?.value.trim() || "";
    const diaSemana = inputDiaSemana?.value.trim() || "";
    const hora = inputHora?.value.trim() || "";
    if (nomeDisciplina === "" || nomeTurma === "") { /*...*/ return; }
    const disciplina = AppState.disciplinas.find(d => d.nome === nomeDisciplina);
    if (!disciplina) { /*...*/ return; }
    const fk_disciplina_codigo = disciplina.codigo;
    mostrarLoader("mostrar");

    fetch("/turma/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fk_disciplina_codigo: fk_disciplina_codigo, nome: nomeTurma })
    })
    .then(res => res.json())
    .then(data => {
        if (data.sucesso) {
            return fetch("/turma/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fk_disciplina_codigo: fk_disciplina_codigo,
                    nome: nomeTurma,
                    local_aula: localAula,
                    dia_semana: diaSemana,
                    hora: hora
                })
            });
        } else {
            mostrarLoader('esconder');
            mostrarAlerta("Esta turma já está cadastrada nesta disciplina!", "aviso");
            throw new Error("Turma duplicada");
        }
    })
    .then(res => res.json())
    .then(dados => {
        if (dados.message || dados.id) {
            mostrarAlerta("Turma cadastrada com sucesso!", "sucesso");
            selectDisciplina.value = "";
            inputNomeTurma.value = "";
            if (inputLocalAula) inputLocalAula.value = "";
            if (inputDiaSemana) inputDiaSemana.value = "";
            if (inputHora) inputHora.value = "";
            modal.classList.remove("show");

            // ✅ MODIFICADO: Chama o orquestrador central
            carregarTodaAplicacao();
        } else {
            mostrarLoader('esconder');
            mostrarAlerta("Erro ao cadastrar a turma!", "erro");
        }
    })
    .catch(err => {
        if (err.message !== "Turma duplicada") {
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
    // ✅ MODIFICADO: Retorna a promise para a cadeia de edição
    return fetch("/curso/verificar", {
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
            return fetch("/curso/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fk_id_instituicao: idInstituicao,
                    nome: nomeCurso
                })
            });
        } else {
            mostrarAlerta(`Curso "${nomeCurso}" já está cadastrado!`, "aviso");
            throw new Error("Curso duplicado");
        }
    })
    .then(res => res.json())
    .then(dados => {
        if (dados.sucesso) {
            mostrarAlerta(`Curso "${nomeCurso}" cadastrado!`, "sucesso");
            fecharModalAdicionarCurso();
            
            // ✅ MODIFICADO: Chama o orquestrador central (se chamado fora de um modal de edição)
            // Se esta função for chamada de 'salvarEdicaoInstituicao', o 'carregarTodaAplicacao'
            // será chamado no final daquela função de qualquer maneira.
            // Para garantir consistência, vamos chamar o recarregamento.
            carregarTodaAplicacao();
        } else {
            mostrarAlerta("Erro ao cadastrar o curso!", "erro");
            throw new Error("Erro ao cadastrar curso");
        }
    })
    .catch(err => {
        if (err.message !== "Curso duplicado") {
            mostrarAlerta("Ocorreu um erro. Verifique o console.", "erro");
            console.error("Erro:", err);
        }
        throw err; // Propaga o erro
    });
}

// ============================================
// 5. FUNÇÕES DE EDIÇÃO DE DADOS (UPDATE)
// (NÃO MODIFICADAS - Preservando a lógica de "hot-reload" do modal)
// ============================================

function preencherDisciplinasAtuaisCursoExpansivel(curso, modal) {
    // ✅ CORREÇÃO: Remove o #cursosBody do seletor
    const container = modal.querySelector(".listaCursosAtuais");

    if (!container) {
        console.error("❌ Container .listaCursosAtuais não encontrado");
        return;
    }

    container.innerHTML = "";

    // Verifica se o curso tem disciplinas
    if (!curso.disciplinas || curso.disciplinas.length === 0) {
        container.innerHTML = '<p class="semCursos"><i class="ph ph-info"></i> Nenhuma disciplina cadastrada</p>';
        return;
    }

    // Renderiza cada disciplina
    curso.disciplinas.forEach(disciplina => {
        const disciplinaEl = document.createElement("div");
        disciplinaEl.className = "itemCursoAtual";
        disciplinaEl.setAttribute("data-disciplina-id", disciplina.id || disciplina.codigo);

        disciplinaEl.innerHTML = `
            <span class="nomeCurso">${disciplina.nome}</span>
            <button class="btnDeletarCurso" 
                    data-disciplina-id="${disciplina.id || disciplina.codigo}" 
                    data-disciplina-nome="${disciplina.nome}" 
                    title="Deletar disciplina">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;

        container.appendChild(disciplinaEl);
    });

    console.log(`✅ ${curso.disciplinas.length} disciplinas carregadas no modal`);
}

function preencherCursosAtuaisExpansivel(instituicao, modal) {
    const container = modal.querySelector(".listaCursosAtuais");
    if (!container) { console.error("❌ Container listaCursosAtuais não encontrado"); return; }
    container.innerHTML = "";
    const cursosDaInstituicao = get.getCursosPorInstituicao(instituicao.id);
    if (cursosDaInstituicao.length === 0) {
        container.innerHTML = '<p class="semCursos"><i class="ph ph-info"></i> Nenhum curso cadastrado</p>';
        return;
    }
    cursosDaInstituicao.forEach(curso => {
        const cursoEl = document.createElement("div");
        cursoEl.className = "itemCursoAtual";
        cursoEl.setAttribute("data-curso-id", curso.id);
        cursoEl.innerHTML = `
            <span class="nomeCurso">${curso.curso}</span>
            <button class="btnDeletarCurso" data-curso-id="${curso.id}" data-curso-nome="${curso.curso}" title="Deletar curso">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        container.appendChild(cursoEl);
    });
}

function vincularEventosModalCursoExpansivel(modal) {
    console.log("🔗 Vinculando eventos do modal de curso...");
    const btnFechar = modal.querySelector(".btnFecharExpansivel");
    if (btnFechar) { btnFechar.addEventListener("click", () => fecharModalEdicaoExpansivel(modal)); }
    const btnCancelar = modal.querySelector(".btnCancelarEdicao");
    if (btnCancelar) { btnCancelar.addEventListener("click", () => fecharModalEdicaoExpansivel(modal)); }
    const btnAdicionar = modal.querySelector(".btnAddCurso");
    const inputDisciplina = modal.querySelector("#addDisciplinaInput");
    const inputSigla = modal.querySelector("#inputSiglaDisciplina");
    const inputCodigo = modal.querySelector("#inputCodigoDisciplina");
    const selectPeriodo = modal.querySelector("#periodoSelect");
    if (btnAdicionar) {
        btnAdicionar.addEventListener("click", () => {
            adicionarDisciplinaTemporario(modal);
        });
    }
    [inputDisciplina, inputSigla, inputCodigo, selectPeriodo].forEach(input => {
        if (input) {
            input.addEventListener("keypress", (e) => {
                if (e.key === "Enter") { e.preventDefault(); adicionarDisciplinaTemporario(modal); }
            });
        }
    });
    const btnSalvar = modal.querySelector(".btnSalvarEdicao");
    if (btnSalvar) {
        btnSalvar.addEventListener("click", () => {
            const idCurso = modal.getAttribute("data-curso-id");
            const inputNome = modal.querySelector("#editNomeCurso");
            const novoNome = inputNome?.value.trim() || "";
            if (!idCurso) { mostrarAlerta("Erro: ID do curso não encontrado", "erro"); return; }
            if (novoNome === "") { mostrarAlerta("Preencha o nome do curso", "aviso"); return; }
            salvarEdicaoCurso(idCurso, novoNome, modal);
        });
    }
    const containerDisciplinas = modal.querySelector(".listaCursosAtuais");
    if (containerDisciplinas) {
        containerDisciplinas.addEventListener("click", (e) => {
            const btn = e.target.closest(".btnDeletarCurso");
            if (!btn) return;
            const idDisciplina = btn.getAttribute("data-disciplina-id");
            const nomeDisciplina = btn.getAttribute("data-disciplina-nome");
            const itemDisciplina = btn.closest(".itemCursoAtual");
            if (!EdicaoStateCurso.disciplinasParaDeletar.includes(idDisciplina)) {
                EdicaoStateCurso.disciplinasParaDeletar.push(idDisciplina);
                itemDisciplina.classList.add("marcadoParaDeletar");
                btn.classList.add("btnDesfazer");
                btn.innerHTML = '<i class="fas fa-undo"></i>';
                btn.title = "Desfazer";
            } else {
                EdicaoStateCurso.disciplinasParaDeletar = EdicaoStateCurso.disciplinasParaDeletar.filter(id => id !== idDisciplina);
                itemDisciplina.classList.remove("marcadoParaDeletar");
                btn.classList.remove("btnDesfazer");
                btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                btn.title = "Deletar disciplina";
            }
        });
    }
    const containerTemp = modal.querySelector(".cursosTemporarios");
    if (containerTemp) {
        containerTemp.addEventListener("click", (e) => {
            const btn = e.target.closest(".btnRemoverTemp");
            if (!btn) return;
            const itemTemp = btn.closest(".itemCursoTemp");
            const codigoTemp = itemTemp.getAttribute("data-codigo-temp");
            EdicaoStateCurso.disciplinasParaAdicionar = EdicaoStateCurso.disciplinasParaAdicionar.filter(d => d.codigo !== codigoTemp);
            itemTemp.remove();
        });
    }
    console.log("✅ Todos os eventos do modal de curso vinculados com sucesso!");
}

function vincularEventosModalExpansivel(modal) {
    const btnFechar = modal.querySelector(".btnFecharExpansivel");
    if (btnFechar) { btnFechar.addEventListener("click", () => fecharModalEdicaoExpansivel(modal)); }
    const btnCancelar = modal.querySelector(".btnCancelarEdicao");
    if (btnCancelar) { btnCancelar.addEventListener("click", () => fecharModalEdicaoExpansivel(modal)); }
    const btnAdicionar = modal.querySelector(".btnAddCurso");
    if (btnAdicionar) { btnAdicionar.addEventListener("click", () => adicionarCursoTemporario(modal)); }
    const inputCurso = modal.querySelector("#addCursoInput");
    if (inputCurso) {
        inputCurso.addEventListener("keypress", (e) => {
            if (e.key === "Enter") { e.preventDefault(); adicionarCursoTemporario(modal); }
        });
    }
    const btnSalvar = modal.querySelector(".btnSalvarEdicao");
    if (btnSalvar) {
        btnSalvar.addEventListener("click", () => {
            const idInstituicao = modal.getAttribute("data-instituicao-id");
            const inputNome = modal.querySelector("#editNomeInstituicao");
            const novoNome = inputNome.value.trim();
            if (novoNome === "") { mostrarAlerta("Preencha o nome da instituição", "aviso"); return; }
            salvarEdicaoInstituicao(idInstituicao, novoNome, modal);
        });
    }
    const containerCursos = modal.querySelector(".listaCursosAtuais");
    if (containerCursos) {
        containerCursos.addEventListener("click", (e) => {
            const btn = e.target.closest(".btnDeletarCurso");
            if (!btn) return;
            const idCurso = btn.getAttribute("data-curso-id");
            const nomeCurso = btn.getAttribute("data-curso-nome");
            const itemCurso = btn.closest(".itemCursoAtual");
            if (!EdicaoState.cursosParaDeletar.includes(idCurso)) {
                EdicaoState.cursosParaDeletar.push(idCurso);
                itemCurso.classList.add("marcadoParaDeletar");
                btn.classList.add("btnDesfazer");
                btn.innerHTML = '<i class="fas fa-undo"></i>';
                btn.title = "Desfazer";
            } else {
                EdicaoState.cursosParaDeletar = EdicaoState.cursosParaDeletar.filter(id => id !== idCurso);
                itemCurso.classList.remove("marcadoParaDeletar");
                btn.classList.remove("btnDesfazer");
                btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                btn.title = "Deletar curso";
            }
        });
    }
    const containerTemp = modal.querySelector(".cursosTemporarios");
    if (containerTemp) {
        containerTemp.addEventListener("click", (e) => {
            const btn = e.target.closest(".btnRemoverTemp");
            if (!btn) return;
            const cursoTemp = btn.closest(".itemCursoTemp");
            const nomeCurso = cursoTemp.querySelector("span").textContent;
            EdicaoState.cursosParaAdicionar = EdicaoState.cursosParaAdicionar.filter(c => c !== nomeCurso);
            cursoTemp.remove();
        });
    }
}

function vincularEventosModalDisciplina(modal) {
    const btnFechar = modal.querySelector(".btnFecharExpansivel");
    if (btnFechar) { btnFechar.addEventListener("click", () => fecharModalEdicaoExpansivel(modal)); }
    const btnCancelar = modal.querySelector(".btnCancelarEdicao");
    if (btnCancelar) { btnCancelar.addEventListener("click", () => fecharModalEdicaoExpansivel(modal)); }
    const btnSalvar = modal.querySelector(".btnSalvarEdicao");
    if (btnSalvar) {
        btnSalvar.addEventListener("click", () => {
            const codigoDisciplina = modal.getAttribute("data-disciplina-codigo");
            const idCurso = modal.getAttribute("data-curso-id");
            const inputNome = modal.querySelector("#editNomeDisciplina");
            const inputSigla = modal.querySelector("#editSiglaDisciplina");
            const inputCodigo = modal.querySelector("#editCodigoDisciplina");
            const selectPeriodo = modal.querySelector("#editPeriodoDisciplina");
            const novoNome = inputNome?.value.trim() || "";
            const novaSigla = inputSigla?.value.trim() || "";
            const codigo = inputCodigo?.value.trim() || "";
            const novoPeriodo = selectPeriodo?.value || "";
            if (novoNome === "") { mostrarAlerta("Preencha o nome da disciplina", "aviso"); return; }
            if (novaSigla === "") { mostrarAlerta("Preencha a sigla", "aviso"); return; }
            if (codigo === "") { mostrarAlerta("Erro: Código da disciplina não encontrado", "erro"); return; }
            if (novoPeriodo === "") { mostrarAlerta("Selecione o período", "aviso"); return; }
            salvarEdicaoDisciplina(codigo, idCurso, novoNome, novaSigla, novoPeriodo, modal);
        });
    }
}

function adicionarDisciplinaTemporario(modal) {
    const inputNomeEl = modal.querySelector("#addDisciplinaInput");
    const inputSiglaEl = modal.querySelector("#inputSiglaDisciplina");
    const inputCodigoEl = modal.querySelector("#inputCodigoDisciplina");
    const inputPeriodoEl = modal.querySelector("#periodoSelect");
    const containerTemp = modal.querySelector(".cursosTemporarios");
    if (!inputNomeEl || !inputSiglaEl || !inputCodigoEl || !inputPeriodoEl) { /*...*/ return; }
    if (!containerTemp) { /*...*/ return; }
    const nomeDisciplina = inputNomeEl.value.trim();
    const sigla = inputSiglaEl.value.trim();
    const codigo = inputCodigoEl.value.trim();
    const periodo = inputPeriodoEl.value.trim();
    function marcarErroCampo(campo) {
        campo.style.border = "2px solid red";
        campo.style.animation = "shake 0.3s";
        setTimeout(() => {
            campo.style.animation = "";
            campo.style.border = "";
        }, 300);
    }
    let erro = false;
    if (nomeDisciplina === "") { marcarErroCampo(inputNomeEl); erro = true; }
    if (sigla === "") { marcarErroCampo(inputSiglaEl); erro = true; }
    if (codigo === "") { marcarErroCampo(inputCodigoEl); erro = true; }
    if (periodo === "") { marcarErroCampo(inputPeriodoEl); erro = true; }
    if (erro) { mostrarAlerta("Preencha todos os campos corretamente", "aviso"); return; }
    const duplicado = EdicaoStateCurso.disciplinasParaAdicionar.find(d => d.codigo === codigo || d.nome === nomeDisciplina);
    if (duplicado) { mostrarAlerta("Disciplina já está na lista para adicionar", "aviso"); return; }
    EdicaoStateCurso.disciplinasParaAdicionar.push({ nome: nomeDisciplina, sigla: sigla, periodo: periodo, codigo: codigo });
    const disciplinaEl = document.createElement("div");
    disciplinaEl.className = "itemCursoTemp";
    disciplinaEl.setAttribute("data-codigo-temp", codigo);
    disciplinaEl.innerHTML = `<span>${nomeDisciplina} - ${sigla} - ${periodo}° - ${codigo}</span><button class="btnRemoverTemp" title="Remover"><i class="fas fa-times"></i></button>`;
    containerTemp.appendChild(disciplinaEl);
    inputNomeEl.value = "";
    inputSiglaEl.value = "";
    inputCodigoEl.value = "";
    inputPeriodoEl.value = "";
}

function adicionarCursoTemporario(modal) {
    const inputCurso = modal.querySelector("#addCursoInput");
    const containerTemp = modal.querySelector(".cursosTemporarios");
    if (!inputCurso || !containerTemp) return;
    const nomeCurso = inputCurso.value.trim();
    if (nomeCurso === "") { mostrarAlerta("Digite o nome do curso", "aviso"); return; }
    if (EdicaoState.cursosParaAdicionar.includes(nomeCurso)) { mostrarAlerta("Curso já está na lista para adicionar", "aviso"); inputCurso.value = ""; return; }
    EdicaoState.cursosParaAdicionar.push(nomeCurso);
    const cursoEl = document.createElement("div");
    cursoEl.className = "itemCursoTemp";
    cursoEl.innerHTML = `<span>${nomeCurso}</span><button class="btnRemoverTemp" title="Remover"><i class="fas fa-times"></i></button>`;
    containerTemp.appendChild(cursoEl);
    inputCurso.value = "";
}

function fecharModalEdicaoExpansivel(modal) {
    if (!modal) return;
    modal.classList.remove("show");
    setTimeout(() => {
        modal.style.position = '';
        modal.style.top = '';
        modal.style.left = '';
        modal.style.width = '';
    }, 300);
    EdicaoState.cursosParaAdicionar = [];
    EdicaoState.cursosParaDeletar = [];
    EdicaoState.instituicaoOriginal = null;
    EdicaoStateCurso.disciplinasParaAdicionar = [];
    EdicaoStateCurso.disciplinasParaDeletar = [];
    EdicaoStateCurso.cursoOriginal = null;
    console.log("🔒 Modal fechado e estado de edição limpo");
}

function salvarEdicaoInstituicao(id, novoNome, modal) {
    console.log(`💾 Salvando edição da instituição ID: ${id}`);
    mostrarLoader('mostrar');
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || !usuarioLogado.id) { /*...*/ return; }

    let promiseChain = Promise.resolve();

    if (novoNome !== EdicaoState.instituicaoOriginal.nome) {
        promiseChain = promiseChain.then(() => {
            return fetch("/instituicao/atualizar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: parseInt(id), novo_nome: novoNome })
            }).then(res => res.json()).then(dados => {
                console.log("✅ Nome atualizado");
            });
        });
    }

    promiseChain = promiseChain.then(() => {
        let cursoPromise = Promise.resolve();
        EdicaoState.cursosParaAdicionar.forEach(nomeCurso => {
            cursoPromise = cursoPromise.then(() => {
                // Chama a versão de vincular que *retorna a promise*
                return vincularCursoInstituicaoDB_Edicao(parseInt(id), nomeCurso);
            });
        });
        return cursoPromise;
    });

    EdicaoState.cursosParaDeletar.forEach(idCurso => {
        promiseChain = promiseChain.then(() => {
            return fetch("/curso/deletar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: parseInt(idCurso), id_instituicao: parseInt(id) })
            }).then(res => res.json()).then(dados => {
                if (dados.sucesso) console.log(`✅ Curso deletado: ${idCurso}`);
            });
        });
    });

    promiseChain
        .then(() => {
            // Recarrega os dados do banco
            return fetch(`/instituicao/all/${usuarioLogado.id}`)
                .then(res => res.json())
                .then(dados => {
                    let instituicoes = (Array.isArray(dados)) ? dados : (dados.instituicoes || []);
                    AppState.instituicoes = instituicoes.map(inst => ({
                        id: inst.id.toString(),
                        nome: inst.nome,
                        cursos: []
                    }));
                    return carregarCursosParaModal(id); // Recarrega cursos da instituição
                });
        })
        .then(() => {
            return carregarDisciplinasFromDB(); // Recarrega todas as disciplinas
        })
        .then(() => {
            const instituicaoAtualizada = get.getInstituicaoPorId(id);
            if (instituicaoAtualizada) {
                EdicaoState.instituicaoOriginal = JSON.parse(JSON.stringify(instituicaoAtualizada));
                EdicaoState.cursosParaAdicionar = [];
                EdicaoState.cursosParaDeletar = [];
                atualizarCamposModalEdicao(modal, instituicaoAtualizada);
                
                // ✅ ATUALIZA A UI CENTRALIZADA
                renderizarTodaInterface(); 
            }
        })
        .catch(err => {
            console.error("❌ Erro:", err);
            mostrarAlerta("Erro ao atualizar instituição", "erro");
        })
        .finally(() => {
            mostrarLoader('esconder');
        });
}

/**
 * Versão especial do vincularCurso para ser usada DENTRO da 'salvarEdicao'
 * Não chama 'carregarTodaAplicacao'
 */
function vincularCursoInstituicaoDB_Edicao(idInstituicao, nomeCurso) {
    return fetch("/curso/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fk_id_instituicao: idInstituicao, nome: nomeCurso })
    })
    .then(res => res.json())
    .then(data => {
        if (data.sucesso) {
            return fetch("/curso/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fk_id_instituicao: idInstituicao, nome: nomeCurso })
            });
        } else {
            console.warn(`Curso "${nomeCurso}" já existe.`);
            throw new Error("Curso duplicado");
        }
    })
    .then(res => res.json())
    .then(dados => {
        if (dados.sucesso) {
            console.log(`Curso "${nomeCurso}" cadastrado.`);
        } else {
            throw new Error("Erro ao cadastrar o curso!");
        }
    })
    .catch(err => {
        if (err.message !== "Curso duplicado") {
            console.error("Erro ao vincular curso:", err);
        }
        // Não propaga o erro de duplicado para não parar a cadeia
        return;
    });
}


function salvarEdicaoCurso(idCurso, novoNome, modal) {
    console.log(`💾 Salvando edição do curso ID: ${idCurso}`);
    mostrarLoader('mostrar');
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || !usuarioLogado.id) { /*...*/ return; }
    let promiseChain = Promise.resolve();
    if (novoNome !== EdicaoStateCurso.cursoOriginal.curso) {
        promiseChain = promiseChain.then(() => {
            return fetch("/curso/atualizar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: parseInt(idCurso), nome: novoNome })
            }).then(res => res.json()).then(dados => {
                if (!dados.message) throw new Error("Erro ao atualizar nome do curso");
                console.log("✅ Nome do curso atualizado");
            });
        });
    }
    promiseChain = promiseChain.then(() => {
        let disciplinaPromise = Promise.resolve();
        EdicaoStateCurso.disciplinasParaAdicionar.forEach(disciplina => {
            disciplinaPromise = disciplinaPromise.then(() => {
                return fetch("/disciplina/verificar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome: disciplina.nome, id_curso: parseInt(idCurso) })
                }).then(res => res.json()).then(verificacao => {
                    if (!verificacao.sucesso) {
                        console.warn("⚠️ Disciplina já existe, pulando:", disciplina.nome);
                        return Promise.resolve({ jaExiste: true });
                    }
                    return fetch("/disciplina/cadastro", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            codigo: disciplina.codigo,
                            id_curso: parseInt(idCurso),
                            nome: disciplina.nome,
                            periodo: disciplina.periodo,
                            sigla: disciplina.sigla
                        })
                    }).then(res => res.json()).then(dados => {
                        if (dados.disciplinaExistente) console.warn("⚠️ Disciplina já existe:", disciplina.nome);
                        else if (dados.sucesso || dados.codigo) console.log(`✅ Disciplina "${disciplina.nome}" cadastrada`);
                    });
                });
            });
        });
        return disciplinaPromise;
    });
    EdicaoStateCurso.disciplinasParaDeletar.forEach(idDisciplina => {
        promiseChain = promiseChain.then(() => {
            return fetch("/disciplina/deletar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ codigo: idDisciplina }) // Assumindo que ID = Código
            }).then(res => res.json()).then(dados => {
                if (dados.message) console.log(`✅ Disciplina deletada: ${idDisciplina}`);
            });
        });
    });
    promiseChain
        .then(() => {
            console.log("🔄 Recarregando dados do banco...");
            return carregarCursosParaModal(AppState.cursos.find(c => c.id == idCurso)?.fk_id_instituicao);
        })
        .then(() => {
            return carregarDisciplinasFromDB();
        })
        .then(() => {
            const cursoAtualizado = get.getCursoPorId(idCurso);
            if (cursoAtualizado) {
                EdicaoStateCurso.cursoOriginal = JSON.parse(JSON.stringify(cursoAtualizado));
                EdicaoStateCurso.disciplinasParaAdicionar = [];
                EdicaoStateCurso.disciplinasParaDeletar = [];
                atualizarCamposModalEdicaoCurso(modal, cursoAtualizado);
                
                // ✅ ATUALIZA A UI CENTRALIZADA
                renderizarTodaInterface();
                
                mostrarAlerta("Curso atualizado com sucesso!", "sucesso");
            }
        })
        .catch(err => {
            console.error("❌ Erro:", err);
            mostrarAlerta("Erro ao atualizar curso: " + err.message, "erro");
        })
        .finally(() => {
            mostrarLoader('esconder');
        });
}

async function carregarCursosParaModal(idInstituicao) {
    console.log(`🔍 Carregando cursos para instituição ${idInstituicao}`);
    return fetch(`/curso/all/${idInstituicao}`)
        .then(res => res.json())
        .then(data => {
            const cursos = data.cursos || [];
            AppState.cursos = AppState.cursos.filter(c => c.fk_id_instituicao != idInstituicao);
            cursos.forEach(curso => {
                AppState.cursos.push({
                    id: curso.id.toString(),
                    fk_id_instituicao: idInstituicao.toString(),
                    nome: curso.nome_instituicao || curso.instituicao || "",
                    curso: curso.nome || curso.nome_curso || "",
                    disciplinas: curso.disciplinas || []
                });
            });
            // ✅ MODIFICADO: Não chama mais renderizar...
            vincularCursosNasInstituicoes(); // Apenas vincula
            console.log("✅ Cursos atualizados no AppState");
        });
}

function atualizarCamposModalEdicao(modal, instituicao) {
    console.log("🔄 Atualizando campos do modal...");
    const inputNome = modal.querySelector("#editNomeInstituicao");
    if (inputNome) {
        inputNome.value = instituicao.nome;
        inputNome.placeholder = instituicao.nome;
    }
    const cursosDaInstituicao = get.getCursosPorInstituicao(instituicao.id);
    const containerCursos = modal.querySelector(".listaCursosAtuais");
    if (containerCursos) {
        containerCursos.innerHTML = "";
        if (cursosDaInstituicao.length === 0) {
            containerCursos.innerHTML = '<p class="semCursos"><i class="ph ph-info"></i> Nenhum curso cadastrado</p>';
        } else {
            cursosDaInstituicao.forEach(curso => {
                const cursoEl = document.createElement("div");
                cursoEl.className = "itemCursoAtual";
                cursoEl.setAttribute("data-curso-id", curso.id);
                cursoEl.innerHTML = `
                    <span class="nomeCurso">${curso.curso}</span>
                    <button class="btnDeletarCurso" data-curso-id="${curso.id}" data-curso-nome="${curso.curso}" title="Deletar curso">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                containerCursos.appendChild(cursoEl);
            });
        }
    }
    const containerTemp = modal.querySelector(".cursosTemporarios");
    if (containerTemp) containerTemp.innerHTML = "";
    const inputAddCurso = modal.querySelector("#addCursoInput");
    if (inputAddCurso) inputAddCurso.value = "";
    console.log("✅ Modal atualizado com sucesso!");
}

function atualizarCamposModalEdicaoCurso(modal, curso) {
    console.log("🔄 Atualizando campos do modal de curso...");
    const inputNome = modal.querySelector("#editNomeCurso");
    if (inputNome) {
        inputNome.value = curso.curso; // ✅ Corrigido de curso.nome
        inputNome.placeholder = curso.curso; // ✅ Corrigido de curso.nome
    }
    const disciplinasDoCurso = get.getDisciplinasPorCurso(curso.id);
    const containerCursos = modal.querySelector(".listaCursosAtuais"); // Container de disciplinas
    if (containerCursos) {
        containerCursos.innerHTML = "";
        if (disciplinasDoCurso.length === 0) {
            containerCursos.innerHTML = '<p class="semCursos"><i class="ph ph-info"></i> Nenhuma disciplina cadastrada</p>';
        } else {
            disciplinasDoCurso.forEach(disciplina => {
                const disciplinaEl = document.createElement("div");
                disciplinaEl.className = "itemCursoAtual";
                disciplinaEl.setAttribute("data-disciplina-codigo", disciplina.codigo);
                disciplinaEl.innerHTML = `
                    <span class="nomeCurso">${disciplina.nome}</span>
                    <button class="btnDeletarCurso" data-disciplina-codigo="${disciplina.codigo}" data-disciplina-nome="${disciplina.nome}" title="Deletar disciplina">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                containerCursos.appendChild(disciplinaEl);
            });
        }
    }
    const containerTemp = modal.querySelector(".cursosTemporarios");
    if (containerTemp) containerTemp.innerHTML = "";
    // Limpa inputs de adicionar disciplina
    const inputAddDisciplina = modal.querySelector("#addDisciplinaInput");
    const inputSigla = modal.querySelector("#inputSiglaDisciplina");
    const inputCodigo = modal.querySelector("#inputCodigoDisciplina");
    const selectPeriodo = modal.querySelector("#periodoSelect");
    if (inputAddDisciplina) inputAddDisciplina.value = "";
    if (inputSigla) inputSigla.value = "";
    if (inputCodigo) inputCodigo.value = "";
    if (selectPeriodo) selectPeriodo.value = "";
    console.log("✅ Modal de curso atualizado com sucesso!");
}

/**
 * Abre o modal de edição (USA O MODAL QUE JÁ EXISTE NO HTML)
 */
function editarInstituicao(id) {

    // Usa a função get para buscar a instituição
    const instituicao = get.getInstituicaoPorId(id);

    if (!instituicao) {
        mostrarAlerta("Instituição não encontrada!", "erro");
        return;
    }

    // Encontra o card correspondente
    const card = document.querySelector(`#instituicoesBody .contentCardIdt[data-id="${id}"]`);

    if (!card) {
        console.error("❌ Card não encontrado!");
        return;
    }

    // Salva estado original
    EdicaoState.instituicaoOriginal = JSON.parse(JSON.stringify(instituicao));
    EdicaoState.cursosParaAdicionar = [];
    EdicaoState.cursosParaDeletar = [];

    // Pega o modal que JÁ EXISTE no HTML
    const modal = document.querySelector("#instituicoesBody .modalEdicaoExpansivel");

    if (!modal) {
        console.error("❌ Modal não encontrado no HTML!");
        return;
    }

    // Armazena o ID da instituição no modal
    modal.setAttribute("data-instituicao-id", id);

    // Preenche o input de nome
    const inputNome = modal.querySelector("#editNomeInstituicao");
    if (inputNome) {
        inputNome.value = instituicao.nome;
        inputNome.placeholder = instituicao.nome;
    }

    // Preenche a lista de cursos atuais
    preencherCursosAtuaisExpansivel(instituicao, modal);

    // Limpa o input e lista temporária
    const inputAddCurso = modal.querySelector("#addCursoInput");
    const containerTemp = modal.querySelector(".cursosTemporarios");
    if (inputAddCurso) inputAddCurso.value = "";
    if (containerTemp) containerTemp.innerHTML = "";

    // Vincula eventos (apenas uma vez)
    if (!modal.hasAttribute("data-eventos-vinculados")) {
        vincularEventosModalExpansivel(modal);
        modal.setAttribute("data-eventos-vinculados", "true");
    }

    // --- Lógica de Posicionamento ---
    const cardRect = card.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const top = cardRect.bottom + scrollTop + 10;
    const left = cardRect.left;
    const width = cardRect.width;

    modal.style.position = 'absolute';
    modal.style.top = `${top}px`;
    modal.style.left = `${left}px`;
    modal.style.width = `${width}px`;
    // --- Fim da Lógica de Posicionamento ---

    // Mostra o modal
    modal.classList.add("show");

    console.log("✅ Modal posicionado abaixo do card");
}

function editarCurso(idCurso) {
    console.log("✏️ Abrindo edição para curso ID:", idCurso);

    const curso = get.getCursoPorId(idCurso);

    if (!curso) {
        mostrarAlerta("Curso não encontrado!", "erro");
        return;
    }

    const card = document.querySelector(`#cursosBody .contentCardIdt[data-id="${idCurso}"]`);
    if (!card) {
        console.error("❌ Card não encontrado!");
        return;
    }

    // Salva estado original
    EdicaoStateCurso.cursoOriginal = JSON.parse(JSON.stringify(curso));
    EdicaoStateCurso.disciplinasParaAdicionar = [];
    EdicaoStateCurso.disciplinasParaDeletar = [];

    // Pega o modal
    const modal = document.querySelector("#cursosBody .modalEdicaoExpansivel");
    if (!modal) {
        console.error("❌ Modal não encontrado!");
        return;
    }

    // Armazena o ID
    modal.setAttribute("data-curso-id", idCurso);

    // Preenche o nome
    const inputNomeCurso = modal.querySelector("#editNomeCurso");
    if (inputNomeCurso) {
        inputNomeCurso.value = curso.curso;
        inputNomeCurso.placeholder = curso.curso;
    }

    // Preenche disciplinas atuais
    preencherDisciplinasAtuaisCursoExpansivel(curso, modal);

    // Limpa inputs temporários
    const inputAddDisciplina = modal.querySelector("#addDisciplinaInput");
    const inputSigla = modal.querySelector("#inputSiglaDisciplina");
    const inputCodigo = modal.querySelector("#inputCodigoDisciplina");
    const selectPeriodo = modal.querySelector("#periodoSelect");
    const containerTemp = modal.querySelector(".cursosTemporarios");

    if (inputAddDisciplina) inputAddDisciplina.value = "";
    if (inputSigla) inputSigla.value = "";
    if (inputCodigo) inputCodigo.value = "";
    if (selectPeriodo) selectPeriodo.value = "";
    if (containerTemp) containerTemp.innerHTML = "";

    // Vincula eventos (apenas uma vez)
    if (!modal.hasAttribute("data-eventos-vinculados")) {
        vincularEventosModalCursoExpansivel(modal);
        modal.setAttribute("data-eventos-vinculados", "true");
    }

    // Posicionamento
    const cardRect = card.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const top = cardRect.bottom + scrollTop + 10;
    const left = cardRect.left;
    const width = cardRect.width;

    modal.style.position = 'absolute';
    modal.style.top = `${top}px`;
    modal.style.left = `${left}px`;
    modal.style.width = `${width}px`;

    modal.classList.add("show");
    console.log("✅ Modal de curso aberto com sucesso!");
}

function editarDisciplina(codigoDisciplina) {
    console.log("✏️ Abrindo edição para disciplina código:", codigoDisciplina);
    let disciplina = null;
    let idCurso = null;
    // ✅ MODIFICADO: Busca em AppState.disciplinas
    disciplina = AppState.disciplinas.find(d => d.codigo == codigoDisciplina);
    if (disciplina) {
        idCurso = disciplina.id_curso;
    }
    
    if (!disciplina) { mostrarAlerta("Disciplina não encontrada!", "erro"); return; }
    const card = document.querySelector(`#disciplinasBody .contentCardIdt[data-codigo="${codigoDisciplina}"]`);
    if (!card) { console.error("❌ Card de disciplina não encontrado!"); return; }
    EdicaoStateDisciplina.disciplinaOriginal = JSON.parse(JSON.stringify(disciplina));
    const modal = document.querySelector("#disciplinasBody .modalEdicaoExpansivel");
    if (!modal) { console.error("❌ Modal de edição de disciplina não encontrado no HTML!"); return; }
    modal.setAttribute("data-disciplina-codigo", codigoDisciplina);
    modal.setAttribute("data-curso-id", idCurso);
    const inputNome = modal.querySelector("#editNomeDisciplina");
    const inputSigla = modal.querySelector("#editSiglaDisciplina");
    const inputCodigo = modal.querySelector("#editCodigoDisciplina");
    const selectPeriodo = modal.querySelector("#editPeriodoDisciplina");
    if (inputNome) { inputNome.value = disciplina.nome || ""; inputNome.placeholder = disciplina.nome || ""; }
    if (inputSigla) { inputSigla.value = disciplina.sigla || ""; }
    if (inputCodigo) { inputCodigo.value = disciplina.codigo || ""; inputCodigo.readOnly = true; }
    if (selectPeriodo) { selectPeriodo.value = disciplina.periodo || ""; }
    if (!modal.hasAttribute("data-eventos-vinculados")) {
        vincularEventosModalDisciplina(modal);
        modal.setAttribute("data-eventos-vinculados", "true");
    }
    const cardRect = card.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const top = cardRect.bottom + scrollTop + 10;
    const left = cardRect.left;
    const width = cardRect.width;
    modal.style.position = 'absolute';
    modal.style.top = `${top}px`;
    modal.style.left = `${left}px`;
    modal.style.width = `${width}px`;
    modal.classList.add("show");
}

function editarTurma(idTurma) {
    const turma = AppState.turmas.find(t => t.id == idTurma);
    if (!turma) { mostrarAlerta("Turma não encontrada!", "erro"); return; }
    const card = document.querySelector(`#turmasBody .contentCardIdt[data-id="${idTurma}"]`); // Assumindo data-id no card de turma
    if (!card) { console.error("❌ Card de turma não encontrado!"); return; }
    EdicaoStateTurma.turmaOriginal = JSON.parse(JSON.stringify(turma));
    const modal = document.querySelector("#turmasBody .modalEdicaoExpansivel");
    if (!modal) { console.error("❌ Modal não encontrado no HTML!"); return; }
    modal.setAttribute("data-turma-id", idTurma);
    const inputNome = modal.querySelector("#editNomeTurma");
    const inputCodigo = modal.querySelector("#editCodigoTurma");
    const selectPeriodo = modal.querySelector("#editPeriodoTurma");
    if (inputNome) { inputNome.value = turma.nome_turma || ""; inputNome.placeholder = turma.nome_turma || ""; }
    if (inputCodigo) { inputCodigo.value = turma.codigo || ""; }
    if (selectPeriodo) {
        const periodoNum = turma.periodo ? turma.periodo.toString().match(/\d+/)[0] : "";
        selectPeriodo.value = periodoNum || "";
    }
    if (!modal.hasAttribute("data-eventos-vinculados")) {
        vincularEventosModalTurma(modal);
        modal.setAttribute("data-eventos-vinculados", "true");
    }
    const cardRect = card.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const top = cardRect.bottom + scrollTop + 10;
    const left = cardRect.left;
    const width = cardRect.width;
    modal.style.position = 'absolute';
    modal.style.top = `${top}px`;
    modal.style.left = `${left}px`;
    modal.style.width = `${width}px`;
    modal.classList.add("show");
}

function vincularEventosModalTurma(modal) {
    const btnFechar = modal.querySelector(".btnFecharExpansivel");
    if (btnFechar) { btnFechar.addEventListener("click", () => fecharModalEdicaoExpansivel(modal)); }
    const btnCancelar = modal.querySelector(".btnCancelarEdicao");
    if (btnCancelar) { btnCancelar.addEventListener("click", () => fecharModalEdicaoExpansivel(modal)); }
    const btnSalvar = modal.querySelector(".btnSalvarEdicao");
    if (btnSalvar) {
        btnSalvar.addEventListener("click", () => {
            const idTurma = modal.getAttribute("data-turma-id");
            const inputNome = modal.querySelector("#editNomeTurma");
            const inputCodigo = modal.querySelector("#editCodigoTurma");
            const selectPeriodo = modal.querySelector("#editPeriodoTurma");
            const novoNome = inputNome?.value.trim() || "";
            const novoCodigo = inputCodigo?.value.trim() || "";
            const novoPeriodo = selectPeriodo?.value || "";
            if (novoNome === "") { mostrarAlerta("Preencha o nome da turma", "aviso"); return; }
            if (novoPeriodo === "") { mostrarAlerta("Selecione o período", "aviso"); return; }
            salvarEdicaoTurma(idTurma, novoNome, novoCodigo, novoPeriodo, modal);
        });
    }
}

function salvarEdicaoDisciplina(codigo, idCurso, novoNome, novaSigla, novoPeriodo, modal) {
    console.log("💾 Salvando edição de disciplina...");
    mostrarLoader("mostrar");
    fetch("/disciplina/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            codigo: codigo,
            id_curso: parseInt(idCurso),
            nome: novoNome,
            sigla: novaSigla,
            periodo: parseInt(novoPeriodo)
        })
    })
    .then(res => res.json())
    .then(dados => {
        if (dados.message) {
            mostrarAlerta("Disciplina atualizada com sucesso!", "sucesso");
            fecharModalEdicaoExpansivel(modal);
            // ✅ MODIFICADO: Chama o orquestrador central
            carregarTodaAplicacao();
        } else {
            mostrarLoader('esconder');
            mostrarAlerta(dados.error || "Erro ao atualizar disciplina", "erro");
        }
    })
    .catch(err => {
        mostrarLoader('esconder');
        mostrarAlerta("Erro ao atualizar disciplina", "erro");
        console.error("❌ Erro:", err);
    });
}

function salvarEdicaoTurma(idTurma, novoNome, novoCodigo, novoPeriodo, modal) {
    console.log("💾 Salvando edição de turma...");
    mostrarLoader("mostrar");
    fetch("/turma/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: parseInt(idTurma),
            nome: novoNome
            // Adicione outros campos se o backend suportar (codigo, periodo)
        })
    })
    .then(res => res.json())
    .then(dados => {
        if (dados.message) {
            mostrarAlerta("Turma atualizada com sucesso!", "sucesso");
            fecharModalEdicaoExpansivel(modal);
            // ✅ MODIFICADO: Chama o orquestrador central
            carregarTodaAplicacao();
        } else {
            mostrarLoader('esconder');
            mostrarAlerta(dados.error || "Erro ao atualizar turma", "erro");
        }
    })
    .catch(err => {
        mostrarLoader('esconder');
        mostrarAlerta("Erro ao atualizar turma", "erro");
        console.error("❌ Erro:", err);
    });
}


// ============================================
// 6. FUNÇÕES DE DELEÇÃO DE DADOS (DELETE)
// ============================================

/**
 * Deleta uma instituição do banco de dados (MODIFICADO)
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
            // ✅ MODIFICADO: Chama o orquestrador central
            carregarTodaAplicacao();
        } else {
            throw new Error(dados.error || "Erro ao deletar");
        }
    })
    .catch(err => {
        console.error("❌ Erro ao deletar instituição:", err);
        mostrarAlerta("Erro ao deletar instituição do banco de dados.", "erro");
        mostrarLoader('esconder');
    });
}

/**
 * Deleta um curso do banco de dados (MODIFICADO)
 */
function deletarCursoDB(id, idInstituicao) {
    console.log(`🗑️ Deletando curso ID: ${id}`);
    mostrarLoader('mostrar');

    fetch("/curso/deletar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parseInt(id), id_instituicao: parseInt(idInstituicao) })
    })
    .then(res => res.json())
    .then(dados => {
        console.log("✅ Resposta do servidor:", dados);
        if (dados.sucesso) {
            mostrarAlerta("Curso deletado com sucesso!", "sucesso");
            // ✅ MODIFICADO: Chama o orquestrador central
            carregarTodaAplicacao();
        } else {
            throw new Error(dados.error || "Erro ao deletar");
        }
    })
    .catch(err => {
        console.error("❌ Erro ao deletar curso:", err);
        mostrarAlerta("Erro ao deletar curso do banco de dados.", "erro");
        mostrarLoader('esconder');
    });
}

/**
 * Deleta uma disciplina do banco de dados (usando CODIGO) (MODIFICADO)
 */
function deletarDisciplinaDB(codigo) {
    console.log(`🗑️ Deletando disciplina código: ${codigo}`);
    mostrarLoader('mostrar');

    fetch("/disciplina/deletar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigo })
    })
    .then(res => res.json())
    .then(dados => {
        console.log("✅ Resposta do servidor:", dados);
        if (dados.sucesso || dados.message) {
            mostrarAlerta("Disciplina deletada com sucesso!", "sucesso");
            // ✅ MODIFICADO: Chama o orquestrador central
            carregarTodaAplicacao();
        } else {
            throw new Error(dados.error || "Erro ao deletar");
        }
    })
    .catch(err => {
        console.error("❌ Erro ao deletar disciplina:", err);
        mostrarAlerta("Erro ao deletar disciplina do banco de dados.", "erro");
        mostrarLoader('esconder');
    });
}

/**
 * Deleta uma turma do banco de dados (MODIFICADO)
 */
function deletarTurmaDB(id) {
    console.log(`🗑️ Deletando turma ID: ${id}`);
    mostrarLoader('mostrar');

    fetch("/turma/deletar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parseInt(id) })
    })
    .then(res => res.json())
    .then(dados => {
        console.log("✅ Resposta do servidor:", dados);
        if (dados.sucesso || dados.message) {
            mostrarAlerta("Turma deletada com sucesso!", "sucesso");
            fecharModalEdicaoExpansivel(document.querySelector("#turmasBody .modalEdicaoExpansivel"));
            // ✅ MODIFICADO: Chama o orquestrador central
            carregarTodaAplicacao();
        } else {
            throw new Error(dados.error || "Erro ao deletar");
        }
    })
    .catch(err => {
        console.error("❌ Erro ao deletar turma:", err);
        mostrarAlerta("Erro ao deletar turma do banco de dados.", "erro");
        mostrarLoader('esconder');
    });
}

// ============================================
// 7. GERENCIAMENTO DE MODAIS E UI AUXILIAR
// (Funções que controlam a abertura/fechamento de modais e preenchimento de selects)
// ============================================

function abrirModalAdicionarCurso(idInstituicao) {
    const instituicao = AppState.instituicoes.find(inst => inst.id == idInstituicao);
    if (!instituicao) { /*...*/ return; }
    const modalAdd = document.querySelector("#instituicoesBody .containerAddIdt");
    if (modalAdd) {
        modalAdd.style.display = "block";
        modalAdd.setAttribute("data-instituicao-id", idInstituicao);
        const datalist = document.getElementById("listCursosLink");
        if (datalist) {
            datalist.innerHTML = "";
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

function fecharModalAdicionarCurso() {
    const modalAdd = document.querySelector("#instituicoesBody .containerAddIdt");
    if (modalAdd) {
        modalAdd.style.display = "none";
        modalAdd.removeAttribute("data-instituicao-id");
    }
}

function abrirModalAdicionarDisciplina(idCurso) {
    console.log("➕ Adicionar disciplina ao curso ID:", idCurso);
    const curso = AppState.cursos.find(c => c.id == idCurso);
    if (!curso) { /*...*/ return; }
    const modalAdd = document.querySelector("#cursosBody .containerAddIdt");
    if (modalAdd) {
        modalAdd.style.display = "block";
        modalAdd.setAttribute("data-curso-id", idCurso);
        const datalist = document.getElementById("listDisciplinasLink");
        if (datalist) {
            datalist.innerHTML = "";
            // ... (lógica para preencher datalist de disciplinas) ...
        }
    }
}

function fecharModalAdicionarDisciplina() {
    const modalAdd = document.querySelector("#cursosBody .containerAddIdt");
    if (modalAdd) {
        modalAdd.style.display = "none";
        modalAdd.removeAttribute("data-curso-id");
    }
}

function preencherSelectInstituicoes() {
    const selectInstituicao = document.querySelector("#cursosBody #instituicao");
    if (!selectInstituicao) { /*...*/ return; }
    console.log("📝 Preenchendo select com", AppState.instituicoes.length, "instituições");
    selectInstituicao.innerHTML = '<option value="" disabled selected>Selecione a instituição</option>';
    AppState.instituicoes.forEach(inst => {
        const option = document.createElement("option");
        option.value = inst.id;
        option.textContent = inst.nome;
        selectInstituicao.appendChild(option);
    });
}

function preencherSelectCursos() {
    const selectCurso = document.querySelector("#disciplinasBody #curso");
    if (!selectCurso) { /*...*/ return; }
    console.log("📝 Preenchendo select com", AppState.cursos.length, "cursos");
    selectCurso.innerHTML = '<option value="" disabled selected>Selecione o curso</option>';
    AppState.cursos.forEach(curso => {
        const option = document.createElement("option");
        option.value = curso.id;
        option.textContent = `${curso.curso} - ${get.getNomeInstituicaoPorId(curso.fk_id_instituicao)}`;
        selectCurso.appendChild(option);
    });
}

function preencherSelectDisciplinas() {
    const inputDisciplina = document.querySelector("#turmasBody #inputDisciplinaTurma");
    const datalist = document.querySelector("#turmasBody #listTurma");
    if (!inputDisciplina && !datalist) { /*...*/ return; }
    if (inputDisciplina && inputDisciplina.tagName === "SELECT") {
        inputDisciplina.innerHTML = '<option value="">Selecione uma disciplina</option>';
    }
    if (datalist) { datalist.innerHTML = ""; }
    const disciplinas = AppState.disciplinas || [];
    if (disciplinas.length === 0) { /*...*/ return; }
    disciplinas.forEach(disciplina => {
        if (inputDisciplina && inputDisciplina.tagName === "SELECT") {
            const option = document.createElement("option");
            option.value = disciplina.nome;
            option.textContent = `${disciplina.nome} (${disciplina.sigla})`;
            inputDisciplina.appendChild(option);
        } else if (datalist) {
            const option = document.createElement("option");
            option.value = disciplina.nome;
            datalist.appendChild(option);
        }
    });
    console.log("✅ Disciplinas carregadas no select/datalist");
}

// ============================================
// 8. FUNÇÕES AUXILIARES E GETTERS DO ESTADO
// ============================================

const get = (() => {
    function getNomeInstituicaoPorId(id) {
        const instituicao = AppState.instituicoes.find(inst => inst.id == id);
        return instituicao ? instituicao.nome : "Instituição não encontrada";
    }
    function getNomeCursoPorId(id) {
        const curso = AppState.cursos.find(c => c.id == id);
        return curso ? curso.curso : "Curso não encontrado";
    }
    function getInstituicaoPorId(id) {
        return AppState.instituicoes.find(inst => inst.id == id) || null;
    }
    function getCursoPorId(id) {
        return AppState.cursos.find(c => c.id == id) || null;
    }
    function getCursosPorInstituicao(idInstituicao) {
        return AppState.cursos.filter(curso => curso.fk_id_instituicao == idInstituicao);
    }
    function getNomeInstituicaoDoCurso(idCurso) {
        const curso = AppState.cursos.find(c => c.id == idCurso);
        if (!curso) return "Instituição não encontrada";
        return getNomeInstituicaoPorId(curso.fk_id_instituicao);
    }
    function getDisciplinasPorCurso(idCurso) {
        return AppState.disciplinas.filter(disc => disc.id_curso == idCurso);
    }
    return {
        getDisciplinasPorCurso,
        getNomeInstituicaoPorId,
        getNomeCursoPorId,
        getInstituicaoPorId,
        getCursoPorId,
        getCursosPorInstituicao,
        getNomeInstituicaoDoCurso
    };
})();

function vincularDisciplinasAosCursos() {
    console.log("🔗 Vinculando disciplinas aos cursos...");
    if (!AppState.disciplinas || AppState.disciplinas.length === 0) {
        AppState.cursos.forEach(curso => { curso.disciplinas = []; });
        return;
    }
    AppState.cursos.forEach(curso => {
        const disciplinasDoCurso = AppState.disciplinas.filter(
            disc => disc.id_curso == curso.id
        );
        curso.disciplinas = disciplinasDoCurso;
    });
    console.log("✅ Disciplinas vinculadas aos cursos");
}

function vincularCursosNasInstituicoes() {
    AppState.instituicoes = AppState.instituicoes.map(inst => {
        const cursosDaInstituicao = AppState.cursos.filter(curso => {
            return curso.fk_id_instituicao == inst.id;
        });
        return {
            ...inst,
            cursos: cursosDaInstituicao.map(c => c.curso)
        };
    });
    console.log("\n✅ Instituições com cursos vinculados");
    
    // ❌ REMOVIDO: renderizarCardsInstituicoes() (será chamado centralmente)
}

// ============================================
// 9. INICIALIZAÇÃO DA APLICAÇÃO (MODIFICADO)
// ============================================

/**
 * ✅ NOVO: Orquestrador principal de carregamento
 */
async function carregarTodaAplicacao() {
    mostrarLoader('mostrar');
    try {
        // 1. Carrega Instituições
        await carregarInstituicoesFromDB();
        
        // 2. Carrega Cursos (só se houver instituições)
        if (AppState.instituicoes.length > 0) {
            await carregarCursosFromDB();
        }
        
        // 3. Carrega Disciplinas (só se houver cursos)
        if (AppState.cursos.length > 0) {
            await carregarDisciplinasFromDB();
        }

        // 4. Carrega Turmas (só se houver disciplinas)
        if (AppState.disciplinas.length > 0) {
            await carregarTurmasFromDB();
        }

        // 5. ✅ Renderiza tudo de uma vez
        renderizarTodaInterface();

    } catch (err) {
        console.error("❌ Erro fatal na cadeia de carregamento:", err);
        // O loader já foi escondido pela função que falhou (provavelmente)
    } finally {
        mostrarLoader('esconder');
    }
}

/**
 * ✅ NOVO: Função única para renderizar e vincular dados
 */
function renderizarTodaInterface() {
    console.log("🚀 Renderizando toda a interface...");
    
    // 1. Vincula dados no AppState
    vincularDisciplinasAosCursos(); // Primeiro, para cursos terem disciplinas
    vincularCursosNasInstituicoes(); // Segundo, para instituições terem nomes de cursos

    // 2. Renderiza os cards
    renderizarCardsInstituicoes();
    renderizarCardsCursos();
    renderizarCardsDisciplinas();
    renderizarCardsTurmas(); // Dispara o evento para seus listeners de turma

    // 3. Atualiza o Dashboard
    atualizarDashboardView();
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("🔧 Configurando integração com banco de dados...");
    
    // ✅ NOVO: Chama a nova cadeia de carregamento
    carregarTodaAplicacao(); 
});