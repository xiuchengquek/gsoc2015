from django.conf.urls import include, url
from meshapp.views import meshView, nodesViewSet, basicView, childrenViewSet, childrenView
from views import gsocMain




urlpatterns = [
	url(r'^$',gsocMain.as_view()),
]





__author__ = 'quek'
