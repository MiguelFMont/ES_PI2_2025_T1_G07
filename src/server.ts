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
    addDocente,
    verificarDocente
} from "./db/docente";

import {
    gerarCodigoVericacao,
    enviarCodigoVerificacao
} from "./services/email";


const app = express();
const port: number = 3000;
let codigoAtivo: string;

app.use(bodyParser.json());
app.use(cors());

//definindo as rotas

// app.get("/estudantes", async (req: Request, res: Response) => {
//     try {
//         const estudantes = await getAllEstudantes();
//         res.json(estudantes);
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             "error": "Erro ao buscar estudantes"
//         });
//     }
// });

// //rota para obter um estudante pelo ID.

// app.get("/estudantes/:id", async (req: Request, res: Response) => {
//     try {
//         const id = Number(req.params.id);
//         const estudante = await getEstudanteById(id);
//         if (estudante) {
//             res.json(estudante);
//         } else {
//             res.status(404).json({ massage: "Estudante não encontrado com o ID fornecido" })
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Erro ao buscar estudante pelo ID fornecido." })
//     }
// });

// // Rota para inserir um estudante.
// app.post("/estudante", async (req: Request, res: Response) => {
//     try {
//         const { ra, nome, email } = req.body;
//         if (!ra || !nome || !email) {
//             return res.status(400).json({ error: "Campos RA, Nome e Email são obrigatórios" });
//         }
//         const id = await addEstudante(ra, nome, email);
//         res.status(201).json({ message: "Estudante adicionado com sucesso", id });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Erro ao inserir estudante." })
//     }
// })

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

app.post('/verificar-docente', async (req: Request, res: Response) => {
    try{
        const { email, senha } = req.body;
        const verificacao = await verificarDocente(email, senha);
        res.status(201).json({ sucesso: true, massage: "Verificação realizada com sucesso."});
    } catch(error){
        console.error(error);
        res.status(500).json({ sucesso: false, massage: "Falha ao verificar docente." })
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
            return res.json({ sucesso: true, mensagem: "Código verificado com sucesso!" });
        } else {
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
            mensagem: 'Código enviado',
            codigo
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao enviar o código' });
    }
});

app.listen(port, '0.0.0.0', () => console.log("🚀 Servidor rodando em http://localhost:3000"));

// definir a rota default;
app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname + '../index.html'));
});

// rota de ping/pong (teste de requisicao)
app.post("/printRequest", (req: Request, res: Response) => {
    const dadosRecebidos = req.body;
    res.json({
        mensagem: "Dados recebidos com sucesso!",
        dadosRecebidos
    });
});

