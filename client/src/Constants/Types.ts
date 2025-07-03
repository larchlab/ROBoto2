import OpenAI from "openai";

export const robotoBucketName: string = "roboto-data";

export interface IPaperEmbeddings {
	[key: string]: string | number[];
}

export interface IPaperParse {
	loaded: boolean;
	paperId: string;
	title: string;
	paragraphs: string[];
}

export interface IRobResult {
	gptResponses: OpenAI.Chat.Completions.ChatCompletion[];
	paragraphs: string[];
	paragraphsFeedback: (string | null)[][];
	paragraphScores: number[];
	questions: string[];
	questionToAnswers: Record<string, RobResponses>;
	questionToKeys?: Record<string, string[]>;
	resultsReviewed: boolean;
	expertPrediction: string[];
	expertExplanation: string[];
	gptPrediction: string[];
	gptExplanation: string[];
	addedParagraphs: string[][];
	riskLevel: "Low Risk" | "Some Concerns" | "High Risk" | null;
}

export enum ModelEmbeddingProgress {
	loading = "loading",
	pending = "pending",
	started = "started",
	completed = "completed",
}

export enum RobTabs {
	domain1 = "domain1",
	domain2 = "domain2",
	domain3 = "domain3",
	domain4 = "domain4",
	domain5 = "domain5",
	summary = "summary",
}

export enum RobResponses {
	yes = "yes",
	no = "no",
	probably_yes = "probably yes",
	probably_no = "probably no",
	no_information = "no information",
}


// This is the response format that Sanjana switched to, we need to refactor anywhere RobResponses is used and be standardized
export type ROBResponse = "Y" | "N" | "PY" | "PN" | "NI";

export type ROBDomainRiskLevel = "Low Risk" | "Some Concerns" | "High Risk";


export const RobResponsesOrdering = [
	RobResponses.no_information,
	RobResponses.probably_yes,
	RobResponses.probably_no,
	RobResponses.yes,
	RobResponses.no,
];

export enum DomainHeadings {
	domain1 = "Randomization Process Bias",
	domain2 = "Deviations from Interventions Bias",
	domain3 = "Missing Outcome Data Bias",
	domain4 = "Measurement Outcome Bias",
	domain5 = "Reported Selection Bias",
}

export type JSONBlobSchema = Record<
	string,
	string | number | (string | number[])[]
>;

// TODO: Add descriptions for each domain
// export enum DomainDescriptions {
//     domain1 = "",
//     domain2 = "",
//     domain3 = "",
//     domain4 = "",
//     domain5 = "",
// }
