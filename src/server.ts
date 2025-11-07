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
    modificarSenhaDocente
} from "./db/docente";

import {
    addCurso,
    deleteCurso,
    updateCurso,
    verificarCursoExistente,
    getCursoById,
    getAllCursos
} from "./db/curso"

import {
    gerarCodigoVericacao,
    enviarCodigoVerificacao,
    enviarLinkAlterarSenha
} from "./services/email";


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

/*=============*/
/* INSTITUIÇÃO */
/*=============*/
app.post('/instituicao/verificar', async (req: Request, res: Response) => {
    try {
        const { nome } = req.body;
        console.log("🔍 Verificando instituição:", nome);

        if (!nome) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: "O campo nome é obrigatório" 
            });
        }

        const instituicao = await verificarCadastroInstituicao(nome);
        if (instituicao) {
            console.log("❌ Instituição já cadastrada:", instituicao.nome);
            res.json({
                sucesso: false,
                mensagem: "A Instituição já está cadastrada",
                instituicao: instituicao
            });
        } else {
            console.log("✅ Instituição ainda não cadastrada!")
            res.json({ 
                sucesso: true, 
                mensagem: "Instituição disponível para cadastro" 
            });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar a instituição:", error);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: "Erro no servidor" 
        });
    }
});

app.post('/instituicao/cadastro', async (req: Request, res: Response) => {
    try {
        const { nome } = req.body;
        if (!nome) {
            console.log("❌ Um ou mais campos estão faltando!:");
            return res.status(400).json({error: "Campo Nome é obrigatório!"});
        }

        const id = await addInstituicao(nome);
        console.log("✅ Instituição registrada com sucesso!")
        res.status(201).json({ message: "Instituição registrada com sucesso", id});
    } catch (error) {
        console.error(error);
        console.log("❌ Erro ao registrar a instituição.");
        res.status(500).json({ error: "Erro ao registrar a instituição." })
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

        // Verificar se o novo nome já existe em outra instituição
        const instituicaoComMesmoNome = await verificarCadastroInstituicao(novo_nome);
        if (instituicaoComMesmoNome && instituicaoComMesmoNome.id !== id) {
            console.log("❌ Já existe uma instituição com este nome:", novo_nome);
            return res.status(409).json({ 
                error: "Já existe uma instituição cadastrada com este nome" 
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
                error: "Instituição não encontrada" 
            });
        }

        console.log("✅ Instituição deletada com sucesso!")
        res.json({ 
            message: "Instituição deletada com sucesso" 
        });
    } catch (error) {
        console.error(error);
        console.log("❌ Erro ao deletar a instituição.");
        res.status(500).json({ 
            error: "Erro ao deletar a instituição." 
        });
    }
});

app.post('/instituicao/:id', async (req: Request, res: Response) => {
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

app.post('/instituicao/all', async (req: Request, res: Response) => {
    try {
        const instituicao = await getAllInstituicao();
        if (instituicao) {
            res.json(instituicao);
        } else {
            res.status(404).json({ message: "Não há instituições cadastradas." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error ao buscar as instituições. "});
    }
})

/*=======*/
/* CURSO */
/*=======*/
// Verificar se curso já existe
app.post('/curso/verificar', async (req: Request, res: Response) => {
    try {
        const { fk_id_docente, fk_id_instituicao, nome } = req.body;
        console.log("🔍 Verificando curso:", { fk_id_docente, fk_id_instituicao, nome });

        const curso = await verificarCursoExistente(fk_id_docente, fk_id_instituicao, nome);
        if (curso) {
            console.log("❌ Curso já cadastrado:", curso.nome);
            res.json({
                sucesso: false,
                mensagem: "O Curso já está cadastrado.",
                curso: curso
            });
        } else {
            console.log("✅ Curso ainda não cadastrado!")
            res.status(200).json({ 
                sucesso: true, 
                mensagem: "Curso disponível para cadastro!" 
            });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar o curso:", error);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: "Erro no servidor ao verificar curso" 
        });
    }
});

// Cadastrar novo curso
app.post('/curso/cadastro', async (req: Request, res: Response) => {
    try {
        const { fk_id_docente, fk_id_instituicao, nome } = req.body;
        
        if (!fk_id_docente || !fk_id_instituicao || !nome) {
            console.log("❌ Campos obrigatórios faltando:", { fk_id_docente, fk_id_instituicao, nome });
            return res.status(400).json({ 
                error: "Todos os campos são obrigatórios: docente, instituição e nome!" 
            });
        }

        const id = await addCurso(fk_id_docente, fk_id_instituicao, nome);
        console.log("✅ Curso registrado com sucesso! ID:", id);
        res.status(201).json({ 
            message: "Curso registrado com sucesso", 
            id: id 
        });
    } catch (error) {
        console.error("❌ Erro ao registrar o curso:", error);
        res.status(500).json({ 
            error: "Erro ao registrar o curso." 
        });
    }
});

// Atualizar curso existente
app.post('/curso/atualizar', async (req: Request, res: Response) => {
    try {
        const { id, fk_id_docente, fk_id_instituicao, nome } = req.body;
        
        if (!id || !fk_id_docente || !fk_id_instituicao || !nome) {
            console.log("❌ Campos obrigatórios faltando:", { id, fk_id_docente, fk_id_instituicao, nome });
            return res.status(400).json({ 
                error: "Todos os campos são obrigatórios: id, docente, instituição e nome!" 
            });
        }

        await updateCurso(id, fk_id_docente, fk_id_instituicao, nome);
        console.log("✅ Curso atualizado com sucesso! ID:", id);
        res.status(200).json({ 
            message: "Curso atualizado com sucesso" 
        });
    } catch (error) {
        console.error("❌ Erro ao atualizar o curso:", error);
        res.status(500).json({ 
            error: "Erro ao atualizar o curso." 
        });
    }
});

// Deletar curso
app.post('/curso/deletar', async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        if (!id) {
            console.log("❌ O campo ID é obrigatório!");
            return res.status(400).json({ 
                error: "O campo ID é obrigatório!" 
            });   
        }

        await deleteCurso(id);
        console.log("✅ Curso deletado com sucesso! ID:", id);
        res.status(200).json({ 
            message: "Curso deletado com sucesso" 
        });
    } catch (error) {
        console.error("❌ Erro ao deletar o curso:", error);
        res.status(500).json({ 
            error: "Erro ao deletar o curso." 
        });
    }
});

// Obter curso por ID
app.post('/curso/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const curso = await getCursoById(id);
        if (curso) {
            res.json(curso);
        } else {
            res.status(404).json({ 
                message: "Curso não encontrado com o ID fornecido" 
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar curso por ID:", error);
        res.status(500).json({ 
            error: "Erro ao buscar o curso pelo ID fornecido." 
        });
    }
});

// Obter todos os cursos
app.post('/curso/all', async (req: Request, res: Response) => {
    try {
        const cursos = await getAllCursos();
        if (cursos && cursos.length > 0) {
            res.json(cursos);
        } else {
            res.status(404).json({ 
                message: "Não há cursos cadastrados." 
            });
        }
    } catch (error) {
        console.error("❌ Erro ao buscar todos os cursos:", error);
        res.status(500).json({ 
            error: "Erro ao buscar os cursos." 
        });
    }
});

/*=========*/
/* DOCENTE */
/*=========*/
app.post('/docente', async (req: Request, res: Response) => {
    try {
        const { nome, email, telefone, senha } = req.body;
        const id = await addDocente(nome, email, telefone, senha);
        res.status(201).json({ sucesso: true, message: "docente adicionado com sucesso", id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ sucesso: false, error: "Erro ao inserir docente." })
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
            console.log("✅ Docente encontrado:", docente.nome);
            // 🟢 RETORNA OS DADOS
            res.json({
                sucesso: true,
                nome: docente.nome,
                email: docente.email
            });
        } else {
            console.log("❌ Credenciais inválidas");
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
    try{
        const { email  } = req.body;
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
        res.status(500).json({ sucesso: false, error: 'Erro ao enviar o link.'})
    }
});

app.post('/modificar-senha', async (req: Request, res: Response) => {
    console.log("📩 Solicitação para modificar a senha recebida.");
    try{
        const { email ,novaSenha } = req.body;
        await modificarSenhaDocente(email, novaSenha);
        console.log("Senha modificada para o email:", email);
        res.status(200).json({
            sucesso: true,
            mensagem: "Senha modificada com sucesso!"
        });
    } catch (error) {
        console.error("Erro ao modificar a senha:", error);
        res.status(500).json({ sucesso: false, error: "Erro ao modificar a senha."})
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

