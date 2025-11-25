// AUTOR: Davi José Bertuolo Vitoreti - RA: 25004168

import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Turma {
    id: number;
    fk_disciplina_codigo: number;
    nome: string;
    local_aula?: string;
    dia_semana?: string;
    hora?: string;
}

// Adicionar uma turma
export async function addTurma(
    fk_disciplina_codigo: number,
    nome: string,
    local_aula?: string,
    dia_semana?: string,
    hora?: string
): Promise<number> {
    const conn = await open();
    try {
        const result = await conn.execute<{ outBinds: { id: number } }>(
            `INSERT INTO webapp.TURMA (FK_DISCIPLINA_CODIGO, NOME, LOCAL_AULA, DIA_SEMANA, HORA)
             VALUES (:fk_disciplina_codigo, :nome, :local_aula, :dia_semana, :hora)
             RETURNING ID_TURMA INTO :id`,
            {
                fk_disciplina_codigo,
                nome,
                local_aula,
                dia_semana,
                hora,
                id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }
            },
            { autoCommit: true }
        );

        const outBinds = result.outBinds as { id?: number[] } | undefined;

        if (!outBinds?.id?.[0]) {
            throw new Error("Erro ao obter o ID retornado na inserção da Turma.");
        }

        return outBinds.id[0];
    } finally {
        await close(conn);
    }
}

// Deletar uma turma
export async function deleteTurma(id: number) {
    const conn = await open();
    try {
        await conn.execute(
            `DELETE FROM webapp.TURMA WHERE ID_TURMA = :id`,
            { id },
            { autoCommit: true }
        );
    } finally {
        await close(conn);
    }
}

// Atualizar uma turma
export async function updateTurma(
    id: number,
    fk_disciplina_codigo: number,
    nome: string,
    local_aula?: string,
    dia_semana?: string,
    hora?: string
) {
    const conn = await open();
    try {
        await conn.execute(
            `UPDATE webapp.TURMA 
             SET FK_DISCIPLINA_CODIGO = :fk_disciplina_codigo,
                 NOME = :nome,
                 LOCAL_AULA = :local_aula,
                 DIA_SEMANA = :dia_semana,
                 HORA = :hora
             WHERE ID_TURMA = :id`,
            { fk_disciplina_codigo, nome, local_aula, dia_semana, hora, id },
            { autoCommit: true }
        );
    } finally {
        await close(conn);
    }
}

// Verificar se turma já existe
export async function verificarTurmaExistente(
    fk_disciplina_codigo: number,
    nome: string
): Promise<Turma | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_TURMA as "id",
                    FK_DISCIPLINA_CODIGO as "fk_disciplina_codigo",
                    NOME as "nome",
                    LOCAL_AULA as "local_aula",
                    DIA_SEMANA as "dia_semana",
                    HORA as "hora"
             FROM webapp.TURMA  
             WHERE FK_DISCIPLINA_CODIGO = :fk_disciplina_codigo
               AND NOME = :nome
             FETCH FIRST 1 ROWS ONLY`,
            { fk_disciplina_codigo, nome },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return (result.rows?.[0] as Turma) || null;
    } finally {
        await close(conn);
    }
}

// Obter turma pelo ID
export async function getTurmaById(id: number): Promise<Turma | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_TURMA as "id",
                    FK_DISCIPLINA_CODIGO as "fk_disciplina_codigo",
                    NOME as "nome",
                    LOCAL_AULA as "local_aula",
                    DIA_SEMANA as "dia_semana",
                    HORA as "hora"
             FROM webapp.TURMA
             WHERE ID_TURMA = :id`,
            { id },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return (result.rows?.[0] as Turma) || null;
    } finally {
        await close(conn);
    }
}

// Obter todas as turmas
export async function getAllTurmas(): Promise<Turma[]> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_TURMA as "id",
                    FK_DISCIPLINA_CODIGO as "fk_disciplina_codigo",
                    NOME as "nome",
                    LOCAL_AULA as "local_aula",
                    DIA_SEMANA as "dia_semana",
                    HORA as "hora"
             FROM webapp.TURMA`
        );

        return result.rows as Turma[];
    } finally {
        await close(conn);
    }
}