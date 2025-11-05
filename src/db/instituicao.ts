import {open, close} from "../config/db";
import OracleDB from "oracledb";

export interface Instituicao {
    id: number,
    nome: string
};

// Obter todas as instituições da tabela INSTITUICAO do Oracle
export async function getAllInstituicao(): Promise<Instituicao[]> {
    const conn = await open();
    try {
        const result = await conn.execute (
            `SELECT ID as "id", NOME as "nome" FROM INSTITUICAO`
        );
        return result.rows as Instituicao[];
    } finally {
        await close(conn);
    }
}

// Obter a instituição pelo ID.
export async function getInstituicaoById(id: number): Promise<Instituicao | null> {
    const conn = await open();
    try {
        const result = await conn.execute (
            `SELECT ID as "id", NOME as "nome" FROM INSTITUICAO
            WHERE ID = :id`,
            [id]
        );
        return (result.rows && result.rows[0]) as Instituicao | null;
    } finally {
        await close(conn);
    }
}

// Adicionar uma instituição
export async function addInstituicao(nome: string): Promise<number> {
    const conn = await open();
    try {
        const result = await conn.execute<{outBinds : {id: number}}>(
            `
            INSERT INTO INSTITUICAO (NOME)
            VALUES (:nome)
            RETURNING ID INTO :id
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