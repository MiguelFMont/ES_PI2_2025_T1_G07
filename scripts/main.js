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
            const inputs = createIdt.querySelectorAll(".campIdt input");
            const inputInstituicao = inputs[0]; // Correto: Instituição
            const inputCurso = inputs[2];

            // ======================================================
            // MUDANÇA (1): Selecionar o checkbox
            // ======================================================
            const checkNoInstituicao = createIdt.querySelector("#noInstituicao");


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

            // ======================================================
            // MUDANÇA (2): Adicionar o event listener para o checkbox
            // ======================================================
            if (checkNoInstituicao && inputInstituicao) {
                checkNoInstituicao.addEventListener('change', () => {
                    if (checkNoInstituicao.checked) {
                        inputInstituicao.disabled = true;
                        inputInstituicao.value = ""; // Limpa o valor
                        inputInstituicao.placeholder = "Não é necessário";
                    } else {
                        inputInstituicao.disabled = false;
                        inputInstituicao.placeholder = "Selecione a instituição"; // Placeholder original
                    }
                });
            }


            // NOVO: Função para popular os cursos no modal de edição
            function popularCursosParaEdicao(item) {
                if (!cursosAdicionadosCamp || !deletCursoContainer || !addCursoContainer) return;

                // ======================================================
                //  MUDANÇA AQUI: Definindo a paleta de cores
                // ======================================================
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

                        // ======================================================
                        //  MUDANÇA AQUI: Aplicando cores (Adicionados)
                        // ======================================================
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

                        // ======================================================
                        //  MUDANÇA AQUI: Aplicando cores (Deletar)
                        // ======================================================
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

                        // ======================================================
                        //  MUDANÇA AQUI: Aplicando cores (Adicionar)
                        // ======================================================
                        const colorIndex = index % bgColors.length;
                        divAdicionar.style.background = `var(${bgColors[colorIndex]})`;
                        divAdicionar.style.color = `var(${textColors[colorIndex]})`;

                        divAdicionar.appendChild(addIcon);
                        addCursoContainer.appendChild(divAdicionar);
                    });
                }
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
                if (inputInstituicao) inputInstituicao.value = "";
                if (inputCurso) inputCurso.value = "";

                // ======================================================
                // MUDANÇA (3): Resetar o checkbox e input ao fechar
                // ======================================================
                if (checkNoInstituicao) {
                    checkNoInstituicao.checked = false;
                }
                if (inputInstituicao) {
                    inputInstituicao.disabled = false;
                    inputInstituicao.placeholder = "Selecione a instituição";
                }


                if (STORAGE_KEY === 'diciplinasBody') {
                    const inputCursoSelect = createIdt.querySelector("#cursoSelect");
                    if (inputCursoSelect) inputCursoSelect.value = "";

                    const allInputs = createIdt.querySelectorAll(".campIdt input, .campIdtToggle .campIdt input");
                    if (allInputs[1]) allInputs[1].value = ""; // Nome Disciplina
                    if (allInputs[2]) allInputs[2].value = ""; // Sigla
                    if (allInputs[3]) allInputs[3].value = ""; // Código

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
                // Restaura placeholders de Adicionar e Deletar
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

                if (inputInstituicao) inputInstituicao.value = "";
                if (inputCurso) inputCurso.value = "";

                // ======================================================
                // MUDANÇA (4): Resetar o checkbox e input ao CRIAR
                // ======================================================
                if (checkNoInstituicao) {
                    checkNoInstituicao.checked = false;
                }
                if (inputInstituicao) {
                    inputInstituicao.disabled = false;
                    inputInstituicao.placeholder = "Selecione a instituição";
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

                    const allInputs = createIdt.querySelectorAll(".campIdt input, .campIdtToggle .campIdt input");
                    if (allInputs[1]) allInputs[1].value = "";
                    if (allInputs[2]) allInputs[2].value = "";
                    if (allInputs[3]) allInputs[3].value = "";

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

                        // ======================================================
                        // MUDANÇA (5): Ajustar o estado ao ABRIR PARA EDITAR
                        // ======================================================
                        if (STORAGE_KEY === 'cursosBody' && checkNoInstituicao && inputInstituicao) {
                            if (item.nome) { // Se tem uma instituição salva
                                checkNoInstituicao.checked = false;
                                inputInstituicao.disabled = false;
                                inputInstituicao.placeholder = "Selecione a instituição";
                            } else { // Se não tem (foi salvo com 'Não tenho')
                                checkNoInstituicao.checked = true;
                                inputInstituicao.disabled = true;
                                inputInstituicao.value = ""; // Garante que esteja limpo
                                inputInstituicao.placeholder = "Não é necessário";
                            }
                        }


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

                        if (STORAGE_KEY === 'diciplinasBody') {
                            const inputCursoSelect = createIdt.querySelector("#cursoSelect");
                            const allInputs = createIdt.querySelectorAll(".campIdt input, .campIdtToggle .campIdt input");
                            const inputNomeDisciplina = allInputs[1];
                            const inputSigla = allInputs[2];
                            const inputCodigo = allInputs[3];
                            const inputPeriodoSelect = createIdt.querySelector("#periodoSelect");

                            if (inputCursoSelect) inputCursoSelect.value = item.nome;
                            if (inputNomeDisciplina) inputNomeDisciplina.value = item.curso;
                            if (inputSigla) inputSigla.value = item.sigla || "";
                            if (inputCodigo) inputCodigo.value = item.codigo || "";
                            if (inputPeriodoSelect) inputPeriodoSelect.value = item.periodo || "";
                        
                        } else if (STORAGE_KEY === 'cursosBody') {
                            if (inputInstituicao) inputInstituicao.value = item.nome; // Campo Instituição
                            if (inputCurso) inputCurso.value = item.curso; // Campo Nome do Curso
                        
                        } else { // instituicoesBody
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

                    if (deleteBtn) {
                        const nomeItem = (STORAGE_KEY === 'diciplinasBody') ? item.curso : (item.curso || item.nome);
                        if (confirm(`Tem certeza que deseja excluir "${nomeItem}"?`)) {
                            // ✅ SE FOR INSTITUIÇÃO, USA O BANCO
                            if (STORAGE_KEY === 'instituicoesBody') {
                                deletarInstituicaoDB(id);
                            } else {
                                // Outros casos continuam usando localStorage
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

                    if (STORAGE_KEY === 'instituicoesBody') {
                        return; // Sai da função, deixa o functionMain.js tratar
                    }

                    let novoNome, novoCurso, novoSigla, novoCodigo, novoPeriodo;

                    if (STORAGE_KEY === 'diciplinasBody') {
                        const inputCursoSelect = createIdt.querySelector("#cursoSelect");
                        const allInputs = createIdt.querySelectorAll(".campIdt input, .campIdtToggle .campIdt input");

                        const inputNomeDisciplina = allInputs[1];
                        const inputSigla = allInputs[2];
                        const inputCodigo = allInputs[3];
                        const inputPeriodoSelect = createIdt.querySelector("#periodoSelect");

                        novoNome = inputCursoSelect ? inputCursoSelect.value.trim() : "";
                        novoCurso = inputNomeDisciplina ? inputNomeDisciplina.value.trim() : "";
                        novoSigla = inputSigla ? inputSigla.value.trim() : "";
                        novoCodigo = inputCodigo ? inputCodigo.value.trim() : "";
                        novoPeriodo = inputPeriodoSelect ? inputPeriodoSelect.value : "";

                    } else {
                        novoNome = inputInstituicao ? inputInstituicao.value.trim() : "";

                        if (STORAGE_KEY === 'instituicoesBody') {
                            novoCurso = "";
                        } else {
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
                        // ======================================================
                        // MUDANÇA (6): Lógica de validação do checkbox
                        // ======================================================
                        if (checkNoInstituicao && checkNoInstituicao.checked) {
                            // Se o checkbox está marcado, 'novoNome' (instituição) não é obrigatório.
                            // 'novoNome' já será "" por causa do listener.
                            if (!novoCurso) {
                                alert("Por favor, preencha o Nome do curso.");
                                return;
                            }
                        } else {
                            // Checkbox NÃO está marcado, ambos são obrigatórios.
                            if (!novoNome || !novoCurso) {
                                alert("Por favor, preencha a Instituição e o Nome do curso.");
                                return;
                            }
                        }
                    }
                    // --- Fim da Validação ---


                    let itens = getItens();

                    if (currentEditingCard) {
                        // --- MODO SALVAR (Edição) ---
                        const item = itens.find(i => i.id == currentEditingCard.id);
                        if (item) {
                            item.nome = novoNome;
                            if (STORAGE_KEY === 'diciplinasBody') {
                                item.curso = novoCurso;
                                item.sigla = novoSigla;
                                item.codigo = novoCodigo;
                                item.periodo = novoPeriodo;
                            }
                            if (STORAGE_KEY === 'cursosBody') {
                                item.curso = novoCurso;
                            }
                        }
                        // Limpa o backup, pois as mudanças foram salvas
                        originalItemBeforeEdit = null;
                    } else {
                        // --- MODO CRIAR (Novo) ---
                        if (!listContainer || !cardTemplate) {
                            console.warn(`Tentativa de CRIAR item em uma página sem .cardsCreateIdt ou template. Operação cancelada.`);
                            closeAndResetModal();
                            return;
                        }

                        const novoItem = {
                            id: Date.now().toString(),
                            nome: novoNome,
                            curso: novoCurso
                        };

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

            // Event listener para DELETAR e ADICIONAR Cursos
            if (createIdt) {
                createIdt.addEventListener('click', (e) => {
                    const trashIcon = e.target.closest('.cursoDeletinIcon');
                    const addIcon = e.target.closest('.cursoAddinIcon'); // NOVO

                    if (!currentEditingCard) return;

                    // Pega a instituição (que está sendo modificada em tempo real)
                    let instituicoes = getItens();
                    const instituicao = instituicoes.find(i => i.id == currentEditingCard.id);
                    if (!instituicao) return;

                    // --- Lógica de DELETAR ---
                    if (trashIcon) {
                        const divParaRemover = trashIcon.closest('.linkDatailsIdt');
                        const nomeDoCurso = divParaRemover.dataset.cursoNome;

                        if (!nomeDoCurso) return;

                        if (instituicao.cursos) {
                            instituicao.cursos = instituicao.cursos.filter(c => c.toLowerCase() !== nomeDoCurso.toLowerCase());
                            saveItens(instituicoes);
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

                        instituicao.cursos.push(nomeDoCurso); // Adiciona o curso
                        saveItens(instituicoes);
                        popularCursosParaEdicao(instituicao); // Recarrega as 3 listas
                    }
                });
            }


            // --- Lógica para o Modal "Linkar Curso" ---
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
                            mostrarAlerta(`Curso "${cursoSelecionado}" não encontrado.\n\nPor favor, selecione um curso que já foi criado na aba "Cursos".`, "aviso")
                            return;
                        }

                        // Validação 2: Já foi adicionado?
                        let instituicoes = getItens();
                        const instituicao = instituicoes.find(i => i.id == instituicaoId);

                        if (!instituicao) return;

                        if (!Array.isArray(instituicao.cursos)) {
                            instituicao.cursos = [];
                        }

                        if (instituicao.cursos.find(c => c.toLowerCase() === cursoSelecionado.toLowerCase())) {
                            alert(`"${cursoSelecionado}" já foi adicionado a esta instituição.`);
                            return;
                        }

                        // SALVAR
                        instituicao.cursos.push(cursoValido.curso);
                        saveItens(instituicoes);

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