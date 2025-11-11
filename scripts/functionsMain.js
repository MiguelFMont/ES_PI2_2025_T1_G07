// ============================================
// INTEGRAÇÃO COM BANCO DE DADOS
// ============================================

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
            
            // ✅ CORREÇÃO: Aceitar AMBOS os formatos
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
                console.log("⚠️ Nenhuma instituição foi cadastrada para o usuário atual:", dados);
                mostrarLoader('esconder');
                mostrarAlerta("Cadastre uma instituição!", "aviso");
                return;
            }
            
            // Formata os dados para o formato esperado pelo main.js
            let instituicoesFormatadas = instituicoes.map(inst => ({
                id: inst.id.toString(),
                nome: inst.nome,
                cursos: inst.cursos || []
            }));

            // Salva no localStorage
            localStorage.setItem("instituicoesBody", JSON.stringify(instituicoesFormatadas));
            console.log("💾 Instituições salvas no localStorage:", instituicoesFormatadas.length);

            // Atualiza o contador no dashboard
            atualizarContadorInstituicoes(instituicoesFormatadas.length);
            
            forcarReRenderizacao();

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
    // ✅ MUDANÇA: Trocar id_docente por id
    if (!usuarioLogado || !usuarioLogado.id) {
        mostrarAlerta("Erro: Usuário não autenticado. Faça login novamente.", "erro");
        return;
    }
    const id_docente = usuarioLogado.id;  // ✅ MUDANÇA: usar .id ao invés de .id_docente

    mostrarLoader("mostrar");

    fetch("/instituicao/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeInstituicao, id_docente: id_docente })
    })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                mostrarLoader('esconder');
                mostrarAlerta("Instituição ainda não cadastrada!", "sucesso");

                // Cadastra a instituição
                return fetch("/instituicao/cadastro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome: nomeInstituicao, id_docente: id_docente })
                });
            } else {
                mostrarLoader('esconder');
                mostrarAlerta("Instituição já possui cadastro!", "aviso");
                throw new Error("Instituição duplicada");
            }
        })
        .then(res => res.json())
        .then(dados => {
            if (dados.sucesso) {
                mostrarLoader('esconder');
                mostrarAlerta("Cadastro realizado com sucesso", "sucesso");

                inputNome.value = "";
                modal.classList.remove("show");
                carregarInstituicoesFromDB();
            } else {
                mostrarLoader('esconder');
                mostrarAlerta("Erro ao realizar o cadastro!", "erro");
            }
        })
        .catch(err => {
            mostrarLoader('esconder');
            mostrarAlerta("Ocorreu um erro. Verifique o console.", "erro");
            console.error("Erro:", err);
        });
}
// Função para deletar instituição do banco
function deletarInstituicaoDB(id) {
    console.log(`🗑️ Deletando instituição ID: ${id}`);
    mostrarLoader('mostrar');

    fetch("/instituicao/deletar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id })
    })
        .then(res => res.json())
        .then(dados => {
            console.log("✅ Resposta do servidor:", dados);

            if (dados.message) {
                mostrarLoader('esconder');
                mostrarAlerta("Instituição deletada com sucesso!", "sucesso");
                carregarInstituicoesFromDB();
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
function forcarReRenderizacao() {
    console.log("🔄 Forçando re-renderização...");

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

// Carrega instituições ao iniciar e configura interceptadores
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log("🔧 Configurando integração com banco de dados...");

        // Carrega instituições ao iniciar
        carregarInstituicoesFromDB();

        // Observa quando o botão de salvar for adicionado ao DOM
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.matches('#createBtnIdt')) {
                        interceptarBotaoSalvar(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

    }, 500);
});

console.log("✅ Sistema de integração com banco de dados carregado!");