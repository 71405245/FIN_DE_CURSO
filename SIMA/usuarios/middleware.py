import jwt
from django.conf import settings
from .models import Usuario
from django.shortcuts import redirect
from django.contrib.auth import login, logout

class JWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = request.COOKIES.get('access_token')
        
        if token:
            try:
                # Decodificar el token
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id')
                
                # Obtener el usuario
                user = Usuario.objects.get(id=user_id)
                
                # Autenticar al usuario en la sesión de Django si no está ya autenticado
                if not request.user.is_authenticated:
                    login(request, user)
                
            except (jwt.ExpiredSignatureError, jwt.DecodeError, Usuario.DoesNotExist):
                # Si el token es inválido o expiró, nos aseguramos de que no haya sesión
                if request.user.is_authenticated:
                    logout(request)
        
        response = self.get_response(request)
        return response
