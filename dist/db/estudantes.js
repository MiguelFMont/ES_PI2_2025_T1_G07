"use strict";
//Apenas testando, a estrutura das tabelas de alunos é diferente.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEstudantes = getAllEstudantes;
exports.getEstudanteById = getEstudanteById;
exports.addEstudante = addEstudante;
const db_1 = require("../config/db");
const oracledb_1 = __importDefault(require("oracledb"));
;
//definindo as rotas| exemplo
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
// Obter todos os estudantes da tabela Estudantes do Oracle
async function getAllEstudantes() {
    const conn = await (0, db_1.open)();
    try {
        const result = await conn.execute(`SELECT ID as "id", RA as "ra", NOME as "nome", EMAIL as "email" FROM ESTUDANTES`);
        return result.rows;
    }
    finally {
        await (0, db_1.close)(conn);
    }
}
// Obter o estudante pelo ID.
async function getEstudanteById(id) {
    const conn = await (0, db_1.open)();
    try {
        const result = await conn.execute(`SELECT ID as "id", RA as "ra", NOME as "nome", EMAIL as "email" FROM ESTUDANTES
            WHERE ID = :id`, [id]);
        return (result.rows && result.rows[0]);
    }
    finally {
        await (0, db_1.close)(conn);
    }
}
async function addEstudante(ra, nome, email) {
    const conn = await (0, db_1.open)();
    try {
        const result = await conn.execute(`
            INSERT INTO ESTUDANTES (RA, NOME, EMAIL)
            VALUES (:ra, :nome, :email)
            RETURNING ID INTO :id
            `, { ra, nome, email, id: { dir: oracledb_1.default.BIND_OUT, type: oracledb_1.default.NUMBER } }, { autoCommit: true });
        const outBinds = result.outBinds;
        if (!outBinds || !outBinds.id || outBinds.id.length === 0) {
            throw new Error("Erro ao obter um ID retornado na inserção de Estudante.");
        }
        return outBinds.id[0];
    }
    finally {
        await (0, db_1.close)(conn);
    }
}
