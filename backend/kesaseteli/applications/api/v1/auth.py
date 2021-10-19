from rest_framework.authentication import SessionAuthentication


class StaffAuthentication(SessionAuthentication):
    def authenticate(self, request):
        user_auth_tuple = super().authenticate(request=request)

        if not user_auth_tuple:
            return None

        user, auth = user_auth_tuple

        if not user.is_staff:
            return None

        return user, auth
