from django.utils import timezone

week_ago = timezone.now() - timezone(days=7)

print(week_ago)