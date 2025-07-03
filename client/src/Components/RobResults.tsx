import {
	domain1Results,
	domain2Results,
	domain3Results,
	domain4Results,
	domain5Results,
	domainResultsProcessing,
	paperEmbeddings,
} from "../State/Atoms";
import { useEffect, useState } from "react";
import { runRobEval } from "../Actions/RunROB";
import { DomainHeadings } from "../Constants/Types";
import { DomainResultsPage } from "./DomainResultsPage";
import { zip } from "../Actions/Helpers";
import { SummaryPage } from "./SummaryPage";
import JSON5 from "json5";
import { useAtom, useAtomValue } from "jotai";
import { Spinner } from "@fluentui/react-components";

function Scroller() {
	const [activeId, setActiveId] = useState(null);

	const handleScrollAndResize = () => {
		const sections = [
			"domain-1",
			"domain-2",
			"domain-3",
			"domain-4",
			"domain-5",
			"summary-page",
		];
		let currentActiveId = null;

		// for the sidebar, we want to highlight the section that is currently in view
		// this code will find the first section that is in view and highlight it
		for (let i = 0; i < sections.length; i++) {
			const section = document.getElementById(sections[i]);
			if (section) {
				const rect = section.getBoundingClientRect();
				if (
					rect.top <= window.innerHeight &&
					(!sections[i + 1] ||
						document.getElementById(sections[i + 1]).getBoundingClientRect()
							.top > window.innerHeight)
				) {
					currentActiveId = sections[i];
					break;
				}
			}
		}
		if (currentActiveId !== activeId) {
			setActiveId(currentActiveId);
		}
	};

	useEffect(() => {
		const resizeObserver = new ResizeObserver(() => {
			handleScrollAndResize();
		});

		const content = document.body; // Or a specific container element
		resizeObserver.observe(content);

		window.addEventListener("scroll", handleScrollAndResize);
		window.addEventListener("resize", handleScrollAndResize);

		// Call the handler initially to set the active section correctly on mount
		handleScrollAndResize();

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("scroll", handleScrollAndResize);
			window.removeEventListener("resize", handleScrollAndResize);
		};
	}, []);

	return (
		<div className="sticky top-4 self-start">
			<b>Contents</b>
			<br />
			<a
				href="#domain-1"
				style={{ fontWeight: activeId === "domain-1" ? "bold" : "normal" }}
			>
				Domain 1
			</a>
			<br />
			<a
				href="#domain-2"
				style={{ fontWeight: activeId === "domain-2" ? "bold" : "normal" }}
			>
				Domain 2
			</a>
			<br />
			<a
				href="#domain-3"
				style={{ fontWeight: activeId === "domain-3" ? "bold" : "normal" }}
			>
				Domain 3
			</a>
			<br />
			<a
				href="#domain-4"
				style={{ fontWeight: activeId === "domain-4" ? "bold" : "normal" }}
			>
				Domain 4
			</a>
			<br />
			<a
				href="#domain-5"
				style={{ fontWeight: activeId === "domain-5" ? "bold" : "normal" }}
			>
				Domain 5
			</a>
			<br />
			<a
				href="#summary-page"
				style={{ fontWeight: activeId === "summary-page" ? "bold" : "normal" }}
			>
				Download
			</a>
		</div>
	);
}

export function ROBResultsPage(): JSX.Element {
	const [isDomainProcessing, setDomainProcessing] = useAtom(domainResultsProcessing);
	const pdfEmbeddings = useAtomValue(paperEmbeddings);
	const [domain1Value, setDomain1] = useAtom(domain1Results);
	const [domain2Value, setDomain2] = useAtom(domain2Results);
	const [domain3Value, setDomain3] = useAtom(domain3Results);
	const [domain4Value, setDomain4] = useAtom(domain4Results);
	const [domain5Value, setDomain5] = useAtom(domain5Results);
	const [overallRisk, setOverallRisk] = useState(null);
	const [prevRisks, setPrevRisks] = useState([null, null, null, null, null]);

	const conductEval = zip(
		[1, 2, 3, 4, 5],
		[setDomain1, setDomain2, setDomain3, setDomain4, setDomain5],
	);
	//const conductEval = zip([1], [setDomain1]); // used for testing

	const allPossibleParagraphs = [
		...Array(pdfEmbeddings["paragraph_count"]).keys(),
	].map((i) => pdfEmbeddings[`t-${i}`]) as string[];

	const risks = [
		domain1Value.riskLevel,
		domain2Value.riskLevel,
		domain3Value.riskLevel,
		domain4Value.riskLevel,
		domain5Value.riskLevel,
	];
	// low risk if all are low
	// if any high risk, overall is high
	// otherwise, some concerns
	useEffect(() => {
		const allSameAsPrev = risks.every((r, i) => r === prevRisks[i]);
		if (allSameAsPrev) {
			return;
		}
		if (risks.every((r) => r === "Low Risk")) {
			setOverallRisk("Low Risk");
		} else if (risks.some((r) => r === "High Risk")) {
			setOverallRisk("High Risk");
		} else {
			setOverallRisk("Some Concerns");
		}
		setPrevRisks(risks);
	}, [risks]);

	/**
	 * This useEffect helps kick off the rob assessments once this component is loaded.
	 */
	useEffect(() => {
		// Use a traditional for loop since a forEach does not play nicely with async/await
		for (let i = 0; i < conductEval.length; i++) {
			const domain_number = conductEval[i][0];
			const setDomain = conductEval[i][1];

			runRobEval(pdfEmbeddings, domain_number)
				.then((value) => {
					value["expertPrediction"] = [];
					value["expertExplanation"] = [];
					value["gptPrediction"] = [];
					value["gptExplanation"] = [];
					value["riskLevel"] = null;
					// for each value, parse the GPT JSON
					value.gptResponses.forEach((v, i) => {
						let gptJson = { prediction: "ERROR", explanation: "ERROR" };
						try {
							gptJson = JSON5.parse(v.choices[0].message.content);
						} catch (error) {
							console.error("Error parsing GPT JSON: ", error);
						}
						let gptPredictionVal = gptJson.prediction

						// if the prediction is not a string, set it to "ERROR"
						if (typeof gptPredictionVal !== "string") {
							gptPredictionVal = "ERROR";
						} else {
							// If it is a valid string we normalize it
							gptPredictionVal = gptPredictionVal.toLowerCase().trim();
						}

						value["expertPrediction"].push(gptPredictionVal);
						value["expertExplanation"].push(gptJson.explanation);
						value["gptPrediction"].push(gptPredictionVal);
						value["gptExplanation"].push(gptJson.explanation);
					});

					setDomain(value);
					// console.log(
					// 	`Success fetching data for domain ${domain_number}:`,
					// 	value,
					// );
				})
				.catch((error) => {
					console.log(`Error with running domain ${domain_number}: `, error);
				});
		}
	}, []);

	return (
		<div className="grid grid-cols-[150px_1fr] mt-16 max-w-6xl mx-auto">
			<Scroller />
				<div className="mb-16 px-5">
					<DomainResultsPage
						key={1}
						domainHeading={DomainHeadings.domain1}
						domainNumber={1}
						domainAtom={domain1Results}
						setDomain={setDomain1}
						allPossibleParagraphs={allPossibleParagraphs}
					/>
					<DomainResultsPage
						key={2}
						domainHeading={DomainHeadings.domain2}
						domainNumber={2}
						domainAtom={domain2Results}
						setDomain={setDomain2}
						allPossibleParagraphs={allPossibleParagraphs}
					/>
					<DomainResultsPage
						key={3}
						domainHeading={DomainHeadings.domain3}
						domainNumber={3}
						domainAtom={domain3Results}
						setDomain={setDomain3}
						allPossibleParagraphs={allPossibleParagraphs}
					/>
					<DomainResultsPage
						key={4}
						domainHeading={DomainHeadings.domain4}
						domainNumber={4}
						domainAtom={domain4Results}
						setDomain={setDomain4}
						allPossibleParagraphs={allPossibleParagraphs}
					/>
					<DomainResultsPage
						key={5}
						domainHeading={DomainHeadings.domain5}
						domainNumber={5}
						domainAtom={domain5Results}
						setDomain={setDomain5}
						allPossibleParagraphs={allPossibleParagraphs}
					/>
					<SummaryPage
						riskLevel={overallRisk}
						setOverallRiskLevel={setOverallRisk}
					/>
				</div>
		</div>
	);
}
