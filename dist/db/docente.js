"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDocente = addDocente;
exports.verificarDocente = verificarDocente;
const db_1 = require("../config/db");
const oracledb_1 = __importDefault(require("oracledb"));
async function addDocente(nome, email, telefone_celular, senha) {
    const conn = await (0, db_1.open)();
    try {
        const result = await conn.execute(`
            INSERT INTO DOCENTE (NOME, EMAIL, TELEFONE_CELULAR, SENHA)
            VALUES (:nome, :email, :telefone_celular, :senha)
            RETURNING ID_DOCENTE INTO :id
            `, { nome, email, telefone_celular, senha, id: { dir: oracledb_1.default.BIND_OUT, type: oracledb_1.default.NUMBER } }, { autoCommit: true });
        const outBinds = result.outBinds;
        if (!outBinds || !outBinds.id || outBinds.id.length === 0) {
            throw new Error("Erro ao obter um ID retornado na inserção de Docente.");
        }
        return outBinds.id[0];
    }
    finally {
        await (0, db_1.close)(conn);
    }
}
async function verificarDocente(email, senha) {
    const conn = await (0, db_1.open)();
    try {
        const result = await conn.execute(`SELECT 1 FROM DOCENTE
            WHERE email = :email AND senha = :senha
            FETCH FIRST 1 ROWS ONLY`, { email, senha }, { outFormat: oracledb_1.default.OUT_FORMAT_OBJECT });
        const existe = !!(result.rows && result.rows.length > 0);
        return existe;
    }
    catch (err) {
        console.error("Erro ao verificar login", err);
        throw err;
    }
    finally {
        if (conn) {
            await conn.close();
        }
    }
}
