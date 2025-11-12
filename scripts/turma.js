// turma.js

function iniciarPageTurmas() {
    console.log("✅ Lógica de Turmas iniciada separadamente!");

    const container = document.querySelector("#turmasBody");
    if (!container) return;

    // --- Elementos Principais ---
    const btnNovaTurma = container.querySelector(".newIdt");
    const cardIdt = container.querySelector(".cardIdt");       
    const createIdt = container.querySelector(".createIdt");   
    const listContainer = container.querySelector(".cardsCreateIdt"); 

    // --- Elementos Visuais do "Vazio" ---
    const emptyStateElements = Array.from(cardIdt.children).filter(el => !el.classList.contains('createIdt'));

    // --- Botões do Modal ---
    const closeBtn = createIdt.querySelector("#xClosedCreate");
    const cancelBtn = createIdt.querySelector("#cancelBtnIdt");
    const createBtn = createIdt.querySelector("#createBtnIdt");

    // --- Inputs ---
    const inputCurso = createIdt.querySelector("#inputCursoTurma");
    const inputNome = createIdt.querySelector("#inputNomeTurma");
    const inputCodigo = createIdt.querySelector("#inputSiglaDiciplina"); 
    const inputPeriodo = createIdt.querySelector("#periodoSelect");
    const datalist = container.querySelector("#listTurma");

    // --- Variável de Controle ---
    let currentEditingId = null;

    // ============================================================
    // 1. POPULAR O DATALIST (Lista de Cursos)
    // ============================================================
    function carregarListaDeCursos() {
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

    // ============================================================
    // 2. RENDERIZAR TURMAS (AJUSTADO PARA SUA ESTRUTURA)
    // ============================================================
    function renderTurmas() {
        const turmas = JSON.parse(localStorage.getItem("turmasBody")) || [];
        
        listContainer.innerHTML = '';

        turmas.forEach(turma => {
            const card = document.createElement('div');
            // AQUI: Mudamos a classe para não conflitar com o grid pai e adicionamos estilo básico se necessário
            card.className = 'turma-card-wrapper'; 
            // Estilo inline opcional para garantir que os itens fiquem organizados (pode mover para o CSS)
            card.style.cssText = "background: var(--white); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 10px; position: relative;";
            
            card.dataset.id = turma.id;
            
            const codigoShow = turma.codigo || "-";
            const periodoShow = turma.periodo || "-";

            card.innerHTML = `
                <div class="contentCardIdt" style="box-shadow: none; padding: 0; transform: none;">
                    <i class="ph ph-users" id="turmasIcon" style="background: var(--color9Shadow); color: var(--color9)"></i>
                    <div class="textContentCardIdt">
                        <h2>${turma.nome}</h2>
                        <p>${turma.curso}</p>
                        <div class="viewDetails">
                            <div class="code">${codigoShow}</div>
                            <div class="period">${periodoShow}°</div>
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
                </div>
                <div class="notas">
                    <a href="../pages/notasEalunos.html" target="_blank" id="manageNotesBtn">
                        Gerenciar Notas e Alunos
                    </a>
                </div>
                
                
            `;
            listContainer.appendChild(card);
        });

        // Lógica de exibição: Lista cheia vs Lista vazia
        if (turmas.length > 0) {
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
            emptyStateElements.forEach(el => el.style.display = "block");
        }
    }

    // ============================================================
    // 3. ABRIR MODAL
    // ============================================================
    function openModal(modo = 'criar') {
        cardIdt.style.display = "flex";
        cardIdt.style.border = "none";
        cardIdt.style.background = "none";
        emptyStateElements.forEach(el => el.style.display = "none");
        listContainer.style.display = "none";
        createIdt.classList.add("show");

        if (modo === 'criar') {
            createBtn.textContent = "Criar";
            currentEditingId = null;
            
            inputNome.value = "";
            inputCurso.value = "";
            inputCodigo.value = "";   
            inputPeriodo.value = "";  
        } else {
            createBtn.textContent = "Salvar";
        }
    }

    // ============================================================
    // 4. FECHAR MODAL
    // ============================================================
    function closeModal() {
        createIdt.classList.remove("show");
        currentEditingId = null;
        renderTurmas(); 
    }

    // --- Listeners ---
    btnNovaTurma.addEventListener("click", () => {
        carregarListaDeCursos();
        openModal('criar');
    });

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);

    // ============================================================
    // 5. SALVAR
    // ============================================================
    createBtn.addEventListener("click", () => {
        const nome = inputNome.value.trim();
        const curso = inputCurso.value.trim();
        const codigo = inputCodigo.value.trim();
        const periodo = inputPeriodo.value;

        if (!nome || !curso) {
            alert("Preencha pelo menos o Nome da Turma e o Curso!");
            return;
        }

        let turmas = JSON.parse(localStorage.getItem("turmasBody")) || [];

        if (currentEditingId) {
            // Edição
            const index = turmas.findIndex(t => t.id == currentEditingId);
            if (index !== -1) {
                turmas[index].nome = nome;
                turmas[index].curso = curso;
                turmas[index].codigo = codigo;
                turmas[index].periodo = periodo;
            }
        } else {
            // Criação
            const novaTurma = {
                id: Date.now().toString(),
                nome: nome,
                curso: curso,
                codigo: codigo,
                periodo: periodo
            };
            turmas.push(novaTurma);
        }

        localStorage.setItem("turmasBody", JSON.stringify(turmas));
        closeModal();
    });

    // ============================================================
    // 6. AÇÕES DOS CARDS (CORRIGIDO O SELETOR)
    // ============================================================
    listContainer.addEventListener("click", (e) => {
        const btnEdit = e.target.closest(".editCard");
        const btnDelet = e.target.closest(".deletCard");
        
        // AQUI: Mudamos para buscar a nova classe wrapper, onde está o ID
        const card = e.target.closest(".turma-card-wrapper");

        if (!card) return;
        const id = card.dataset.id;

        if (btnDelet) {
            if (confirm("Deseja excluir esta turma?")) {
                let turmas = JSON.parse(localStorage.getItem("turmasBody")) || [];
                turmas = turmas.filter(t => t.id != id);
                localStorage.setItem("turmasBody", JSON.stringify(turmas));
                renderTurmas();
            }
        }

        if (btnEdit) {
            const turmas = JSON.parse(localStorage.getItem("turmasBody")) || [];
            const turma = turmas.find(t => t.id == id);
            if (turma) {
                carregarListaDeCursos();
                
                inputNome.value = turma.nome;
                inputCurso.value = turma.curso;
                inputCodigo.value = turma.codigo || "";
                inputPeriodo.value = turma.periodo || "";
                
                currentEditingId = id;
                openModal('editar');
            }
        }
    });

    renderTurmas();
}