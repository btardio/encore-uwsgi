"""encorea URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from page_parts.views import view_page_parts
from page_parts.views import view_javascript_error
from page_main.views import view_page_main
from page_parts.views import view_makefacetrequest
from page_parts.views import view_makesearchrequest
from page_parts.views import view_executepartdetailsearch
from page_parts.views import view_executeoemsearch
from page_parts.views import view_executeoempartsearch
from page_contact.views import form_view_page_consult

#from encore_parts_page.views import view_solr_through

urlpatterns = [
    path('admin/', admin.site.urls),
    path(r'', view_page_main),
    path(r'parts', view_page_parts),
    path(r'logerror', view_javascript_error),
    path(r'makefacetrequest', view_makefacetrequest),
    path(r'makesearchrequest', view_makesearchrequest),
    path(r'executepartdetailsearch', view_executepartdetailsearch),
    path(r'executeoemsearch', view_executeoemsearch),
    path(r'executeoempartsearch', view_executeoempartsearch),
    path(r'contact', form_view_page_consult.as_view()),
    
#    re_path(r'solr(?P<solr>.*)', view_solr_through),
]
