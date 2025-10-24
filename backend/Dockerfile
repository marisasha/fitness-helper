FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl build-essential \
    && rm -rf /var/lib/apt/lists/*


COPY requirments.txt .
RUN pip install --no-cache-dir -r requirments.txt

COPY . .

COPY ../front /app/react
WORKDIR /app/react
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install \
    && npm run build

WORKDIR /app
RUN mkdir -p /app/static && cp -r /app/react/build/* /app/static/

RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "django_settings.wsgi:application", "--bind", "0.0.0.0:8000"]
