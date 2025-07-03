from fastapi import Body, FastAPI, File, UploadFile, HTTPException, Request
import hashlib
import requests
from fastapi.middleware.cors import CORSMiddleware
from roboto2.grobid2json.process_pdf import process_pdf_stream
from typing import Union
from pydantic import BaseModel
from roboto2.services.openai_client import get_completion
from roboto2.services.s3_client import upload_json_to_s3
import os

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3232",
    "http://localhost:5000",
    "http://localhost:5173",
    "https://roboto2.vercel.app",
    "https://gentle-bush-031b6030f.5.azurestaticapps.net"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload_file")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename
    if filename.endswith('pdf'):
        pdf_content = await file.read()
        pdf_sha = hashlib.sha1(pdf_content).hexdigest()
        results = process_pdf_stream(filename, pdf_sha, pdf_content)
        return results
    else:
        raise HTTPException(status_code=400, detail="Unknown file type!")

@app.post("/upload_url")
async def upload_url(requestInfo: dict = Body(...)):
    filename = "unknown"   
    try:
        response = requests.get(requestInfo["url"])
        content_type = response.headers.get('Content-Type', '').lower()
        
        # Check if content type indicates PDF
        if 'application/pdf' not in content_type:
            raise HTTPException(status_code=400, detail="URL does not point to a PDF file")
            
        pdf_content = response.content
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Error downloading file: {e}")
    
    pdf_sha = hashlib.sha1(pdf_content).hexdigest()
    results = process_pdf_stream(filename, pdf_sha, pdf_content)

    return results

class Prompt(BaseModel):
    texts: list[str]
    model: Union[str, None] = None

@app.post("/oai_completion")
async def oai_completion(requestInfo: dict = Body(...)):
    texts =  requestInfo["texts"]
    model = requestInfo["model"]

    try:
        responses = []
        for text in texts:
            response = get_completion(text)
            responses.append(response)
        return {"responses": responses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-json")
async def upload_json(requestInfo: dict = Body(...)):
    try:
        bucket_name = os.environ.get("S3_BUCKET_NAME")
        json_string = requestInfo.get("json")
        file_name = requestInfo.get("file_name")

        if not json_string:
            raise HTTPException(status_code=400, detail="No JSON data provided")
        
        if not file_name:
            raise HTTPException(status_code=400, detail="No file name provided")
        
        result = upload_json_to_s3(json_string, bucket_name, file_name)

        if result is None:
            raise HTTPException(status_code=500, detail="Error uploading JSON to S3")
        
        return {"status": "success", "s3_result": result}
    except Exception as e:
        print(f"Error uploading JSON to S3: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))