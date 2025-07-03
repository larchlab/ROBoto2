import { atom } from "jotai";
import {
	IPaperParse,
	IRobResult,
	ModelEmbeddingProgress,
	RobTabs,
} from "../Constants/Types";
import { Theme, webDarkTheme } from "@fluentui/react-components";

const emptyRobResult: IRobResult = {
	gptResponses: [],
	paragraphs: [],
	questions: [],
	paragraphScores: [],
	questionToAnswers: {},
	resultsReviewed: false,
	expertPrediction: [],
	expertExplanation: [],
	gptPrediction: [],
	gptExplanation: [],
	addedParagraphs: [],
	paragraphsFeedback: [],
	riskLevel: null,
};

export const questionAnswerMapping = atom<Record<string, string>>({});

export const styleTheme = atom<Theme>(webDarkTheme);

export const paperParse = atom<IPaperParse>({
	loaded: false,
} as IPaperParse);

export const paperEmbeddings = atom<{ [key: string]: string | number[] }>({});

export const paperUploadButtonState = atom<boolean>(true);

export const paperUrl = atom<string>("");

export const paperFile = atom<File | null>();

export const paperSubmissionProcessing = atom<boolean>(false);

export const domainResultsProcessing = atom<boolean>(false);

// TODO: Refactor this into an object
export const domain1Results = atom<IRobResult>(emptyRobResult);

export const domain2Results = atom<IRobResult>(emptyRobResult);

export const domain3Results = atom<IRobResult>(emptyRobResult);

export const domain4Results = atom<IRobResult>(emptyRobResult);

export const domain5Results = atom<IRobResult>(emptyRobResult);

export const robAssessmentProcess = atom<ModelEmbeddingProgress>(
	ModelEmbeddingProgress.pending,
);
