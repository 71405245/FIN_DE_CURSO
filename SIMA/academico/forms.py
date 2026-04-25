from django import forms
from .models import HistorialAcademico, Curso

class RegistrarNotaForm(forms.ModelForm):

    class Meta:
        model = HistorialAcademico
        fields = ['curso', 'nota', 'estado', 'ciclo']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['curso'].queryset = Curso.objects.all()

class CursoForm(forms.ModelForm):
    class Meta:
        model = Curso
        fields = ['codigo', 'nombre', 'creditos', 'ciclo', 'tipo']
        widgets = {
            'codigo': forms.TextInput(attrs={'class': 'form-control'}),
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'creditos': forms.NumberInput(attrs={'class': 'form-control'}),
            'ciclo': forms.Select(attrs={'class': 'form-select'}),
            'tipo': forms.Select(attrs={'class': 'form-select'}),
        }

from .models import Seccion, Salon

class SalonForm(forms.ModelForm):
    class Meta:
        model = Salon
        fields = ['numero', 'capacidad']
        widgets = {
            'numero': forms.TextInput(attrs={'class': 'form-control'}),
            'capacidad': forms.NumberInput(attrs={'class': 'form-control'}),
        }

class SeccionForm(forms.ModelForm):
    class Meta:
        model = Seccion
        fields = ['curso', 'dia', 'hora_inicio', 'hora_fin', 'salon', 'cupo']
        widgets = {
            'curso': forms.Select(attrs={'class': 'form-select'}),
            'dia': forms.Select(choices=[
                ('Lunes', 'Lunes'), ('Martes', 'Martes'), ('Miércoles', 'Miércoles'),
                ('Jueves', 'Jueves'), ('Viernes', 'Viernes'), ('Sábado', 'Sábado')
            ], attrs={'class': 'form-select'}),
            'hora_inicio': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'hora_fin': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'salon': forms.Select(attrs={'class': 'form-select'}),
            'cupo': forms.NumberInput(attrs={'class': 'form-control'}),
        }