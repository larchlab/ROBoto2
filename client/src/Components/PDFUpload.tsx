import { useState } from "react";
import { paperFile, paperUploadButtonState } from "../State/Atoms";
import { useAtom, useSetAtom } from "jotai";

export function PDFUpload(): JSX.Element {
	const [file, setFile] = useAtom(paperFile);
	const [isDragOver, setIsDragOver] = useState(false);
	const [isFileUploaded, setIsFileUploaded] = useState(false);
	const setIsButtonDisabled = useSetAtom(paperUploadButtonState);

	const handleDragEnter = (e: {
		preventDefault: () => void;
		stopPropagation: () => void;
	}) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(true);
	};

	const handleDragOver = (e: {
		preventDefault: () => void;
		stopPropagation: () => void;
	}) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isDragOver) {
			setIsDragOver(true);
		}
	};

	const handleDragLeave = (e: {
		preventDefault: () => void;
		stopPropagation: () => void;
	}) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
	};

	const handleDrop = (e: {
		preventDefault: () => void;
		stopPropagation: () => void;
		dataTransfer: { files: any };
	}) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
		const files = e.dataTransfer.files;
		if (files.length) {
			handleFileUpload(files[0]); // Assuming you want to handle the first file
		}
	};

	const handleFileUpload = (file: File) => {
		console.debug("File uploaded:", file);
		setFile(file);
		setIsButtonDisabled(false);
		setIsFileUploaded(true);
	};

	function onFileChange(e) {
		const file = e.target.files[0];
		handleFileUpload(file);
	}


	return (
		<div
			className={`file-uploader ${isDragOver ? "drag-over" : ""}`}
			onDragEnter={handleDragEnter}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<label
				htmlFor="file-upload"
				className="hover:cursor-pointer text-center py-2 bg-[#F8F9FA] font-medium rounded-md border-dashed border-slate-300 hover:border-blue-300  border-[1px] w-full"
			>
				<input
					id="file-upload"
					type="file"
					className="file-input"
					onChange={onFileChange}
					accept="application/pdf"
				/>
				<div>
					<div>
						{isFileUploaded ? "File uploaded!" : "Click to Upload a PDF"}
					</div>
					<div className="font-light">
						{isFileUploaded
							? (file.name ?? "Error with grabbing file name")
							: "...or drag and drop a file."}
					</div>
				</div>
			</label>
		</div>
	);
}
