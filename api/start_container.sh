#!/bin/bash

# Start the Grobid service in the background
bash ./scripts/run_grobid.sh & uvicorn roboto2.api.main:app --host 0.0.0.0 --port 8000 --log-level 'debug' --timeout-keep-alive 60