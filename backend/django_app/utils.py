from rest_framework.response import Response
from django_settings import settings
from rest_framework import status
from django.core.cache import caches
from django_app import models
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
import os, random
import redis


class Cache:

    RedisCache = caches["default"]

    @staticmethod
    def get_cache(
        key: str,
        query: callable = lambda: any,
        timeout: int = 60,
        cache: any = RedisCache,
    ) -> any:
        data = cache.get(key)
        if data is None:
            data = query()
            cache.set(key, data, timeout)
        return data

    @staticmethod
    def delete_cache(key: str, cache: any = RedisCache) -> None:
        cache.delete(key)

    @staticmethod
    def delete_by_pattern(pattern: str) -> None:
        r = redis.Redis.from_url(settings.CACHES["default"]["LOCATION"])
        for key in r.scan_iter(pattern):
            r.delete(key)


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #

def get_random_workout_image():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    folder_path = os.path.join(project_root, "media", "workout_avatar")
    files = os.listdir(folder_path)
    filename = random.choice(files)
    return f"/workout_avatar/{filename}"

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #

def get_reward_for_completing_achievement(user_id: int):

    user = User.objects.get(id=user_id)
    if not user:
        raise Exception(f"Server error: User with id {user_id} not found")

    now = timezone.localtime()
    today_workouts = models.Workout.objects.filter(
        user=user,
        is_active=False,
        start_time__date=now.date()
    )

    if today_workouts.count() >= 2 :
        return 

    completing_workout = today_workouts.first()
    if not completing_workout:
        return
    


    user_workouts = models.Workout.objects.filter(user=user, is_active=False)
    counter_start_for_add = 0

# =-=-=Проведение тренировки=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #

    try:


        achievement_1 = "Проведение тренировки"
        models.UserRewardsLogs.objects.create(
            user=user,
            count_of_added_stars=1,
            achievement=achievement_1
        )
        counter_start_for_add += 1
    except Exception as e:
        raise Exception(f"Server error in issuance reward with achievement: {achievement_1}")

# =-=-=Проведение тренировок 2 дня подряд=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #
    try:
        achievement_2 = "Проведение тренировок 2 дня подряд"
        workouts_for_last_day = user_workouts.filter(
            start_time__date=(now - timedelta(days=1)).date()
        ).count()
        if workouts_for_last_day > 0:
            models.UserRewardsLogs.objects.create(
                user=user,
                count_of_added_stars=2,
                achievement=achievement_2
            )
            counter_start_for_add += 2
    except Exception as e:
        raise Exception(f"Server error in issuance reward with achievement: {achievement_2}")
    
# =-=-=Выполнение 5-ти или более упражнений за тренировку=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #
    try:
        achievement_3 = "Выполнение 5-ти или более упражнений за тренировку"
        if models.FactualExercise.objects.filter(workout=completing_workout).count() >= 5:
            models.UserRewardsLogs.objects.create(
                user=user,
                count_of_added_stars=1,
                achievement=achievement_3
            )
            counter_start_for_add += 1
    except Exception as e:
        raise Exception(f"Server error in issuance reward with achievement: {achievement_3}")

# =-=-=Тренировка продолжительностью более 2-ух часов=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #
    try:
        achievement_4 = "Тренировка продолжительностью более 2-ух часов"
        is_workout_more_two_hours = completing_workout.finish_time - completing_workout.start_time
        if is_workout_more_two_hours.total_seconds() / 3600 >= 2:
            models.UserRewardsLogs.objects.create(
                user=user,
                count_of_added_stars=1,
                achievement=achievement_4
            )
            counter_start_for_add += 1
    except Exception as e:
        raise Exception(f"Server error in issuance reward with achievement: {achievement_4}")


# =-=-=Выполнение достижения=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #
    try:
        user_reward_statuses = models.UserRewardStatuses.objects.filter(user=user)
        user_reward_ids = {u.exercise_reward.id for u in user_reward_statuses}

        exercise_reward_statuses = models.ExerciseRewardStatuses.objects.all()
        exercises_completing_workout = models.FactualExercise.objects.filter(
            workout=completing_workout,
            factual_exercise__weight_exercise_equipment__isnull=False
        )

        for exercise_completing_workout in exercises_completing_workout:
            for exercise_reward_status in exercise_reward_statuses:
                if exercise_completing_workout.name == exercise_reward_status.exercise.name:
                    user_exercise_approaches = models.FactualApproach.objects.filter(
                        exercise=exercise_completing_workout
                    )
                    if exercise_reward_status.criteria == "weight":
                        criteria = "вес"
                        unit_of_measurement = "кг"
                        achieved = any(
                            approach.weight_exercise_equipment >= exercise_reward_status.required_result
                            for approach in user_exercise_approaches
                        )
                    elif exercise_reward_status.criteria == "approach":
                        criteria = "выполнений"
                        unit_of_measurement = "раз"
                        achieved = any(
                            approach.count_approach >= exercise_reward_status.required_result
                            for approach in user_exercise_approaches
                        )
                    elif exercise_reward_status.criteria == "time":
                        criteria = "время"
                        unit_of_measurement = "минут"
                        achieved = any(

                            approach.factual_time  >= exercise_reward_status.required_result
                            for approach in user_exercise_approaches
                        )
                    if achieved and exercise_reward_status.id not in user_reward_ids:
                        models.UserRewardStatuses.objects.create(
                            user=user,
                            exercise_reward=exercise_reward_status
                        )
                        achievement_5 = f"Выполнение достижения: {exercise_reward_status.exercise.name} - {criteria} {exercise_reward_status.required_result} {unit_of_measurement}"
                        models.UserRewardsLogs.objects.create(
                            user=user,
                            count_of_added_stars=50,
                            achievement=achievement_5
                        )
                        counter_start_for_add += 50
                        user_reward_ids.add(exercise_reward_status.id)

    except Exception as e:
        raise Exception(f"Server error in issuance reward with achievement: Выполнение достижения")

    profile = models.Profile.objects.get(user=user)
    profile.stars += counter_start_for_add
    profile.save()
