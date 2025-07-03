# Stage 1
# More information on multi-stage builds: https://pythonspeed.com/articles/multi-stage-docker-python/
FROM python:3.11 AS compile-image

# Copy the rest of the app
COPY . .

RUN apt-get -y update
RUN apt-get -y install git

# Explanation of the below: https://pythonspeed.com/articles/activate-virtualenv-dockerfile/
ENV VIRTUAL_ENV=/opt/venv
RUN python -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Upgrade pip
RUN pip install --upgrade pip

COPY requirements.txt .
RUN pip install -e .
RUN pip install -r requirements.txt

# Stage 2
FROM python:3.11-slim AS production-image
COPY --from=compile-image /opt/venv /opt/venv

# Copy the rest of the app
COPY . .

# Install Java and Gorbid
RUN apt-get -y update
RUN apt-get install -y default-jdk wget unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
RUN bash ./scripts/setup_grobid.sh

# Make sure we use the virtualenv from compile-image:
ENV PATH="/opt/venv/bin:$PATH"

EXPOSE 8000

# Make sure the script is executable
RUN chmod +x /start_container.sh

# Set the script as the entrypoint
ENTRYPOINT ["./start_container.sh"]