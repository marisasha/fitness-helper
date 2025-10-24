from django.contrib import admin
from django.urls import path
from django_app import views
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path("", view=views.index),
    path("api",views.api),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("api/register", view=views.api_user_register),
    path("api/change/profile/<int:user_id>", view=views.api_change_user_register),

    path("api/users",views.api_list_users),
    path("api/check/user/<str:username>",views.api_check_user),

    path("api/profiles/all",views.api_all_profiles),
    path("api/profile/<int:user_id>/<int:is_all_data>",views.api_user_profile),

    path("api/user/friends/<int:user_id>",views.api_user_friends),
    path("api/user/requests/<int:user_id>",views.api_user_request_friends),
    path("api/send/request/to/friends",views.api_add_friends),
    path("api/add/friend",views.api_accept_request_to_friends),
    path("api/delete/friend",views.api_delete_friend),

    path("api/all/workouts/user/<int:user_id>",views.api_all_user_workout),
    path("api/all/workouts/planned/user/<int:user_id>/<int:is_active>",views.api_all_planned_user_workout),
    path("api/workout/info/<int:workout_id>/",views.api_user_workout_info),
    path("api/workout/planned/info/<int:workout_id>",views.api_user_planned_workout_info),
    path("api/workout/all/info/<int:workout_id>",views.api_workout_info),
    path("api/workout/repeat/planned/info/<int:user_id>/<int:workout_id>",views.api_repeat_workout),
    path("api/create/workout",views.api_create_workout_plan),
    path("api/input/workout/data",views.api_input_workout_data),
    path("api/user/exercises/<int:user_id>",views.api_user_exercises),
    path("api/workout/recommended",views.api_recommended_workouts),

    path("api/workouts/statistics/<int:user_id>",views.api_workouts_statistics),
    path("api/workouts/statistics/exercise/<int:user_id>",views.api_exercise_information),
    path("api/create/workouts/purpose/<int:user_id>",views.api_create_purpose),
    path("api/workouts/purpose/<int:user_id>",views.api_user_purpose),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
