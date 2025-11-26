// AUTOR: Davi José Bertuolo Vitoreti - RA: 25004168

import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface ComponenteNota {
    id_componente: number;
    fk_disciplina_codigo: number;
    nome: string;
    sigla?: string;
    descricao?: string;
}

// Adicionar um componente de nota
export async function addComponenteNota(
    fk_disciplina_codigo: number,
    nome: string
    , sigla: string, descricao?: string
): Promise<number> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `INSERT INTO webapp.COMPONENTE_NOTA (FK_DISCIPLINA_CODIGO, NOME, SIGLA, DESCRICAO)
             VALUES (:fk_disciplina_codigo, :nome, :sigla, :descricao)
             RETURNING ID_COMPONENTE INTO :id`,
            {
                fk_disciplina_codigo,
                nome,
                sigla,
                descricao,
                id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }
            },
            { autoCommit: true }
        );
        const outBinds = result.outBinds as { id: number[] };
        return outBinds.id[0];
    } finally {
        await close(conn);
    }
}

// Deletar um componente de nota
export async function deleteComponenteNota(id_componente: number) {
    const conn = await open();
    try {
        await conn.execute(
            `DELETE FROM webapp.COMPONENTE_NOTA WHERE ID_COMPONENTE = :id_componente`,
            { id_componente },
            { autoCommit: true }
        );
    } finally {
        await close(conn);
    }
}

// Atualizar um componente de nota
export async function updateComponenteNota(
    id_componente: number,
    fk_disciplina_codigo: number,
    nome: string
    , sigla: string, descricao?: string
) {
    const conn = await open();
    try {
        await conn.execute(
            `UPDATE webapp.COMPONENTE_NOTA 
             SET FK_DISCIPLINA_CODIGO = :fk_disciplina_codigo,
                 NOME = :nome,
                 SIGLA = :sigla,
                 DESCRICAO = :descricao
             WHERE ID_COMPONENTE = :id_componente`,
            { fk_disciplina_codigo, nome, sigla, descricao, id_componente },
            { autoCommit: true }
        );
    } finally {
        await close(conn);
    }
}

// Verificar se componente de nota já existe
export async function verificarComponenteNotaExistente(
    fk_disciplina_codigo: number,
    nome: string
): Promise<ComponenteNota | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_COMPONENTE as "id_componente",
                    FK_DISCIPLINA_CODIGO as "fk_disciplina_codigo",
                    NOME as "nome",
                    SIGLA as "sigla",
                    DESCRICAO as "descricao"
             FROM webapp.COMPONENTE_NOTA  
             WHERE FK_DISCIPLINA_CODIGO = :fk_disciplina_codigo AND NOME = :nome
             FETCH FIRST 1 ROWS ONLY`,
            { fk_disciplina_codigo, nome },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return (result.rows?.[0] as ComponenteNota) || null;
    } finally {
        await close(conn);
    }
}

// Obter componente de nota pelo ID
export async function getComponenteNotaById(id_componente: number): Promise<ComponenteNota | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_COMPONENTE as "id_componente",
                    FK_DISCIPLINA_CODIGO as "fk_disciplina_codigo",
                    NOME as "nome",
                    SIGLA as "sigla",
                    DESCRICAO as "descricao"
             FROM webapp.COMPONENTE_NOTA
             WHERE ID_COMPONENTE = :id_componente`,
            { id_componente },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return (result.rows?.[0] as ComponenteNota) || null;
    } finally {
        await close(conn);
    }
}

// Obter todos os componentes de nota
export async function getAllComponentesNota(): Promise<ComponenteNota[]> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_COMPONENTE as "id_componente",
                    FK_DISCIPLINA_CODIGO as "fk_disciplina_codigo",
                    NOME as "nome",
                    SIGLA as "sigla",
                    DESCRICAO as "descricao"
             FROM webapp.COMPONENTE_NOTA`,
            {},
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return result.rows as ComponenteNota[];
    } finally {
        await close(conn);
    }
}