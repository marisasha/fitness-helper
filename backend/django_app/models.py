from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from django.core.validators import FileExtensionValidator
from django.dispatch import receiver
from django.db.models.signals import post_save



class Profile(models.Model):
    user = models.OneToOneField(
        verbose_name="Пользователь",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
        to=User,
        on_delete=models.CASCADE,
        related_name="user",
    )
    name = models.CharField(
        verbose_name="Имя",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
        max_length=150
    )
    surname = models.CharField(
        verbose_name="Фамилия",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
        max_length=150
    )

    birth_date = models.DateTimeField(
        verbose_name="Дата рождения",
        db_index=True,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )
    weight = models.FloatField(
        verbose_name="Вес",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )
    height = models.FloatField(
        verbose_name="Рост",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )
    avatar = models.ImageField(
        verbose_name="Аватар профиля",
        validators=[FileExtensionValidator(["jpg", "png", "jpeg"])],
        unique=False,
        editable=True,
        null=False,
        default="profile_avatar/anonim.png",
        upload_to="profile_avatar/",
    )

    stars = models.IntegerField(
        verbose_name = "Фитнес звезды",
        editable=True,
        blank=True,
        null=False,
        default=0,
    )

    class Meta:
        app_label = "django_app"
        ordering = ("-id",)
        verbose_name = "Профиль"
        verbose_name_plural = "Профили"

    def __str__(self):
        return f"[{self.id}] {self.name} {self.surname}"


@receiver(post_save, sender=User)
def profile_create(sender, instance: User, created: bool, **kwargs):
    Profile.objects.get_or_create(user=instance)


class Friends(models.Model):
    from_user = models.ForeignKey(
        verbose_name="Автор запроса в друзья",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
        to=User,
        on_delete=models.CASCADE,
        related_name="sender",
    )
    to_user = models.ForeignKey(
        verbose_name="Получатель запроса в друзья",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
        to=User,
        on_delete=models.CASCADE,
        related_name="recipient",
    )
    status = models.CharField(
        verbose_name="Статус",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
    )

    class Meta:
        app_label = "django_app"
        ordering = ("-id",)
        verbose_name = "Друзья"
        verbose_name_plural = "Друзья"

    def __str__(self):
        return f"<Friends [{self.id}] from {self.from_user} to {self.to_user}/>"


class Workout(models.Model):
    user = models.ForeignKey(
        verbose_name="Пользователь",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
        to=User,
        on_delete=models.CASCADE,
        related_name="user_workout",
    )
    start_time = models.DateTimeField(
        verbose_name="Дата прихода",
        db_index=True,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )
    finish_time = models.DateTimeField(
        verbose_name="Дата ухода",
        db_index=True,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )
    name = models.CharField(
        verbose_name="Имя тренировки",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
        max_length=150
    )
    type = models.CharField(
        verbose_name="Тип тренировки",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )
    is_active = models.BooleanField(
        verbose_name="Активна ли тренировка", null=False, default=True
    )
    avatar = models.ImageField(
        verbose_name="Аватар тренировки",
        validators=[FileExtensionValidator(["jpg", "png", "jpeg"])],
        unique=False,
        editable=True,
        null=False,
        default="workout_avatar/pexels-pixabay-50597.jpg",
        upload_to="workout_avatar/",
    )

    is_recommended = models.BooleanField(
        verbose_name="Рекомендуемая ли тренировка", null=False, default=False
    )

    class Meta:
        app_label = "django_app"
        ordering = ("-id",)
        verbose_name = "Тренировка"
        verbose_name_plural = "Тренировки"

    def __str__(self):
        return f"<Workout [{self.id}][{self.name}] user - {self.user}/>"


class PlannedExercise(models.Model):
    workout = models.ForeignKey(
        verbose_name="Тренировка",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
        to=Workout,
        on_delete=models.CASCADE,
        related_name="planned_workout",
    )
    name = models.CharField(
        verbose_name="Название упражнения",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
        max_length=150
    )

    class Meta:
        app_label = "django_app"
        ordering = ("-id",)
        verbose_name = "Упражнение"
        verbose_name_plural = "Планированные упражнения"

    def __str__(self):
        return f"<PlannedExercise [{self.id}] workout {self.workout}/>"


class PlannedApproach(models.Model):
    exercise = models.ForeignKey(
        verbose_name="Упражнение",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        to=PlannedExercise,
        on_delete=models.CASCADE,
        related_name="planned_approach",
    )
    planned_time = models.PositiveIntegerField(
        verbose_name="Планированное время выполнения упражнения(секунды)",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )
    speed_exercise_equipment = models.FloatField(
        verbose_name="Скорость",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )
    weight_exercise_equipment = models.FloatField(
        verbose_name="Вес",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )
    count_approach = models.PositiveSmallIntegerField(
        verbose_name="Количество",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )

    class Meta:
        app_label = "django_app"
        ordering = ("-id",)
        verbose_name = "Подход "
        verbose_name_plural = "Планированные подходы"

    def __str__(self):
        return f"<PlannedApproach [{self.id}] exercise {self.exercise}/>"


class FactualExercise(models.Model):
    workout = models.ForeignKey(
        verbose_name="Тренировка",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
        to=Workout,
        on_delete=models.CASCADE,
        related_name="factual_workout",
    )
    name = models.CharField(
        verbose_name="Название упражнения",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
        max_length=150
    )

    class Meta:
        app_label = "django_app"
        ordering = ("-id",)
        verbose_name = "Упражнение"
        verbose_name_plural = "Фактические упражнения"

    def __str__(self):
        return f"<FactualExercise [{self.id}] workout {self.name}/>"


class FactualApproach(models.Model):
    exercise = models.ForeignKey(
        verbose_name="Упражнение",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
        to=FactualExercise,
        on_delete=models.CASCADE,
        related_name="factual_exercise",
    )
    factual_time = models.PositiveIntegerField(
        verbose_name="Фактическое время выполнения упражнения(секунды)",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )
    speed_exercise_equipment = models.FloatField(
        verbose_name="Скорость",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )
    weight_exercise_equipment = models.FloatField(
        verbose_name="Вес",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )
    count_approach = models.PositiveSmallIntegerField(
        verbose_name="Количество",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )

    class Meta:
        app_label = "django_app"
        ordering = ("-id",)
        verbose_name = "Подход "
        verbose_name_plural = "Фактические подходы"

    def __str__(self):
        return f"<FactualApproach [{self.id}] exercise {self.exercise}/>"




class WorkoutPurpose(models.Model):
    user = models.ForeignKey(
        verbose_name="Пользователь",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
        to=User,
        on_delete=models.CASCADE,
        related_name="user_purpose",
    )

    start_time = models.DateTimeField(
        verbose_name="Дата начала учета цели",
        db_index=True,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )

    finish_time = models.DateTimeField(
        verbose_name="Дата конца учета цели",
        db_index=True,
        editable=True,
        blank=True,
        null=True,
        default=None,
    )

    purpose = models.PositiveSmallIntegerField(
        verbose_name="Цель(Дни)",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
    )

    is_completed = models.BooleanField(
        verbose_name="Выполнена ли цель", null=False, default=False
    )

    class Meta:
        app_label = "django_app"
        ordering = ("-id",)
        verbose_name = "Цель "
        verbose_name_plural = "Цели"

    def __str__(self):
        return f"<WorkoutPurpose [{self.id}] user {self.user.username}/>"

class Exercises(models.Model):
    user = models.ForeignKey(
        verbose_name="Пользователь",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=True,
        default=None,
        to=User,
        on_delete=models.CASCADE,
        related_name="user_exercises",
    )

    name = models.CharField(
        verbose_name="Имя Упражнения",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
        max_length=150
    )

    class Meta:
        app_label = "django_app"
        ordering = ("-id",)
        verbose_name = "Упражнение "
        verbose_name_plural = "Упражнения пользователя"

    def __str__(self):
        return f"<Exercises - {self.name}/>"

class FitnesHelperExercise(models.Model):

    name = models.CharField(
        verbose_name="Имя Упражнения",
        db_index=True,
        primary_key=False,
        unique=True,
        editable=True,
        blank=True,
        null=False,
        max_length=150
    )

    description = models.TextField(
        verbose_name="Описание упражнения",
        db_index=False,
        primary_key=False,
        unique=False,
        editable=True,
        blank=True,
        null=False,
    )

    exercise_technique = models.TextField(
        verbose_name="Техника упражнения",
        db_index=False,
        primary_key=False,
        unique=False,
        editable=True,
        blank=True,
        null=False,
    )

    recommendations_for_men = models.CharField(
        verbose_name="Рекомендации мужчинам",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
        max_length=150
    )

    recommendations_for_women = models.CharField(
        verbose_name="Рекомандации женащинам",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
        max_length=150
    )

    avatar = models.ImageField(
        verbose_name="Аватар Упражнения",
        validators=[FileExtensionValidator(["jpg", "png", "jpeg"])],
        unique=False,
        editable=True,
        null=True,
        default=None,
        upload_to="exercise_avatar/",
    )

    class Meta:
        app_label = "django_app"
        ordering = ("-id",)
        verbose_name = "Упражнение от Fitnesshelper"
        verbose_name_plural = "Упражнения от Fitnesshelper"

    def __str__(self):
        return f"<FitnesHelperExercise - {self.name}/>"
    

class ExerciseRewardStatuses(models.Model):

    exercise = models.ForeignKey(
        verbose_name="Упражнение",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
        to=FitnesHelperExercise,
        on_delete=models.CASCADE,
        related_name="exercise_reward",
    )

    criteria = models.CharField(
        verbose_name="Критерий награды",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
        max_length=150
    )

    required_result = models.IntegerField(
        verbose_name = "Необходимый результат",
        editable=True,
        blank=True,
        null=False,
    )

    avatar = models.ImageField(
        verbose_name="Аватар Достижения",
        validators=[FileExtensionValidator(["jpg", "png", "jpeg"])],
        editable=True,
        null=True,
        default=None,
        upload_to="exercise_reward_avatar/",
    )

    class Meta:
        app_label = "django_app"
        ordering = ("-id",)
        verbose_name = "Достижение за упражнение"
        verbose_name_plural = "Достижения за упражнения"

    def __str__(self):
        return f"<ExerciseReward - {self.exercise.name}/>"
    
class UserRewardStatuses(models.Model):

    user =  models.ForeignKey(
        verbose_name="Пользователь",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
        to=User,
        on_delete=models.CASCADE,
        related_name="user_rewards_statuses",
    )

    exercise_reward = models.ForeignKey(
        verbose_name="Упражнение достижения",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
        to=ExerciseRewardStatuses,
        on_delete=models.CASCADE,
        related_name="exercise_user_reward",
    )

    class Meta:
        app_label = "django_app"
        ordering = ("-id",)
        verbose_name = "Достижение пользователя"
        verbose_name_plural = "Достижения пользователя"

    def __str__(self):
        return f"<UserRewardStatuses - {self.user}/>"


class UserRewardsLogs(models.Model):

    user = models.ForeignKey(
        verbose_name="Пользователь",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
        to=User,
        on_delete=models.CASCADE,
        related_name="user_rewards_logs",
    )

    count_of_added_stars = models.IntegerField(
        verbose_name = "Количество добавленных звезд",
        editable=True,
        blank=True,
        null=False,
    )

    achievement = models.CharField(
        verbose_name="Критерий награды",
        db_index=True,
        primary_key=False,
        editable=True,
        blank=True,
        null=False,
    )

    date_reward = models.DateTimeField(
        verbose_name="Дата получения награды",
        null=True,
        default=timezone.localtime,
    )

    class Meta:
        app_label = "django_app"
        ordering = ("-id",)
        verbose_name = "Лог награды за упражнения"
        verbose_name_plural = "Логи наград за упражнения"

    def __str__(self):
        return f"<UserRewardsLogs - {self.user}/>"





