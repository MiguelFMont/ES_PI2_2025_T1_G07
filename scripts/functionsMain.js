// ============================================
// CACHE EM MEMÓRIA (Estado da Aplicação)
// ============================================
const AppState = {
    instituicoes: [],
    cursos: [],
    turmas: []
};

// ============================================
// ATUALIZAÇÃO DO DASHBOARD
// ============================================

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

// ============================================
// 1. INSTITUIÇÕES
// ============================================

/**
 * Carrega instituições do banco de dados.
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

function atualizarContadorInstituicoes(quantidade) {
    const instituicoesCounter = document.querySelector("#instituicoes .titleOptionDashboard p");
    if (instituicoesCounter) {
        instituicoesCounter.textContent = quantidade;
        console.log("📊 Contador de Instituições atualizado:", quantidade);
    }
}

/**
 * Salva nova instituição no banco de dados
 * IMPORTANTE: Salva instituição E curso simultaneamente
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

// ============================================
// 2. CURSOS
// ============================================

/**
 * Carrega cursos e VINCULA às instituições
 */
function carregarCursosFromDB() {
    const instituicoes = AppState.instituicoes;
    if (!instituicoes || instituicoes.length === 0) {
        console.log("ℹ️ Nenhuma instituição carregada. Pulando carregamento de Cursos.");
        AppState.cursos = [];
        atualizarContadorCursos(0);
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
                
                // ✅ VINCULA OS CURSOS ÀS INSTITUIÇÕES
                vincularCursosNasInstituicoes();
            }

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
 * ✅ NOVA FUNÇÃO: Vincula cursos às instituições após carregar
 */
function vincularCursosNasInstituicoes() {
    
    AppState.instituicoes = AppState.instituicoes.map(inst => {
        
        // Filtra cursos que pertencem a esta instituição
        const cursosDaInstituicao = AppState.cursos.filter(curso => {

            const pertence = curso.fk_id_instituicao == inst.id;
            
            if (pertence) {
                console.log(`  ✅ Curso "${curso.curso}" VINCULADO à "${inst.nome}"`);
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


// Renderiza os cards de instituições na interface
 
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
        //  elementos internos do card vazio
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
                <button class="addCurso" >
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
        
        containerCards.appendChild(card);
    });
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
 * Confirma antes de deletar uma instituição
 */
function confirmarDeletarInstituicao(id) {
    const instituicao = AppState.instituicoes.find(inst => inst.id == id);
    const nome = instituicao ? instituicao.nome : "instituição";
    
    if (confirm(`Tem certeza que deseja deletar a instituição "${nome}"? Esta ação não pode ser desfeita.`)) {
        deletarInstituicaoDB(id);
    }
}


function atualizarContadorCursos(quantidade) {
    const counter = document.querySelector("#cursos .titleOptionDashboard p");
    if (counter) {
        counter.textContent = quantidade;
        console.log("📊 Contador de Cursos atualizado:", quantidade);
    }
}

function salvarCurso() {
    const modal = document.querySelector("#cursosBody .createIdt");
    if (!modal) {
        console.error("Modal não encontrado!");
        return;
    }

    const inputInstituicao = modal.querySelector("#instituicao");
    const inputNomeCurso = modal.querySelector("#nomeDoCurso");

    if (!inputInstituicao || !inputNomeCurso) {
        console.error("Inputs não encontrados!");
        return;
    }

    const nomeInstituicao = inputInstituicao.value.trim();
    const nomeCurso = inputNomeCurso.value.trim();

    if (nomeCurso === "") {
        mostrarAlerta("Preencha o campo \"Nome do Curso\"", "aviso");
        return;
    }

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || !usuarioLogado.id) {
        mostrarAlerta("Erro: Usuário não autenticado. Faça login novamente.", "erro");
        return;
    }

    // Busca o ID da instituição
    let fk_id_instituicao = null;
    if (nomeInstituicao) {
        const instituicaoEncontrada = AppState.instituicoes.find(
            inst => inst.nome.toLowerCase() === nomeInstituicao.toLowerCase()
        );

        if (instituicaoEncontrada) {
            fk_id_instituicao = parseInt(instituicaoEncontrada.id);
            console.log("🏢 Instituição selecionada ID:", fk_id_instituicao);
        } else {
            mostrarAlerta("Instituição não encontrada. Selecione uma instituição válida.", "aviso");
            return;
        }
    }

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

                inputInstituicao.value = "";
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
// 3. TURMAS
// ============================================

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

function atualizarContadorTurmas(quantidade) {
    const counter = document.querySelector("#turmas .titleOptionDashboard p");
    if (counter) {
        counter.textContent = quantidade;
        console.log("📊 Contador de Turmas atualizado:", quantidade);
    }
}

//////////// Disciplinas ///////////

// ============================================
// DISCIPLINAS - INTEGRAÇÃO COM BANCO
// ============================================

function salvarDisciplina() {
    const modal = document.querySelector("#cursosBody .createIdt");
    if (!modal) {
        console.error("Modal não encontrado!");
        return;
    }

    const inputCodigoDisciplina = modal.querySelector("#inputCodigoDisciplina");
    const inputNomeCurso = modal.querySelector("#cursoSelect");
    const inputNomeDisciplina = modal.querySelector("#inputNomeDisciplina");
    const inputPeriodo = modal.querySelector("periodoSelect");
    const inputSiglaDisciplina = modal.querySelector("#inputSiglaDisciplina");

    if (!inputCodigoDisciplina || !inputNomeCursoDisciplina || inputNomeDisciplina || inputPeriodo || inputSiglaDisciplina) {
        console.error("Inputs não encontrados!");
        return;
    }

    const codigoDisciplina = inputCodigoDisciplina.value.trim();
    const nomeCurso = cursoSelect.value.trim()
    const nomeDisciplina = inputNomeDisciplina.value.trim()
    const periodo = periodoSelect.value.trim();
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
        const curso = JSON.parse(localStorage.getItem("disciplinaBody")) || [];
        const cursoEncontrada = curso.find(
            inst => inst.nome.toLowerCase() === NomeCurso.toLowerCase()
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

    // Dados para enviar ao backend
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
                    })
                });
            } else {
                mostrarLoader('esconder');
                mostrarAlerta("Este disciplina já está cadastrado neste curso!", "aviso");
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

                // Recarrega os cursos
                // Implementar para disciplina
                carregarCursosFromDB();

                // Se vinculado a uma instituição, atualiza a lista de cursos da instituição
                if (fk_id_curso) {
                    carregarCursosFromDB();
                }
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
// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
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

console.log("✅ Sistema de integração com banco de dados carregado!");