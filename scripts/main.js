/**
 * =================================================================
 * MAPA DE FUNÇÕES E BOTÕES (main.js)
 * =================================================================
 *
 * Este guia localiza os principais eventos de clique (botões) no código.
 *
 *
 * --- Funções Principais (Globais e Modais) ---
 *
 * * @linha 40: logoutBtn.addEventListener("click", ...)
 * - @Botão: Ícone "Sair" (Logout)
 * - @Ação: Desconecta o usuário (limpa localStorage) e redireciona para a home.
 *
 * * @linha 482: btn.addEventListener("click", ...)
 * - @Botão: Botões ".newIdt" (Ex: "Nova instituição", "Novo curso", "Nova diciplina")
 * - @Ação: Abre o modal principal no modo "Criar", limpando todos os campos.
 *
 * * @linha 667: closeBtn.addEventListener("click", ...)
 * - @Botão: Ícone "X" no modal principal (#xClosedCreate)
 * - @Ação: Fecha o modal de criação/edição.
 *
 * * @linha 672: cancelBtn.addEventListener("click", ...)
 * - @Botão: "Cancelar" no modal principal (#cancelBtnIdt)
 * - @Ação: Fecha o modal de criação/edição.
 *
 * * @linha 677: createBtn.addEventListener("click", ...)
 * - @Botão: "Criar" / "Salvar" no modal principal (#createBtnIdt)
 * - @Ação: Valida os campos e decide se deve CRIAR um novo item ou SALVAR um item existente.
 *
 *
 * --- Funções nos Cards (Instituição, Curso, Disciplina) ---
 *
 * * @linha 516: listContainer.addEventListener('click', ...)
 * - @Contexto: Gerencia cliques nos botões *dentro* dos cards já criados.
 *
 * - @Botão: ".editCard" (Lápis de Edição) - (Linha 528)
 * - @Ação: Abre o modal em modo "Editar", preenchendo os campos com os dados do card.
 *
 * - @Botão: ".deletCard" (Lixeira) - (Linha 590)
 * - @Ação: Pede confirmação e remove o item.
 *
 * - @Botão: ".addCurso" (Adicionar Curso) - (Linha 649)
 * - @Ação: (Específico de Instituições) Abre o segundo modal ("Linkar Curso").
 *
 *
 * --- Funções Dentro do Modal de Edição (Específico de Instituições) ---
 *
 * * @linha 864: createIdt.addEventListener('click', ...)
 * - @Contexto: Gerencia cliques *dentro* do modal de edição de Instituição.
 *
 * - @Botão: ".cursoDeletinIcon" (Lixeira ao lado do curso) - (Linha 878)
 * - @Ação: Desvincula um curso da instituição (durante a edição).
 *
 * - @Botão: ".cursoAddinIcon" (Ícone '+' ao lado do curso) - (Linha 904)
 * - @Ação: Vincula um curso disponível à instituição (durante a edição).
 *
 *
 * --- Funções do Modal "Linkar Curso" ---
 *
 * * @linha 947: closeLinkBtn.addEventListener('click', ...)
 * - @Botão: "X" do modal "Linkar Curso" (#closedAdd)
 * - @Ação: Fecha o modal "Linkar Curso".
 *
 * * @linha 948: cancelLinkBtn.addEventListener('click', ...)
 * - @Botão: "Cancelar" do modal "Linkar Curso" (#cancelAddIdt)
 * - @Ação: Fecha o modal "Linkar Curso".
 *
 * * @linha 952: saveLinkBtn.addEventListener('click', ...)
 * - @Botão: "Salvar" do modal "Linkar Curso" (#saveAddIdt)
 * - @Ação: Valida e salva o vínculo do curso com a instituição.
 *
 *
 * --- Funções de Navegação ---
 *
 * * @linha 1011: link.addEventListener("click", ...)
 * - @Botão: Links da barra lateral (Dashboard, Instituições, etc.)
 * - @Ação: Carrega a página correspondente via `carregarPagina`.
 *
 * * @linha 1020: document.addEventListener("click", ...)
 * - @Botão: Links globais (Ex: Cards do Dashboard)
 * - @Ação: Carrega a página correspondente via `carregarPagina`.
 *
 */

// main.js
document.addEventListener("DOMContentLoaded", () => {
    // --- LOGIN ---
    // const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    // if (usuario) {
    //     const nomeEl = document.querySelector(".titleUser h1");
    //     const emailEl = document.querySelector(".titleUser p");

    //     if (nomeEl) {
    //         const partesNome = usuario.nome.trim().split(/\s+/);
    //         let primeiro = partesNome[0];
    //         let segundoMenor = "";
    //         if (partesNome.length > 1) {
    //             const restantes = partesNome.slice(1);
    //             const nomesValidos = restantes.filter(n => n.length >= 4);
    //             if (nomesValidos.length > 0) {
    //                 segundoMenor = nomesValidos.reduce((menor, atual) =>
    //                     atual.length < menor.length ? atual : menor
    //                 );
    //             } else {
    //                 segundoMenor = partesNome[partesNome.length - 1];
    //             }
    //         }
    //         const formatarNome = (nome) =>
    //             nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
    //         const nomeFormatado = segundoMenor
    //             ? `${formatarNome(primeiro)} ${formatarNome(segundoMenor)}`
    //             : formatarNome(primeiro);
    //         nomeEl.textContent = nomeFormatado;
    //         nomeEl.style.whiteSpace = "nowrap";
    //     }
    //     if (emailEl) emailEl.textContent = usuario.email;
    // } else {
    //     window.location.href = "/";
    //     return;
    // }
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
            
            // [REMOVIDO DAQUI] const inputs = createIdt.querySelectorAll(".campIdt input");
            // [REMOVIDO DAQUI] const inputInstituicao = inputs[0]; 
            // [REMOVIDO DAQUI] const inputCurso = inputs[1]; 

            // NOVO: Adicionar referência aos campos de adicionar/editar
            const addCursoEdit = container.querySelector('#addCursoEdit');
            const deletCursoEdit = container.querySelector('#deletCursoEdit');
            const linkCursoContainer = container.querySelector(".containerAddIdt");

            // (Usando :nth-child(3) para pegar o "Cursos Adicionados" do HTML)
            const cursosAdicionadosCamp = createIdt.querySelector('#cursosAdicionadosCamp');

            // NOVO: Container para "Adicionar Curso"
            const addCursoContainer = addCursoEdit ? addCursoEdit.querySelector('.cursosEdidCamp') : null;
            const deletCursoContainer = deletCursoEdit ? deletCursoEdit.querySelector('.cursosEdidCamp') : null;

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
            let originalItemBeforeEdit = null; // Cópia de segurança

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

            // --- Função para popular os cursos no modal de edição ---
            // (código de popularCursosParaEdicao omitido para brevidade)
            function popularCursosParaEdicao(item) {
                if (!cursosAdicionadosCamp || !deletCursoContainer || !addCursoContainer) return;

                const bgColors = ['--color4Shadow', '--color3Shadow', '--color9Shadow', '--color8Shadow'];
                const textColors = ['--color4', '--color3', '--color9', '--color8'];

                // --- Limpeza ---
                const placeholderAdicionados = cursosAdicionadosCamp.querySelector('.linkDatailsIdt');
                if (placeholderAdicionados) placeholderAdicionados.remove();
                deletCursoContainer.innerHTML = '';
                addCursoContainer.innerHTML = '';

                // --- Container "Cursos Adicionados" (dinâmico) ---
                let containerAdicionados = cursosAdicionadosCamp.querySelector('.cursosEdidCamp');
                if (!containerAdicionados) {
                    containerAdicionados = document.createElement('div');
                    containerAdicionados.className = 'cursosEdidCamp';
                    cursosAdicionadosCamp.appendChild(containerAdicionados);
                }
                containerAdicionados.innerHTML = ''; // Limpa

                // --- Pega os Cursos ---
                const todosCursos = JSON.parse(localStorage.getItem("cursosBody")) || [];
                const cursosAtuais = item.cursos ? item.cursos.map(c => c.toLowerCase()) : [];

                // --- Filtra os Cursos Disponíveis ---
                const cursosDisponiveis = todosCursos.filter(curso =>
                    !cursosAtuais.includes(curso.curso.toLowerCase())
                );

                // --- Popula "Cursos Adicionados" e "Deletar Curso" ---
                if (!item.cursos || item.cursos.length === 0) {
                    containerAdicionados.innerHTML = '<div class="linkDatailsIdt" style="background: var(--color6Shadow); color: var(--color6); padding: 2px 4px; border-radius: 4px;">Nenhum curso vinculado</div>';
                } else {
                    item.cursos.forEach((cursoNome, index) => { // <-- Pega o index
                        // 1. Popula "Cursos Adicionados" (sem ícone)
                        const divAdicionado = document.createElement('div');
                        divAdicionado.className = 'linkDatailsIdt';
                        divAdicionado.textContent = cursoNome;

                        const colorIndex = index % bgColors.length;
                        divAdicionado.style.background = `var(${bgColors[colorIndex]})`;
                        divAdicionado.style.color = `var(${textColors[colorIndex]})`;

                        containerAdicionados.appendChild(divAdicionado);

                        // 2. Popula "Deletar Curso" (com ícone de lixeira)
                        const divDeletar = document.createElement('div');
                        divDeletar.className = 'linkDatailsIdt';
                        divDeletar.textContent = cursoNome;
                        divDeletar.dataset.cursoNome = cursoNome; // Guarda o nome para deleção

                        const trashIcon = document.createElement('i');
                        trashIcon.className = 'ph ph-trash cursoDeletinIcon'; // Usando classe

                        divDeletar.style.background = `var(${bgColors[colorIndex]})`;
                        divDeletar.style.color = `var(${textColors[colorIndex]})`;

                        divDeletar.appendChild(trashIcon);
                        deletCursoContainer.appendChild(divDeletar);
                    });
                }

                // --- Popula "Adicionar Curso" ---
                if (cursosDisponiveis.length === 0) {
                    addCursoContainer.innerHTML = '<div class="linkDatailsIdt" style="background: var(--color6Shadow); color: var(--color6); padding: 2px 4px; border-radius: 4px;">Nenhum curso disponível</div>';
                } else {
                    cursosDisponiveis.forEach((curso, index) => { // <-- Pega o index
                        // Popula "Adicionar Curso" (com ícone de mais)
                        const divAdicionar = document.createElement('div');
                        divAdicionar.className = 'linkDatailsIdt';
                        divAdicionar.textContent = curso.curso;
                        divAdicionar.dataset.cursoNome = curso.curso; // Guarda o nome para adição

                        const addIcon = document.createElement('i');
                        addIcon.className = 'ph ph-plus cursoAddinIcon'; // NOVO: Classe para adicionar

                        const colorIndex = index % bgColors.length;
                        divAdicionar.style.background = `var(${bgColors[colorIndex]})`;
                        divAdicionar.style.color = `var(${textColors[colorIndex]})`;

                        divAdicionar.appendChild(addIcon);
                        addCursoContainer.appendChild(divAdicionar);
                    });
                }
            }


            // --- Função para Renderizar ---
            // (código de loadAndRender omitido para brevidade)
            function loadAndRender() {
                const itens = getItens();

                if (listContainer && cardTemplate) {
                    listContainer.innerHTML = '';

                    itens.forEach(item => {
                        const newCard = cardTemplate.cloneNode(true);
                        newCard.dataset.id = item.id;

                        const cardTitleEl = newCard.querySelector(".textContentCardIdt h2");
                        const cardSubtitleEl = newCard.querySelector(".textContentCardIdt p");

                        const viewDetailsContainer = newCard.querySelector(".viewDetailsIC");

                        if (STORAGE_KEY === 'diciplinasBody') {
                            if (cardTitleEl) cardTitleEl.textContent = item.curso;
                            if (cardSubtitleEl) cardSubtitleEl.textContent = item.nome;

                            const codeEl = newCard.querySelector(".code");
                            const acronymEl = newCard.querySelector(".acronym");
                            const periodEl = newCard.querySelector(".period");

                            if (codeEl) codeEl.textContent = item.codigo;
                            if (acronymEl) acronymEl.textContent = item.sigla;
                            if (periodEl) periodEl.textContent = `${item.periodo}°`;

                            if (viewDetailsContainer) viewDetailsContainer.style.display = 'none';
                        }
                        else if (STORAGE_KEY === 'instituicoesBody') {
                            if (cardTitleEl) cardTitleEl.textContent = item.nome;
                            if (cardSubtitleEl) cardSubtitleEl.style.display = 'none';

                            if (viewDetailsContainer) {
                                viewDetailsContainer.innerHTML = '';

                                if (Array.isArray(item.cursos) && item.cursos.length > 0) {
                                    item.cursos.forEach(cursoNome => {
                                        const div = document.createElement('div');
                                        div.className = 'linkDatailsIdt';
                                        div.textContent = cursoNome;
                                        viewDetailsContainer.appendChild(div);
                                    });
                                }
                            }
                        }
                        else { // Assumindo cursosBody
                            if (cardTitleEl) cardTitleEl.textContent = item.curso; // Nome do Curso
                            // Se 'item.nome' (Instituição) for "", não mostra nada
                            if (cardSubtitleEl) cardSubtitleEl.textContent = item.nome || "Sem instituição";
                            if (viewDetailsContainer) viewDetailsContainer.style.display = 'none';
                        }

                        listContainer.appendChild(newCard);

                        // Paleta de cores para os CARDS PRINCIPAIS
                        const bgColors = ['--color4Shadow', '--color3Shadow', '--color9Shadow', '--color8Shadow'];
                        const textColors = ['--color4', '--color3', '--color9', '--color8'];
                        const linksDetalhes = newCard.querySelectorAll(".viewDetailsIC .linkDatailsIdt");

                        linksDetalhes.forEach((link, index) => {
                            const colorIndex = index % bgColors.length;
                            link.style.background = `var(${bgColors[colorIndex]})`;
                            link.style.color = `var(${textColors[colorIndex]})`;
                        });
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
                // Restaura o item original se "Cancelar" for clicado
                if (originalItemBeforeEdit) {
                    let itens = getItens();
                    const index = itens.findIndex(i => i.id == originalItemBeforeEdit.id);
                    if (index !== -1) {
                        itens[index] = originalItemBeforeEdit; // Restaura o item modificado
                    }
                    saveItens(itens); // Salva a versão restaurada
                }
                originalItemBeforeEdit = null; // Limpa a cópia de segurança

                // Restante da função
                createIdt.classList.remove("show");
                
                // [NOVO] Limpa os inputs de forma segura
                const allInputsInModal = createIdt.querySelectorAll(".campIdt input");
                allInputsInModal.forEach(input => {
                    input.value = "";
                    input.disabled = false;
                });
                
                // Reseta placeholders específicos
                if (STORAGE_KEY === 'cursosBody') {
                    const inputInstituicao = allInputsInModal[0];
                    if (inputInstituicao) inputInstituicao.placeholder = "Selecione a instituição";
                }
                if (STORAGE_KEY === 'instituicoesBody') {
                    const inputInstituicao = allInputsInModal[0];
                    if (inputInstituicao) inputInstituicao.placeholder = "Ex: PUC-Campinas";
                }

                if (STORAGE_KEY === 'diciplinasBody') {
                    const inputCursoSelect = createIdt.querySelector("#cursoSelect");
                    if (inputCursoSelect) inputCursoSelect.value = "";

                    const inputPeriodoSelect = createIdt.querySelector("#periodoSelect");
                    if (inputPeriodoSelect) inputPeriodoSelect.value = "";
                }

                if (addCursoEdit) {
                    addCursoEdit.style.display = 'none';
                }
                if (deletCursoEdit) {
                    deletCursoEdit.style.display = 'none';
                }

                if (cursosAdicionadosCamp) {
                    cursosAdicionadosCamp.style.display = 'none';
                }

                // Limpa os containers de cursos do modal
                // (código de limpeza de modal omitido para brevidade)
                if (cursosAdicionadosCamp) {
                    const dynamicContainer = cursosAdicionadosCamp.querySelector('.cursosEdidCamp');
                    if (dynamicContainer) dynamicContainer.remove(); // Remove o container dinâmico

                    // Restaura o placeholder original do HTML
                    if (!cursosAdicionadosCamp.querySelector('.linkDatailsIdt')) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'linkDatailsIdt';
                        placeholder.textContent = 'Engenharia de Software'; // Placeholder do seu HTML
                        cursosAdicionadosCamp.appendChild(placeholder);
                    }
                }
                if (addCursoContainer) {
                    addCursoContainer.innerHTML = `
                        <div class="linkDatailsIdt">
                            Engenharia de Software
                            <i class="ph ph-plus" id="cursoAddinIntituicoes"></i>
                        </div>
                        <div class="linkDatailsIdt">
                            Engenharia da Computação
                            <i class="ph ph-plus" id="cursoAddinIntituicoes"></i>
                        </div>`;
                }
                if (deletCursoContainer) {
                    deletCursoContainer.innerHTML = `
                        <div class="linkDatailsIdt">
                            Engenharia de Software
                            <i class="ph ph-trash" id="cursoDeletinIntituicoes"></i>
                        </div>
                        <div class="linkDatailsIdt">
                            Engenharia da Computação
                            <i class="ph ph-trash" id="cursoDeletinIntituicoes"></i>
                        </div>`;
                }


                currentEditingCard = null;

                loadAndRender();
            }

            // --- Evento: Abrir para CRIAR ---
            btn.addEventListener("click", () => {
                currentEditingCard = null;
                originalItemBeforeEdit = null; // Limpa backup

                if (createBtn) createBtn.textContent = "Criar";

                // [NOVO] Limpa os inputs de forma segura
                const allInputsInModal = createIdt.querySelectorAll(".campIdt input");
                allInputsInModal.forEach(input => {
                    input.value = "";
                    input.disabled = false;
                });

                // Reseta placeholders específicos
                if (STORAGE_KEY === 'cursosBody') {
                    const inputInstituicao = allInputsInModal[0];
                    if (inputInstituicao) inputInstituicao.placeholder = "Selecione a instituição";
                }
                if (STORAGE_KEY === 'instituicoesBody') {
                    const inputInstituicao = allInputsInModal[0];
                    if (inputInstituicao) inputInstituicao.placeholder = "Ex: PUC-Campinas";
                }


                if (addCursoEdit) {
                    addCursoEdit.style.display = 'none';
                }
                if (deletCursoEdit) {
                    deletCursoEdit.style.display = 'none';
                }
                if (cursosAdicionadosCamp) {
                    cursosAdicionadosCamp.style.display = 'none';
                }

                if (STORAGE_KEY === 'diciplinasBody') {
                    const inputCursoSelect = createIdt.querySelector("#cursoSelect");
                    if (inputCursoSelect) inputCursoSelect.value = "";

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
                    const addCursoBtn = e.target.closest('.addCurso');
                    const card = e.target.closest('.contentCardIdt');

                    if (!card) return;
                    const id = card.dataset.id;
                    if (!id) return;

                    const itens = getItens();
                    const item = itens.find(i => i.id == id);
                    if (!item) return;

                    if (editBtn) {
                        currentEditingCard = { id: id, cardElement: card };
                        // Salva uma cópia de segurança ANTES de qualquer modificação
                        originalItemBeforeEdit = JSON.parse(JSON.stringify(item));

                        createIdt.dataset.editingId = id;

                        if (addCursoEdit) {
                            if (STORAGE_KEY === 'instituicoesBody') {
                                addCursoEdit.style.display = 'flex';
                            } else {
                                addCursoEdit.style.display = 'none';
                            }
                        }
                        if (deletCursoEdit) {
                            if (STORAGE_KEY === 'instituicoesBody') {
                                deletCursoEdit.style.display = 'flex';
                            } else {
                                deletCursoEdit.style.display = 'none';
                            }
                        }
                        if (cursosAdicionadosCamp) {
                            if (STORAGE_KEY === 'instituicoesBody') {
                                cursosAdicionadosCamp.style.display = 'block';
                            } else {
                                cursosAdicionadosCamp.style.display = 'none';
                            }
                        }
                        
                        // [NOVO] Pega os inputs no momento do clique
                        const allInputsInModal = createIdt.querySelectorAll(".campIdt input");

                        if (STORAGE_KEY === 'diciplinasBody') {
                            const inputCursoSelect = createIdt.querySelector("#cursoSelect");
                            const inputNomeDisciplina = allInputsInModal[1];
                            const inputSigla = allInputsInModal[2];
                            const inputCodigo = allInputsInModal[3];
                            const inputPeriodoSelect = createIdt.querySelector("#periodoSelect");

                            if (inputCursoSelect) inputCursoSelect.value = item.nome;
                            if (inputNomeDisciplina) inputNomeDisciplina.value = item.curso;
                            if (inputSigla) inputSigla.value = item.sigla || "";
                            if (inputCodigo) inputCodigo.value = item.codigo || "";
                            if (inputPeriodoSelect) inputPeriodoSelect.value = item.periodo || "";
                        
                        } else if (STORAGE_KEY === 'cursosBody') {
                            const inputInstituicao = allInputsInModal[0];
                            const inputCurso = allInputsInModal[1];
                            if (inputInstituicao) inputInstituicao.value = item.nome; // Campo Instituição
                            if (inputCurso) inputCurso.value = item.curso; // Campo Nome do Curso
                        
                        } else { // instituicoesBody
                            const inputInstituicao = allInputsInModal[0];
                            if (inputInstituicao) inputInstituicao.value = item.nome;
                        }

                        // Popula os cursos no modal
                        if (STORAGE_KEY === 'instituicoesBody') {
                            popularCursosParaEdicao(item);
                        }

                        cardIdt.style.display = "flex";
                        cardIdt.style.border = "none";
                        cardIdt.style.background = "none";
                        hideCardIdtContent(true);
                        createIdt.classList.add("show");
                        if (createBtn) createBtn.textContent = "Salvar";
                    }
                    
                    // (código de deleteBtn omitido para brevidade)
                    if (deleteBtn) {
                        const nomeItem = (STORAGE_KEY === 'diciplinasBody') ? item.curso : (item.curso || item.nome);
                        if (confirm(`Tem certeza que deseja excluir "${nomeItem}"?`)) {
                            
                            if (STORAGE_KEY === 'instituicoesBody') {
                                // deletarInstituicaoDB(id); // (Função não fornecida, assumindo que deleta aqui)

                                // LÓGICA DE DELETAR INSTITUIÇÃO: Limpa todos os cursos vinculados a ela
                                let cursos = JSON.parse(localStorage.getItem("cursosBody")) || [];
                                const instituicoes = getItens();
                                const instParaDeletar = instituicoes.find(i => i.id == id);

                                if (instParaDeletar) {
                                    // Remove a referência à instituição de todos os cursos que estavam vinculados
                                    const nomeInst = instParaDeletar.nome.toLowerCase();
                                    cursos.forEach(curso => {
                                        if (curso.nome && curso.nome.toLowerCase() === nomeInst) {
                                            curso.nome = ""; // Desvincula o curso
                                        }
                                    });
                                    localStorage.setItem("cursosBody", JSON.stringify(cursos));
                                    
                                    // Deleta a instituição
                                    let novosItens = instituicoes.filter(i => i.id != id);
                                    saveItens(novosItens);
                                    loadAndRender();
                                }


                            } else {
                                
                                // LÓGICA NOVA: Desvincular curso da instituição
                                if (STORAGE_KEY === 'cursosBody' && item.nome) {
                                    try {
                                        let instituicoes = JSON.parse(localStorage.getItem("instituicoesBody")) || [];
                                        const instituicaoAlvo = instituicoes.find(inst => inst.nome.toLowerCase() === item.nome.toLowerCase());
                                        if (instituicaoAlvo && Array.isArray(instituicaoAlvo.cursos)) {
                                            instituicaoAlvo.cursos = instituicaoAlvo.cursos.filter(c => c.toLowerCase() !== item.curso.toLowerCase());
                                            localStorage.setItem("instituicoesBody", JSON.stringify(instituicoes));
                                        }
                                    } catch (error) {
                                        console.error("Erro ao desvincular curso da instituição:", error);
                                    }
                                }
                                // FIM DA LÓGICA NOVA

                                // Lógica original: Deleta o item (curso, disciplina, etc.)
                                let novosItens = itens.filter(i => i.id != id);
                                saveItens(novosItens);
                                loadAndRender();
                            }
                        }
                    }

                    if (addCursoBtn) {
                        if (linkCursoContainer) {
                            linkCursoContainer.style.display = 'block';
                            linkCursoContainer.dataset.instituicaoId = id;
                        }
                    }
                });
                
                // (código de wheel event omitido)
                listContainer.addEventListener('wheel', (e) => {
                    const viewDetails = e.target.closest('.viewDetailsIC');
                    if (!viewDetails) return;
                    e.preventDefault();
                    viewDetails.scrollLeft += e.deltaY;
                }, { passive: false });
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
                    
                    // [NOVO] Pega os inputs no momento do clique
                    const allInputsInModal = createIdt.querySelectorAll(".campIdt input");

                    if (STORAGE_KEY === 'diciplinasBody') {
                        const inputCursoSelect = createIdt.querySelector("#cursoSelect");
                        const inputNomeDisciplina = allInputsInModal[1];
                        const inputSigla = allInputsInModal[2];
                        const inputCodigo = allInputsInModal[3];
                        const inputPeriodoSelect = createIdt.querySelector("#periodoSelect");

                        novoNome = inputCursoSelect ? inputCursoSelect.value.trim() : "";
                        novoCurso = inputNomeDisciplina ? inputNomeDisciplina.value.trim() : "";
                        novoSigla = inputSigla ? inputSigla.value.trim() : "";
                        novoCodigo = inputCodigo ? inputCodigo.value.trim() : "";
                        novoPeriodo = inputPeriodoSelect ? inputPeriodoSelect.value : "";

                    } else {
                        // `inputs[0]` é "Nome da Instituição" (em instituicoes) ou "Instituição" (em cursos)
                        const inputInstituicao = allInputsInModal[0];
                        novoNome = inputInstituicao ? inputInstituicao.value.trim() : "";

                        if (STORAGE_KEY === 'instituicoesBody') {
                            novoCurso = "";
                        } else {
                            // `inputs[1]` é "Nome do curso" (em cursos)
                            const inputCurso = allInputsInModal[1];
                            novoCurso = inputCurso ? inputCurso.value.trim() : "";
                        }
                    }

                    // --- Validação ---
                    if (STORAGE_KEY === 'diciplinasBody') {
                        if (!novoNome || !novoCurso || !novoSigla || !novoCodigo || !novoPeriodo) {
                            alert("Por favor, preencha todos os campos da disciplina (Curso, Nome, Sigla, Código, Período).");
                            return;
                        }
                    }
                    else if (STORAGE_KEY === 'instituicoesBody') {
                        if (!novoNome) {
                            alert("Por favor, preencha o nome da instituição.");
                            return;
                        }
                    } else { // 'cursosBody'
                        if (!novoCurso) {
                            alert("Por favor, preencha o Nome do curso.");
                            return;
                        }
                        // novoNome (instituição) é opcional. Se preenchido, será linkado.
                    }
                    // --- Fim da Validação ---


                    let itens = getItens();

                    if (currentEditingCard) {
                        // --- MODO SALVAR (Edição) ---
                        // (código de edição omitido para brevidade)
                        const item = itens.find(i => i.id == currentEditingCard.id);
                        if (item) {

                            // ======================================================
                            //  INÍCIO DA MUDANÇA: LÓGICA DE EDIÇÃO DE CURSO
                            // ======================================================
                            if (STORAGE_KEY === 'cursosBody') {
                                // Pega os valores antes e depois da edição
                                const instituicaoAntiga = originalItemBeforeEdit.nome || "";
                                const instituicaoNova = novoNome || "";
                                const nomeAntigoDoCurso = originalItemBeforeEdit.curso;
                                const nomeNovoDoCurso = novoCurso;

                                // 1. Se a instituição MUDOU
                                if (instituicaoAntiga.toLowerCase() !== instituicaoNova.toLowerCase()) {
                                    let instituicoes = JSON.parse(localStorage.getItem("instituicoesBody")) || [];

                                    // 1a. REMOVE da instituição ANTIGA (se ela existia)
                                    if (instituicaoAntiga) {
                                        const instAntiga = instituicoes.find(i => i.nome.toLowerCase() === instituicaoAntiga.toLowerCase());
                                        if (instAntiga && Array.isArray(instAntiga.cursos)) {
                                            instAntiga.cursos = instAntiga.cursos.filter(c => c.toLowerCase() !== nomeAntigoDoCurso.toLowerCase());
                                        }
                                    }

                                    // 1b. ADICIONA à instituição NOVA (se ela existe)
                                    if (instituicaoNova) {
                                        const instNova = instituicoes.find(i => i.nome.toLowerCase() === instituicaoNova.toLowerCase());
                                        if (instNova) {
                                            if (!Array.isArray(instNova.cursos)) instNova.cursos = [];
                                            // Adiciona se não existir
                                            if (!instNova.cursos.find(c => c.toLowerCase() === nomeNovoDoCurso.toLowerCase())) {
                                                instNova.cursos.push(nomeNovoDoCurso);
                                            }
                                        }
                                    }
                                    // Salva as mudanças nas instituições
                                    localStorage.setItem("instituicoesBody", JSON.stringify(instituicoes));
                                }
                                // 2. Se a instituição é a MESMA, mas o NOME DO CURSO mudou
                                else if (instituicaoNova && (nomeAntigoDoCurso.toLowerCase() !== nomeNovoDoCurso.toLowerCase())) {
                                    let instituicoes = JSON.parse(localStorage.getItem("instituicoesBody")) || [];
                                    const inst = instituicoes.find(i => i.nome.toLowerCase() === instituicaoNova.toLowerCase());
                                    
                                    if (inst && Array.isArray(inst.cursos)) {
                                        // Encontra o índice do nome antigo
                                        const index = inst.cursos.findIndex(c => c.toLowerCase() === nomeAntigoDoCurso.toLowerCase());
                                        if (index !== -1) {
                                            // Atualiza para o nome novo
                                            inst.cursos[index] = nomeNovoDoCurso;
                                            localStorage.setItem("instituicoesBody", JSON.stringify(instituicoes));
                                        }
                                    }
                                }

                                // Atualiza o próprio item do curso
                                item.nome = novoNome;
                                item.curso = novoCurso;
                            
                            } 
                            // ======================================================
                            //  FIM DA MUDANÇA
                            // ======================================================
                            
                            // Lógica original para outros tipos
                            else if (STORAGE_KEY === 'diciplinasBody') {
                                item.nome = novoNome;
                                item.curso = novoCurso;
                                item.sigla = novoSigla;
                                item.codigo = novoCodigo;
                                item.periodo = novoPeriodo;
                            } else {
                                // Assumindo instituicoesBody (ou outros)
                                item.nome = novoNome;

                                // LÓGICA DE EDIÇÃO DE INSTITUIÇÃO: Atualiza o nome da instituição nos cursos
                                if (STORAGE_KEY === 'instituicoesBody' && originalItemBeforeEdit.nome.toLowerCase() !== novoNome.toLowerCase()) {
                                    let cursos = JSON.parse(localStorage.getItem("cursosBody")) || [];
                                    let instituicoes = JSON.parse(localStorage.getItem("instituicoesBody")) || [];
                                    const cursosRelacionados = cursos.filter(c => c.nome.toLowerCase() === originalItemBeforeEdit.nome.toLowerCase());

                                    // Atualiza o nome da instituição nos objetos de cursos
                                    cursosRelacionados.forEach(curso => {
                                        curso.nome = novoNome;
                                    });
                                    localStorage.setItem("cursosBody", JSON.stringify(cursos));

                                    // Atualiza o nome da instituição na lista de cursos dentro da própria instituição (para o caso de linkar cursos posteriormente)
                                    // A lista de cursos (item.cursos) já está sendo atualizada pelo fluxo de edição (item.nome = novoNome) pois 'item' é a referência.
                                    // Mas é bom garantir a persistência:
                                    const instEditada = instituicoes.find(i => i.id == item.id);
                                    if (instEditada) {
                                        instEditada.nome = novoNome;
                                        saveItens(instituicoes);
                                    }
                                }
                            }
                        }
                        // Limpa o backup, pois as mudanças foram salvas
                        originalItemBeforeEdit = null;
                    
                    } else {
                        // --- MODO CRIAR (Novo) ---
                        // (código de criação omitido para brevidade)
                        if (!listContainer || !cardTemplate) {
                            console.warn(`Tentativa de CRIAR item em uma página sem .cardsCreateIdt ou template. Operação cancelada.`);
                            closeAndResetModal();
                            return;
                        }

                        const novoItem = {
                            id: Date.now().toString(),
                            nome: novoNome,  // Nome da Instituição (em cursosBody) ou Curso (em diciplinasBody)
                            curso: novoCurso // Nome do Curso (em cursosBody) ou Nome da Disciplina (em diciplinasBody)
                        };

                        // LÓGICA: Linkar curso à instituição (ao criar um novo curso)
                        if (STORAGE_KEY === 'cursosBody' && novoItem.nome) {
                            let instituicoes = JSON.parse(localStorage.getItem("instituicoesBody")) || [];
                            const instituicaoAlvo = instituicoes.find(inst => inst.nome.toLowerCase() === novoItem.nome.toLowerCase());
                            if (instituicaoAlvo) {
                                if (!Array.isArray(instituicaoAlvo.cursos)) {
                                    instituicaoAlvo.cursos = [];
                                }
                                const cursoJaExiste = instituicaoAlvo.cursos.find(c => c.toLowerCase() === novoItem.curso.toLowerCase());
                                if (!cursoJaExiste) {
                                    instituicaoAlvo.cursos.push(novoItem.curso);
                                    localStorage.setItem("instituicoesBody", JSON.stringify(instituicoes));
                                }
                            }
                        }


                        if (STORAGE_KEY === 'diciplinasBody') {
                            novoItem.sigla = novoSigla;
                            novoItem.codigo = novoCodigo;
                            novoItem.periodo = novoPeriodo;
                        }

                        if (STORAGE_KEY === 'instituicoesBody') {
                            novoItem.cursos = [];
                            delete novoItem.curso;
                        }

                        itens.push(novoItem);
                    }

                    saveItens(itens);
                    closeAndResetModal();
                });
            }

            // Event listener para DELETAR e ADICIONAR Cursos (dentro do modal de edição de Instituições)
            // (código de add/deletar cursos no modal omitido para brevidade)
            if (createIdt) {
                createIdt.addEventListener('click', (e) => {
                    const trashIcon = e.target.closest('.cursoDeletinIcon');
                    const addIcon = e.target.closest('.cursoAddinIcon'); // NOVO

                    if (!currentEditingCard) return;
                    if (STORAGE_KEY !== 'instituicoesBody') return;

                    // Pega a instituição (que está sendo modificada em tempo real)
                    let instituicoes = getItens();
                    const instituicao = instituicoes.find(i => i.id == currentEditingCard.id);
                    if (!instituicao) return;
                    
                    const nomeInst = instituicao.nome;

                    // --- Lógica de DELETAR ---
                    if (trashIcon) {
                        const divParaRemover = trashIcon.closest('.linkDatailsIdt');
                        const nomeDoCurso = divParaRemover.dataset.cursoNome;

                        if (!nomeDoCurso) return;

                        if (instituicao.cursos) {
                            // 1. Remove da lista de cursos da Instituição
                            instituicao.cursos = instituicao.cursos.filter(c => c.toLowerCase() !== nomeDoCurso.toLowerCase());
                            saveItens(instituicoes);
                            
                            // 2. Remove o nome da Instituição do objeto Curso no localStorage
                            let cursos = JSON.parse(localStorage.getItem("cursosBody")) || [];
                            const cursoAlvo = cursos.find(c => c.curso.toLowerCase() === nomeDoCurso.toLowerCase());
                            
                            if (cursoAlvo && cursoAlvo.nome.toLowerCase() === nomeInst.toLowerCase()) {
                                cursoAlvo.nome = ""; // Desvincula o curso da instituição
                                localStorage.setItem("cursosBody", JSON.stringify(cursos));
                            }

                            popularCursosParaEdicao(instituicao); // Recarrega as 3 listas
                        }
                    }

                    // --- Lógica de ADICIONAR ---
                    if (addIcon) {
                        const divParaAdicionar = addIcon.closest('.linkDatailsIdt');
                        const nomeDoCurso = divParaAdicionar.dataset.cursoNome;

                        if (!nomeDoCurso) return;

                        if (!instituicao.cursos) { // Garante que o array exista
                            instituicao.cursos = [];
                        }

                        // 1. Adiciona na lista de cursos da Instituição
                        instituicao.cursos.push(nomeDoCurso); // Adiciona o curso
                        saveItens(instituicoes);
                        
                        // 2. Adiciona o nome da Instituição ao objeto Curso no localStorage
                        let cursos = JSON.parse(localStorage.getItem("cursosBody")) || [];
                        const cursoAlvo = cursos.find(c => c.curso.toLowerCase() === nomeDoCurso.toLowerCase());
                        
                        if (cursoAlvo) {
                            cursoAlvo.nome = nomeInst; // Vincula o curso à instituição
                            localStorage.setItem("cursosBody", JSON.stringify(cursos));
                        }
                        
                        popularCursosParaEdicao(instituicao); // Recarrega as 3 listas
                    }
                });
            }


            // --- Lógica para o Modal "Linkar Curso" ---
            // (código do modal Linkar Curso omitido para brevidade)
            if (linkCursoContainer) {
                const closeLinkBtn = linkCursoContainer.querySelector("#closedAdd");
                const cancelLinkBtn = linkCursoContainer.querySelector("#cancelAddIdt");
                const saveLinkBtn = linkCursoContainer.querySelector("#saveAddIdt");
                const inputLink = linkCursoContainer.querySelector('input[list="listCursosLink"]');
                const datalistLink = linkCursoContainer.querySelector("#listCursosLink");

                // Popula o datalist
                if (datalistLink) {
                    datalistLink.innerHTML = '';
                    const cursos = JSON.parse(localStorage.getItem("cursosBody")) || [];
                    cursos.forEach(curso => {
                        const option = document.createElement('option');
                        option.value = curso.curso;
                        datalistLink.appendChild(option);
                    });
                }

                const closeLinkModal = () => {
                    linkCursoContainer.style.display = 'none';
                    if (inputLink) inputLink.value = '';
                    linkCursoContainer.removeAttribute('data-instituicao-id');
                };

                if (closeLinkBtn) closeLinkBtn.addEventListener('click', closeLinkModal);
                if (cancelLinkBtn) cancelLinkBtn.addEventListener('click', closeLinkModal);

                // Lógica de Salvamento e Validação
                if (saveLinkBtn) {
                    saveLinkBtn.addEventListener('click', () => {
                        const cursoSelecionado = inputLink.value.trim();
                        const instituicaoId = linkCursoContainer.dataset.instituicaoId;

                        if (!instituicaoId) return;
                        if (!cursoSelecionado) {
                            alert("Por favor, selecione um curso para adicionar.");
                            return;
                        }

                        // Validação 1: Curso existe?
                        const todosCursos = JSON.parse(localStorage.getItem("cursosBody")) || [];
                        const cursoValido = todosCursos.find(c => c.curso.toLowerCase() === cursoSelecionado.toLowerCase());

                        if (!cursoValido) {
                            // A função mostrarAlerta não está definida aqui, usando alert
                            alert(`Curso "${cursoSelecionado}" não encontrado.\nPor favor, selecione um curso que já foi criado na aba "Cursos".`)
                            return;
                        }

                        // Validação 2: Já foi adicionado?
                        let instituicoes = getItens();
                        const instituicao = instituicoes.find(i => i.id == instituicaoId);

                        if (!instituicao) return;

                        if (!Array.isArray(instituicao.cursos)) {
                            instituicao.cursos = [];
                        }
                        const nomeInst = instituicao.nome;

                        if (instituicao.cursos.find(c => c.toLowerCase() === cursoSelecionado.toLowerCase())) {
                            alert(`"${cursoSelecionado}" já está vinculado a esta instituição.`);
                            return;
                        }

                        // Validação 3: Curso já pertence a OUTRA instituição?
                        if (cursoValido.nome && cursoValido.nome.toLowerCase() !== nomeInst.toLowerCase()) {
                             alert(`O curso "${cursoSelecionado}" já está vinculado à instituição "${cursoValido.nome}". Desvincule-o primeiro na aba "Cursos" ou edite a instituição lá.`);
                            return;
                        }


                        // SALVAR
                        // 1. Adiciona o curso à lista de cursos da instituição
                        instituicao.cursos.push(cursoValido.curso);
                        saveItens(instituicoes);

                        // 2. Atualiza o objeto do curso no cursosBody para vincular à instituição
                        const cursoAlvo = todosCursos.find(c => c.curso.toLowerCase() === cursoSelecionado.toLowerCase());
                        if (cursoAlvo) {
                            cursoAlvo.nome = nomeInst;
                            localStorage.setItem("cursosBody", JSON.stringify(todosCursos));
                        }

                        closeLinkModal();
                        loadAndRender(); // Atualiza a tela
                    });
                }
            }


            // --- Lógica de Datalist (dos modais de criação/edição) ---
            if (STORAGE_KEY === 'diciplinasBody') {
                const datalist = container.querySelector("#listCursos");
                if (datalist) {
                    datalist.innerHTML = '';
                    const cursos = JSON.parse(localStorage.getItem("cursosBody")) || [];
                    cursos.forEach(curso => {
                        const option = document.createElement('option');
                        option.value = curso.curso;
                        datalist.appendChild(option);
                    });
                }
            }
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