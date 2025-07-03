import React, { useState } from "react";
import { paperUploadButtonState, paperUrl } from "../State/Atoms";
import { useId } from "@fluentui/react-components";
import { Input } from "@/Components/ui/input";
import { useSetAtom } from "jotai";

/**
 *
 * @returns
 */
function URLUpload() {
	const setUrl = useSetAtom(paperUrl);
	const setIsButtonDisabled = useSetAtom(paperUploadButtonState);

	const [valState, setValState] = useState<
		"error" | "warning" | "success" | "none"
	>("none");
	const [valMessage, setValMessage] = useState("");
	const inputId = useId("urlInput");

	function handleChange(ev: React.ChangeEvent<HTMLInputElement>): void {
		// Lets check the value of the input ends with .pdf
		const value = ev.target.value;
		if (value.endsWith(".pdf")) {
			setUrl(value);
			setIsButtonDisabled(false);
			setValState("success");
			setValMessage("This is a valid link!");
		} else {
			setIsButtonDisabled(true);
			setValState("error");
			setValMessage("Please make sure the link ends with .pdf");
		}
	}

	return (
		<div>
			<div className="pl-3 mb-1 font-medium">Paste a URL to a PDF:</div>
			<Input
				id={inputId}
				onChange={handleChange}
				placeholder="PDF URL"
				className="text-xs h-9"
			/>
		</div>
	);
}

export default URLUpload;
