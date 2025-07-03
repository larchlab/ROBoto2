import { Spinner } from "@fluentui/react-components";
import React, { useState, useEffect } from "react";

interface FunnySpinnerProps {
	messages: string[];
	rotationInterval: number;
}

/**
 * A spinner to lighten the mood....
 * @param param0
 * @returns
 */
const FunnySpinner: React.FC<FunnySpinnerProps> = ({
	messages,
	rotationInterval,
}) => {
	const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
		}, rotationInterval * 1000);

		return () => {
			clearInterval(intervalId);
		};
	}, [messages, rotationInterval]);

	return (
		<div>
			<Spinner label={messages[currentMessageIndex]} size="large" />
		</div>
	);
};

export default FunnySpinner;
