from django.contrib.auth.models import User
from rest_framework import serializers
from django_app import models,utils

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #

class UserRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=2)
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    name = serializers.CharField(min_length=2)
    surname = serializers.CharField(min_length=2)
    birth_date = serializers.DateTimeField()
    weight = serializers.IntegerField()
    height = serializers.IntegerField()
    avatar = serializers.FileField(required=False)

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #

class UserChangeProfile(serializers.Serializer):
    username = serializers.CharField(required=False,min_length=2)
    password = serializers.CharField(required=False,write_only=True)
    name = serializers.CharField(required=False,min_length=2)
    surname = serializers.CharField(required=False,min_length=2)
    birth_date = serializers.DateTimeField(required=False)
    weight = serializers.IntegerField(required=False)
    height = serializers.IntegerField(required=False)
    avatar = serializers.FileField(required=False)
    delete_avatar = serializers.BooleanField(required=False)

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #

class FriendsStatusChangerSerializer(serializers.Serializer):
    from_user = serializers.IntegerField()
    to_user = serializers.IntegerField()

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #

class PlannedApproachSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PlannedApproach
        fields = [
            "planned_time",
            "speed_exercise_equipment",
            "weight_exercise_equipment",
            "count_approach",
        ]


class PlannedExerciseSerializer(serializers.ModelSerializer):
    approaches = PlannedApproachSerializer(many=True)

    class Meta:
        model = models.PlannedExercise
        fields = ["name", "approaches"]


class WorkoutSerializer(serializers.ModelSerializer):
    exercises = PlannedExerciseSerializer(many=True)

    class Meta:
        model = models.Workout
        fields = ["name", "user", "type", "exercises", "avatar"]

    def create(self, validated_data):
        workout = None
        try:
            exercises_data = validated_data.pop("exercises", [])
            workout = models.Workout.objects.create(**validated_data)
            workout.avatar = utils.get_random_workout_image()
            workout.save()

            for ex in exercises_data:
                exercise_name = ex.get("name")
                if exercise_name:
                    models.Exercises.objects.get_or_create(
                        user=workout.user,
                        name=exercise_name
                    )

            for ed in exercises_data:
                approaches_data = ed.pop("approaches", [])
                planned_exercise = models.PlannedExercise.objects.create(
                    workout=workout,
                    name=ed.get("name", "Без названия")
                )
                if approaches_data:
                    models.PlannedApproach.objects.bulk_create([
                        models.PlannedApproach(exercise=planned_exercise, **approach)
                        for approach in approaches_data
                    ])

            return workout

        except Exception as e:
            print(e)
            if workout and workout.id:
                workout.delete()
            raise Exception(str(e))


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #
from rest_framework import serializers
from . import models

class FactualApproachSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.FactualApproach
        fields = [
            "factual_time",
            "speed_exercise_equipment",
            "weight_exercise_equipment",
            "count_approach",
        ]

class FactualExerciseInputSerializer(serializers.ModelSerializer):
    approaches = FactualApproachSerializer(many=True)

    class Meta:
        model = models.FactualExercise
        fields = ["name", "approaches"]

class FactualWorkoutInputSerializer(serializers.Serializer):
    workout_id = serializers.IntegerField()
    start_time = serializers.DateTimeField()
    finish_time = serializers.DateTimeField()
    exercises = FactualExerciseInputSerializer(many=True)

    def create(self, validated_data):
        try:
            workout_id = validated_data["workout_id"]
            start_time = validated_data.get("start_time")
            finish_time = validated_data.get("finish_time")
            exercises_data = validated_data.pop("exercises", [])

            workout = models.Workout.objects.get(id=workout_id)
            workout.is_active = False
            if start_time:
                workout.start_time = start_time
            if finish_time:
                workout.finish_time = finish_time
            workout.save()

            for exercise_data in exercises_data:
                approaches_data = exercise_data.pop("approaches", [])
                factual_exercise = models.FactualExercise.objects.create(
                    workout=workout,
                    name=exercise_data.get("name", "Без названия")
                )

                for approach_data in approaches_data:
                    models.FactualApproach.objects.create(
                        exercise=factual_exercise,
                        **approach_data
                    )

            return workout

        except Exception as e:
            print("❌ Error:", e)
            raise serializers.ValidationError(
                {"message": f"Error with input Workout: {str(e)}"}
            )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #

class WorkoutPurposeSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    start_time = serializers.DateTimeField()   
    finish_time = serializers.DateTimeField()   
    purpose = serializers.IntegerField()   

    def create(self,validated_data):
        user_id = validated_data["user_id"]
        start_time = validated_data["start_time"]
        finish_time = validated_data["finish_time"]
        purpose = validated_data["purpose"]

        user = User.objects.get(id = user_id)
        purpose = models.WorkoutPurpose.objects.create(
            user=user, start_time=start_time, finish_time=finish_time, purpose=purpose
        )
        return purpose



    
# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #