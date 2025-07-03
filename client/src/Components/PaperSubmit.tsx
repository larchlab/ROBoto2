import { Button, Spinner } from "@fluentui/react-components";
import { PDFUpload } from "./PDFUpload";
import URLUpload from "./URLUpload";
import ky from "ky";
import { RobotoAPI } from "../Constants/Constants";
import {
	paperFile,
	paperParse,
	paperSubmissionProcessing,
	paperUploadButtonState,
	paperUrl,
} from "../State/Atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { filterParagraphs } from "@/Actions/Helpers";

/**
 * Used to control/sync the submission of papers
 * @returns
 */
export function PaperSubmitter() {
	// App state
	const setPaperParseState = useSetAtom(paperParse);
	const pdfUrl = useAtomValue(paperUrl);
	const pdfFile = useAtomValue(paperFile);
	const [isButtonDisabled, setIsButtonDisabled] = useAtom(paperUploadButtonState);
	const setIsPaperProcessing = useSetAtom(paperSubmissionProcessing);

	const handlePaperSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			// TODO: Add logic in the future to handle and disable the other upload method once one is uploaded
			// but for now priortize URL uploading
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let response: any = null;

			if (pdfUrl !== "") {
				response = await ky
					.post(`${RobotoAPI.baseUrl}/${RobotoAPI.uploadUrlEndpoint}`, {
						json: { url: pdfUrl },
						timeout: 600000,
					})
					.json();
			} else if (pdfFile !== null) {
				const formData = new FormData();
				formData.append("file", pdfFile);

				response = await ky
					.post(`${RobotoAPI.baseUrl}/${RobotoAPI.uploadFileEndpoint}`, {
						body: formData,
						timeout: 600000,
					})
					.json();
			} else {
				console.error("No file or URL provided");
				return;
			}

			if (response === null) {
				console.error("No response from server");
				return;
			}

			const abstract: string[] = response.pdf_parse.abstract.map(
				(paragraph: { text: string }) => paragraph.text,
			);
			const bodyText: string[] = response.pdf_parse.body_text.map(
				(paragraph: { text: string }) => paragraph.text,
			);
			const paragraphs: string[] = [...abstract, ...bodyText];

			const saveResult = {
				loaded: true,
				paperId: response.paper_id,
				title: response.title,
				paragraphs: filterParagraphs(paragraphs),
			};

			setPaperParseState(saveResult);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="paper-submit-container max-w-[650px] mx-auto">
					<div className="mt-8 grid grid-cols-[44fr_12fr_44fr] mb-[-7px]">
						<URLUpload />
						<div className="text-center mt-5">or</div>
						<PDFUpload />
					</div>
					<Button
						className="!py-2"
						appearance={"primary"}
						onClick={async (e) => {
							e.preventDefault();
							try {
								setIsButtonDisabled(true);
								await handlePaperSubmit(e);
								console.log("Upload successful!");
							} catch (error) {
								console.error(error);
							}
						}}
						disabled={isButtonDisabled}
					>
						Run ROB Assessment
					</Button>
		</div>
	);
}
