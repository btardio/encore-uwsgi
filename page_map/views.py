from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse
from django.conf import settings
import requests
import re
from requests.exceptions import HTTPError
from django.http.response import HttpResponseBadRequest
from django.http.response import HttpResponseRedirect
from django.http.response import StreamingHttpResponse
# Create your views here.
def view_page_stores(request):

    renderedtemplates = ''

    # header 00 template
    template = loader.get_template('page_header/page_header_start.html')
    context = { 'partspage': False, }
    renderedtemplates += template.render(context, request)
    
    template = loader.get_template('page_map/xx00')
    context = { }
    renderedtemplates += template.render(context, request)
    
    template = loader.get_template('page_header/page_header_end.html')
    context = { }
    renderedtemplates += template.render(context, request)
# 
    template = loader.get_template('page_header/page_body_start.html')
    context = { }
    renderedtemplates += template.render(context, request)

    template = loader.get_template('page_map/xx01')
    context = { }
    renderedtemplates += template.render(context, request)

    # footer 00 template
    template = loader.get_template('page_footer/page_footer.html')
    context = { 'filter': '' }
    renderedtemplates += template.render(context, request)

    return HttpResponse(renderedtemplates)

def view_page_urlredirect(request):
    
    if 'url' in request.GET:
        return HttpResponseRedirect(request.GET['url'])
    
    else:        
        return HttpResponseBadRequest('URL must be included in a request to /storeurlredirect')

def view_page_streetview(request):

    if 'x' not in request.GET or re.match('^\d+$', request.GET['x']) == None:
        return HttpResponseBadRequest('Bad coordinates. Please check your map tile request and try again.')
    if 'y' not in request.GET or re.match('^\d+$', request.GET['y']) == None:
        return HttpResponseBadRequest('Bad coordinates. Please check your map tile request and try again.')
    if 'z' not in request.GET or re.match('^\d+$', request.GET['z']) == None:
        return HttpResponseBadRequest('Bad coordinates. Please check your map tile request and try again.')
       
    urlstr = 'https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/'
    urlstr += request.GET['z']
    urlstr += '/'
    urlstr += request.GET['x']
    urlstr += '/'
    urlstr += request.GET['y']
    urlstr += '@2x?access_token=pk.eyJ1IjoiYnRhcmRpbyIsImEiOiJjamthZHlzMjcwbDI0M3h0NGwwNG9sdDFkIn0.umyRO8QAVei9mwDNX2UDDg.png'
    
    r = requests.get( urlstr )
    
    return StreamingHttpResponse( r, 'image/jpeg' )

    

def view_page_satelliteview(request):

    if 'x' not in request.GET or re.match('^\d+$', request.GET['x']) == None:
        return HttpResponseBadRequest('Bad coordinates. Please check your map tile request and try again.')
    if 'y' not in request.GET or re.match('^\d+$', request.GET['y']) == None:
        return HttpResponseBadRequest('Bad coordinates. Please check your map tile request and try again.')
    if 'z' not in request.GET or re.match('^\d+$', request.GET['z']) == None:
        return HttpResponseBadRequest('Bad coordinates. Please check your map tile request and try again.')
       
    urlstr = 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/'
    urlstr += request.GET['z']
    urlstr += '/'
    urlstr += request.GET['x']
    urlstr += '/'
    urlstr += request.GET['y']
    urlstr += '@2x?access_token=pk.eyJ1IjoiYnRhcmRpbyIsImEiOiJjamthZHlzMjcwbDI0M3h0NGwwNG9sdDFkIn0.umyRO8QAVei9mwDNX2UDDg.png'
    
    r = requests.get( urlstr )
    
    return StreamingHttpResponse( r, 'image/jpeg' )

def view_page_mapsearch(request):
    
    if 'lat' in request.GET and re.match('^-{0,1}\d+\.{0,1}\d*$', request.GET['lat']) != None and \
        'lon' in request.GET and re.match('^-{0,1}\d+\.{0,1}\d*$', request.GET['lon']) != None and \
        'distance' in request.GET and re.match('^\d+$', request.GET['distance']) != None:
        if float(request.GET['lat']) <= 90.0 and float(request.GET['lat']) >= -90.0 and \
            float(request.GET['lon']) <= 1800.0 and float(request.GET['lon']) >= -180.0:
            
            if int(request.GET['distance']) >= 1000:
                distance = 1000
            elif int(request.GET['distance']) < 100:
                distance = 100
            else:
                distance = int(request.GET['distance'])
            
            lat = request.GET['lat']
            lon = request.GET['lon']
            
            urlstr = 'http://127.0.0.1:8983/solr/encorel/select?d='
            urlstr += str(distance)
            urlstr += '&df=recip(geodist(),1,1,1)&pt='
            urlstr += lat + ',' + lon
            urlstr += '&q={!geofilt score=distance sfield=latlonlocationdv pt=\''
            urlstr += lat + ',' + lon
            urlstr += '\' d='
            urlstr += str(distance)
            urlstr += '}&sfield=latlonlocationdv&sort=query({!geofilt score=distance filter=false sfield=latlonlocationdv d='
            urlstr += str(distance)
            urlstr += ' v=\'\'}) asc'
            
            for server in settings.SOLR_SERVERS:
                        
                r = requests.get( urlstr )
            
                if r.ok: break
                

            return HttpResponse(r.text, 'application/json')
        else:
            return HttpResponseBadRequest('Bad coordinates. Please check you lat/lon coordinates and try again.')
    else:
        return HttpResponseBadRequest('Bad coordinates. Please check you lat/lon coordinates and try again.')
    









