export const RobotoAPI = {
	baseUrl: "https://rob-demo-api-temp-czgfe4gng4b3hccu.canadacentral-01.azurewebsites.net", //'http://localhost:8000',
	uploadUrlEndpoint: "upload_url",
	uploadFileEndpoint: "upload_file",
	oaiCompletion: "oai_completion",
	uploadS3Endpoint: "upload-json",
	headers: {
		"Content-Type": "application/x-www-form-urlencoded",
	},
	timeout: 30000,
};