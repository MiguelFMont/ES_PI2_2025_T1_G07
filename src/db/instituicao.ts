import {open, close} from "../config/db";
import OracleDB from "oracledb";

export interface Instituicao {
    id: number,
    nome: string
};

// Adicionar uma instituição
export async function addInstituicao(nome: string): Promise<number> {
    const conn = await open();
    try {
        const result = await conn.execute<{outBinds : {id: number}}>(
            `
            INSERT INTO INSTITUICAO (NOME)
            VALUES (:nome)
            RETURNING ID_INSTITUICAO INTO :id
            `,
            {nome, id: {dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER}},
            {autoCommit: true}
        );

        const outBinds = result.outBinds as {id?: number[]} | undefined;

        if (!outBinds || !outBinds.id || outBinds.id.length === 0) {
            throw new Error("Erro ao obter um ID retornado na inserção da Instituição.");
        }

        return outBinds.id[0];
        
    } finally {
        await close(conn);
    }
}

// Verifica se a instituição já não está cadastrada
export async function verificarCadastroInstituicao(nome: string): Promise<{ nome: string } | null>{
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT NOME FROM INSTITUICAO  
            WHERE NOME = :nome
            FETCH FIRST 1 ROWS ONLY`,
            { nome },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows && result.rows.length > 0) {
            const docente = result.rows[0] as { NOME: string };
            return { nome: docente.NOME };
        }
        
        return null;
    } finally {
        if (conn) {
            await close(conn);
        }
    }
}

// Obter a instituição pelo ID.
export async function getInstituicaoById(id: number): Promise<Instituicao | null> {
    const conn = await open();
    try {
        const result = await conn.execute (
            `SELECT ID_INSTITUICAO as "id", NOME as "nome" FROM INSTITUICAO
            WHERE ID_INSTITUICAO = :id`,
            [id]
        );
        return (result.rows && result.rows[0]) as Instituicao | null;
    } finally {
        await close(conn);
    }
}

// Obter todas as instituições da tabela INSTITUICAO do Oracle
export async function getAllInstituicao(): Promise<Instituicao[]> {
    const conn = await open();
    try {
        const result = await conn.execute (
            `SELECT ID_INSTITUICAO as "id", NOME as "nome" FROM INSTITUICAO`
        );
        return result.rows as Instituicao[];
    } finally {
        await close(conn);
    }
}