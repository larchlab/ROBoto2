// eslint-disable-next-line @typescript-eslint/no-var-requires
import similarity from "compute-cosine-similarity";
import { RobResponses, RobResponsesOrdering } from "../Constants/Types";
import ky from "ky";
import { RobotoAPI } from "@/Constants/Constants";
import { ChatCompletion } from "openai/resources/index.mjs";

export const zip = (a, b) => a.map((k, i) => [k, b[i]]);

export function cosineSimilarity(a: number[], b: number[]) {
	return similarity(a, b);
}

/**
 */
export function createHash(message: string) {
	return window.btoa(encodeURI(message));
}

/**
 * Removes any paragraphs less then 20 characters
 * @param paragraphs
 */
export function filterParagraphs(paragraphs: string[]) {
	return paragraphs.filter((paragraph) => paragraph.length > 20);
}


export function grabModelResponse(gptResponse: string): RobResponses {
	for (let k = 0; k < RobResponsesOrdering.length; k++) {
		try {
			// Try converting the gpt response to JSON
			const gptResponseJSON = JSON.parse(gptResponse);
			if (
				gptResponseJSON["prediction"].trim().toLowerCase() ==
				RobResponsesOrdering[k].toLowerCase()
			) {
				return RobResponsesOrdering[k];
			}
		} catch {
			if (
				gptResponse
					.trim()
					.toLowerCase()
					.includes(RobResponsesOrdering[k].toLowerCase())
			) {
				return RobResponsesOrdering[k];
			}
		}
	}
	return RobResponses.no_information;
}

export async function sha1Hash(data: string): Promise<string> {
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest("SHA-1", dataBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
	return hashHex;
}

export async function sendJsonToS3(bucketName: string,
	key: string, json_string: string) {
	const response = await ky
	.post(`${RobotoAPI.baseUrl}/${RobotoAPI.uploadS3Endpoint}`, {
		json: { json: json_string, file_name: key },
		timeout: 600000,
	})
	.json();
	return response;
}

export async function sendStringsToOAI(strings: string[]): Promise<{"responses": Array<ChatCompletion>}> {
	const response = await ky
		.post(`${RobotoAPI.baseUrl}/${RobotoAPI.oaiCompletion}`, {
			json: { texts: strings, model: "gpt-3.5-turbo" },
			timeout: 600000,
		})
		.json();	
	return response as {"responses": Array<ChatCompletion>};
}