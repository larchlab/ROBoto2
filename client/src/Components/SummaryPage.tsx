import {
	domain1Results,
	domain2Results,
	domain3Results,
	domain4Results,
	domain5Results,
	paperEmbeddings,
} from "../State/Atoms";
import { Button } from "@fluentui/react-components";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Label } from "@/Components/ui/label";
import { sendJsonToS3, zip } from "../Actions/Helpers";
import { generateCsv, download } from "export-to-csv";
import {
	IRobResult,
	JSONBlobSchema,
	robotoBucketName,
} from "@/Constants/Types";
import {
	createClinicalBlob,
	createDeveloperReport,
} from "@/Actions/BlobHelpers";
import { useAtomValue } from "jotai";

function downloadJSON(data: JSONBlobSchema, filename: string): void {
	const json: string = JSON.stringify(data, null, 2); // Convert JSON data to string
	const blob: Blob = new Blob([json], { type: "application/json" }); // Create a Blob from the JSON data
	const url: string = URL.createObjectURL(blob); // Create a URL for the Blob

	const a: HTMLAnchorElement = document.createElement("a"); // Create a link element
	a.href = url;
	a.download = `${filename}.json`; // Set the file name
	document.body.appendChild(a);
	a.click(); // Programmatically click the link to trigger the download
	document.body.removeChild(a);
}

function FormatRiskLevel({
	riskLevel,
	domain,
	href,
}: {
	riskLevel: "Low Risk" | "Some Concerns" | "High Risk";
	domain: string;
	href: string;
}) {
	if (riskLevel === "Low Risk") {
		return (
			<a href={href}>
				<div className="bg-green-500 inline-block rounded-sm px-1">
					{domain}
				</div>
			</a>
		);
	} else if (riskLevel === "Some Concerns") {
		return (
			<a href={href}>
				<div className="bg-yellow-500 inline-block rounded-sm px-1">
					{domain}
				</div>
			</a>
		);
	} else if (riskLevel === "High Risk") {
		return (
			<a href={href}>
				<div className="bg-red-500 inline-block rounded-sm px-1">{domain}</div>
			</a>
		);
	}
}

export function SummaryPage({
	riskLevel,
	setOverallRiskLevel,
}: {
	riskLevel: "Low Risk" | "Some Concerns" | "High Risk" | null;
	setOverallRiskLevel: (riskLevel: string) => void;
}): JSX.Element {
	const domain1 = useAtomValue(domain1Results),
		domain2 = useAtomValue(domain2Results),
		domain3 = useAtomValue(domain3Results),
		domain4 = useAtomValue(domain4Results),
		domain5 = useAtomValue(domain5Results),
		pdfEmbeddings = useAtomValue(paperEmbeddings);

	const conductEval: Array<[number, IRobResult]> = zip(
		[1, 2, 3, 4, 5],
		[domain1, domain2, domain3, domain4, domain5],
	);

	async function downloadClinicalReport() {
		console.log("Downloading report...");

		const csvData = await createClinicalBlob(
			pdfEmbeddings,
			conductEval,
			riskLevel,
		);

		const devReport = await createDeveloperReport(
			pdfEmbeddings,
			conductEval,
			riskLevel,
			domain1,
			domain2,
			domain3,
			domain4,
			domain5,
		);

		await sendJsonToS3(
			robotoBucketName,
			devReport.file_name,
			JSON.stringify(devReport.json),
		);

		// Converts your Array<Object> to a CsvOutput string based on the configs
		const csv = generateCsv(csvData.csvConfig)(csvData.csvData);
		download(csvData.csvConfig)(csv);
	}

	async function downloadDeveloperReport() {
		console.log("Downloading report...");

		const devReport = await createDeveloperReport(
			pdfEmbeddings,
			conductEval,
			riskLevel,
			domain1,
			domain2,
			domain3,
			domain4,
			domain5,
		);

		await sendJsonToS3(
			robotoBucketName,
			devReport.file_name,
			JSON.stringify(devReport.json),
		);

		downloadJSON(devReport.json, devReport.file_name);
	}

	async function saveToDatabase() {
		const devReport = await createDeveloperReport(
			pdfEmbeddings,
			conductEval,
			riskLevel,
			domain1,
			domain2,
			domain3,
			domain4,
			domain5,
		);

		await sendJsonToS3(
			robotoBucketName,
			devReport.file_name,
			JSON.stringify(devReport.json),
		);
	}

	return (
		<div className={"q-a-result"}>
			<h2 className="text-2xl mb-1 font-bold" id="summary-page">
				Download Assessment
			</h2>
			<div className="mt-0 mb-0 bg-gray-100 rounded-md px-4 py-3 border-2 border-gray-200">
				<div className="text-xl font-medium ml-3">Overall Judgement</div>
				<div className="space-x-1 ml-3 mt-2 mb-3 text-base">
					<FormatRiskLevel
						domain="D1"
						riskLevel={domain1.riskLevel}
						href="#domain-1"
					/>
					<FormatRiskLevel
						domain="D2"
						riskLevel={domain2.riskLevel}
						href="#domain-2"
					/>
					<FormatRiskLevel
						domain="D3"
						riskLevel={domain3.riskLevel}
						href="#domain-3"
					/>
					<FormatRiskLevel
						domain="D4"
						riskLevel={domain4.riskLevel}
						href="#domain-4"
					/>
					<FormatRiskLevel
						domain="D5"
						riskLevel={domain5.riskLevel}
						href="#domain-5"
					/>
				</div>
				<div className="border-[1px] px-3 py-3 pt-1 rounded-md mt-2">
					<RadioGroup
						id={"summary-page-risk-level-radio-group"}
						value={riskLevel}
						onValueChange={(e) => {
							setOverallRiskLevel(e);
						}}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="Low Risk" id={"summary-page-low-risk-radio"}/>
							<Label
								htmlFor={"summary-page-low-risk-radio"}
								style={{
									backgroundColor:
										riskLevel === "Low Risk" ? "#b7eb8f" : "transparent",
								}}
								className="px-1 py-1 rounded-sm"
							>
								Low Risk
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="Some Concerns" id={"summary-page-some-concerns-radio"}/>
							<Label
								htmlFor={"summary-page-some-concerns-radio"}
								style={{
									backgroundColor:
										riskLevel === "Some Concerns" ? "#fffb8f" : "transparent",
								}}
								className="px-1 py-1 rounded-sm"
							>
								Some Concerns
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="High Risk" id={"summary-page-high-risk-radio"}/>
							<Label
								htmlFor={"summary-page-high-risk-radio"}
								style={{
									backgroundColor:
										riskLevel === "High Risk" ? "#ffa39e" : "transparent",
								}}
								className="px-1 py-1 rounded-sm"
							>
								High Risk
							</Label>
						</div>
					</RadioGroup>
				</div>
			</div>
			<p>
				Click "Download" to download a CSV copy of this assessment to your
				device. Please review each domain and validate LLM results before
				downloading the assessment.
			</p>
			<div className="grid-cols-3 gap-x-3 grid">
				<div>
					<Button
						className="w-full"
						appearance={"primary"}
						onClick={() => downloadClinicalReport()}
					>
						Download Researcher Version
					</Button>
				</div>
				<div>
					<Button
						className="w-full"
						appearance={"primary"}
						onClick={() => downloadDeveloperReport()}
					>
						Download Developer Version
					</Button>
				</div>
				<div>
					<Button
						className="w-full"
						appearance={"secondary"}
						onClick={() => saveToDatabase()}
					>
						Save to database
					</Button>
				</div>
			</div>
		</div>
	);
}
