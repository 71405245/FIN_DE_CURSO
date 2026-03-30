from django import forms
from .models import HistorialAcademico, Curso

class RegistrarNotaForm(forms.ModelForm):

    class Meta:
        model = HistorialAcademico
        fields = ['curso', 'nota', 'estado', 'ciclo']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['curso'].queryset = Curso.objects.all()