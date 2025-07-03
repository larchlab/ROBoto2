# Roboto2

This repo contains data and code for the Roboto2 project.

## Structure
Contents: 
- dataset/:
    - Contains the ROBoto2 dataset
- api/:
    - Contains the code for the API
    - roboto2/:
        - Main source code for the API as well as the Dockerfiles
        - test/:
            - Contains the code for testing the ROB-2 API
- client/:
    - Contains the code for the React frontend

## API

### Running the API via Docker

```bash
docker build -t roboto2/rob-api .
docker run --env-file .env -p 8000:8000 roboto2/rob-api
```

## Setup
Windows:
```sh
# Step 1: Create a virtualenv called '.venv'
py -3.11 -m venv .venv

# Step 2: Activate the virtualenv 
.venv\Scripts\Activate.ps1 # windows
.... # linux/MacOS

# Step 3: Upgrade pip
python -m pip install --upgrade pip

# Step 4: Install the requirements from requirements.txt
pip install -r requirements.txt
pip install https://s3-us-west-2.amazonaws.com/ai2-s2-scispacy/releases/v0.5.4/en_core_sci_md-0.5.4.tar.gz
```

Linux/MacOS:
```sh
# Step 1: Create a virtualenv called '.venv'
python3.11 -m venv .venv

# Step 2: Activate the virtualenv
source .venv/bin/activate

# Step 3: Upgrade pip
python -m pip install --upgrade pip

# Step 4: Install the requirements from requirements.txt
pip install -r requirements.txt
pip install https://s3-us-west-2.amazonaws.com/ai2-s2-scispacy/releases/v0.5.4/en_core_sci_md-0.5.4.tar.gz
```

## Frontend

Prior to running the frontend, you must have the API running. See the API section above for more information.

```bash
cd client
npm ci # Does a clean install of the dependencies that are explicitly listed in package.json
npm run dev # Opens a browser window to http://localhost:5173/
```