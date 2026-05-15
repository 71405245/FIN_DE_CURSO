from django import forms
from .models import Usuario

class CrearEstudianteForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = Usuario
        fields = ['username', 'password', 'codigo', 'ciclo_actual', 'creditos_acumulados']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        user.rol = 'estudiante'

        if commit:
            user.save()

        return user