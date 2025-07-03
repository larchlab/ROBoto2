import OpenAI from "openai";
import { embeddings } from "../Constants/ROB/DomainQuestionEmbeddings.ts";
import {
	cosineSimilarity,
	createHash,
	grabModelResponse,
	sendStringsToOAI,
	zip,
} from "./Helpers.ts";
import { answer_format } from "../Constants/ROB/DomainQuestions.ts";
import { ChatCompletion } from "openai/resources/index.mjs";
import { IRobResult, RobResponses } from "../Constants/Types.ts";
import { question_dict_simplified } from "../Constants/ROB/DomainQuestionsSimplified.ts";


function get_domain_embeddings(domain_number: number) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return embeddings[`domain_${domain_number}_embeddings`];
}

function get_domain_questions(domain_number: number) {
	return question_dict_simplified[`domain_${domain_number}_questions`];
}

function findTop3(record) {
	return Object.entries(record)
		.sort((a, b) => b[1][0] - a[1][0]) // Sort based on the number in descending order
		.slice(0, 3) // Get the top 3 entries
		.map((entry) => entry[0]); // Extract the keys
}

/**
 * Helper function to run the rob assessment for a given domain
 * @param paperEmbeddings
 * @param domain_number
 * @returns
 */
export async function runRobEval(
	paperEmbeddings,
	domain_number: number,
): Promise<IRobResult> {
	const domain_embeddings = get_domain_embeddings(domain_number);
	const domain_questions = get_domain_questions(domain_number);
	const domain_q_e_pairs = zip(domain_questions, domain_embeddings);

	const promiseBatch: Array<Promise<{"responses": Array<ChatCompletion>}>> = [];
	const paragraphBatch = [];
	const paragraphsFeedback = [];
	const questionBatch = [];
	const addedParagraphs = [];
	const simScoresBatch = [];
	const questionToAnswers = {};
	const questionsToKeys = {};

	// Iterate over all the questions and run the eval
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	domain_q_e_pairs.forEach(async (q_e_pair: any[]) => {
		const question = q_e_pair[0];
		const question_embedding = q_e_pair[1];

		const sim_scores_mapping = {}; // used for debugging

		for (let i = 0; i < paperEmbeddings["paragraph_count"]; i++) {
			const paragraph_embedding = paperEmbeddings[`p-${i}`];
			const sim_score = cosineSimilarity(
				question_embedding,
				paragraph_embedding,
			);
			sim_scores_mapping[`p-${i}`] = [sim_score, paperEmbeddings[`t-${i}`]];
		}

		const top3keys = findTop3(sim_scores_mapping);

		// Grab the text from the top 3 paragraphs
		const top3Paragraphs = top3keys.map((key) => sim_scores_mapping[key][1]);
		const top3scores = top3keys.map((key) => sim_scores_mapping[key][0]);

		const prompt = `Context${top3Paragraphs}\n\n Question: ${question} \n\n ${answer_format}`;

		promiseBatch.push(
			sendStringsToOAI([prompt]),
		);

		paragraphBatch.push(top3Paragraphs);
		paragraphsFeedback.push(new Array(3).fill(null));
		addedParagraphs.push([]);
		questionBatch.push(question);
		simScoresBatch.push(top3scores);
		questionToAnswers[createHash(question)] = RobResponses.no_information;
		questionsToKeys[createHash(question)] = top3keys;
	});

	const promisesResolved = await Promise.all(promiseBatch);
	promisesResolved.forEach((response, index) => {
		// Map the response to an answer
		const question = questionBatch[index];
		questionToAnswers[createHash(question)] = grabModelResponse(
			response.responses[0].choices[0].message.content,
		);
	});
	
	const gptResponses = promisesResolved.map((response) => response.responses[0]);

	return {
		// We flatten the promisesResolved array to get the responses because the oai api call supports 
		// batching by default and in this instance we only ever send one prompt at a time
		gptResponses: gptResponses.flat(),
		paragraphs: paragraphBatch,
		paragraphsFeedback: paragraphsFeedback,
		addedParagraphs: addedParagraphs,
		paragraphScores: simScoresBatch,
		questions: questionBatch,
		questionToAnswers: questionToAnswers,
		questionToKeys: questionsToKeys,
		resultsReviewed: false,
		expertPrediction: [],
		expertExplanation: [],
		gptPrediction: [],
		gptExplanation: [],
		riskLevel: null,
	};
}
