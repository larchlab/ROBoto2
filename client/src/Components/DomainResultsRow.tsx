import { IRobResult, RobResponses } from "../Constants/Types";
import { useEffect, useRef, useState } from "react";
import { JSX } from "react/jsx-runtime";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Label } from "@/Components/ui/label";
import { cn } from "@/lib/utils";
import { Textarea } from "@/Components/ui/textarea";
import { PrimitiveAtom, useAtom } from "jotai";
import { FaThumbsDown, FaThumbsUp } from 'react-icons/fa';

interface IDomainResultsRow {
	domainAtom: PrimitiveAtom<IRobResult>;
	questionNumber: number;
	domainNumber: number;
	questionHash: string;
	isHidden: boolean;
	question: string;
	defaultSelection: RobResponses;
	gptResponse: string;
	ctxParagraph1: string;
	ctxParagraph2: string;
	ctxParagraph3: string;
	ctxP1Score: string;
	ctxP2Score: string;
	ctxP3Score: string;
	expertPrediction: string;
	expertExplanation: string;
	gptPrediction: string;
	gptExplanation: string;
	setDomain: any;
	paragraphsFeedback: (string | null)[];
	addedParagraphs: any[];
	allPossibleParagraphs: string[];
}

function ThumbsDown() {
	return <div className="inline-block text-red-500"> <FaThumbsDown className="text-red-500" /></div>;
}

function ThumbsUp() {
	return <div className="inline-block text-green-500"><FaThumbsUp className="text-green-500" /></div>;
}

function ParagraphFeedback({
	paragraphsFeedback,
	setDomain,
	questionNumber,
	paragraphNumber,
	addedParagraphs,
}: {
	paragraphsFeedback: (string | null)[];
	setDomain: any;
	questionNumber: number;
	paragraphNumber: number;
	addedParagraphs: any[];
}) {
	let paragraphFeedback;
	if (paragraphNumber > 3) {
		paragraphFeedback = addedParagraphs[paragraphNumber - 4].feedback;
	} else {
		paragraphFeedback = paragraphsFeedback[paragraphNumber - 1];
	}

	return (
		<div className="mb-1">
			{paragraphNumber > 3 && (
				<div
					className="inline-block mr-1 hover:cursor-pointer"
					onClick={() => {
						setDomain((prev) => {
							const newDomain = { ...prev };
							const arrayCopy = [...newDomain.addedParagraphs];
							const questionArray = [...arrayCopy[questionNumber - 1]];
							questionArray.splice(paragraphNumber - 4, 1);
							arrayCopy[questionNumber - 1] = questionArray;
							newDomain.addedParagraphs = arrayCopy;
							return newDomain;
						});
					}}
				>
					❌
				</div>
			)}
			Paragraph {paragraphNumber}{" "}
			<div
				className={cn(
					"ml-1 w-3 duration-150 inline-block hover:cursor-pointer align-middle mt-[-4px]",
					paragraphFeedback === "good"
						? "opacity-100"
						: "hover:opacity-80 opacity-60 grayscale",
				)}
				onClick={() => {
					setDomain((prev) => {
						const newDomain = { ...prev };

						// it's an added paragraph
						if (paragraphNumber > 3) {
							const arrayCopy = [...newDomain.addedParagraphs];
							const questionArray = [...arrayCopy[questionNumber - 1]];
							const paragraph = { ...questionArray[paragraphNumber - 4] };
							if (paragraph.feedback === "good") {
								paragraph.feedback = null;
							} else {
								paragraph.feedback = "good";
							}
							questionArray[paragraphNumber - 4] = paragraph;
							arrayCopy[questionNumber - 1] = questionArray;
							newDomain.addedParagraphs = arrayCopy;
							return newDomain;
						}

						// it's a context paragraph
						const arrayCopyParent = [...newDomain.paragraphsFeedback];
						const arrayInnerCopy = [...arrayCopyParent[questionNumber - 1]];
						const prevValue = arrayInnerCopy[paragraphNumber - 1];
						if (prevValue === "good") {
							arrayInnerCopy[paragraphNumber - 1] = null;
						} else {
							arrayInnerCopy[paragraphNumber - 1] = "good";
						}
						arrayCopyParent[questionNumber - 1] = arrayInnerCopy;
						newDomain.paragraphsFeedback = arrayCopyParent;
						return newDomain;
					});
				}}
			>
				<ThumbsUp />
			</div>
			<div
				// className="ml-[5px] w-3 opacity-60 hover:opacity-80 duration-150 inline-block hover:cursor-pointer align-middle mt-[-4px]"
				className={cn(
					"ml-[5px] w-3 duration-150 inline-block hover:cursor-pointer align-middle mt-[-4px]",
					paragraphFeedback === "bad"
						? "opacity-100"
						: "hover:opacity-80 opacity-60 grayscale",
				)}
				onClick={() => {
					setDomain((prev) => {
						const newDomain = { ...prev };

						// it's an added paragraph
						if (paragraphNumber > 3) {
							const arrayCopy = [...newDomain.addedParagraphs];
							const questionArray = [...arrayCopy[questionNumber - 1]];
							const paragraph = { ...questionArray[paragraphNumber - 4] };
							if (paragraph.feedback === "bad") {
								paragraph.feedback = null;
							} else {
								paragraph.feedback = "bad";
							}
							questionArray[paragraphNumber - 4] = paragraph;
							arrayCopy[questionNumber - 1] = questionArray;
							newDomain.addedParagraphs = arrayCopy;
							return newDomain;
						}

						const arrayCopyParent = [...newDomain.paragraphsFeedback];
						const arrayInnerCopy = [...arrayCopyParent[questionNumber - 1]];
						const prevValue = arrayInnerCopy[paragraphNumber - 1];
						if (prevValue === "bad") {
							arrayInnerCopy[paragraphNumber - 1] = null;
						} else {
							arrayInnerCopy[paragraphNumber - 1] = "bad";
						}
						arrayCopyParent[questionNumber - 1] = arrayInnerCopy;
						newDomain.paragraphsFeedback = arrayCopyParent;
						return newDomain;
					});
				}}
			>
				<ThumbsDown />
			</div>
		</div>
	);
}

/**
 * TODO: This is an a11y nightmare, needs to maintain focus of the screen so users can tab through it
 * Displays a modal allowing the user to add additional paragraphs to the domain
 * @param param0 
 * @returns 
 */
function ParagraphsToAddPanel({
	paragraphs,
	setShowParagraphsToAdd,
	setDomain,
	questionNumber,
}: {
	paragraphs: string[];
	setShowParagraphsToAdd: any;
	setDomain: any;
	questionNumber: number;
}) {

	// This is a hack to focus the modal when it is opened so that we can properly escape
	const divRef = useRef(null);

	useEffect(() => {
		if (divRef.current) {
		divRef.current.focus();
		}
	}, []);

	return (
		<div
			ref={divRef}
			tabIndex={0}
			className="fixed top-0 left-0 right-0 bottom-0 overflow-y-auto z-50 backdrop-blur-sm bg-gray-500 bg-opacity-10"
			onClick={() => {
				setShowParagraphsToAdd(false);
			}}
			onKeyDown={(event) => {
				console.log(event.key);
				if (event.key === "Escape") {
					setShowParagraphsToAdd(false);
				}
			}}
		>
			<div
				className="bg-white ml-[calc(50%_-_425px)] border-gray-300 border-[1px] py-7 h-[90vh] mt-[5vh] rounded-md px-4 max-w-[850px] overflow-y-auto"
				onClick={(event) => {
					// Prevent the click from closing the modal
					event.stopPropagation();
				}}
			>
				<div className="mb-5">
					<h3 className="text-lg font-semibold">Add Reference Paragraph</h3>
					<p>Click on a paragraph to add it as a reference.</p>
				</div>
				{paragraphs.map((paragraph, index) => {
					return (
						<div
							key={index}
							className="border-2 border-gray-200 py-3 mb-6 px-3 rounded-md hover:bg-gray-100 duration-150 hover:cursor-pointer"
							onClick={() => {
								setDomain((prev) => {
									const newDomain = { ...prev };
									const arrayCopy = [...newDomain.addedParagraphs];
									const questionArray = [...arrayCopy[questionNumber - 1]];
									questionArray.push({
										paragraph: paragraph,
										score: 0.3352,
										feedback: null,
									});
									arrayCopy[questionNumber - 1] = questionArray;
									newDomain.addedParagraphs = arrayCopy;
									return newDomain;
								});
								setShowParagraphsToAdd(false);
							}}
						>
							<div>{paragraph}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function DomainResultsRow(props: IDomainResultsRow): JSX.Element {
	const [domainResults, setDomainResults] = useAtom(props.domainAtom);
	const [showParagraphsToAdd, setShowParagraphsToAdd] = useState(false);
	const [currPossibleParagraphs, setCurrPossibleParagraphs] = useState<
		string[]
	>(props.allPossibleParagraphs);

	useEffect(() => {
		const topParagraphs = new Set([
			props.ctxParagraph1,
			props.ctxParagraph2,
			props.ctxParagraph3,
		]);
		// remove all paragraphs that have been added from allPossibleParagraphs
		const addedParagraphsStr = new Set(
			props.addedParagraphs[props.questionNumber - 1].map((x) => x.paragraph),
		);
		const allPossibleParagraphsCopy = [...props.allPossibleParagraphs];
		const newPossibleParagraphs = allPossibleParagraphsCopy.filter(
			(x) => !addedParagraphsStr.has(x) && !topParagraphs.has(x),
		);
		setCurrPossibleParagraphs(newPossibleParagraphs);
	}, [props.addedParagraphs]);

	// When this component is loaded lets set resultsReviewed to true
	useEffect(() => {
		setDomainResults({ ...domainResults, resultsReviewed: true });
	}, []);

	return (
		<div
			style={{
				display: props.isHidden ? "none" : "block",
			}}
		>
			{showParagraphsToAdd && (
				<ParagraphsToAddPanel
					paragraphs={currPossibleParagraphs}
					setShowParagraphsToAdd={setShowParagraphsToAdd}
					setDomain={props.setDomain}
					questionNumber={props.questionNumber}
				/>
			)}
			<div className="mt-4 mb-4">
				<h3 className="text-lg font-semibold">
					Question {props.domainNumber}.{props.questionNumber}: {props.question}
				</h3>
				<div>
					<h4 className="text-base mt-3 font-medium">Reference Paragraphs</h4>
					<div className="mt-2 space-y-3">
						<div>
							<ParagraphFeedback
								paragraphsFeedback={props.paragraphsFeedback}
								setDomain={props.setDomain}
								questionNumber={props.questionNumber}
								paragraphNumber={1}
								addedParagraphs={
									props.addedParagraphs[props.questionNumber - 1]
								}
							/>
							<div>{props.ctxParagraph1}</div>
						</div>
						<div>
							<ParagraphFeedback
								paragraphsFeedback={props.paragraphsFeedback}
								setDomain={props.setDomain}
								questionNumber={props.questionNumber}
								paragraphNumber={2}
								addedParagraphs={
									props.addedParagraphs[props.questionNumber - 1]
								}
							/>
							<div>{props.ctxParagraph2}</div>
						</div>
						<div>
							<ParagraphFeedback
								paragraphsFeedback={props.paragraphsFeedback}
								setDomain={props.setDomain}
								questionNumber={props.questionNumber}
								paragraphNumber={3}
								addedParagraphs={
									props.addedParagraphs[props.questionNumber - 1]
								}
							/>
							<div>{props.ctxParagraph3}</div>
						</div>
						{props.addedParagraphs[props.questionNumber - 1].map((x, i) => {
							return (
								<div key={x.paragraph}>
									<ParagraphFeedback
										paragraphsFeedback={props.paragraphsFeedback}
										setDomain={props.setDomain}
										questionNumber={props.questionNumber}
										paragraphNumber={i + 4}
										addedParagraphs={
											props.addedParagraphs[props.questionNumber - 1]
										}
									/>
									<div>{x.paragraph}</div>
								</div>
							);
						})}
					</div>
					<div
						className="hover:cursor-pointer mt-3 py-1 bg-slate-100 text-slate-600 border-dashed border-[1px] border-slate-300 text-xs inline-block px-2 rounded-md"
						onClick={() => {
							setShowParagraphsToAdd(true);
						}}
					>
						+ Add Reference Paragraph
					</div>
				</div>

				<div>
					<h4 className="text-base font-medium mt-5">🤖 LLM Response</h4>
					<div className="mt-2 space-y-[2px]">
						<div><strong>Model Prediction:</strong> {props.gptPrediction}</div>
						<div><strong>Model Explanation:</strong> {props.gptExplanation}</div>
					</div>
				</div>
				<div className="mt-5 grid-cols-[10fr_20fr_10fr_13fr] grid gap-x-3">
					<div>
						<div className="text-base font-medium bg-yellow-200">Expert Answer 🤔</div>
						<div className="border-[1px] px-3 py-3 rounded-md mt-2">
							<RadioGroup
								id={`domain-${props.domainNumber}.${props.questionNumber}-radio-group`}
								value={props.expertPrediction}
								onValueChange={(e) => {
									props.setDomain((prev) => {
										const newDomain = { ...prev };
										const arrayCopy = [...newDomain.expertPrediction];
										arrayCopy[props.questionNumber - 1] = e;
										newDomain.expertPrediction = arrayCopy;
										return newDomain;
									});
								}}
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="no" id={`domain-${props.domainNumber}.${props.questionNumber}-no`}/>
									<Label htmlFor={`domain-${props.domainNumber}.${props.questionNumber}-no`}>No</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="probably no" id={`domain-${props.domainNumber}.${props.questionNumber}-probably-no`}/>
									<Label htmlFor={`domain-${props.domainNumber}.${props.questionNumber}-probably-no`}>Probably No</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="no information" id={`domain-${props.domainNumber}.${props.questionNumber}-no-information`}/>
									<Label htmlFor={`domain-${props.domainNumber}.${props.questionNumber}-no-information`}>No Information</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="probably yes" id={`domain-${props.domainNumber}.${props.questionNumber}-probably-yes`}/>
									<Label htmlFor={`domain-${props.domainNumber}.${props.questionNumber}-probably-yes`}>Probably Yes</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="yes" id={`domain-${props.domainNumber}.${props.questionNumber}-yes`}/>
									<Label htmlFor={`domain-${props.domainNumber}.${props.questionNumber}-yes`}>Yes</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="qa-na" id={`domain-${props.domainNumber}.${props.questionNumber}-qa-na`}/>
									<Label htmlFor={`domain-${props.domainNumber}.${props.questionNumber}-qa-na`}>Question Not Applicable</Label>
								</div>
							</RadioGroup>
						</div>
					</div>

					<div>
						<div className="text-base font-medium bg-yellow-200">Expert Explanation ✏️</div>
						<Textarea
							className="text-sm mt-2 h-[162px]"
							value={props.expertExplanation}
							onChange={(e) => {
								props.setDomain((prev) => {
									const newDomain = { ...prev };
									const arrayCopy = [...newDomain.expertExplanation];
									arrayCopy[props.questionNumber - 1] = e.currentTarget.value;
									newDomain.expertExplanation = arrayCopy;
									return newDomain;
								});
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
