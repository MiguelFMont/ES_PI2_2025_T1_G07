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
async function verificarDocente(email) {
    const conn = await (0, db_1.open)();
    try {
        const result = await conn.execute(`SELECT NOME, EMAIL FROM DOCENTE  
            WHERE EMAIL = :email
            FETCH FIRST 1 ROWS ONLY`, 
        //     ^^^^  ^^^^^ BUSCA ESSES DADOS NO BANCO
        { email }, { outFormat: oracledb_1.default.OUT_FORMAT_OBJECT });
        if (result.rows && result.rows.length > 0) {
            const docente = result.rows[0];
            return {
                nome: docente.NOME,
                email: docente.EMAIL
            };
        }
        return null;
    }
    finally {
        if (conn) {
            await (0, db_1.close)(conn);
        }
    }
}
