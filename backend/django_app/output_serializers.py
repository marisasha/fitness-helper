from django.contrib.auth.models import User, Group
from rest_framework import serializers, pagination
from django_app import models
from django.db.models import QuerySet


class ProfileSimpleSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    user_id = serializers.SerializerMethodField()
    class Meta:
        model = models.Profile
        exclude = ("id",)
    
    def get_username(self,obj):
        return obj.user.username
    
    def get_user_id(self,obj):
        return obj.user.id

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

class FriendSimpleSerializer(serializers.Serializer):
    friend_id = serializers.SerializerMethodField()
    friend_name = serializers.CharField(source="name")
    friend_surname = serializers.CharField(source="surname")
    friend_avatar = serializers.SerializerMethodField()

    def get_friend_id(self, obj):
        return obj.user.id

    def get_friend_avatar(self, obj):
        return obj.avatar.url if obj.avatar else None

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

class UserListSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_active"]

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

class WorkoutListSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Workout
        fields = "__all__"

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

class UserExercisesSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Workout
        fields = ["name"]

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
class PlannedWorkoutListSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    finish_time = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    exercises_count = serializers.SerializerMethodField()

    def get_id(self, obj):
        return obj.id
    
    def get_name(self, obj):
        return obj.name

    def get_type(self, obj):
        return obj.type
    
    def get_start_time(self, obj):
        return obj.start_time

    def get_finish_time(self, obj):
        return obj.finish_time
    
    def get_is_active(self, obj):
        return obj.is_active
    
    def get_avatar(self, obj):
        if hasattr(obj, 'avatar') and obj.avatar:
            return obj.avatar.url  
        return None

    def get_exercises_count(self,obj):
        return len(models.PlannedExercise.objects.filter(workout=obj))

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

class ApproachExerciseSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.FactualApproach
        exclude = ("exercise","id",)


class WorkoutExersiceHardSerializator(serializers.Serializer):
    name = serializers.SerializerMethodField()
    approaches = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.name

    def get_approaches(self, obj):
        approaches = models.FactualApproach.objects.filter(exercise=obj).order_by("id")
        return ApproachExerciseSimpleSerializer(
            approaches, many=True if isinstance(approaches, QuerySet) else False
        ).data


class WorkoutInfoHardSerializer(serializers.Serializer):
    start_time = serializers.SerializerMethodField()
    finish_time = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    exercises = serializers.SerializerMethodField()

    def get_start_time(self, obj):
        return obj.start_time

    def get_finish_time(self, obj):
        return obj.finish_time

    def get_type(self, obj):
        return obj.type

    def get_name(self, obj):
        return obj.name

    def get_exercises(self, obj):
        exercises = models.FactualExercise.objects.filter(workout=obj).order_by("id")
        return WorkoutExersiceHardSerializator(
            exercises, many=True if isinstance(exercises, QuerySet) else False
        ).data


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-


class PlannedApproachExerciseSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PlannedApproach
        exclude = ("exercise","id",)


class PlannedWorkoutExersiceHardSerializator(serializers.Serializer):
    name = serializers.SerializerMethodField()
    approaches = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.name

    def get_approaches(self, obj):
        approaches = models.PlannedApproach.objects.filter(exercise=obj).order_by("id")
        return PlannedApproachExerciseSimpleSerializer(
            approaches, many=True if isinstance(approaches, QuerySet) else False
        ).data


class PlannedWorkoutInfoHardSerializer(serializers.Serializer):
    name = serializers.SerializerMethodField()
    exercises = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()

    def get_type(self, obj):
        return obj.type
    def get_name(self, obj):
        return obj.name
        
    def get_exercises(self, obj):
        exercises = models.PlannedExercise.objects.filter(workout=obj).order_by("id")
        return PlannedWorkoutExersiceHardSerializator(
            exercises, many=True if isinstance(exercises, QuerySet) else False
        ).data

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

class WorkoutAllInfoHardSerializer(serializers.Serializer):
    start_time = serializers.SerializerMethodField()
    finish_time = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    planned_exercises = serializers.SerializerMethodField()
    factual_exercises = serializers.SerializerMethodField()

    def get_start_time(self, obj):
        return obj.start_time

    def get_finish_time(self, obj):
        return obj.finish_time

    def get_type(self, obj):
        return obj.type

    def get_name(self, obj):
        return obj.name
    
    def get_avatar(self, obj):
        return obj.avatar.url

    def get_planned_exercises(self, obj):
        exercises = models.PlannedExercise.objects.filter(workout=obj).order_by("id")
        return PlannedWorkoutExersiceHardSerializator(
            exercises, many=True if isinstance(exercises, QuerySet) else False
        ).data

    def get_factual_exercises(self, obj):
        exercises = models.FactualExercise.objects.filter(workout=obj).order_by("id")
        return WorkoutExersiceHardSerializator(
            exercises, many=True if isinstance(exercises, QuerySet) else False
        ).data

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

class StatisticsWorkoutSerializer(serializers.Serializer):
    name = serializers.CharField()              
    total_approaches = serializers.IntegerField() 
    max_count = serializers.FloatField()  
    max_weight = serializers.FloatField()  
    max_speed = serializers.FloatField()          
    max_time = serializers.IntegerField()        
    avg_time = serializers.FloatField()          

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
