// AUTOR: Davi José Bertuolo Vitoreti - RA: 25004168

import {open, close} from "../config/db";
import OracleDB from "oracledb";

export interface Matricula {
	id_matricula: number;
	fk_id_turma: number;
	fk_id_estudante: number;
}

// Adicionar uma matrícula
export async function addMatricula(
	fk_id_turma: number,
	fk_id_estudante: number
): Promise<number> {
	const conn = await open();
	try {
		const result = await conn.execute<{ outBinds: { id_matricula: number } }>(
			`INSERT INTO webapp.MATRICULA (FK_ID_TURMA, FK_ID_ESTUDANTE)
			 VALUES (:fk_id_turma, :fk_id_estudante)
			 RETURNING ID_MATRICULA INTO :id_matricula`,
			{
				fk_id_turma,
				fk_id_estudante,
				id_matricula: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }
			},
			{ autoCommit: true }
		);

		const outBinds = result.outBinds as { id_matricula?: number[] } | undefined;

		if (!outBinds?.id_matricula?.[0]) {
			throw new Error("Erro ao obter o ID retornado na inserção da Matrícula.");
		}

		return outBinds.id_matricula[0];
	} finally {
		await close(conn);
	}
}


// Verificar se matrícula já existe
export async function verificarMatriculaExistente(
	fk_id_turma: number,
	fk_id_estudante: number
): Promise<Matricula | null> {
	const conn = await open();
	try {
		const result = await conn.execute(
			`SELECT FK_ID_TURMA as "fk_id_turma",
					FK_ID_ESTUDANTE as "fk_id_estudante"
			 FROM webapp.MATRICULA
			 WHERE FK_ID_TURMA = :fk_id_turma
			   AND FK_ID_ESTUDANTE = :fk_id_estudante
			 FETCH FIRST 1 ROWS ONLY`,
			{ fk_id_turma, fk_id_estudante },
			{ outFormat: OracleDB.OUT_FORMAT_OBJECT }
		);

		return (result.rows?.[0] as Matricula) || null;
	} finally {
		await close(conn);
	}
}


// Obter matrícula pelo ID
export async function getMatriculaById(id_matricula: number): Promise<Matricula | null> {
	const conn = await open();
	try {
		const result = await conn.execute(
			`SELECT ID_MATRICULA as "id_matricula",
					FK_ID_TURMA as "fk_id_turma",
					FK_ID_ESTUDANTE as "fk_id_estudante"
			 FROM webapp.MATRICULA
			 WHERE ID_MATRICULA = :id_matricula`,
			{ id_matricula },
			{ outFormat: OracleDB.OUT_FORMAT_OBJECT }
		);

		return (result.rows?.[0] as Matricula) || null;
	} finally {
		await close(conn);
	}
}

// Obter todas as matrículas
export async function getAllMatriculas(): Promise<Matricula[]> {
	const conn = await open();
	try {
		const result = await conn.execute(
			`SELECT ID_MATRICULA as "id_matricula",
					FK_ID_TURMA as "fk_id_turma",
					FK_ID_ESTUDANTE as "fk_id_estudante"
			 FROM webapp.MATRICULA`
		);

		return result.rows as Matricula[];
	} finally {
		await close(conn);
	}
}