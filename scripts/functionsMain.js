// ============================================
// INTEGRAÇÃO COM BANCO DE DADOS (CORRIGIDO)
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
            if (!res) return; // Se chegou aqui por erro
            return res.json();
        })
        .then(dados => {
            if (!dados) return; // Se chegou aqui por erro
            
            if (dados.sucesso) {
                mostrarLoader('esconder');
                mostrarAlerta("Cadastro realizado com sucesso", "sucesso");

                // Limpa o input e fecha o modal
                inputNome.value = "";
                modal.classList.remove("show");
                
                // Recarrega as instituições do banco
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
    
    const nomeInstituicao = obterNomeInstituicao(id);
    const confirmacao = confirm(`Tem certeza que deseja excluir "${nomeInstituicao}"?`);
    
    if (!confirmacao) {
        console.log("❌ Deleção cancelada pelo usuário");
        return;
    }
    
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

    // Carrega instituições ao iniciar
    carregarInstituicoesFromDB();

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