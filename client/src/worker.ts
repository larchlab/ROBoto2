import { env, pipeline } from "@huggingface/transformers";

// Fixes a bug caused by bundler
env.allowLocalModels = false;
env.useBrowserCache = false;

class RetrieverPipeline {
	static instance = null;

	static async getInstance() {
		if (this.instance === null) {
			this.instance = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
		}

		return this.instance;
	}
}

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
	const extractor = await RetrieverPipeline.getInstance();

	if (extractor && event.data.task === "embed") {
		const results = {};

		for (let i = 0; i < event.data.paragraphs.length; i++) {
			const output = await extractor(event.data.paragraphs[i], {
				pooling: "mean",
				normalize: true,
			});
			results[`p-${i}`] = [...output.data]; // we need to convert it to an array from Float32Array otherwise it wont work
			results[`t-${i}`] = event.data.paragraphs[i]; // we save the equivalent text for later use
		}

		results["paragraph_count"] = event.data.paragraphs.length;

		// Send the output back to the main thread
		self.postMessage({
			status: "completed",
			embeddings: results,
		});
	}
});
