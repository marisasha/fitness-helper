from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from django.db.models import QuerySet
from django.db.models import Avg, Max, Count, F
from django.db.models import Q
from django_app import models, output_serializers, input_serializers, utils
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema
from datetime import timedelta
from django.utils import timezone
from django.shortcuts import render
from django.http import HttpRequest


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #

def index(request) -> HttpRequest:
    return render(request, "index.html")

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #

@api_view(http_method_names=["GET"])
@permission_classes([AllowAny])
def api(request: Request) -> Response:
    return Response(data={"message": "ok, we are staring!"})


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(["GET"])
@permission_classes([AllowAny])
def api_list_users(request: Request) -> Response:
    users = User.objects.all()
    user_serializer = output_serializers.UserListSimpleSerializer(users, many=True).data
    user_serializer_with_cache = utils.Cache.get_cache(
        key="users_cache", query=lambda: user_serializer, timeout=5
    )
    return Response(
        data={"data": user_serializer_with_cache}, status=status.HTTP_200_OK
    )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(["GET"])
@permission_classes([AllowAny])
def api_check_user(request, username: str) -> Response:
    try:
        user = User.objects.get(username=username)
        return Response(
            data={"exists": True, "message": "User already exists"},
            status=status.HTTP_200_OK,
        )
    except ObjectDoesNotExist:
        return Response(
            data={"exists": False, "message": "User not found"},
            status=status.HTTP_200_OK,
        )
    except Exception:
        return Response(
            data={"message": "Server Error!"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@extend_schema(
    request=input_serializers.UserRegisterSerializer, summary="Регистрация пользователя"
)
@api_view(["POST"])
@permission_classes([AllowAny])
def api_user_register(request: Request) -> Response:
    data_serializer = input_serializers.UserRegisterSerializer(data=request.data)
    if data_serializer.is_valid():
        username = data_serializer.validated_data["username"]
        password = data_serializer.validated_data["password"]
        password2 = data_serializer.validated_data["password2"]
        name = data_serializer.validated_data["name"]
        surname = data_serializer.validated_data["surname"]
        birth_date = data_serializer.validated_data["birth_date"]
        weight = data_serializer.validated_data["weight"]
        height = data_serializer.validated_data["height"]
        avatar = data_serializer.validated_data.get("avatar", None)
    else:
        return Response(data_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if password != password2:
        return Response(
            {"error": "Passwords don't match"}, status=status.HTTP_401_UNAUTHORIZED
        )

    user = User.objects.create(username=username, password=make_password(password))
    profile = models.Profile.objects.get(user=user)
    profile.name = name
    profile.surname = surname
    profile.birth_date = birth_date
    profile.weight = weight
    profile.height = height
    if avatar:
        profile.avatar = avatar
    profile.save()

    return Response(
        {"success": "Account successfully created!"}, status=status.HTTP_201_CREATED
    )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@extend_schema(
    request=input_serializers.UserRegisterSerializer,
    summary="Правка данных пользователя",
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def api_change_user_register(request: Request, user_id: int) -> Response:
    data_serializer = input_serializers.UserChangeProfile(data=request.data)
    if data_serializer.is_valid():
        username = data_serializer.validated_data.get("username", None)
        password = data_serializer.validated_data.get("password", None)
        name = data_serializer.validated_data.get("name", None)
        surname = data_serializer.validated_data.get("surname", None)
        birth_date = data_serializer.validated_data.get("birth_date", None)
        weight = data_serializer.validated_data.get("weight", None)
        height = data_serializer.validated_data.get("height", None)
        avatar = data_serializer.validated_data.get("avatar", None)
        delete_avatar = data_serializer.validated_data.get("delete_avatar", None)
    else:
        return Response(data_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.get(id=user_id)
    profile = models.Profile.objects.get(user=user)
    if username:
        user.username = username
    if password:
        user.password = make_password(password)
    if name:
        profile.name = name
    if surname:
        profile.surname = surname
    if birth_date:
        profile.birth_date = birth_date
    if weight:
        profile.weight = weight
    if height:
        profile.height = height
    if avatar:
        profile.avatar = avatar
    if delete_avatar:
        profile.avatar = f"/profile_avatar/anonim.png"
    profile.save()
    user.save()

    return Response(
        {"success": "Account successfully changed!"}, status=status.HTTP_200_OK
    )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def api_all_profiles(request: Request) -> Response:
    profiles = models.Profile.objects.all()
    profiles_serializer = output_serializers.ProfileSimpleSerializer(
        profiles, many=True if isinstance(profiles, QuerySet) else False
    ).data
    profiles_serializer_with_cache = utils.Cache.get_cache(
        key="profiles_cache", query=lambda: profiles_serializer, timeout=10
    )
    return Response(
        data={"data": profiles_serializer_with_cache}, status=status.HTTP_200_OK
    )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def api_user_profile(request: Request, user_id: int, is_all_data: int = 1) -> Response:
    user = User.objects.get(id=user_id)
    profile = models.Profile.objects.get(user=user)
    if bool(is_all_data):
        profile_serializer = output_serializers.ProfileSimpleSerializer(
            profile, many=True if isinstance(profile, QuerySet) else False
        ).data
        profile_serializer_with_cache = utils.Cache.get_cache(
            key=f"profile_cache_{user_id}_{is_all_data}",
            query=lambda: profile_serializer,
            timeout=3,
        )
        return Response(
            data={"data": profile_serializer_with_cache}, status=status.HTTP_200_OK
        )
    return Response(data={"data": profile.name}, status=status.HTTP_200_OK)


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def api_user_friends(request, user_id: int):
    user = User.objects.get(id=user_id)

    friend_users = User.objects.filter(
        Q(sender__to_user=user, sender__status="friends")
        | Q(recipient__from_user=user, recipient__status="friends")
    ).distinct()

    friend_profiles = models.Profile.objects.filter(user__in=friend_users).order_by(
        "name"
    )

    friend_serializer = output_serializers.FriendSimpleSerializer(
        friend_profiles, many=True
    ).data
    friend_serializer_with_cache = utils.Cache.get_cache(
        key=f"friend_cache_{user_id}", query=lambda: friend_serializer, timeout=1
    )

    return Response({"data": friend_serializer_with_cache}, status=status.HTTP_200_OK)


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def api_user_request_friends(request, user_id: int):
    user = User.objects.get(id=user_id)

    friend_users = User.objects.filter(
        sender__to_user=user, sender__status="request"
    ).distinct()

    friend_profiles = models.Profile.objects.filter(user__in=friend_users).order_by(
        "name"
    )

    friend_serializer = output_serializers.FriendSimpleSerializer(
        friend_profiles, many=True
    ).data
    friend_serializer_with_cache = utils.Cache.get_cache(
        key=f"friend_requests_{user_id}", query=lambda: friend_serializer, timeout=1
    )

    return Response(
        {"data": friend_serializer_with_cache}, status=status.HTTP_200_OK
    )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@extend_schema(
    request=input_serializers.FriendsStatusChangerSerializer,
    summary="Запрос у пользователя добавления в друзья",
)
@api_view(http_method_names=["POST"])
@permission_classes([IsAuthenticated])
def api_add_friends(request: Request) -> Response:
    serializer = input_serializers.FriendsStatusChangerSerializer(data=request.data)
    if serializer.is_valid():
        to_user_id = serializer.validated_data["from_user"]
        from_user_id = serializer.validated_data["to_user"]
    from_user = User.objects.get(id=from_user_id)
    to_user = User.objects.get(id=to_user_id)
    friend_exists = models.Friends.objects.filter(
        Q(from_user=from_user, to_user=to_user)
        | Q(from_user=to_user, to_user=from_user),
        status__in=["request", "friends"],
    ).exists()

    if not friend_exists:
        models.Friends.objects.create(
            from_user=from_user, to_user=to_user, status="request"
        )
        return Response(
            data={"message": "Request successfully sent!"}, status=status.HTTP_200_OK
        )

    return Response(
        data={"message": "You are already friends or a question has been sent to you"},
        status=status.HTTP_400_BAD_REQUEST,
    )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@extend_schema(
    request=input_serializers.FriendsStatusChangerSerializer,
    summary="Добавление пользователя в друзья",
)
@api_view(http_method_names=["POST"])
@permission_classes([IsAuthenticated])
def api_accept_request_to_friends(request: Request) -> Response:
    serializer = input_serializers.FriendsStatusChangerSerializer(data=request.data)
    if serializer.is_valid():
        from_user_id = serializer.validated_data["from_user"]
        to_user_id = serializer.validated_data["to_user"]
    from_user = User.objects.get(id=from_user_id)
    to_user = User.objects.get(id=to_user_id)
    try:
        friendship = models.Friends.objects.get(
            from_user=from_user, to_user=to_user, status="request"
        )
        friendship.status = "friends"
        friendship.save()
        return Response(
            data={"message": "Friend successfully added! "},
            status=status.HTTP_201_CREATED,
        )

    except models.Friends.DoesNotExist:
        return Response(data={"message": "Error, "}, status=status.HTTP_404_NOT_FOUND)


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@extend_schema(
    request=input_serializers.FriendsStatusChangerSerializer,
    summary="Удаление пользователя из друзей",
)
@api_view(http_method_names=["DELETE"])
@permission_classes([IsAuthenticated])
def api_delete_friend(request: Request) -> Response:
    serializer = input_serializers.FriendsStatusChangerSerializer(data=request.data)
    if serializer.is_valid():
        from_user_id = serializer.validated_data["from_user"]
        to_user_id = serializer.validated_data["to_user"]
    from_user = User.objects.get(id=from_user_id)
    to_user = User.objects.get(id=to_user_id)
    try:
        friendship = models.Friends.objects.filter(
            Q(from_user=from_user, to_user=to_user)
            | Q(from_user=to_user, to_user=from_user),
            status__in=["request", "friends"],
        )
        friendship.delete()
        return Response(
            data={"message": "Friend or Request successfully deleted! "},
            status=status.HTTP_204_NO_CONTENT,
        )
    except models.Friends.DoesNotExist:
        return Response(data={"message": "Error, "}, status=status.HTTP_404_NOT_FOUND)


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def api_all_user_workout(request: Request, user_id: int) -> Response:
    user = User.objects.get(id=user_id)
    workouts_data = models.Workout.objects.filter(user=user)
    workouts_data_serializer = output_serializers.WorkoutListSimpleSerializer(
        workouts_data, many=True if isinstance(workouts_data, QuerySet) else False
    ).data
    workouts_data_serializer_with_cache = utils.Cache.get_cache(
        key=f"workouts_{user_id}",
        query=lambda: workouts_data_serializer,
        timeout=3 ,
    )
    return Response(
        data={"data": workouts_data_serializer_with_cache}, status=status.HTTP_200_OK
    )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_all_planned_user_workout(request: Request, user_id: int, is_active: int = 1) -> Response:
    user = User.objects.get(id=user_id)
    workouts_qs = models.Workout.objects.filter(user=user, is_active=bool(is_active))

    # 🔹 Настраиваем пагинатор
    paginator = PageNumberPagination()
    paginator.page_size = int(request.GET.get("page_size", 10))  # по умолчанию 10
    paginated_workouts = paginator.paginate_queryset(workouts_qs, request)

    # 🔹 Сериализация
    serializer = output_serializers.PlannedWorkoutListSerializer(paginated_workouts, many=True)

    # 🔹 Кэшируем данные страницы
    page_number = request.GET.get("page", 1)
    cache_key = f"workouts_planned_{user_id}_{is_active}_page_{page_number}"
    data_with_cache = utils.Cache.get_cache(
        key=cache_key,
        query=lambda: serializer.data,
        timeout=10,
    )

    # 🔹 Формируем кастомный response
    response_data = {
        "count": workouts_qs.count(),
        "total_pages": paginator.page.paginator.num_pages if paginated_workouts else 1,
        "current_page": int(page_number),
        "results": data_with_cache
    }

    return Response(data={"data":response_data}, status=status.HTTP_200_OK)


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def api_recommended_workouts(request: Request) -> Response:
    workouts_data = models.Workout.objects.filter(is_recommended=True).order_by("id")
    workouts_data_serializer = output_serializers.PlannedWorkoutListSerializer(
        workouts_data, many=True if isinstance(workouts_data, QuerySet) else False
    ).data
    workouts_data_serializer_with_cache = utils.Cache.get_cache(
        key="workouts_recommend",
        query=lambda: workouts_data_serializer,
        timeout=3 ,
    )
    return Response(
        data={"data": workouts_data_serializer_with_cache}, status=status.HTTP_200_OK
    )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def api_user_workout_info(request: Request, workout_id: int) -> Response:
    workout_data = models.Workout.objects.get(id=int(workout_id))
    workout_data_serializer = output_serializers.WorkoutInfoHardSerializer(
        workout_data, many=True if isinstance(workout_data, QuerySet) else False
    ).data
    workout_data_serializer_with_cache = utils.Cache.get_cache(
        key=f"workout_info_{workout_id}",
        query=lambda: workout_data_serializer,
        timeout=3 ,
    )
    return Response(
        data={"data": workout_data_serializer_with_cache}, status=status.HTTP_200_OK
    )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@extend_schema(
    request=input_serializers.WorkoutSerializer,
    summary="Создание плана тренировки",
)
@api_view(http_method_names=["POST"])
@permission_classes([IsAuthenticated])
def api_create_workout_plan(request: Request) -> Response:
    serializer = input_serializers.WorkoutSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Workout successfully created"}, status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def api_user_exercises(
    request: Request,
    user_id: int,
) -> Response:
    user = User.objects.get(id=user_id)
    user_exercises = models.Exercises.objects.filter(user=user)
    user_exercises_serializer = output_serializers.UserExercisesSimpleSerializer(
        user_exercises, many=True if isinstance(user_exercises, QuerySet) else False
    ).data
    user_exercises_serializer_with_cache = utils.Cache.get_cache(
        key=f"user_exercises_{user_id}",
        query=lambda: user_exercises_serializer,
        timeout=3 ,
    )
    return Response(
        data={"data": user_exercises_serializer_with_cache}, status=status.HTTP_200_OK
    )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def api_user_planned_workout_info(
    request: Request,
    workout_id: int,
) -> Response:
    workout_data = models.Workout.objects.get(id=int(workout_id))
    workout_data_serializer = output_serializers.PlannedWorkoutInfoHardSerializer(
        workout_data, many=True if isinstance(workout_data, QuerySet) else False
    ).data
    workout_data_serializer_with_cache = utils.Cache.get_cache(
        key=f"workout_planned_{workout_id}",
        query=lambda: workout_data_serializer,
        timeout=3,
    )
    return Response(
        data={"data": workout_data_serializer_with_cache}, status=status.HTTP_200_OK
    )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@extend_schema(
    request=input_serializers.FactualWorkoutInputSerializer,
    summary="Заполнение данных о проведенной тренировке",
)
@api_view(http_method_names=["POST"])
@permission_classes([IsAuthenticated])
def api_input_workout_data(request: Request) -> Response:
    serializer = input_serializers.FactualWorkoutInputSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Workout successfully input"}, status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def api_repeat_workout(request: Request, user_id: int, workout_id: int) -> Response:
    try:
        user = User.objects.get(id=user_id)
        birth_date_workout = models.Workout.objects.get(id=workout_id)
        new_workout = models.Workout.objects.get(id=workout_id)
        new_workout.user = user
        new_workout.pk = None
        new_workout.is_active = True
        new_workout.start_time = None
        new_workout.is_recommended = False
        new_workout.finish_time = None
        new_workout.save()

        planned_exercises = models.PlannedExercise.objects.filter(
            workout=birth_date_workout
        )
        for pe in planned_exercises:
            birth_date_ex_id = pe.id
            pe.pk = None
            pe.workout = new_workout
            pe.save()
            planned_approaches = models.PlannedApproach.objects.filter(
                exercise_id=birth_date_ex_id
            )
            for pa in planned_approaches:
                pa.pk = None
                pa.exercise = pe
                pa.save()

        return Response(
            data={"data": {"workout_id": new_workout.id}}, status=status.HTTP_200_OK
        )

    except models.Workout.DoesNotExist:
        return Response(
            {"error": "Workout not found"}, status=status.HTTP_404_NOT_FOUND
        )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_workout_info(request: Request, workout_id: int) -> Response:
    workout_data = models.Workout.objects.get(id=workout_id)
    workout_data_serializer = output_serializers.WorkoutAllInfoHardSerializer(
        workout_data, many=True if isinstance(workout_data, QuerySet) else False
    ).data
    workout_data_serializer_with_cache = utils.Cache.get_cache(
        key=f"workout_info_{workout_id}",
        query=lambda: workout_data_serializer,
        timeout=3,
    )
    return Response(
        data={"data": workout_data_serializer_with_cache}, status=status.HTTP_200_OK
    )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_workouts_statistics(request: Request, user_id) -> Response:
    filter = request.query_params.get("filter", "all_time")
    user = User.objects.get(id=int(user_id))
    now = timezone.now()

    if filter == "week":
        date_ago = now - timedelta(days=7)
        workouts = models.Workout.objects.filter(
            user=user, start_time__range=(date_ago, now)
        )
    elif filter == "month":
        date_ago = now - timedelta(days=30)
        workouts = models.Workout.objects.filter(
            user=user, start_time__range=(date_ago, now)
        )
    elif filter == "all_time":
        workouts = models.Workout.objects.filter(user=user)
    else:
        return Response({"error": "Unknown filter"}, status=status.HTTP_400_BAD_REQUEST)

    valid_approaches = models.FactualApproach.objects.filter(
        exercise__workout__in=workouts
    ).filter(
        Q(factual_time__isnull=False)
        | Q(speed_exercise_equipment__isnull=False)
        | Q(weight_exercise_equipment__isnull=False)
        | Q(count_approach__isnull=False)
    )

    stats = (
        valid_approaches.values(name=F("exercise__name"))
        .annotate(
            total_approaches=Count("id"),
            max_count=Max("count_approach"),
            max_speed=Max("speed_exercise_equipment"),
            max_weight=Max("weight_exercise_equipment"),
            max_time=Max("factual_time"),
            avg_time=Avg("factual_time"),
        )
        .order_by("name")
    )

    stats_serializer = output_serializers.StatisticsWorkoutSerializer(
        stats, many=True
    ).data

    stats_serializer_with_cache = utils.Cache.get_cache(
        key=f"stats_{user_id}_{filter}", query=lambda: stats_serializer, timeout=3 
    )

    return Response({"data": stats_serializer_with_cache}, status=status.HTTP_200_OK)


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@extend_schema(
    request=input_serializers.WorkoutPurposeSerializer,
    summary="Создание цели на месяц",
)
@api_view(http_method_names=["POST"])
@permission_classes([IsAuthenticated])
def api_create_purpose(request: Request, user_id: int) -> Response:
    user = User.objects.get(id=user_id)
    data_serializer = input_serializers.WorkoutPurposeSerializer(data=request.data)
    if data_serializer.is_valid():
        start_time = data_serializer.validated_data["start_time"]
        finish_time = data_serializer.validated_data["finish_time"]
        purpose = data_serializer.validated_data["purpose"]
    else:
        return Response(data_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    models.WorkoutPurpose.objects.create(
        user=user, start_time=start_time, finish_time=finish_time, purpose=purpose
    )

    return Response(
        {"message": "Purpose successfully created!"}, status=status.HTTP_201_CREATED
    )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def api_user_purpose(request: Request, user_id: int) -> Response:
    try:
        user = User.objects.get(id=user_id)
        now = timezone.now()
        purpose = models.WorkoutPurpose.objects.get(
            user=user, start_time__year=now.year, start_time__month=now.month
        )
        workouts_count = models.Workout.objects.filter(
            user=user, start_time__range=(purpose.start_time, purpose.finish_time)
        ).count()

        response_data = {
            "workouts_count": workouts_count,
            "workouts_count_purpose": purpose.purpose,
        }
        response_data_with_cache = utils.Cache.get_cache(
            key=f"user_infromation_{user_id}",
            query=lambda: response_data,
            timeout=3 ,
        )
        return Response(
            {"data": response_data_with_cache},
            status=status.HTTP_200_OK,
        )
    except ObjectDoesNotExist:
        return Response(
            {"message": "Purpose not found for this month."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        return Response(
            {"message": f"Server Error!{e}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= #


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_exercise_information(request, user_id: int):
    exercise_name = request.query_params.get("exercise_name", "Жим лежа")
    cache_key = f"exercise_info_{user_id}_{exercise_name}"

    def load_data():
        user = User.objects.get(id=user_id)
        workouts = models.Workout.objects.filter(user=user)

        valid_approaches = models.FactualApproach.objects.filter(
            exercise__workout__in=workouts
        ).filter(
            Q(factual_time__isnull=False)
            | Q(speed_exercise_equipment__isnull=False)
            | Q(weight_exercise_equipment__isnull=False)
            | Q(count_approach__isnull=False)
        )

        if exercise_name:
            valid_approaches = valid_approaches.filter(exercise__name=exercise_name)

        last_workout_date = valid_approaches.order_by(
            "-exercise__workout__start_time"
        ).first()
        last_date = (
            last_workout_date.exercise.workout.start_time if last_workout_date else None
        )

        max_by_weight = valid_approaches.filter(weight_exercise_equipment__isnull=False)
        if max_by_weight.exists():
            max_by_weight = (
                max_by_weight.values("weight_exercise_equipment")
                .annotate(max_count=Max("count_approach"))
                .order_by("max_count")
            )
        else:
            max_by_weight = []

        max_by_speed = valid_approaches.filter(speed_exercise_equipment__isnull=False)
        if max_by_speed.exists():
            max_by_speed = (
                max_by_speed.values("speed_exercise_equipment")
                .annotate(max_time=Max("factual_time"))
                .order_by("-max_time")
            )
        else:
            max_by_speed = []

        if len(max_by_weight) > 0:
            stats = valid_approaches.values(name=F("exercise__name")).annotate(
                total_approaches=Count("id"),
                max_count=Max("count_approach"),
                max_weight=Max("weight_exercise_equipment"),
            )
            top_approaches_data = []
        elif len(max_by_speed) > 0:
            stats = valid_approaches.values(name=F("exercise__name")).annotate(
                total_approaches=Count("id"),
                max_speed=Max("speed_exercise_equipment"),
                max_time=Max("factual_time"),
                avg_time=Avg("factual_time"),
            )
            top_approaches_data = []
        else:
            top_approaches = valid_approaches.order_by("-count_approach")[:5]
            top_approaches_data = [
                {"count_approach": a.count_approach} for a in top_approaches
            ]
            stats = []

        return {
            "stats": list(stats),
            "max_by_weight": list(max_by_weight),
            "max_by_speed": list(max_by_speed),
            "top_approaches": top_approaches_data,
            "last_workout_date": last_date,
        }

    data = utils.Cache.get_cache(key=cache_key, query=load_data, timeout=60 * 3)

    return Response({"data": data}, status=status.HTTP_200_OK)
