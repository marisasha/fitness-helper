from django.contrib import admin
from django_app import models

admin.site.register(models.Profile)
admin.site.register(models.Friends)
admin.site.register(models.PlannedExercise)
admin.site.register(models.PlannedApproach)
admin.site.register(models.FactualApproach)
admin.site.register(models.FactualExercise)
admin.site.register(models.Workout)
admin.site.register(models.Exercises)
admin.site.register(models.WorkoutPurpose)

