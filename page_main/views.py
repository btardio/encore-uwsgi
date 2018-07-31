from django.shortcuts import render
from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader



# Create your views here.

def view_page_main(request):

  renderedtemplates = ''

  # header 00 template
  template = loader.get_template('page_header/page_header.html')
  context = { 'partspage': False, }
  renderedtemplates += template.render(context, request)

  template = loader.get_template('page_main/page_main.html')
  context = { }
  renderedtemplates += template.render(context, request)

  # footer 00 template
  template = loader.get_template('page_footer/page_footer.html')
  context = { 'filter': '' }
  renderedtemplates += template.render(context, request)

  return HttpResponse(renderedtemplates)

