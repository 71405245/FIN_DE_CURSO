from django import forms
from .models import PreferenciaHorario

class PreferenciaHorarioForm(forms.ModelForm):
    class Meta:
        model = PreferenciaHorario
        fields = ['turno_preferido', 'dias_maximos', 'cantidad_cursos']
        widgets = {
            'turno_preferido': forms.Select(attrs={'class': 'form-select form-select-lg rounded-3'}),
            'dias_maximos': forms.NumberInput(attrs={'class': 'form-control form-control-lg rounded-3', 'min': 1, 'max': 7}),
            'cantidad_cursos': forms.NumberInput(attrs={'class': 'form-control form-control-lg rounded-3', 'min': 1, 'max': 10}),
        }
