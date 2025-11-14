//////////// Cursos ///////////

// ============================================
// CURSOS - INTEGRAÇÃO COM BANCO
// ============================================

/**
 * Carrega todos os cursos do banco de dados
 */
function carregarCursosFromDB() {
    const instituicoesArmazenadas = localStorage.getItem("instituicoesBody");
    if (!instituicoesArmazenadas) {
        console.error("❌ Nenhuma instituição armazenada");
        mostrarAlerta("Nenhuma instituição registrada no armazenamento local.", "erro");
        return;
    }

    const instituicoes = JSON.parse(instituicoesArmazenadas);
    const idsInstituicoes = instituicoes.map(inst => inst.id);

    mostrarLoader('mostrar');

    // Usar idsInstituicoes para carregar cursos de todas as instituições
    const fetchCursosPromises = idsInstituicoes.map(id =>
        fetch(`/curso/all/${id}`).then(res => res.json())
    );

    Promise.all(fetchCursosPromises)
        .then(resultados => {
            const todosCursos = resultados.flatMap(resultado => resultado.cursos || []);

            if (todosCursos.length === 0) {
                console.log("⚠️ Nenhum curso cadastrado");
                localStorage.setItem("cursosBody", JSON.stringify([]));
                atualizarContadorCursos(0);
                mostrarAlerta("Cadastre um curso!", "aviso");
            } else {
                const cursosFormatados = todosCursos.map(curso => ({
                    id: curso.id.toString(),
                    nome: curso.nome_instituicao || curso.instituicao || "",
                    curso: curso.nome || curso.nome_curso || "",
                    disciplinas: curso.disciplinas || []
                }));

                console.log("✅ Cursos formatados:", cursosFormatados);

                localStorage.setItem("cursosBody", JSON.stringify(cursosFormatados));
                atualizarContadorCursos(cursosFormatados.length);
            }

            document.dispatchEvent(new CustomEvent('recarregarCursos'));
            mostrarLoader('esconder');
        })
        .catch(err => {
            console.error("❌ Erro ao carregar cursos:", err);
            mostrarLoader('esconder');
            mostrarAlerta("Erro ao carregar cursos do banco de dados.", "erro");
        });
}

/**
 * Salva um novo curso no banco de dados
 */
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

    // Busca o ID da instituição se foi selecionada
    let fk_id_instituicao = null;
    if (nomeInstituicao) {
        const instituicoes = JSON.parse(localStorage.getItem("instituicoesBody")) || [];
        const instituicaoEncontrada = instituicoes.find(
            inst => inst.nome.toLowerCase() === nomeInstituicao.toLowerCase()
        );

        if (instituicaoEncontrada) {
            fk_id_instituicao = parseInt(instituicaoEncontrada.id);
            console.log(fk_id_instituicao)
        } else {
            mostrarAlerta("Instituição não encontrada. Selecione uma instituição válida.", "aviso");
            return;
        }
    }

    mostrarLoader("mostrar");

    // Dados para enviar ao backend
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
        .then(res => {
            return res.json();
        })
        .then(dados => {

            if (dados.sucesso) {
                mostrarLoader('esconder');
                mostrarAlerta("Curso cadastrado com sucesso!", "sucesso");

                // Limpa os inputs e fecha o modal
                inputInstituicao.value = "";
                inputNomeCurso.value = "";
                modal.classList.remove("show");

                // Recarrega os cursos
                carregarCursosFromDB();

                // Se vinculado a uma instituição, atualiza a lista de cursos da instituição
                if (fk_id_instituicao) {
                    carregarInstituicoesFromDB();
                }
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
        .then(res => {
            console.log("📥 Status da resposta:", res.status);
            return res.json();
        })
        .then(dados => {
            console.log("✅ Resposta do servidor:", dados);

            if (dados.sucesso) {
                // Remove do localStorage
                let cursos = JSON.parse(localStorage.getItem("cursosBody")) || [];
                const cursoRemovido = cursos.find(c => c.id == id);
                cursos = cursos.filter(c => c.id != id);
                localStorage.setItem("cursosBody", JSON.stringify(cursos));

                atualizarContadorCursos(cursos.length);

                // Se o curso estava vinculado a uma instituição, atualiza a instituição
                if (cursoRemovido && cursoRemovido.nome) {
                    let instituicoes = JSON.parse(localStorage.getItem("instituicoesBody")) || [];
                    const inst = instituicoes.find(
                        i => i.nome.toLowerCase() === cursoRemovido.nome.toLowerCase()
                    );
                    if (inst && Array.isArray(inst.cursos)) {
                        inst.cursos = inst.cursos.filter(
                            c => c.toLowerCase() !== cursoRemovido.curso.toLowerCase()
                        );
                        localStorage.setItem("instituicoesBody", JSON.stringify(instituicoes));
                    }
                }

                document.dispatchEvent(new CustomEvent('recarregarCursos'));

                mostrarLoader('esconder');

                mostrarAlerta("Curso deletado com sucesso!", "sucesso");

            } else {
                throw new Error(dados.error || "Erro ao deletar");
            }
        })
        .catch(err => {
            console.error("❌ Erro ao deletar curso:", err);
            mostrarLoader('esconder');
            mostrarAlerta("Erro ao deletar curso do banco de dados.", "erro");

        });
}

/**
 * Atualiza o contador de cursos no dashboard
 */
function atualizarContadorCursos(quantidade) {
    const counter = document.querySelector("#cursos .titleOptionDashboard p");
    if (counter) {
        counter.textContent = quantidade;
        console.log("📊 Contador de cursos atualizado:", quantidade);
    }
}

/**
 * Obtém o nome do curso pelo ID
 */
function obterNomeCurso(id) {
    const cursos = JSON.parse(localStorage.getItem("cursosBody")) || [];
    const curso = cursos.find(c => c.id == id);
    return curso ? curso.curso : "Curso";
}

/////////////   INSTITUIÇÕES  //////////////

// Função para carregar instituições do banco de dados
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
        .then(res => {
            console.log("📥 Status ao buscar instituições:", res.status);
            return res.json();
        })
        .then(dados => {
            console.log("📦 Dados recebidos do servidor:", dados);

            let instituicoes;

            if (Array.isArray(dados)) {
                // Se for array direto
                instituicoes = dados;
                console.log("🔄 Formato 1: Array direto");
            } else if (dados.instituicoes && Array.isArray(dados.instituicoes)) {
                // Se for objeto com propriedade instituicoes
                instituicoes = dados.instituicoes;
                console.log("🔄 Formato 2: Objeto com propriedade .instituicoes");
            } else {
                // Nenhum dos dois
                console.log("⚠️ Nenhuma instituição foi cadastrada para o usuário atual");

                // ✅ CORREÇÃO: Limpa localStorage e atualiza contador para 0
                localStorage.setItem("instituicoesBody", JSON.stringify([]));
                atualizarContadorInstituicoes(0);

                mostrarAlerta("Cadastre uma instituição!", "aviso");
                mostrarLoader('esconder');
                return;
            }

            // Formata os dados para o formato esperado pelo main.js
            let instituicoesFormatadas = instituicoes.map(inst => ({
                id: inst.id.toString(),
                nome: inst.nome,
                cursos: inst.cursos || []
            }));

            console.log("✅ Instituições formatadas:", instituicoesFormatadas);

            // Salva no localStorage
            localStorage.setItem("instituicoesBody", JSON.stringify(instituicoesFormatadas));
            console.log("💾 Instituições salvas no localStorage:", instituicoesFormatadas.length);

            // Atualiza o contador no dashboard
            atualizarContadorInstituicoes(instituicoesFormatadas.length);

            forcarRenderizacao();

            mostrarLoader('esconder');
        })
        .catch(err => {
            console.error("❌ Erro ao carregar instituições:", err);
            mostrarLoader('esconder');
            mostrarAlerta("Erro ao carregar instituições do banco de dados.", "erro");
        });
}

// Função para atualizar o contador do dashboard
function atualizarContadorInstituicoes(quantidade) {
    let instituicoesCounter = document.querySelector("#instituicoes .titleOptionDashboard p");
    if (instituicoesCounter) {
        instituicoesCounter.textContent = quantidade;
        console.log("📊 Contador atualizado:", quantidade);
    }
}

function salvarInstituicao() {
    const modal = document.querySelector("#instituicoesBody .createIdt");
    if (!modal) {
        console.error("Modal não encontrado!");
        return;
    }

    const inputNome = modal.querySelector("#nomeDaInstituicao");
    if (!inputNome) {
        console.error("Input não encontrado!");
        return;
    }

    const nomeInstituicao = inputNome.value.trim();

    if (nomeInstituicao === "") {
        mostrarAlerta("Preencha o campo \"Nome da Instituição\"", "aviso");
        return;
    }

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || !usuarioLogado.id) {
        mostrarAlerta("Erro: Usuário não autenticado. Faça login novamente.", "erro");
        return;
    }
    const id_docente = usuarioLogado.id;

    mostrarLoader("mostrar");

    // PASSO 1: Verificar se já existe
    fetch("/instituicao/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeInstituicao, id_docente: id_docente })
    })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                // Instituição ainda não existe, pode cadastrar
                console.log("✅ Instituição disponível para cadastro");

                // PASSO 2: Cadastrar a instituição
                return fetch("/instituicao/cadastro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome: nomeInstituicao, id_docente: id_docente })
                });
            } else {
                // Instituição já existe
                mostrarLoader('esconder');
                mostrarAlerta("Instituição já possui cadastro!", "aviso");
                throw new Error("Instituição duplicada");
            }
        })
        .then(res => {
            return res.json();
        })
        .then(dados => {

            if (dados.sucesso) {
                mostrarLoader('esconder');
                mostrarAlerta("Cadastro realizado com sucesso", "sucesso");

                // Limpa o input e fecha o modal
                inputNome.value = "";
                modal.classList.remove("show");

                // Recarrega as instituições do banco (já atualiza o contador)
                carregarInstituicoesFromDB();
            } else {
                mostrarLoader('esconder');
                mostrarAlerta("Erro ao realizar o cadastro!", "erro");
            }
        })
        .catch(err => {
            if (err.message !== "Instituição duplicada") {
                mostrarLoader('esconder');
                mostrarAlerta("Ocorreu um erro. Verifique o console.", "erro");
                console.error("Erro:", err);
            }
        });
}

// Função para deletar instituição do banco
function deletarInstituicaoDB(id) {
    console.log(`🗑️ Deletando instituição ID: ${id}`);

    mostrarLoader('mostrar');

    fetch("/instituicao/deletar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parseInt(id) })
    })
        .then(res => {
            console.log("📥 Status da resposta:", res.status);
            return res.json();
        })
        .then(dados => {
            console.log("✅ Resposta do servidor:", dados);

            if (dados.sucesso || dados.message) {
                // ✅ REMOVE DO LOCALSTORAGE IMEDIATAMENTE
                let instituicoes = JSON.parse(localStorage.getItem("instituicoesBody")) || [];
                instituicoes = instituicoes.filter(inst => inst.id != id);
                localStorage.setItem("instituicoesBody", JSON.stringify(instituicoes));

                // ✅ ATUALIZA O CONTADOR
                atualizarContadorInstituicoes(instituicoes.length);

                // ✅ FORÇA RENDERIZAÇÃO IMEDIATA
                forcarRenderizacao();

                mostrarLoader('esconder');
                mostrarAlerta("Instituição deletada com sucesso!", "sucesso");
            } else {
                throw new Error(dados.error || "Erro ao deletar");
            }
        })
        .catch(err => {
            console.error("❌ Erro ao deletar instituição:", err);
            mostrarLoader('esconder');
            mostrarAlerta("Erro ao deletar instituição do banco de dados.", "erro");
        });
}

// Função auxiliar para obter o nome da instituição pelo ID
function obterNomeInstituicao(id) {
    const instituicoes = JSON.parse(localStorage.getItem("instituicoesBody")) || [];
    const instituicao = instituicoes.find(inst => inst.id == id);
    return instituicao ? instituicao.nome : "Instituição";
}

// ============================================
// INTEGRAÇÃO COM O MAIN.JS
// ============================================

// Listener para atualizar a interface quando houver mudanças
document.addEventListener('instituicoesAtualizadas', (e) => {
    console.log("🔄 Evento instituicoesAtualizadas disparado");

    let instituicoesContainer = document.querySelector('.instituições');
    if (instituicoesContainer && instituicoesContainer.style.display === 'block') {
        console.log("🔄 Recarregando página de instituições...");

        let reloadBtn = document.querySelector('.instituições .newIdt');
        if (reloadBtn) {
            let evento = new Event('DOMContentLoaded');
            document.dispatchEvent(evento);
        }
    }
});

// Função para forçar re-renderização na página atual
function forcarRenderizacao() {
    console.log("🔄 Forçando renderização...");

    // Verifica se está na página de instituições
    const instituicoesContainer = document.querySelector('.instituições');
    if (instituicoesContainer && instituicoesContainer.style.display === 'block') {

        // Pega a função loadAndRender do escopo do main.js
        const listContainer = instituicoesContainer.querySelector('.cardsCreateIdt');

        if (listContainer) {
            // Dispara um evento customizado que o main.js vai escutar
            const evento = new CustomEvent('recarregarInstituicoes');
            document.dispatchEvent(evento);
            console.log("✅ Evento recarregarInstituicoes disparado");
        }
    }
}

// Carrega instituições ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    console.log("🔧 Configurando integração com banco de dados...");

    carregarInstituicoesFromDB();
    carregarCursosFromDB();

    // Observa quando o botão de salvar for adicionado ao DOM
    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.matches('#createBtnIdt')) {
                    // O botão já tem o evento correto no main.js
                    console.log("✅ Botão #createBtnIdt detectado");
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

console.log("✅ Sistema de integração com banco de dados carregado!");