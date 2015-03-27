from django.shortcuts import render

from django.views.generic import TemplateView

# Create your views here.


class gsocMain(TemplateView):
	template_name="gsoc2015/main.html"
