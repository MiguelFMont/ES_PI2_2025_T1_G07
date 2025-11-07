// main.js
document.addEventListener("DOMContentLoaded", () => {
    // --- LOGIN ---
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (usuario) {
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
        window.location.href = "/";
        return;
    }
    // --- LOGOUT ---
    const logoutBtn = document.querySelector("#logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("usuarioLogado");
            window.location.href = "/";
        });
    }

    // --- VARIÁVEIS GERAIS ---
    const links = document.querySelectorAll(".content ul li a");
    const paginas = {
        "dashboard": "./components/dashboard.html",
        "instituições": "./components/instituicoes.html",
        "cursos": "./components/cursos.html", 
        "diciplinas": "./components/diciplina.html",
        "turmas": "./components/turmas.html"
    };

    // --- FUNÇÃO: ATUALIZAR CONTADORES ---
    function atualizarContadoresDashboard() {
        const instituicoesCounter = document.querySelector("#instituicoes .titleOptionDashboard p");
        const cursosCounter = document.querySelector("#cursos .titleOptionDashboard p");
        const diciplinasCounter = document.querySelector("#diciplinas .titleOptionDashboard p");
        const turmasCounter = document.querySelector("#turmas .titleOptionDashboard p");

        const instituicoesItens = JSON.parse(localStorage.getItem("instituicoesBody")) || [];
        const cursosItens = JSON.parse(localStorage.getItem("cursosBody")) || [];
        const diciplinasItens = JSON.parse(localStorage.getItem("diciplinasBody")) || [];
        const turmasItens = JSON.parse(localStorage.getItem("turmasBody")) || [];

        if (instituicoesCounter) instituicoesCounter.textContent = instituicoesItens.length;
        if (cursosCounter) cursosCounter.textContent = cursosItens.length;
        if (diciplinasCounter) diciplinasCounter.textContent = diciplinasItens.length;
        if (turmasCounter) turmasCounter.textContent = turmasItens.length;
    }

    // --- FUNÇÃO PARA CARREGAR UMA PÁGINA ---
    async function carregarPagina(nome) {
        links.forEach(l => l.classList.remove("ativo"));
        const link = Array.from(links).find(l =>
            l.querySelector("p").textContent.trim().toLowerCase() === nome
        );
        if (link) link.classList.add("ativo");
        document.querySelectorAll(".pagesContent > div").forEach(div => {
            div.style.display = "none";
        });
        const divAtual = document.querySelector(`.${nome}`);
        if (divAtual) {
            divAtual.style.display = "block";
            try {
                const res = await fetch(paginas[nome]);
                const html = await res.text();
                divAtual.innerHTML = html;
                
                if (nome === "dashboard") {
                    atualizarContadoresDashboard();
                } else if (paginas[nome].includes("components/")) {
                    ativarCreateIdt(); 
                }

            } catch (error) {
                console.error("Erro ao carregar página:", error);
                divAtual.innerHTML = "<p>Erro ao carregar página.</p>";
            }
        }
    }

    // --- FUNÇÃO GENÉRICA PARA CONTROLE DE CREATEIDT ---
    function ativarCreateIdt() {
        const allNewBtns = document.querySelectorAll(".newIdt");

        allNewBtns.forEach(btn => {
            const container = btn.closest(".idtBody");
            if (!container) return;

            const cardIdt = container.querySelector(".cardIdt");
            if (!cardIdt) return;
            
            const createIdt = cardIdt.querySelector(".createIdt"); 
            if (!createIdt) return; 

            // --- Elementos do Card "Nenhum" ---
            const iconIdt = cardIdt.querySelector(".iconIdt");
            const h3Idt = cardIdt.querySelector("h3");
            const pIdt = cardIdt.querySelector("p:not(.textContentCardIdt p)");

            // --- Elementos do Formulário ---
            const closeBtn = createIdt.querySelector("#xClosedCreate");
            const cancelBtn = createIdt.querySelector("#cancelBtnIdt");
            const createBtn = createIdt.querySelector("#createBtnIdt");
            const inputs = createIdt.querySelectorAll(".campIdt input");
            const inputInstituicao = inputs[0]; // Genérico, pode ser Instituição ou Curso
            const inputCurso = inputs[1]; // Genérico, pode ser Nome do Curso

            // --- Elementos dos Cards (OPCIONAL) ---
            const listContainer = container.querySelector(".cardsCreateIdt"); 
            let cardTemplate = null; 

            if (listContainer) {
                cardTemplate = listContainer.querySelector(".contentCardIdt");
                if (cardTemplate) {
                    cardTemplate.remove(); 
                }
            }

            // --- Variável de Estado ---
            let currentEditingCard = null; 

            // --- Storage ---
            const STORAGE_KEY = container.id || 'itensGenericos';
            
            function getItens() {
                return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            }
            
            function saveItens(data) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            }

            // --- Função para esconder o conteúdo do "Nenhuma" ---
            function hideCardIdtContent(hide = true) {
                const display = hide ? "none" : "block";
                if (iconIdt) iconIdt.style.display = display;
                if (h3Idt) h3Idt.style.display = display;
                if (pIdt) pIdt.style.display = display;
            }

            // --- Função para Renderizar ---
            function loadAndRender() {
                const itens = getItens();
                
                if (listContainer && cardTemplate) { 
                    listContainer.innerHTML = ''; 

                    itens.forEach(item => {
                        const newCard = cardTemplate.cloneNode(true);
                        newCard.dataset.id = item.id;
                        
                        const cardTitleEl = newCard.querySelector(".textContentCardIdt h2");
                        const cardSubtitleEl = newCard.querySelector(".textContentCardIdt p");
                        
                        // MUDANÇA 1: Lógica de exibição de 'diciplinasBody'
                        if (STORAGE_KEY === 'diciplinasBody') { 
                            // item.curso = Nome da Disciplina
                            // item.nome = Nome do Curso
                            if (cardTitleEl) cardTitleEl.textContent = item.curso; // Título (h2) = Nome da Disciplina
                            if (cardSubtitleEl) cardSubtitleEl.textContent = item.nome; // Subtítulo (p) = Nome do Curso
                            
                            const codeEl = newCard.querySelector(".code");
                            const acronymEl = newCard.querySelector(".acronym");
                            const periodEl = newCard.querySelector(".period");

                            if (codeEl) codeEl.textContent = item.codigo;
                            if (acronymEl) acronymEl.textContent = item.sigla;
                            if (periodEl) periodEl.textContent = `${item.periodo}°`; 
                        } 
                        else {
                           if (STORAGE_KEY === 'instituicoesBody') {
                               if (cardTitleEl) cardTitleEl.textContent = item.nome; // Nome da Instituição
                               if (cardSubtitleEl) cardSubtitleEl.textContent = item.curso; // (Vazio)
                           } else {
                               // Lógica para 'cursosBody'
                               if (cardTitleEl) cardTitleEl.textContent = item.curso; // Nome do Curso
                               if (cardSubtitleEl) cardSubtitleEl.textContent = item.nome; // Instituição
                           }
                        }
                        
                        listContainer.appendChild(newCard);
                    });

                    if (itens.length > 0) {
                        listContainer.style.display = "grid";
                        listContainer.style.opacity = "1"; 
                        listContainer.style.pointerEvents = "all"; 
                        cardIdt.style.display = "none";
                    } else {
                        listContainer.style.display = "none";
                        listContainer.style.opacity = "0"; 
                        listContainer.style.pointerEvents = "none"; 
                        cardIdt.style.display = "flex";
                        cardIdt.style.background = "";
                        cardIdt.style.border = "1px dashed var(--lightgrey)";
                        cardIdt.style.borderWidth = "2px"
                        hideCardIdtContent(false);
                    }
                } else {
                    cardIdt.style.display = "flex";
                    cardIdt.style.background = "";
                    cardIdt.style.border = "1px dashed var(--lightgrey)";
                    cardIdt.style.borderWidth = "2px"
                    hideCardIdtContent(false);
                }
            }

            // --- Função para fechar e resetar o modal ---
            function closeAndResetModal() {
                createIdt.classList.remove("show");
                if (inputInstituicao) inputInstituicao.value = ""; // Limpa o primeiro campo genérico
                if (inputCurso) inputCurso.value = ""; // Limpa o segundo campo genérico
                
                // MUDANÇA 2: Resetar campos de 'diciplinasBody'
                if (STORAGE_KEY === 'diciplinasBody') {
                    const inputCursoSelect = createIdt.querySelector("#cursoSelect"); // Pega o campo de Curso
                    if (inputCursoSelect) inputCursoSelect.value = ""; // Limpa o campo de Curso

                    const allInputs = createIdt.querySelectorAll(".campIdt input, .campIdtToggle .campIdt input");
                    if (allInputs[1]) allInputs[1].value = ""; // Nome Disciplina
                    if (allInputs[2]) allInputs[2].value = ""; // Sigla
                    if (allInputs[3]) allInputs[3].value = ""; // Código
                    
                    const inputPeriodoSelect = createIdt.querySelector("#periodoSelect");
                    if (inputPeriodoSelect) inputPeriodoSelect.value = ""; // Reseta o select
                }

                currentEditingCard = null;
                
                loadAndRender(); 
            }

            // --- Evento: Abrir para CRIAR ---
            btn.addEventListener("click", () => {
                currentEditingCard = null; 
                
                if (createBtn) createBtn.textContent = "Criar";
                
                if (inputInstituicao) inputInstituicao.value = "";
                if (inputCurso) inputCurso.value = "";

                // MUDANÇA 3: Resetar campos de 'diciplinasBody' ao Criar
                if (STORAGE_KEY === 'diciplinasBody') {
                    const inputCursoSelect = createIdt.querySelector("#cursoSelect"); // Pega o campo de Curso
                    if (inputCursoSelect) inputCursoSelect.value = ""; // Limpa o campo de Curso

                    const allInputs = createIdt.querySelectorAll(".campIdt input, .campIdtToggle .campIdt input");
                    if (allInputs[1]) allInputs[1].value = ""; // Nome Disciplina
                    if (allInputs[2]) allInputs[2].value = ""; // Sigla
                    if (allInputs[3]) allInputs[3].value = ""; // Código
                    
                    const inputPeriodoSelect = createIdt.querySelector("#periodoSelect");
                    if (inputPeriodoSelect) inputPeriodoSelect.value = ""; 
                }

                cardIdt.style.display = "flex";
                cardIdt.style.border = "none";
                cardIdt.style.background = "none";
                hideCardIdtContent(true); 

                createIdt.classList.add("show");
            });

            // --- Eventos de Ação nos Cards (SÓ ATIVA SE listContainer EXISTIR) ---
            if (listContainer) {
                listContainer.addEventListener('click', (e) => {
                    const editBtn = e.target.closest('.editCard');
                    const deleteBtn = e.target.closest('.deletCard');
                    const card = e.target.closest('.contentCardIdt');
                    
                    if (!card) return;
                    const id = card.dataset.id; 
                    if (!id) return;

                    const itens = getItens();
                    const item = itens.find(i => i.id == id);
                    if (!item) return;

                    if (editBtn) {
                        currentEditingCard = { id: id, cardElement: card };

                        // MUDANÇA 4: Carregar dados para Edição em 'diciplinasBody'
                        if (STORAGE_KEY === 'diciplinasBody') {
                            // item.nome = Nome do Curso
                            // item.curso = Nome da Disciplina
                            const inputCursoSelect = createIdt.querySelector("#cursoSelect"); // Campo do Curso
                            const allInputs = createIdt.querySelectorAll(".campIdt input, .campIdtToggle .campIdt input");
                            const inputNomeDisciplina = allInputs[1];
                            const inputSigla = allInputs[2];
                            const inputCodigo = allInputs[3];
                            const inputPeriodoSelect = createIdt.querySelector("#periodoSelect"); 

                            if (inputCursoSelect) inputCursoSelect.value = item.nome; // Carrega Nome do Curso
                            if (inputNomeDisciplina) inputNomeDisciplina.value = item.curso; // Carrega Nome da Disciplina
                            if (inputSigla) inputSigla.value = item.sigla || "";
                            if (inputCodigo) inputCodigo.value = item.codigo || "";
                            if (inputPeriodoSelect) inputPeriodoSelect.value = item.periodo || "";
                        } else {
                            // Lógica antiga para outros
                            if (inputInstituicao) inputInstituicao.value = item.nome;
                            if (inputCurso) inputCurso.value = item.curso;
                        }

                        cardIdt.style.display = "flex";
                        cardIdt.style.border = "none";
                        cardIdt.style.background = "none";
                        hideCardIdtContent(true);
                        createIdt.classList.add("show");
                        if (createBtn) createBtn.textContent = "Salvar"; 
                    }

                    if (deleteBtn) {
                        // Usa item.curso (Nome Disciplina) ou item.nome (Instituição/Curso) para o confirm
                        const nomeItem = (STORAGE_KEY === 'diciplinasBody') ? item.curso : (item.curso || item.nome);
                        if (confirm(`Tem certeza que deseja excluir "${nomeItem}"?`)) { 
                            let novosItens = itens.filter(i => i.id != id); 
                            saveItens(novosItens); 
                            loadAndRender(); 
                        }
                    }
                });
            }

            // --- Evento: Fechar (Botão X) ---
            if (closeBtn) {
                closeBtn.addEventListener("click", closeAndResetModal);
            }

            // --- Evento: Fechar (Botão Cancelar) ---
            if (cancelBtn) {
                cancelBtn.addEventListener("click", closeAndResetModal);
            }

            // --- Evento: CRIAR ou SALVAR (Botão Principal) (MODIFICADO) ---
            if (createBtn) {
                createBtn.addEventListener("click", () => {
                    let novoNome, novoCurso, novoSigla, novoCodigo, novoPeriodo; 
                    
                    // MUDANÇA 5: Lógica de salvamento 'diciplinasBody'
                    if (STORAGE_KEY === 'diciplinasBody') {
                        const inputCursoSelect = createIdt.querySelector("#cursoSelect"); // Campo do Curso
                        const allInputs = createIdt.querySelectorAll(".campIdt input, .campIdtToggle .campIdt input");
                        
                        const inputNomeDisciplina = allInputs[1]; 
                        const inputSigla = allInputs[2];
                        const inputCodigo = allInputs[3];
                        const inputPeriodoSelect = createIdt.querySelector("#periodoSelect");
                        
                        novoNome = inputCursoSelect ? inputCursoSelect.value.trim() : ""; // novoNome = Nome do CURSO
                        novoCurso = inputNomeDisciplina ? inputNomeDisciplina.value.trim() : ""; // novoCurso = Nome da DISCIPLINA
                        novoSigla = inputSigla ? inputSigla.value.trim() : "";
                        novoCodigo = inputCodigo ? inputCodigo.value.trim() : "";
                        novoPeriodo = inputPeriodoSelect ? inputPeriodoSelect.value : "";
                    
                    } else { 
                        // Lógica para outras páginas (instituicoesBody e cursosBody)
                        novoNome = inputInstituicao ? inputInstituicao.value.trim() : "";
                        
                        if (STORAGE_KEY === 'instituicoesBody') {
                            novoCurso = ""; // Instituição não tem "curso"
                        } else {
                            novoCurso = inputCurso ? inputCurso.value.trim() : ""; 
                        }
                    }

                    // --- Validação ---
                    if (STORAGE_KEY === 'diciplinasBody') {
                        // Valida Curso (novoNome) e Nome da Disciplina (novoCurso) + outros
                        if (!novoNome || !novoCurso || !novoSigla || !novoCodigo || !novoPeriodo) { 
                            alert("Por favor, preencha todos os campos da disciplina (Curso, Nome, Sigla, Código, Período).");
                            return;
                        }
                    
                    }
                    else if (STORAGE_KEY === 'instituicoesBody') {
                        if (!novoNome) { // Apenas valida 'novoNome' (Instituição)
                            alert("Por favor, preencha o nome da instituição.");
                            return;
                        }
                    } else { // Isso se aplica a 'cursosBody'
                        if (!novoNome || !novoCurso) { 
                            alert("Por favor, preencha todos os campos.");
                            return;
                        }
                    }
                    // --- Fim da Validação ---


                    let itens = getItens();

                    if (currentEditingCard) {
                        // --- MODO SALVAR (Edição) ---
                        const item = itens.find(i => i.id == currentEditingCard.id);
                        if (item) {
                            item.nome = novoNome; // Salva Nome do Curso em item.nome
                            item.curso = novoCurso; // Salva Nome da Disciplina em item.curso
                            if (STORAGE_KEY === 'diciplinasBody') {
                                item.sigla = novoSigla;
                                item.codigo = novoCodigo;
                                item.periodo = novoPeriodo;
                            }
                        }
                    } else {
                        // --- MODO CRIAR (Novo) ---

                        if (!listContainer || !cardTemplate) {
                            console.warn(`Tentativa de CRIAR item em uma página sem .cardsCreateIdt ou template. Operação cancelada.`);
                            closeAndResetModal(); 
                            return; 
                        }

                        const novoItem = {
                            id: Date.now().toString(),
                            nome: novoNome, // Salva Nome do Curso em item.nome
                            curso: novoCurso // Salva Nome da Disciplina em item.curso
                        };
                        
                        if (STORAGE_KEY === 'diciplinasBody') {
                            novoItem.sigla = novoSigla;
                            novoItem.codigo = novoCodigo;
                            novoItem.periodo = novoPeriodo;
                        }

                        itens.push(novoItem);
                    }

                    saveItens(itens); 
                    closeAndResetModal(); 
                });
            }

            // MUDANÇA 6: Lógica de carregamento do Datalist
            if (STORAGE_KEY === 'diciplinasBody') {
                const datalist = container.querySelector("#listCursos"); // Procura o datalist de Cursos
                if (datalist) {
                    datalist.innerHTML = ''; 
                    const cursos = JSON.parse(localStorage.getItem("cursosBody")) || []; // Puxa de 'cursosBody'
                    cursos.forEach(curso => {
                        const option = document.createElement('option');
                        option.value = curso.curso; // Pega o nome do curso (armazenado em 'curso.curso')
                        datalist.appendChild(option);
                    });
                }
            }
            // Lógica antiga para 'cursosBody' (puxando Instituições)
            else if (STORAGE_KEY === 'cursosBody') { 
                const datalist = container.querySelector("#listInstituicao");
                if (datalist) {
                    datalist.innerHTML = ''; 
                    const instituicoes = JSON.parse(localStorage.getItem("instituicoesBody")) || [];
                    instituicoes.forEach(inst => {
                        const option = document.createElement('option');
                        option.value = inst.nome;
                        datalist.appendChild(option);
                    });
                }
            }

            // --- Carregamento Inicial ---
            if (listContainer) { 
                listContainer.style.display = "none"; 
            }
            loadAndRender(); 
        });
    }


    // --- EVENTOS DOS LINKS (Barra Lateral) ---
    links.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const nome = link.querySelector("p").textContent.trim().toLowerCase();
            carregarPagina(nome);
        });
    });

    // --- AO INICIAR: CARREGAR "DASHBOARD" ---
    carregarPagina("dashboard");

    // --- LINKS GLOBAIS (Dashboard, etc.) ---
    document.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (!link) return; 

        const texto = link.textContent.toLowerCase();
        const id = link.id;

        if (texto.includes("cadastrar instituição")) {
            e.preventDefault();
            carregarPagina("instituições");
        } 
        else if (id === "instituicoes") {
            e.preventDefault();
            carregarPagina("instituições");
        } 
        else if (id === "cursos") {
            e.preventDefault();
            carregarPagina("cursos");
        }
        else if (id === "diciplinas") {
            e.preventDefault();
            carregarPagina("diciplinas");
        } 
        else if (id === "turmas") {
            e.preventDefault();
            carregarPagina("turmas");
        }
    });
});