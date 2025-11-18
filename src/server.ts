import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { request } from "http";
import cors from "cors";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

console.log("API KEY:", process.env.RESEND_API_KEY);
// import {
//     getAllEstudantes,
//     getEstudanteById,
//     addEstudante,
// } from "./db/estudantes";

import {
    addInstituicao,
    deleteInstituicao,
    updateInstituicao,
    verificarCadastroInstituicao,
    getInstituicaoById,
    getAllInstituicao
} from "./db/instituicao";

import {
    addDocente,
    verificarLoginDocente,
    verificarCadastroDocente,
    modificarSenhaDocente,
    modifyDocente
} from "./db/docente";

import {
    addCurso,
    deleteCurso,
    updateCurso,
    verificarCadastroCurso,
    getCursoById,
    getAllCurso
} from "./db/curso"

import {
    addDisciplina,
    deleteDisciplina,
    updateDisciplina,
    verificarCadastroDisciplina,
    getDisciplinaByCodigo,
    getAllDisciplina
} from "./db/disciplina"

import {
    addTurma,
    deleteTurma,
    updateTurma,
    verificarTurmaExistente,
    getTurmaById,
    getAllTurmas
} from "./db/turma"

import {
    addEstudante,
    deleteEstudante,
    updateEstudante,
    verificarEstudanteExistente,
    getEstudanteByRA,
    getAllEstudantes
} from "./db/estudante"

import {
    addComponenteNota,
    deleteComponenteNota,
    updateComponenteNota,
    verificarComponenteNotaExistente,
    getComponenteNotaById,
    getAllComponentesNota
} from "./db/componente_nota"

import {
    addNota,
    verificarNotaExistente,
    getNotaById,
    getAllNotas
} from "./db/nota";

import {
    addMatricula,
    verificarMatriculaExistente,
    getMatriculaById,
    getAllMatriculas
} from "./db/matricula";

import {
    gerarCodigoVericacao,
    enviarCodigoVerificacao,
    enviarLinkAlterarSenha
} from "./services/email";

import { isNumberObject } from "util/types";


const app = express();
const port: number = 3000;
let codigoAtivo: string;


app.use(express.static(path.resolve(__dirname, "..")));
app.use("/pages", express.static(path.resolve(__dirname, "../pages")));

app.use(bodyParser.json());
app.use(cors());
app.use('/scripts', express.static(path.join(__dirname, '../scripts')));
app.use('/src', express.static(path.join(__dirname, './src')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*=========*/
/* PÁGINAS */
/*=========*/
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../index.html"));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/pageCadastro.html'));
});

app.get('/recuperar-senha', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/pageEmailToModifyPassword.html'));
});

app.get('/redefinir-senha', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/pageRecoveryPassword.html'));
});

app.get('/verificacao', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/pageVerification.html'));
});

app.get('/userSettings', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/pageUserSettings.html'));
});

app.get('/gerenciar-notas', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/notasEalunos.html'));
});

app.get('/mainPage', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/mainPage.html'));
});

/*=============*/
/* INSTITUIÇÃO */
/*=============*/
// ✅ Verificar se docente já tem instituição com este nome
app.post('/instituicao/verificar', async (req: Request, res: Response) => {
    try {
        const { nome, id_docente } = req.body;
        console.log("🔍 Verificando instituição:", nome, "para docente:", id_docente);

        if (!nome || !id_docente) {
            return res.status(400).json({
                sucesso: false,
                message: "Os campos nome e id_docente são obrigatórios"
            });
        }

        const instituicao = await verificarCadastroInstituicao(nome, id_docente);

        if (instituicao) {
            console.log("❌ Instituição já cadastrada:", instituicao.nome);
            res.json({
                sucesso: false,
                message: "A Instituição já está cadastrada",
                instituicao: instituicao
            });
        } else {
            console.log("✅ Instituição disponível para cadastro!")
            res.json({
                sucesso: true,
                message: "Instituição disponível para cadastro"
            });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar a instituição:", error);
        res.status(500).json({
            sucesso: false,
            message: "Erro no servidor"
        });
    }
});

// ✅ Cadastrar instituição
app.post("/instituicao/cadastro", async (req, res) => {
    try {
        const { nomeInstituicao, nomeCurso, id_docente } = req.body;

        if (!nomeInstituicao || !id_docente) {
            return res.status(400).json({
                sucesso: false,
                error: "Nome e ID do docente são obrigatórios"
            });
        }
        const id = await addInstituicao(nomeCurso, nomeInstituicao, id_docente);

        res.json({
            sucesso: true,
            message: "Instituição e curso cadastrados com sucesso!",
            id: id.id,
            nome_instituicao: id.nome,
            nome_curso: id.nomeCurso
        });
    } catch (error) {
        console.error("Erro ao cadastrar instituição:", error);
        res.status(500).json({
            sucesso: false,
            error: "Erro ao cadastrar instituição"
        });
    }
});

app.post('/instituicao/atualizar', async (req: Request, res: Response) => {
    try {
        const { id, novo_nome } = req.body;

        if (!id || !novo_nome) {
            console.log("❌ ID e novo nome são obrigatórios!");
            return res.status(400).json({
                error: "Os campos ID e novo_nome são obrigatórios!"
            });
        }

        // Verificar se a instituição existe
        const instituicaoExistente = await getInstituicaoById(id);
        if (!instituicaoExistente) {
            console.log("❌ Instituição não encontrada para o ID:", id);
            return res.status(404).json({
                error: "Instituição não encontrada com o ID fornecido"
            });
        }

        await updateInstituicao(id, novo_nome);
        console.log("✅ Instituição atualizada com sucesso!");
        res.status(200).json({
            message: "Instituição atualizada com sucesso",
            id: id,
            novo_nome: novo_nome
        });
    } catch (error) {
        console.error("❌ Erro ao atualizar a instituição:", error);
        res.status(500).json({ error: "Erro ao atualizar a instituição." });
    }
});

// ✅ Deletar instituição (não precisa mais do id_docente)
app.post('/instituicao/deletar', async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        if (!id) {
            console.log("❌ O campo ID é obrigatório!");
            return res.status(400).json({
                error: "O campo ID é obrigatório!"
            });
        }

        const deletado = await deleteInstituicao(id);
        if (!deletado) {
            return res.status(404).json({
                error: "Instituição não encontrada",
                sucesso: false
            });
        }

        console.log("✅ Instituição deletada com sucesso!")
        res.json({
            message: "Instituição deletada com sucesso",
            sucesso: true
        });
    } catch (error) {
        console.error(error);
        console.log("❌ Erro ao deletar a instituição.");
        res.status(500).json({
            error: "Erro ao deletar a instituição.",
            sucesso: false
        });
    }
});

app.get('/instituicao/id/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const instituicao = await getInstituicaoById(id);
        if (instituicao) {
            res.json(instituicao);
        } else {
            res.status(404).json({ message: "Instituição não encontrada com o ID fornecido" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar a instituição pelo ID fornecido." });
    }
});

app.get('/instituicao/all/:id_docente', async (req: Request, res: Response) => {
    try {
        const id_docente = Number(req.params.id_docente);
        console.log("🔍 Buscando instituições do docente ID:", id_docente);

        if (!id_docente || isNaN(id_docente)) {
            console.log("❌ ID do docente inválido:", req.params.id_docente);
            return res.status(400).json({
                sucesso: false,
                error: "ID do docente é obrigatório e deve ser um número válido"
            });
        }

        const instituicoes = await getAllInstituicao(id_docente);

        if (instituicoes && instituicoes.length > 0) {
            console.log(`✅ ${instituicoes.length} instituição(ões) encontrada(s) para o docente ID: ${id_docente}`);
            res.json({
                sucesso: true,
                instituicoes: instituicoes
            });
        } else {
            console.log("⚠️ Nenhuma instituição encontrada para o docente ID:", id_docente);
            res.status(404).json({
                sucesso: false,
                message: "Não há instituições cadastradas para este docente."
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar instituições do docente:", error);
        res.status(500).json({
            sucesso: false,
            error: "Erro ao buscar as instituições."
        });
    }
});

/*=======*/
/* CURSO */
/*=======*/
// Verificar se curso já existe
app.post('/curso/verificar', async (req: Request, res: Response) => {
    try {
        const { fk_id_instituicao, nome } = req.body;
        console.log("🔍 Verificando curso:", { fk_id_instituicao, nome });

        const curso = await verificarCadastroCurso(nome, fk_id_instituicao);
        if (curso) {
            console.log("❌ Curso já cadastrado:", curso.nome);
            res.json({
                sucesso: false,
                message: "O Curso já está cadastrado.",
                curso: curso
            });
        } else {
            console.log("✅ Curso ainda não cadastrado!")
            res.status(200).json({
                sucesso: true,
                message: "Curso disponível para cadastro!"
            });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar o curso:", error);
        res.status(500).json({
            sucesso: false,
            message: "Erro no servidor ao verificar curso"
        });
    }
});

// Cadastrar novo curso
app.post('/curso/cadastro', async (req: Request, res: Response) => {
    try {
        const { fk_id_instituicao, nome } = req.body;

        if (!fk_id_instituicao || !nome) {
            console.log("❌ Campos obrigatórios faltando:", { fk_id_instituicao, nome });
            return res.status(400).json({
                error: "Todos os campos são obrigatórios: docente, instituição e nome!"
            });
        }

        const id = await addCurso(fk_id_instituicao, nome);
        console.log("✅ Curso registrado com sucesso! ID:", id);
        res.status(201).json({
            sucesso: true,
            message: "Curso registrado com sucesso",
            id: id
        });
    } catch (error) {
        console.error("❌ Erro ao registrar o curso:", error);
        res.status(500).json({
            error: "Erro ao registrar o curso.",
            sucesso: false
        });
    }
});

// Atualizar curso existente
app.post('/curso/atualizar', async (req: Request, res: Response) => {
    try {
        const { id, nome } = req.body;

        if (!id || !nome) {
            console.log("❌ Campos obrigatórios faltando:", { id, nome });
            return res.status(400).json({
                error: "Todos os campos são obrigatórios: id, nome!"
            });
        }

        await updateCurso(id, nome);
        console.log("✅ Curso atualizado com sucesso! ID:", id);
        res.status(200).json({
            sucesso: true,
            message: "Curso atualizado com sucesso"
        });
    } catch (error) {
        console.error("❌ Erro ao atualizar o curso:", error);
        res.status(500).json({
            sucesso: false, 
            error: "Erro ao atualizar o curso."
        });
    }
});

// Deletar curso
app.post('/curso/deletar', async (req: Request, res: Response) => {
    try {
        const { id, id_instituicao } = req.body;
        console.log(id, id_instituicao);
        if (!id || !id_instituicao) {
            console.log("❌ Os campos ID e ID da instituição são obrigatórios!");
            return res.status(400).json({
                sucesso: false,
                error: "Os campos ID e ID da instituição são obrigatórios!"
            });
        }

        await deleteCurso(id, id_instituicao);
        console.log("✅ Curso deletado com sucesso! ID:", id);
        res.status(200).json({
            sucesso: true,
            message: "Curso deletado com sucesso"
        });
    } catch (error) {
        console.error("❌ Erro ao deletar o curso:", error);
        res.status(500).json({
            sucesso: false,
            error: "Erro ao deletar o curso."
        });
    }
});

// Obter curso por ID
app.get('/curso/id/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const curso = await getCursoById(id);
        if (curso) {
            res.json({
                sucesso: true,
                curso: curso
            });
        } else {
            res.status(404).json({
                sucesso: false,
                message: "Curso não encontrado com o ID fornecido"
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar curso por ID:", error);
        res.status(500).json({
            sucesso: false,
            error: "Erro ao buscar o curso pelo ID fornecido."
        });
    }
});

// Obter todos os cursos
app.get('/curso/all/:id_instituicao', async (req: Request, res: Response) => {
    try {
        const id_instituicao = Number(req.params.id_instituicao);
        console.log("🔍 Buscando cursos da instituição ID:", id_instituicao);

        if (!id_instituicao || isNaN(id_instituicao)) {
            console.log("❌ ID da instituição inválido:", req.params.id_instituicao);
            return res.status(400).json({
                sucesso: false,
                error: "ID da instituição é obrigatório e deve ser um número válido"
            });
        }

        const cursos = await getAllCurso(id_instituicao);

        if (cursos && cursos.length > 0) {
            
            console.log(`✅ ${cursos.length} curso(s) encontrados (sem disciplinas aninhadas)`);
            
            res.json({
                sucesso: true,
                cursos: cursos
            });
        } else {
            console.log("⚠️ Nenhum curso encontrado para a instituição ID:", id_instituicao);
            res.status(404).json({
                sucesso: false,
                message: "Não há cursos cadastrados para esta instituição."
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar cursos da instituição:", error);
        res.status(500).json({
            sucesso: false,
            error: "Erro ao buscar os cursos."
        });
    }
});


/*=============*/
/*  DISCIPLINA */
/*=============*/
// Verificar se disciplina já existe
// ✅ Verificar se disciplina já existe
app.post('/disciplina/verificar', async (req: Request, res: Response) => {
    try {
        const { nome, id_curso } = req.body;
        console.log("🔍 Verificando disciplina:", nome);

        if (!nome || !id_curso) {
            return res.status(400).json({
                sucesso: false,
                message: "Os campos nome e id_curso são obrigatórios"
            });
        }

        const disciplina = await verificarCadastroDisciplina(nome, id_curso);
        if (disciplina) {
            console.log("❌ Disciplina já cadastrada:", disciplina.nome);
            res.json({
                sucesso: false,
                message: "A Disciplina já está cadastrada neste curso",
                disciplina: disciplina
            });
        } else {
            console.log("✅ Disciplina ainda não cadastrada!")
            res.json({
                sucesso: true,
                mensagem: "Disciplina disponível para cadastro"
            });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar a disciplina:", error);
        res.status(500).json({
            sucesso: false,
            mensagem: "Erro no servidor"
        });
    }
});

// Cadastrar nova disciplina
// ✅ Cadastrar nova disciplina
app.post('/disciplina/cadastro', async (req: Request, res: Response) => {
    try {
        const { codigo, id_curso, nome, periodo, sigla } = req.body;

        if (!codigo || !id_curso || !nome) {
            console.log("❌ Campos obrigatórios faltando!");
            return res.status(400).json({
                error: "Campos codigo, id_curso e nome são obrigatórios!"
            });
        }

        // Verificar se o código já existe
        const disciplinaExistente = await getDisciplinaByCodigo(codigo);
        if (disciplinaExistente) {

            return res.status(409).json({
                disciplinaExistente:true,
                sucesso: false,
                error: "Já existe uma disciplina cadastrada com este código."
            });
        }

        const codigoInserido = await addDisciplina(codigo, id_curso, nome, periodo, sigla);
        console.log("✅ Disciplina registrada com sucesso!")
        res.status(201).json({
            message: "Disciplina registrada com sucesso",
            codigo: codigoInserido
        });
    } catch (error) {
        console.error("❌ Erro ao registrar a disciplina:", error);
        res.status(500).json({
            error: "Erro ao registrar a disciplina."
        });
    }
});

// Atualizar disciplina
app.post('/disciplina/atualizar', async (req: Request, res: Response) => {
    try {
        const { codigo, id_curso, nome, periodo, sigla } = req.body;

        if (!codigo || !id_curso || !nome) {
            console.log("❌ Campos obrigatórios faltando!");
            return res.status(400).json({
                error: "Campos codigo, id_curso e nome são obrigatórios!"
            });
        }

        // Verificar se a disciplina existe
        const disciplinaExistente = await getDisciplinaByCodigo(codigo);
        if (!disciplinaExistente) {
            console.log("❌ Disciplina não encontrada para o código:", codigo);
            return res.status(404).json({
                error: "Disciplina não encontrada com o código fornecido"
            });
        }

        await updateDisciplina(codigo, id_curso, nome, periodo, sigla);
        console.log("✅ Disciplina atualizada com sucesso!");
        res.status(200).json({
            message: "Disciplina atualizada com sucesso",
            codigo: codigo
        });
    } catch (error) {
        console.error("❌ Erro ao atualizar a disciplina:", error);
        res.status(500).json({
            error: "Erro ao atualizar a disciplina."
        });
    }
});


// Deletar disciplina
app.post('/disciplina/deletar', async (req: Request, res: Response) => {
    try {
        const { codigo } = req.body;

        if (!codigo) {
            console.log("❌ O campo código é obrigatório!");
            return res.status(400).json({
                sucesso: false,
                error: "O campo código é obrigatório!"
            });
        }

        // Verificar se a disciplina existe
        const disciplinaExistente = await getDisciplinaByCodigo(codigo);
        if (!disciplinaExistente) {
            return res.status(404).json({
                error: "Disciplina não encontrada"
            });
        }

        await deleteDisciplina(codigo);
        console.log("✅ Disciplina deletada com sucesso!")
        res.json({
            sucesso: true,
            message: "Disciplina deletada com sucesso"
        });
    } catch (error) {
        console.error("❌ Erro ao deletar a disciplina:", error);
        res.status(500).json({
            sucesso: false,
            error: "Erro ao deletar a disciplina."
        });
    }
});

// Obter disciplina por código
app.get('/disciplina/codigo/:codigo', async (req: Request, res: Response) => {
    try {
        const codigo = Number(req.params.codigo);
        const disciplina = await getDisciplinaByCodigo(codigo);

        if (disciplina) {
            res.json(disciplina);
        } else {
            res.status(404).json({
                message: "Disciplina não encontrada com o código fornecido"
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar disciplina:", error);
        res.status(500).json({
            error: "Erro ao buscar a disciplina pelo código fornecido."
        });
    }
});

// Obter todas as disciplinas
app.get('/disciplina/all', async (req: Request, res: Response) => {
    try {
        const disciplinas = await getAllDisciplina();

        if (disciplinas && disciplinas.length > 0) {
            res.json(disciplinas);
        } else {
            res.status(404).json({
                message: "Não há disciplinas cadastradas."
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar disciplinas:", error);
        res.status(500).json({
            error: "Erro ao buscar as disciplinas."
        });
    }
});

/*=======*/
/* TURMA */
/*=======*/
// Verificar se turma já existe
app.post('/turma/verificar', async (req: Request, res: Response) => {
    try {
        const { fk_disciplina_codigo, nome } = req.body;
        console.log("🔍 Verificando turma:", { fk_disciplina_codigo, nome });

        const turma = await verificarTurmaExistente(fk_disciplina_codigo, nome);
        if (turma) {
            console.log("❌ Turma já cadastrada:", turma.nome);
            res.json({
                sucesso: false,
                message: "A Turma já está cadastrada.",
                turma: turma
            });
        } else {
            console.log("✅ Turma ainda não cadastrada!")
            res.status(200).json({
                sucesso: true,
                message: "Turma disponível para cadastro!"
            });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar a turma:", error);
        res.status(500).json({
            sucesso: false,
            message: "Erro no servidor ao verificar turma"
        });
    }
});

// Cadastrar nova turma
app.post('/turma/cadastro', async (req: Request, res: Response) => {
    try {
        const { fk_disciplina_codigo, nome, local_aula, dia_semana, hora } = req.body;

        if (!fk_disciplina_codigo || !nome) {
            console.log("❌ Campos obrigatórios faltando:", { fk_disciplina_codigo, nome });
            return res.status(400).json({
                error: "Os campos disciplina e nome são obrigatórios!"
            });
        }

        const id = await addTurma(fk_disciplina_codigo, nome, local_aula, dia_semana, hora);
        console.log("✅ Turma registrada com sucesso! ID:", id);
        res.status(201).json({
            message: "Turma registrada com sucesso",
            id: id
        });
    } catch (error) {
        console.error("❌ Erro ao registrar a turma:", error);
        res.status(500).json({
            error: "Erro ao registrar a turma."
        });
    }
});

// Atualizar turma existente
app.post('/turma/atualizar', async (req: Request, res: Response) => {
    try {
        const { id, fk_disciplina_codigo, nome, local_aula, dia_semana, hora } = req.body;

        if (!id || !fk_disciplina_codigo || !nome) {
            console.log("❌ Campos obrigatórios faltando:", { id, fk_disciplina_codigo, nome });
            return res.status(400).json({
                error: "Os campos id, disciplina e nome são obrigatórios!"
            });
        }

        await updateTurma(id, fk_disciplina_codigo, nome, local_aula, dia_semana, hora);
        console.log("✅ Turma atualizada com sucesso! ID:", id);
        res.status(200).json({
            message: "Turma atualizada com sucesso"
        });
    } catch (error) {
        console.error("❌ Erro ao atualizar a turma:", error);
        res.status(500).json({
            error: "Erro ao atualizar a turma."
        });
    }
});

// Deletar turma
app.post('/turma/deletar', async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        if (!id) {
            console.log("❌ O campo ID é obrigatório!");
            return res.status(400).json({
                error: "O campo ID é obrigatório!"
            });
        }

        await deleteTurma(id);
        console.log("✅ Turma deletada com sucesso! ID:", id);
        res.status(200).json({
            message: "Turma deletada com sucesso"
        });
    } catch (error) {
        console.error("❌ Erro ao deletar a turma:", error);
        res.status(500).json({
            error: "Erro ao deletar a turma."
        });
    }
});

// Obter turma por ID
app.get('/turma/id/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const turma = await getTurmaById(id);
        if (turma) {
            res.json(turma);
        } else {
            res.status(404).json({
                message: "Turma não encontrada com o ID fornecido"
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar turma por ID:", error);
        res.status(500).json({
            error: "Erro ao buscar a turma pelo ID fornecido."
        });
    }
});

// Obter todas as turmas
app.get('/turma/all', async (req: Request, res: Response) => {
    try {
        const turmas = await getAllTurmas();
        if (turmas && turmas.length > 0) {
            res.json(turmas);
        } else {
            res.status(404).json({
                message: "Não há turmas cadastradas."
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar todas as turmas:", error);
        res.status(500).json({
            error: "Erro ao buscar as turmas."
        });
    }
});

/*==========*/
/* ESTUDANTE */
/*==========*/
// Verificar se estudante já existe
app.post('/estudante/verificar', async (req: Request, res: Response) => {
    try {
        const { ra } = req.body;
        console.log("🔍 Verificando estudante:", { ra });

        const estudante = await verificarEstudanteExistente(ra);
        if (estudante) {
            console.log("❌ Estudante já cadastrado:", estudante.nome);
            res.json({
                sucesso: false,
                message: "O Estudante já está cadastrado.",
                estudante: estudante
            });
        } else {
            console.log("✅ Estudante ainda não cadastrado!")
            res.status(200).json({
                sucesso: true,
                message: "Estudante disponível para cadastro!"
            });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar o estudante:", error);
        res.status(500).json({
            sucesso: false,
            message: "Erro no servidor ao verificar estudante"
        });
    }
});

// Cadastrar novo estudante
app.post('/estudante/cadastro', async (req: Request, res: Response) => {
    try {
        const { ra, nome } = req.body;

        if (!ra || !nome) {
            console.log("❌ Campos obrigatórios faltando:", { ra, nome });
            return res.status(400).json({
                error: "Os campos RA e nome são obrigatórios!"
            });
        }

        const id = await addEstudante(ra, nome);
        console.log("✅ Estudante registrado com sucesso! RA:", id);
        res.status(201).json({
            message: "Estudante registrado com sucesso",
            ra: id
        });
    } catch (error) {
        console.error("❌ Erro ao registrar o estudante:", error);
        res.status(500).json({
            error: "Erro ao registrar o estudante."
        });
    }
});

// Atualizar estudante existente
app.post('/estudante/atualizar', async (req: Request, res: Response) => {
    try {
        const { ra, nome } = req.body;

        if (!ra || !nome) {
            console.log("❌ Campos obrigatórios faltando:", { ra, nome });
            return res.status(400).json({
                error: "Os campos RA e nome são obrigatórios!"
            });
        }

        await updateEstudante(ra, nome);
        console.log("✅ Estudante atualizado com sucesso! RA:", ra);
        res.status(200).json({
            message: "Estudante atualizado com sucesso"
        });
    } catch (error) {
        console.error("❌ Erro ao atualizar o estudante:", error);
        res.status(500).json({
            error: "Erro ao atualizar o estudante."
        });
    }
});

// Deletar estudante
app.post('/estudante/deletar', async (req: Request, res: Response) => {
    try {
        const { ra } = req.body;
        if (!ra) {
            console.log("❌ O campo RA é obrigatório!");
            return res.status(400).json({
                error: "O campo RA é obrigatório!"
            });
        }

        await deleteEstudante(ra);
        console.log("✅ Estudante deletado com sucesso! RA:", ra);
        res.status(200).json({
            message: "Estudante deletado com sucesso"
        });
    } catch (error) {
        console.error("❌ Erro ao deletar o estudante:", error);
        res.status(500).json({
            error: "Erro ao deletar o estudante."
        });
    }
});

// Obter estudante por RA
app.get('/estudante/ra/:ra', async (req: Request, res: Response) => {
    try {
        const ra = Number(req.params.ra);
        const estudante = await getEstudanteByRA(ra);
        if (estudante) {
            res.json(estudante);
        } else {
            res.status(404).json({
                message: "Estudante não encontrado com o RA fornecido"
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar estudante por RA:", error);
        res.status(500).json({
            error: "Erro ao buscar o estudante pelo RA fornecido."
        });
    }
});

// Obter todos os estudantes
app.get('/estudante/all', async (req: Request, res: Response) => {
    try {
        const estudantes = await getAllEstudantes();
        if (estudantes && estudantes.length > 0) {
            res.json(estudantes);
        } else {
            res.status(404).json({
                message: "Não há estudantes cadastrados."
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar todos os estudantes:", error);
        res.status(500).json({
            error: "Erro ao buscar os estudantes."
        });
    }
});

/*==================*/
/* COMPONENTE_NOTA */
/*==================*/
// Verificar se componente de nota já existe
app.post('/componente-nota/verificar', async (req: Request, res: Response) => {
    try {
        const { fk_disciplina_codigo, nome } = req.body;
        console.log("🔍 Verificando componente de nota:", { fk_disciplina_codigo, nome });

        const componente = await verificarComponenteNotaExistente(fk_disciplina_codigo, nome);
        if (componente) {
            console.log("❌ Componente de nota já cadastrado:", componente.nome);
            res.json({
                sucesso: false,
                message: "O Componente de nota já está cadastrado.",
                componente: componente
            });
        } else {
            console.log("✅ Componente de nota ainda não cadastrado!")
            res.status(200).json({
                sucesso: true,
                message: "Componente de nota disponível para cadastro!"
            });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar o componente de nota:", error);
        res.status(500).json({
            sucesso: false,
            message: "Erro no servidor ao verificar componente de nota"
        });
    }
});

// Cadastrar novo componente de nota
app.post('/componente-nota/cadastro', async (req: Request, res: Response) => {
    try {
        const { fk_disciplina_codigo, nome } = req.body;

        if (!fk_disciplina_codigo || !nome) {
            console.log("❌ Campos obrigatórios faltando:", { fk_disciplina_codigo, nome });
            return res.status(400).json({
                error: "Os campos fk_disciplina_codigo e nome são obrigatórios!"
            });
        }

        const id = await addComponenteNota(fk_disciplina_codigo, nome);
        console.log("✅ Componente de nota registrado com sucesso! ID:", id);
        res.status(201).json({
            message: "Componente de nota registrado com sucesso",
            id_componente: id
        });
    } catch (error) {
        console.error("❌ Erro ao registrar o componente de nota:", error);
        res.status(500).json({
            error: "Erro ao registrar o componente de nota."
        });
    }
});

// Atualizar componente de nota existente
app.post('/componente-nota/atualizar', async (req: Request, res: Response) => {
    try {
        const { id_componente, fk_disciplina_codigo, nome } = req.body;

        if (!id_componente || !fk_disciplina_codigo || !nome) {
            console.log("❌ Campos obrigatórios faltando:", { id_componente, fk_disciplina_codigo, nome });
            return res.status(400).json({
                error: "Os campos id_componente, fk_disciplina_codigo e nome são obrigatórios!"
            });
        }

        await updateComponenteNota(id_componente, fk_disciplina_codigo, nome);
        console.log("✅ Componente de nota atualizado com sucesso! ID:", id_componente);
        res.status(200).json({
            message: "Componente de nota atualizado com sucesso"
        });
    } catch (error) {
        console.error("❌ Erro ao atualizar o componente de nota:", error);
        res.status(500).json({
            error: "Erro ao atualizar o componente de nota."
        });
    }
});

// Deletar componente de nota
app.post('/componente-nota/deletar', async (req: Request, res: Response) => {
    try {
        const { id_componente } = req.body;
        if (!id_componente) {
            console.log("❌ O campo id_componente é obrigatório!");
            return res.status(400).json({
                error: "O campo id_componente é obrigatório!"
            });
        }

        await deleteComponenteNota(id_componente);
        console.log("✅ Componente de nota deletado com sucesso! ID:", id_componente);
        res.status(200).json({
            message: "Componente de nota deletado com sucesso"
        });
    } catch (error) {
        console.error("❌ Erro ao deletar o componente de nota:", error);
        res.status(500).json({
            error: "Erro ao deletar o componente de nota."
        });
    }
});

// Obter componente de nota por ID
app.get('/componente-nota/id/:id_componente', async (req: Request, res: Response) => {
    try {
        const id_componente = Number(req.params.id_componente);
        const componente = await getComponenteNotaById(id_componente);
        if (componente) {
            res.json(componente);
        } else {
            res.status(404).json({
                message: "Componente de nota não encontrado com o ID fornecido"
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar componente de nota por ID:", error);
        res.status(500).json({
            error: "Erro ao buscar o componente de nota pelo ID fornecido."
        });
    }
});

// Obter todos os componentes de nota
app.get('/componente-nota/all', async (req: Request, res: Response) => {
    try {
        const componentes = await getAllComponentesNota();
        if (componentes && componentes.length > 0) {
            res.json(componentes);
        } else {
            res.status(404).json({
                message: "Não há componentes de nota cadastrados."
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar todos os componentes de nota:", error);
        res.status(500).json({
            error: "Erro ao buscar os componentes de nota."
        });
    }
});

/*==================*/
/* NOTA */
/*==================*/

app.post('/nota/cadastro', async (req: Request, res: Response) => {
    try {
        const { id_nota, fk_id_componente, fk_id_estudante, fk_id_turma, valor_nota } = req.body;

        if (!fk_id_componente || !fk_id_estudante || !fk_id_turma || !valor_nota) {
            console.log("❌ Campos obrigatórios faltando:", { fk_id_componente, fk_id_estudante, fk_id_turma, valor_nota });
            return res.status(400).json({
                error: "Os campos fk_disciplina_codigo e nome são obrigatórios!"
            });
        }

        const id = await addNota(id_nota, fk_id_componente, fk_id_estudante, fk_id_turma, valor_nota);
        console.log("✅ Nota registrada com sucesso! ID:", id);
        res.status(201).json({
            message: "Nota registrada com sucesso",
            id_nota: id
        });
    } catch (error) {
        console.error("❌ Erro ao registrar nota:", error);
        res.status(500).json({
            error: "Erro ao registrar nota."
        });
    }
});

// Obter nota pelo ID
app.get('/nota/id/:id_nota', async (req: Request, res: Response) => {
    try {
        const id_nota = Number(req.params.id_nota);
        if (!id_nota /*|| isNaN(id_nota)*/) {
            console.log("❌ ID da nota inválido:", req.params.id_nota);
            return res.status(400).json({
                error: "O campo id_nota é obrigatório e deve ser um número válido"
            });
        }

        const nota = await getNotaById(id_nota);
        if (nota) {
            res.json(nota);
        } else {
            res.status(404).json({
                message: "Nota não encontrada com o ID fornecido"
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar nota por ID:", error);
        res.status(500).json({
            error: "Erro ao buscar a nota pelo ID fornecido."
        });
    }
});

// Obter todas as notas
app.get('/nota/all', async (req: Request, res: Response) => {
    try {
        const notas = await getAllNotas();
        if (notas && notas.length > 0) {
            res.json(notas);
        } else {
            res.status(404).json({
                message: "Não há notas cadastradas."
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar todas as notas:", error);
        res.status(500).json({
            error: "Erro ao buscar as notas."
        });
    }
});

/*===========*/
/* MATRICULA */
/*===========*/


// Verificar se matrícula já existe (turma + estudante)
app.post('/matricula/verificar', async (req: Request, res: Response) => {
    try {
        const { fk_id_turma, fk_id_estudante } = req.body;

        if (!fk_id_turma || !fk_id_estudante) {
            return res.status(400).json({
                sucesso: false,
                message: "Os campos fk_id_turma e fk_id_estudante são obrigatórios"
            });
        }

        const matricula = await verificarMatriculaExistente(fk_id_turma, fk_id_estudante);
        if (matricula) {
            res.json({
                sucesso: false,
                message: "A Matrícula já está cadastrada",
                matricula
            });
        } else {
            res.json({
                sucesso: true,
                message: "Matrícula disponível para cadastro"
            });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar matrícula:", error);
        res.status(500).json({ sucesso: false, message: "Erro no servidor" });
    }
});


// Cadastrar nova matrícula
app.post('/matricula/cadastro', async (req: Request, res: Response) => {
    try {
        const { fk_id_turma, fk_id_estudante } = req.body;

        if (!fk_id_turma || !fk_id_estudante) {
            console.log("❌ Campos obrigatórios faltando:", { fk_id_turma, fk_id_estudante });
            return res.status(400).json({
                error: "Os campos fk_id_turma e fk_id_estudante são obrigatórios"
            });
        }
        
        
        const existente = await verificarMatriculaExistente(fk_id_turma, fk_id_estudante);
        if (existente) {
            console.log("❌ Matrícula já existente para estudante na turma", existente.id_matricula);
            return res.status(409).json({ sucesso: false, message: "Matrícula já existe", id: existente.id_matricula });
        }
        

        const id = await addMatricula(fk_id_turma, fk_id_estudante);
        console.log("✅ Matrícula registrada com sucesso! ID:", id);
        res.status(201).json({
            message: "Matrícula registrada com sucesso",
            id_matricula: id
        });
    } catch (error) {
        console.error("❌ Erro ao registrar matrícula:", error);
        res.status(500).json({ error: "Erro ao registrar matrícula." });
    }
});

// Obter matrícula pelo ID
app.get('/matricula/id/:id_matricula', async (req: Request, res: Response) => {
    try {
        const id_matricula = Number(req.params.id_matricula);
        if (!id_matricula) {
            return res.status(400).json({ error: "O campo id_matricula é obrigatório e deve ser um número válido" });
        }

        const matricula = await getMatriculaById(id_matricula);
        if (matricula) {
            res.json(matricula);
        } else {
            res.status(404).json({ message: "Matrícula não encontrada com o ID fornecido" });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar matrícula por ID:", error);
        res.status(500).json({ error: "Erro ao buscar a matrícula pelo ID fornecido." });
    }
});

// Obter todas as matrículas
app.get('/matricula/all', async (req: Request, res: Response) => {
    try {
        const matriculas = await getAllMatriculas();
        if (matriculas && matriculas.length > 0) {
            res.json(matriculas);
        } else {
            res.status(404).json({ message: "Não há matrículas cadastradas." });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar todas as matrículas:", error);
        res.status(500).json({ error: "Erro ao buscar as matrículas." });
    }
});

/*=========*/
/* DOCENTE */
/*=========*/
app.post('/docente', async (req: Request, res: Response) => {
    try {
        const { nome, email, telefone, senha } = req.body;
        const id = await addDocente(nome, email, telefone, senha);
        res.status(201).json({ sucesso: true, message: "docente adicionado com sucesso", id: id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ sucesso: false, error: "Erro ao inserir docente." })
    }
});

// SUBSTITUA A ROTA /atualizar/docente EXISTENTE POR ESTA:

app.post('/atualizar/docente', async (req: Request, res: Response) => {
    try {
        const { id, nome, telefone } = req.body;

        if (!id) {
            console.log("❌ ID do docente é obrigatório");
            return res.status(400).json({
                sucesso: false,
                error: "O campo ID é obrigatório!"
            });
        }

        if (!nome && !telefone) {
            console.log("❌ Nenhum campo para atualizar");
            return res.status(400).json({
                sucesso: false,
                error: "Forneça pelo menos um campo para atualizar (nome ou telefone)!"
            });
        }

        console.log("📤 Recebido para atualização:", { id, nome, telefone });

        const resultado = await modifyDocente(id, nome, telefone);

        if (!resultado) {
            console.log("⚠️ Nenhuma linha foi atualizada");
            return res.status(404).json({
                sucesso: false,
                error: "Docente não encontrado ou nenhuma alteração realizada"
            });
        }

        console.log(`✅ Informações do docente ${id} atualizadas com sucesso!`);
        res.status(200).json({
            sucesso: true,
            message: "Informações atualizadas com sucesso!"
        });

    } catch (error) {
        console.error("❌ Erro ao atualizar docente:", error);
        res.status(500).json({
            sucesso: false,
            error: "Erro ao atualizar informações do docente"
        });
    }
});

app.post('/verificar-docente/cadastro', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        console.log("🔍 Verificando docente:", email);

        const docente = await verificarCadastroDocente(email);

        if (docente) {
            console.log("❌ Docente já cadastrado:", docente.nome);

            // 🟢 RETORNA OS DADOS
            res.json({
                sucesso: false,
                nome: docente.nome,
                email: docente.email
            });
        } else {
            console.log("✅ Docente ainda não cadastrado!")
            res.status(401).json({ sucesso: true, mensagem: "Credenciais inválidas" });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar docente:", error);
        res.status(500).json({ sucesso: false, mensagem: "Erro no servidor" });
    }
});

app.post('/verificar-docente', async (req: Request, res: Response) => {
    try {
        const { email, senha } = req.body;

        console.log("🔍 Verificando docente:", email);

        const docente = await verificarLoginDocente(email, senha);

        if (docente) {
            res.json({
                sucesso: true,
                id: docente.id,
                nome: docente.nome,
                email: docente.email,
                telefone: docente.telefone
            });
        } else {
            res.status(401).json({ sucesso: false, mensagem: "Credenciais inválidas" });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar docente:", error);
        res.status(500).json({ sucesso: false, mensagem: "Erro no servidor" });
    }
});

app.post('/verificar-codigo', async (req: Request, res: Response) => {
    try {

        const { codigo } = req.body;
        const codigoCerto: string = codigoAtivo;

        console.log(`Verificando o código. Código esperado: ${codigoCerto}, Código recebido: ${codigo}`);

        if (!codigoCerto) {
            return res.status(400).json({ sucesso: false, mensagem: "Código não encontrado ou expirado!" });
        }

        if (codigoCerto === codigo) {
            codigoAtivo = '';
            console.log("Código verificado com sucesso!");
            return res.json({ sucesso: true, mensagem: "Código verificado com sucesso!" });
        } else {
            console.log("Código incorreto.");
            return res.status(400).json({ sucesso: false, mensagem: "Código incorreto." });
        }
    } catch (error) {
        console.error("Erro ao verificar código:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor." });
    }
});

app.post('/enviar-codigo', async (req: Request, res: Response) => {

    console.log("📩 Dados recebidos:", req.body);
    try {
        const { nome, email } = req.body;

        const codigo = gerarCodigoVericacao();

        await enviarCodigoVerificacao(email, nome, codigo);

        codigoAtivo = codigo;

        res.json({
            sucesso: true,
            mensagem: 'Código enviado',
            codigo
        });
    } catch (error) {
        res.status(500).json({ sucesso: false, erro: 'Erro ao enviar o código' });
    }
});

app.post('/reenviar-codigo', async (req: Request, res: Response) => {

    console.log("📩 Solicitação para reenviar código recebida:", req.body)
    try {
        const { nome, email } = req.body
        const codigo = gerarCodigoVericacao();

        await enviarCodigoVerificacao(email, nome, codigo);

        codigoAtivo = codigo;
        console.log("Código reenviado para:", email);
        res.json({
            sucesso: true,
            mensagem: 'Código enviado',
            codigo
        });
    } catch (error) {
        console.log("Erro ao reenviar o código:", error);
        res.status(500).json({ sucesso: false, erro: 'Erro ao enviar o código' });
    }
});

app.post('/link-alterar-senha', async (req: Request, res: Response) => {
    console.log("📩 Solicitação de link para alterar senha recebida.");
    try {
        const { email } = req.body;
        console.log("Verificando email:", email);
        const encontrado = await verificarCadastroDocente(email);
        if (encontrado === null) {
            console.log("Docente não encontrado para o email:", email);
            res.status(404).json({
                sucesso: false,
                mensagem: 'Docente não encontrado.'
            });
        } else {
            await enviarLinkAlterarSenha(email);
            console.log("Link para alterar senha enviado para:", email);
            res.status(200).json({
                sucesso: true,
                mensagem: "Link enviado!"
            });
        }
    } catch (error) {
        console.error("Erro ao enviar link para alterar senha:", error);
        res.status(500).json({ sucesso: false, error: 'Erro ao enviar o link.' })
    }
});

app.post('/modificar-senha', async (req: Request, res: Response) => {
    console.log("📩 Solicitação para modificar a senha recebida.");
    try {
        const { email, novaSenha } = req.body;
        await modificarSenhaDocente(email, novaSenha);
        console.log("Senha modificada para o email:", email);
        res.status(200).json({
            sucesso: true,
            mensagem: "Senha modificada com sucesso!"
        });
    } catch (error) {
        console.error("Erro ao modificar a senha:", error);
        res.status(500).json({ sucesso: false, error: "Erro ao modificar a senha." })
    }

});

app.listen(port, '0.0.0.0', () => console.log("🚀 Servidor rodando em https://notadez.cfd e http://localhost:3000"));

// rota de ping/pong (teste de requisicao)
app.post("/printRequest", (req: Request, res: Response) => {
    const dadosRecebidos = req.body;
    res.json({
        mensagem: "Dados recebidos com sucesso!",
        dadosRecebidos
    });
});

