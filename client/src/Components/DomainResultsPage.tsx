import { useEffect, useState } from "react";

import { DomainHeadings, IRobResult, ROBDomainRiskLevel, ROBResponse, RobResponses } from "../Constants/Types";
import { DomainResultsRow } from "./DomainResultsRow";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Label } from "@/Components/ui/label";
import { createHash } from "../Actions/Helpers";
import { PrimitiveAtom, useAtomValue } from "jotai";

interface IDomainPageResults {
	domainHeading: DomainHeadings;
	domainAtom: PrimitiveAtom<IRobResult>;
	domainNumber: number;
	setDomain: any;
	allPossibleParagraphs: string[];
}

function d1RiskLevel(q1: ROBResponse, q2: ROBResponse, q3: ROBResponse): ROBDomainRiskLevel {
	if (q2 === "Y" || q2 === "PY") {
		if (q1 === "N" || q1 === "PN") {
			return "Some Concerns";
		} else if (q3 === "Y" || q3 === "PY") {
			return "Some Concerns";
		} else {
			return "Low Risk";
		}
	} else if (q2 === "N" || q2 === "PN") {
		return "High Risk";
	} else if (q3 === "Y" || q3 === "PY") {
		return "High Risk";
	} else {
		return "Some Concerns";
	}
}

function d2RiskLevelp1(q1: ROBResponse, q2: ROBResponse, q3: ROBResponse, q4: ROBResponse, q5: ROBResponse) {
	if ((q1 === "N" || q1 === "PN") && (q2 === "N" || q2 === "PN")) {
		return "Low Risk";
	} else if (q3 === "N" || q3 === "PN") {
		return "Low Risk";
	} else if (q3 === "NI") {
		return "Some Concerns";
	} else if (q4 === "N" || q4 === "PN") {
		return "Some Concerns";
	} else if (q5 === "Y" || q5 === "PY") {
		return "Some Concerns";
	} else {
		return "High Risk";
	}
}

function d2RiskLevelp2(q6: ROBResponse, q7: ROBResponse): ROBDomainRiskLevel {
	if (q6 === "Y" || q6 === "PY") {
		return "Low Risk";
	} else if (q7 === "N" || q7 === "PN") {
		return "Some Concerns";
	} else {
		return "High Risk";
	}
}

function d2RiskLevel(q1: ROBResponse, q2: ROBResponse, q3: ROBResponse, q4: ROBResponse, q5: ROBResponse, q6: ROBResponse, q7: ROBResponse): ROBDomainRiskLevel {
	const p1 = d2RiskLevelp1(q1, q2, q3, q4, q5);
	const p2 = d2RiskLevelp2(q6, q7);
	if (p1 === "Low Risk" && p2 === "Low Risk") {
		return "Low Risk";
	} else if (p1 === "High Risk" || p2 === "High Risk") {
		return "High Risk";
	} else {
		return "Some Concerns";
	}
}

function d3RiskLevel(q1: ROBResponse, q2: ROBResponse, q3: ROBResponse, q4: ROBResponse): ROBDomainRiskLevel {
	if (q1 === "Y" || q1 === "PY") {
		return "Low Risk";
	} else if (q2 === "Y" || q2 === "PY") {
		return "Low Risk";
	} else if (q3 === "N" || q3 === "PN") {
		return "Low Risk";
	} else if (q4 === "N" || q4 === "PN") {
		return "Some Concerns";
	} else {
		return "High Risk";
	}
}


function d4RiskLevel(q1: ROBResponse, q2: ROBResponse, q3: ROBResponse, q4: ROBResponse, q5: ROBResponse): ROBDomainRiskLevel {
	if (q1 === "Y" || q1 === "PY") {
		return "High Risk";
	} else if (q2 === "Y" || q2 === "PY") {
		return "High Risk";
	} else {
		if (q2 === "NI") {
			if (q3 === "N" || q3 === "PN") {
				return "Some Concerns";
			} else if (q4 === "N" || q4 === "PN") {
				return "Some Concerns";
			} else if (q5 === "N" || q5 === "PN") {
				return "Some Concerns";
			} else {
				return "High Risk";
			}
		} else if (q2 === "N" || q2 === "PN") {
			if (q3 === "N" || q3 === "PN") {
				return "Low Risk";
			} else if (q4 === "N" || q4 === "PN") {
				return "Low Risk";
			} else if (q5 === "N" || q5 === "PN") {
				return "Some Concerns";
			} else {
				return "High Risk";
			}
		}
	}
}

/**
 * Calculate the risk level for domain 5
 * @param q1 
 * @param q2 
 * @param q3 
 * @returns 
 */
function d5RiskLevel(q1: ROBResponse, q2: ROBResponse, q3: ROBResponse): ROBDomainRiskLevel {
	if (q2 === "Y" || q2 === "PY") {
		return "High Risk";
	} else if (q3 === "Y" || q3 === "PY") {
		return "High Risk";
	} else if (q2 === "NI" || q3 === "NI") {
		return "Some Concerns";
	} else if (q1 === "Y" || q1 === "PY") {
		return "Low Risk";
	} else {
		return "Some Concerns";
	}
}

/**
 * TODO: We do need this step and we can return ROBResponse directly from the model
 * This function converts the models answer to the standardized format
 * @param pred 
 * @returns 
 */
function fPred(pred: string): ROBResponse {
	// Remove any leading/trailing whitespace
	const nromalizedPred = pred.toLowerCase().trim();

	if (nromalizedPred === "no") {
		return "N";
	} else if (nromalizedPred === "yes") {
		return "Y";
	} else if (nromalizedPred === "no information") {
		return "NI";
	} else if (nromalizedPred === "probably no") {
		return "PN";
	} else if (nromalizedPred === "probably yes") {
		return "PY";
	}
}

export function DisplayRisk(riskLevel: {
	riskLevel: ROBDomainRiskLevel
}) {
	let out = <></>;
	if (riskLevel.riskLevel === "Low Risk") {
		out = <span className="bg-green-500 px-2 py-1 rounded-sm">Low Risk</span>;
	} else if (riskLevel.riskLevel === "Some Concerns") {
		out = (
			<span className="bg-yellow-500 px-2 py-1 rounded-sm">Some Concerns</span>
		);
	} else if (riskLevel.riskLevel === "High Risk") {
		out = <span className="bg-red-500 px-2 py-1 rounded-sm">High Risk</span>;
	} else {
		return <></>;
	}
	return (
		<span className="text-sm font-normal mb-1 px-1 align-middle inline-block">
			{out}
		</span>
	);
}

export function DomainResultsPage(props: IDomainPageResults): JSX.Element {
	const domainResults = useAtomValue(props.domainAtom);
	const [renderContent, setRenderContent] = useState([<></>]);
	// [riskLevel, setRiskLevel] = useState<"Low Risk" | "Some Concerns" | "High Risk" | null>(null);
	const riskLevel = domainResults.riskLevel;

	function setRiskLevel(riskLevel) {
		props.setDomain((old) => {
			return {
				...old,
				riskLevel: riskLevel,
			};
		});
	}
	function updateRiskLevel() {
		if (props.domainNumber === 1) {
			setRiskLevel(
				d1RiskLevel(
					fPred(domainResults.expertPrediction[0]),
					fPred(domainResults.expertPrediction[1]),
					fPred(domainResults.expertPrediction[2]),
				),
			);
		} else if (props.domainNumber === 2) {
			setRiskLevel(
				d2RiskLevel(
					fPred(domainResults.expertPrediction[0]),
					fPred(domainResults.expertPrediction[1]),
					fPred(domainResults.expertPrediction[2]),
					fPred(domainResults.expertPrediction[3]),
					fPred(domainResults.expertPrediction[4]),
					fPred(domainResults.expertPrediction[5]),
					fPred(domainResults.expertPrediction[6]),
				),
			);
		} else if (props.domainNumber === 3) {
			setRiskLevel(
				d3RiskLevel(
					fPred(domainResults.expertPrediction[0]),
					fPred(domainResults.expertPrediction[1]),
					fPred(domainResults.expertPrediction[2]),
					fPred(domainResults.expertPrediction[3]),
				),
			);
		} else if (props.domainNumber === 4) {
			setRiskLevel(
				d4RiskLevel(
					fPred(domainResults.expertPrediction[0]),
					fPred(domainResults.expertPrediction[1]),
					fPred(domainResults.expertPrediction[2]),
					fPred(domainResults.expertPrediction[3]),
					fPred(domainResults.expertPrediction[4]),
				),
			);
		} else if (props.domainNumber === 5) {
			setRiskLevel(
				d5RiskLevel(
					fPred(domainResults.expertPrediction[0]),
					fPred(domainResults.expertPrediction[1]),
					fPred(domainResults.expertPrediction[2]),
				),
			);
		}
	}

	useEffect(() => {
		if (domainResults.expertPrediction.length > 0) {
			updateRiskLevel();
		}
	}, [domainResults.expertPrediction]);

	useEffect(() => {
		if (
			domainResults.questions &&
			domainResults.gptResponses &&
			domainResults.questions.length > 0 &&
			domainResults.paragraphs.length > 0 &&
			domainResults.paragraphScores.length > 0
		) {
			const returnElements = [];
			const hiddenQuestions = new Set<number>();

			for (let i = 0; i < domainResults.questions.length; i++) {
				const questionHash = createHash(domainResults.questions[i]);
				const defaultSelection: RobResponses =
					domainResults.questionToAnswers[questionHash] ||
					RobResponses.no_information;
				let isHidden = false;

				// Domain 2
				if (props.domainNumber === 2) {
					if (
						i + 1 === 3 &&
						fPred(domainResults.expertPrediction[0]) !== "Y" &&
						fPred(domainResults.expertPrediction[0]) !== "PY" &&
						fPred(domainResults.expertPrediction[0]) !== "NI" &&
						fPred(domainResults.expertPrediction[1]) !== "Y" &&
						fPred(domainResults.expertPrediction[1]) !== "PY" &&
						fPred(domainResults.expertPrediction[1]) !== "NI"
					) {
						// check if 2.1 or 2.2 have Y/PY/NI
						isHidden = true;
						hiddenQuestions.add(i + 1);
					} else if (
						i + 1 === 4 &&
						!hiddenQuestions.has(3) &&
						fPred(domainResults.expertPrediction[2]) !== "N" &&
						fPred(domainResults.expertPrediction[2]) !== "NI" &&
						fPred(domainResults.expertPrediction[2]) !== "PN"
					) {
						// check if 2.3 is hidden
						isHidden = true;
						hiddenQuestions.add(i + 1);
					} else if (
						i + 1 === 5 &&
						!hiddenQuestions.has(4) &&
						fPred(domainResults.expertPrediction[3]) !== "N" &&
						fPred(domainResults.expertPrediction[3]) !== "PN"
					) {
						isHidden = true;
						hiddenQuestions.add(i + 1);
					} else if (
						i + 1 === 7 &&
						(fPred(domainResults.expertPrediction[5]) === "N" ||
							fPred(domainResults.expertPrediction[5]) === "PN" ||
							fPred(domainResults.expertPrediction[5]) === "NI")
					) {
						isHidden = true;
						hiddenQuestions.add(i + 1);
					}
				} else if (props.domainNumber === 3) {
					if (
						i + 1 === 2 &&
						fPred(domainResults.expertPrediction[0]) !== "Y" &&
						fPred(domainResults.expertPrediction[0]) !== "PY"
					) {
						isHidden = true;
						hiddenQuestions.add(i + 1);
					} else if (
						i + 1 === 3 &&
						hiddenQuestions.has(2) &&
						fPred(domainResults.expertPrediction[1]) !== "Y" &&
						fPred(domainResults.expertPrediction[1]) !== "PY" &&
						fPred(domainResults.expertPrediction[1]) !== "NI"
					) {
						isHidden = true;
						hiddenQuestions.add(i + 1);
					} else if (
						i + 1 === 4 &&
						hiddenQuestions.has(3) &&
						fPred(domainResults.expertPrediction[2]) !== "N" &&
						fPred(domainResults.expertPrediction[2]) !== "PN"
					) {
						isHidden = true;
						hiddenQuestions.add(i + 1);
					}
				} else if (props.domainNumber === 4) {
					if (
						i + 1 === 3 &&
						fPred(domainResults.expertPrediction[0]) !== "Y" &&
						fPred(domainResults.expertPrediction[0]) !== "PY" &&
						fPred(domainResults.expertPrediction[1]) !== "Y" &&
						fPred(domainResults.expertPrediction[1]) !== "PY"
					) {
						isHidden = true;
						hiddenQuestions.add(i + 1);
					} else if (
						i + 1 === 4 &&
						hiddenQuestions.has(3) &&
						fPred(domainResults.expertPrediction[2]) !== "N" &&
						fPred(domainResults.expertPrediction[2]) !== "PN"
					) {
						isHidden = true;
						hiddenQuestions.add(i + 1);
					} else if (
						i + 1 === 5 &&
						hiddenQuestions.has(4) &&
						fPred(domainResults.expertPrediction[3]) !== "N" &&
						fPred(domainResults.expertPrediction[3]) !== "PN"
					) {
						isHidden = true;
						hiddenQuestions.add(i + 1);
					}
				}

				returnElements.push(
					<DomainResultsRow
						domainAtom={props.domainAtom}
						questionNumber={i + 1}
						isHidden={isHidden}
						domainNumber={props.domainNumber}
						questionHash={questionHash}
						question={domainResults.questions[i]}
						defaultSelection={defaultSelection}
						gptResponse={
							domainResults.gptResponses[i].choices[0].message.content
						}
						ctxParagraph1={domainResults.paragraphs[i][0]}
						ctxParagraph2={domainResults.paragraphs[i][1]}
						ctxParagraph3={domainResults.paragraphs[i][2]}
						ctxP1Score={domainResults.paragraphScores[i][0].toFixed(3) || "0.0"}
						ctxP2Score={domainResults.paragraphScores[i][1].toFixed(3) || "0.0"}
						ctxP3Score={domainResults.paragraphScores[i][2].toFixed(3) || "0.0"}
						addedParagraphs={domainResults.addedParagraphs}
						paragraphsFeedback={domainResults.paragraphsFeedback[i]}
						expertPrediction={domainResults.expertPrediction[i]}
						expertExplanation={domainResults.expertExplanation[i]}
						gptPrediction={domainResults.gptPrediction[i]}
						gptExplanation={domainResults.gptExplanation[i]}
						setDomain={props.setDomain}
						allPossibleParagraphs={props.allPossibleParagraphs}
					/>,
				);
			}

			setRenderContent(returnElements);
		}
	}, [domainResults.questions, domainResults.gptResponses, domainResults]);

	return (
		<div className="domain-results-page mb-16">
			<h2
				className="text-2xl mb-2 font-bold"
				id={`domain-${props.domainNumber}`}
			>
				Domain {props.domainNumber}: {props.domainHeading}
			</h2>
			{renderContent.map((element) => element)}
			<div className="mt-12 mb-0 bg-gray-100 rounded-md px-4 py-3 border-2 border-gray-200">
				<div className="text-xl font-medium ml-3">
					Domain {props.domainNumber} Risk Level:
				</div>
				<div className="border-[1px] px-3 py-3 pt-1 rounded-md mt-2">
					<RadioGroup
						id={`domain-${props.domainNumber}-risk-level-radio-group`}
						value={riskLevel}
						onValueChange={(e) => {
							// TODO: We should track this in some sort of telemetry
							props.setDomain((prev) => {
								const newDomain = { ...prev };
								newDomain.riskLevel = e;
								return newDomain;
							});
						}}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="Low Risk" id={`domain-${props.domainNumber}-low-risk-radio`} />
							<Label htmlFor={`domain-${props.domainNumber}-low-risk-radio`} style={{
									backgroundColor:
										riskLevel === "Low Risk" ? "#b7eb8f" : "transparent",
								}}>
								Low Risk
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="Some Concerns" id={`domain-${props.domainNumber}-some-concerns-radio`} />
							<Label htmlFor={`domain-${props.domainNumber}-some-concerns-radio`} style={{
									backgroundColor:
										riskLevel === "Some Concerns" ? "#fffb8f" : "transparent",
								}}>Some Concerns</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="High Risk" id={`domain-${props.domainNumber}-high-risk-radio`} />
							<Label htmlFor={`domain-${props.domainNumber}-high-risk-radio`} style={{
									backgroundColor:
										riskLevel === "High Risk" ? "#ffa39e" : "transparent",
								}}>High Risk</Label>
						</div>
					</RadioGroup>
				</div>
			</div>
		</div>
	);
}
