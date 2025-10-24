FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirments.txt .
RUN pip install --no-cache-dir -r requirments.txt

COPY . .

RUN mkdir -p /app/static
COPY react/build /app/static

RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "django_settings.wsgi:application", "--bind", "0.0.0.0:8000"]