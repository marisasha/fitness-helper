from django.core.cache import caches
import os, random


class Cache:

    RedisCache = caches["default"]

    def get_cache(
        key: str,
        query: callable = lambda: any,
        timeout: int = 10,
        cache: any = RedisCache,
    ) -> any:
        data = cache.get(key)
        if data is None:
            data = query()
            cache.set(key, data, timeout)
        return data


def get_randow_workout_image():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    folder_path = os.path.join(project_root, "media", "workout_avatar")
    files = os.listdir(folder_path)
    filename = random.choice(files)
    return f"/workout_avatar/{filename}"
