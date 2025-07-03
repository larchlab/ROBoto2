/**
 * Various helper functions for creating/working with files and blobs
 */

import { IRobResult, JSONBlobSchema } from "@/Constants/Types";
import { sha1Hash } from "./Helpers";
import { ConfigOptions, mkConfig } from "export-to-csv";
import { WithDefaults } from "node_modules/export-to-csv/output/lib/types";

export async function createClinicalBlob(
	pdfEmbeddings: { [key: string]: string | number[] },
	conductEval: Array<[number, IRobResult]>,
	riskLevel: string,
): Promise<{
	csvConfig: WithDefaults<ConfigOptions>;
	csvData: Record<string, string | number>[];
}> {
	const allPossibleParagraphs = [
		...Array(pdfEmbeddings["paragraph_count"]).keys(),
	].map((i) => pdfEmbeddings[`t-${i}`]);
	const paragraphsHash = await sha1Hash(allPossibleParagraphs.join(" "));
	const csvConfig = mkConfig({
		filename: `${paragraphsHash}.researcher`,
		useKeysAsHeaders: true,
	});
	const csvData = [];

	// get max added paragraphs
	let maxAddedParagraphs = 0;
	conductEval.forEach((domain) => {
		const domain_data = domain[1];
		for (let i = 0; i < domain_data.addedParagraphs.length; i++) {
			if (domain_data.addedParagraphs[i].length > maxAddedParagraphs) {
				maxAddedParagraphs = domain_data.addedParagraphs[i].length;
			}
		}
	});

	conductEval.forEach((domain) => {
		const domain_number = domain[0];
		const domain_data = domain[1];

		for (let i = 0; i < domain_data.questions.length; i++) {
			const question = domain_data.questions[i];
			const ctxParagraph1 = domain_data.paragraphs[i][0];
			const ctxParagraph2 = domain_data.paragraphs[i][1];
			const ctxParagraph3 = domain_data.paragraphs[i][2];

			// TODO: Unsure if addedParagraphs even works....
			// get added paragraphs with ctxParagraph<4 + i>
			// const addedParagraphsMap = {};
			// for (let j = 0; j < maxAddedParagraphs; j++) {
			// 	if (j < domain_data.addedParagraphs[i].length) {
			// 		addedParagraphsMap[`addedParagraph${j + 1}`] =
			// 			domain_data.addedParagraphs[i][j].paragraph;
			// 	} else {
			// 		addedParagraphsMap[`addedParagraph${j + 1}`] = null;
			// 	}
			// }

			// const response = domain_data.questionToAnswers[createHash(question)];
			const expertPrediction = domain_data.expertPrediction[i];
			const expertExplanation = domain_data.expertExplanation[i];
			const domainRisk = domain_data.riskLevel;

			csvData.push({
				domain_number: domain_number,
				question: question,
				expertPrediction: expertPrediction,
				expertExplanation: expertExplanation,
				ctxParagraph1: ctxParagraph1,
				ctxParagraph2: ctxParagraph2,
				ctxParagraph3: ctxParagraph3,
				domainRisk: domainRisk,
				overallRisk: riskLevel,
			});
		}
	});

	const csv = {
		csvConfig: csvConfig,
		csvData: csvData,
	};

	return csv;
}

export async function createDeveloperReport(
	pdfEmbeddings: { [key: string]: string | number[] },
	conductEval: Array<[number, IRobResult]>,
	riskLevel: string,
	domain1: IRobResult,
	domain2: IRobResult,
	domain3: IRobResult,
	domain4: IRobResult,
	domain5: IRobResult,
): Promise<{ json: JSONBlobSchema; file_name: string }> {
	const allPossibleParagraphs = [
		...Array(pdfEmbeddings["paragraph_count"]).keys(),
	].map((i) => pdfEmbeddings[`t-${i}`]);

	const paragraphsHash = await sha1Hash(allPossibleParagraphs.join(" "));
	const jsonData = [];

	// get max added paragraphs
	let maxAddedParagraphs = 0;
	conductEval.forEach((domain) => {
		const domain_data = domain[1];
		for (let i = 0; i < domain_data.addedParagraphs.length; i++) {
			if (domain_data.addedParagraphs[i].length > maxAddedParagraphs) {
				maxAddedParagraphs = domain_data.addedParagraphs[i].length;
			}
		}
	});

	conductEval.forEach((domain) => {
		const domain_number = domain[0];
		const domain_data = domain[1];

		for (let i = 0; i < domain_data.questions.length; i++) {
			const question = domain_data.questions[i];
			const gptResponse =
				domain_data.gptResponses[i].choices[0].message.content;
			const ctxParagraph1 = domain_data.paragraphs[i][0];
			const ctxParagraph2 = domain_data.paragraphs[i][1];
			const ctxParagraph3 = domain_data.paragraphs[i][2];
			const ctxP1Score = domain_data.paragraphScores[i][0].toFixed(3);
			const ctxP2Score = domain_data.paragraphScores[i][1].toFixed(3);
			const ctxP3Score = domain_data.paragraphScores[i][2].toFixed(3);
			const ctxParagraph1Feedback = domain_data.paragraphsFeedback[i][0];
			const ctxParagraph2Feedback = domain_data.paragraphsFeedback[i][1];
			const ctxParagraph3Feedback = domain_data.paragraphsFeedback[i][2];

			const gptPrediction = domain_data.gptPrediction[i];
			const gptExplanation = domain_data.gptExplanation[i];

			const expertPrediction = domain_data.expertPrediction[i];
			const expertExplanation = domain_data.expertExplanation[i];

			jsonData.push({
				domain_number: domain_number,
				question: question,
				gptResponse: gptResponse,
				ctxParagraph1: ctxParagraph1,
				ctxParagraph2: ctxParagraph2,
				ctxParagraph3: ctxParagraph3,
				ctxP1Score: ctxP1Score,
				ctxP2Score: ctxP2Score,
				ctxP3Score: ctxP3Score,
				ctxParagraph1Feedback: ctxParagraph1Feedback,
				ctxParagraph2Feedback: ctxParagraph2Feedback,
				ctxParagraph3Feedback: ctxParagraph3Feedback,
				gptPrediction: gptPrediction,
				gptExplanation: gptExplanation,
				expertPrediction: expertPrediction,
				expertExplanation: expertExplanation,
				addedParagraphs: domain_data.addedParagraphs[i],
			});
		}
	});

	const resultsJson = {
		file_id: `${paragraphsHash}.developer`,
		pdf_hash: paragraphsHash,
		document: allPossibleParagraphs,
		result: jsonData,
		overall_risk_level: riskLevel,
		domain_risk_levels: [
			domain1.riskLevel,
			domain2.riskLevel,
			domain3.riskLevel,
			domain4.riskLevel,
			domain5.riskLevel,
		],
	};

	return {
		json: resultsJson,
		file_name: paragraphsHash,
	};
}
