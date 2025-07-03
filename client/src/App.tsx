import "./App.css";
import "../app/globals.css";
import {
	paperEmbeddings,
	paperParse,
	paperSubmissionProcessing,
	robAssessmentProcess,
} from "./State/Atoms";
import { useRef, useEffect, useState } from "react";
import { IPaperEmbeddings, ModelEmbeddingProgress } from "./Constants/Types";
import { PaperSubmitter } from "./Components/PaperSubmit";
import {
	FluentProvider,
	Spinner,
	webLightTheme,
} from "@fluentui/react-components";
import { ROBResultsPage } from "./Components/RobResults";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { simd } from "wasm-feature-detect";

function App() {
	const { isPending, error, data } = useQuery({
		queryKey: ["isWasmSupported"],
		queryFn: async () => {
			return await simd();
		},
	});

	const [currPageContent, setCurrPageContent] = useState<JSX.Element>(
		<PaperSubmitter />,
	);
	const [showUploadForm, setShowUploadForm] = useState<boolean>(true);

	// Use this to check when paper parse has been loaded in and we no longer need to display the upload forms.
	const paperParseState = useAtomValue(paperParse);

	const setPaperEmbeddings = useSetAtom(paperEmbeddings);

	// Used to determine what state the model is currently in.
	const [modelEmbedProgress, setModelProgress] = useAtom(robAssessmentProcess);

	const worker = useRef<Worker>(null);

	// We use the `useEffect` hook to setup the worker as soon as the `App` component is mounted.
	useEffect(() => {
		if (!worker.current) {
			// Create the worker if it does not yet exist.
			(worker.current as any) = new Worker(
				new URL("./worker.ts", import.meta.url),
				{
					type: "module",
				},
			);
		}

		// Create a callback function for messages from the worker thread.
		const onMessageReceived = (e: {
			data: { status: ModelEmbeddingProgress; embeddings: IPaperEmbeddings };
		}) => {
			switch (e.data.status) {
				case ModelEmbeddingProgress.loading:
					// Model file start load: add a new progress item to the list.
					setModelProgress(ModelEmbeddingProgress.loading);
					break;

				case ModelEmbeddingProgress.completed:
					setModelProgress(ModelEmbeddingProgress.completed);
					setPaperEmbeddings(e.data.embeddings);
					break;
			}
		};

		// Attach the callback function as an event listener.
		(worker.current as Worker).addEventListener("message", onMessageReceived);

		// Define a cleanup function for when the component is unmounted.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		return () =>
			(worker.current as Worker).removeEventListener(
				"message",
				onMessageReceived,
			);
	});

	/**
	 * Post a message to the model when the paper parse is returned.
	 */
	useEffect(() => {
		if (
			paperParseState.loaded &&
			modelEmbedProgress === ModelEmbeddingProgress.pending
		) {
			setModelProgress(ModelEmbeddingProgress.started);
			setCurrPageContent(
				<Spinner className="pt-16 pb-6" label="Processing paper ..." />,
			);

			(worker.current as Worker).postMessage({
				task: "embed",
				paragraphs: paperParseState.paragraphs,
			});
		}

		if (
			paperParseState.loaded &&
			modelEmbedProgress === ModelEmbeddingProgress.completed
		) {
			setCurrPageContent(<ROBResultsPage />);
			setShowUploadForm(false);
		}
	}, [paperParseState, modelEmbedProgress, setModelProgress]);

	return (
		<FluentProvider theme={webLightTheme}>
			{!isPending && !error && !data && (
				<div>
					Your browser might not support the latest WebAssembly features, which
					could result in failures when running the assessment. Please ensure
					your browser is updated and try again if you experience issues.
				</div>
			)}
			{showUploadForm && (
				<div className="max-w-[650px] mx-auto">
					<h1 className="text-3xl font-bold mt-5 text-center">
						🤖 ROBoto2: Conducting Risk of Bias Assessment with LLM Assistance
					</h1>
					<p className="font-light text-[15px] mt-4 leading-5">
						ROBoto2 is a tool that helps automate{" "}
						<a
							href="https://methods.cochrane.org/bias/resources/rob-2-revised-cochrane-risk-bias-tool-randomized-trials"
							className="underline"
						>
							Risk of Bias assessments
						</a>{" "}
						for clinical trial papers. To get started, either paste a PDF URL
						(e.g.,{" "}
						<a
							href="https://pdfs.semanticscholar.org/da82/bc0f839be4b028f7210b2b6598508c43fea1.pdf"
							className="underline"
						>
							this URL
						</a>
						) in the input field below or upload a PDF from your computer.
					</p>
				</div>
			)}
			{currPageContent}
		</FluentProvider>
	);
}

export default App;
