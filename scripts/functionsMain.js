// ============================================
// INTEGRAÇÃO COM BANCO DE DADOS
// ============================================

// Função para carregar instituições do banco de dados
function carregarInstituicoesFromDB() {
    mostrarLoader('mostrar');
    
    fetch("/instituicao/all", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(res => {
            console.log("📥 Status ao buscar instituições:", res.status);
            return res.json();
        })
        .then(dados => {
            console.log("✅ Instituições recebidas:", dados);
            if (Array.isArray(dados)) {
                // Formata os dados para o formato esperado pelo main.js
                let instituicoesFormatadas = dados.map(inst => ({
                    id: inst.id.toString(),
                    nome: inst.nome,
                    cursos: inst.cursos || []
                }));
                
                // Salva no localStorage
                localStorage.setItem("instituicoesBody", JSON.stringify(instituicoesFormatadas));
                console.log("💾 Instituições salvas no localStorage:", instituicoesFormatadas.length);
                
                // Atualiza o contador no dashboard
                atualizarContadorInstituicoes(instituicoesFormatadas.length);
                
                // Dispara evento para recarregar a interface
                let evento = new CustomEvent('instituicoesAtualizadas', { 
                    detail: { instituicoes: instituicoesFormatadas }
                });
                document.dispatchEvent(evento);
                
                mostrarLoader('esconder');
            } else {
                console.warn("⚠️ Formato de dados inesperado:", dados);
                mostrarLoader('esconder');
                mostrarAlerta("Formato de dados inesperado recebido do servidor.", "erro");
            }
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

// Função para salvar instituição no banco
document.addEventListener("click", (e) => {
    const createBtn = e.target.closest("#createBtnIdt");

    if (!createBtn) return;

    const container = createBtn.closest("#instituicoesBody");
    if (!container) return;

    e.preventDefault();

    const modal = createBtn.closest(".createIdt");
    if (!modal) {
        console.error("Modal não encontrado!");
        return;
    }

    // ✅ CORREÇÃO: nomeDaInstituicao (com "a" no final)
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

    mostrarLoader("mostrar");

    fetch("/instituicao/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeInstituicao })
    })
        .then(res => {
            console.log("📥 Status dos dados recebidos:", res.status);
            return res.json();
        })
        .then(data => {
            if (data.sucesso) {
                mostrarLoader('esconder');
                mostrarAlerta("Instituição ainda não cadastrada!", "sucesso");
                console.log("Intituição ainda não cadastrada: ", nomeInstituicao,);

                mostrarLoader('mostrar');
                fetch("/instituicao/cadastro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome: nomeInstituicao })
                })
                    .then(res => {
                        console.log("📥 Status dos dados recebidos:", res.status);
                        return res.json();
                    })
                    .then(dados => {
                        console.log("✅ Dados da verificação:", dados);
                        if (dados.sucesso) {
                            mostrarLoader('esconder');
                            mostrarAlerta("Cadastro de instituição realizado com sucesso", "sucesso");
                            console.log("Cadastro realizado com sucesso!");

                            inputNome.value = "";

                            const modal = createBtn.closest(".createIdt");
                            if (modal) modal.classList.remove("show");

                        } else {
                            mostrarLoader('esconder');
                            mostrarAlerta("Erro ao realizar o cadastro!", "erro");
                            console.log("Erro ao realizar o cadastro!");
                        }
                    })
                    .catch(err => {
                        console.error("Erro ao cadastrar instituição. Error:", err);
                        console.error("Detalhes do erro:", err.message);
                        mostrarLoader('esconder');
                        mostrarAlerta("Ocorreu um erro. Verifique o console para mais detalhes.", "erro");
                    });

            } else {
                mostrarLoader('esconder');
                mostrarAlerta("Instituição ja possui cadastro!", "aviso");
                console.log("Instituição ja possui cadastro!");
            }
        })
        .catch(err => {
            mostrarLoader("mostrar");
            mostrarAlerta("Ocorreu um erro. Verifique o console para mais detalhes.", "erro");
            console.error("Erro ao verificar Instituição: err: ", err);
            console.error("Mensagem: ", err.message);
        });
});

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