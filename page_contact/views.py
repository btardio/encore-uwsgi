from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.http import HttpResponseRedirect
from django.core.mail import EmailMessage, BadHeaderError
from django.views.generic.edit import FormView
from page_contact import forms
from page_contact.models import user_submission
from django.conf import settings
from django.utils.text import slugify as slugencode
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_protect
from django.core.mail import EmailMultiAlternatives
import logging
import re
from django.utils import timezone
from django.core.mail.backends.smtp import EmailBackend
#from datetime import datetime
#from datetime import time as dtime
#from datetime import timedelta
#from django.utils import timezone



#from dateutil.parser import parse

#import json
#import random
#import string



# todo: paging

# Get an instance of a logger
logger = logging.getLogger('jslogger')




# Create your views here.


#def view_page_contact(request):

  #renderedtemplates = ''

  ## header 00 template
  #template = loader.get_template('page_header/page_header.html')
  #context = { 'contactpage': True }
  #renderedtemplates += template.render(context, request)

  #template = loader.get_template('page_contact/page_contact.html')
  #renderedtemplates += template.render(context, request)

  ## footer 00 template
  #template = loader.get_template('page_footer/page_footer.html')
  #context = { 'filter': '-webkit-filter: invert(100%); filter: invert(100%);' }
  #renderedtemplates += template.render(context, request)

  #return HttpResponse(renderedtemplates)



def htmlemail( firstname, lastname ):
    rhtmlemaila = '''

    <html>
    <head>
    <title>Thank you for contacting us!</title>

    <body>
    '''
    
    rhtmlemailb = '''
                    Dear %s %s,
                  ''' % ( firstname, lastname )
                  
    rhtmlemailc = '''
                    <br><br>
                
                    Thank you for contacting us.
                    <br><br>
                    
                    We encourage you to continue browsing our website to learn more about us.
                    <br><br>                    
                    
                    
                    Sincerely,

                    <br><br>
                    
                    Encore Automotive Inc.
                
                    <br><br>                
        
    </body>

    </html>



    ''' 
    
    return rhtmlemaila + rhtmlemailb + rhtmlemailc





def plainemail ( firstname, lastname ):
    
    rstr = '''Dear %s %s,

Thank you for contacting us!

Sincerely,

    Encore Automotive
                    
                ''' % ( firstname, lastname )
                
    return rstr
    



class form_view_page_consult( FormView ):


    def get(self, request, *args, **kwargs):

        renderedtemplates = ''
        form = forms.contact_form()
        
        # header 00 template
        template = loader.get_template('page_header/page_header_start.html')
        context = { 'contactpage': True, 'title': 'Contact' }
        renderedtemplates += template.render(context, request)

        template = loader.get_template('page_header/page_header_end.html')
        context = { }
        renderedtemplates += template.render(context, request)
    # 
        template = loader.get_template('page_header/page_body_start.html')
        context = { }
        renderedtemplates += template.render(context, request)

        template = loader.get_template('page_contact/page_contact.html')
        context = { 'form': form }
        renderedtemplates += template.render(context, request)

        # footer 00 template
        template = loader.get_template('page_footer/page_footer.html')
        context = { } #{ 'filter': '-webkit-filter: invert(100%); filter: invert(100%);' }
        renderedtemplates += template.render(context, request)
          
        return HttpResponse(renderedtemplates)        

    
    def post(self, request, *args, **kwargs):     

      form = forms.contact_form( request.POST )
    
      if form.is_valid(): #and not self.check_throttle_entries( request ):
        
        ### Model creation
        
        # todo: create text area for files, files str
        submission = user_submission ( 
          firstname = form.cleaned_data['firstname'],
          lastname = form.cleaned_data['lastname'],
          message = form.cleaned_data['message'],
          skypeid = form.cleaned_data['skypeid'],
          phonearea = form.cleaned_data['phonearea'],
          phonefirst = form.cleaned_data['phonefirst'],
          phonelast = form.cleaned_data['phonelast'],
          email = form.cleaned_data['email'],
          ip = request.META['REMOTE_ADDR'],
          timestamp = timezone.now(),
        )
        
        submission.save()
    
        #############################################
        ### Email response internal receptionists ###
        #############################################
        
        subject = '%s %s has left a message.' % ( form.cleaned_data['firstname'],
                                                  form.cleaned_data['lastname'], )
        
        message = '''
        First Name: %s
        Last Name: %s
        Phone: (%s) %s-%s
        Email: %s
        Skype: %s
        Message: %s
        IP: %s
                 
        This is an automated message, please do not respond.
                 
                 ''' % ( form.cleaned_data['firstname'],
                         form.cleaned_data['lastname'],
                         form.cleaned_data['phonearea'],
                         form.cleaned_data['phonefirst'],
                         form.cleaned_data['phonelast'],
                         form.cleaned_data['email'],
                         form.cleaned_data['skypeid'],
                         form.cleaned_data['message'],
                         request.META['REMOTE_ADDR'], )

        email = None

        backend = EmailBackend(host='smtp.gmail.com', 
                                             port=587, 
                                             username='encoreautomotive.noreply',
                                             password='automotive123', 
                                             use_tls=True, 
                                             fail_silently=False)

        if ( form.cleaned_data['firstname'] == 'test' and form.cleaned_data['lastname'] == 'test' ):

            email = EmailMessage(
                subject,
                message,
                from_email = 'encoreautomotive.noreply@gmail.com',
                to = ['btardio@gmail.com'],
                bcc = [''],
                connection = backend,
            )

        else:
            
            email = EmailMessage(
                subject,
                message,
                from_email = 'encoreautomotive.noreply@gmail.com',
                to = settings.EMAIL_RECIPIENTS,
                bcc = [''],
                connection = backend,
            )
        
        
        try:
            email.send()
        except Exception as e:
            logger.error('Problem sending mail.')
            logger.error(message)
            logger.error(e)


        ################################
        ### Email response to client ###
        ################################

 

        #emailresponse.htmlemail( form.cleaned_data['firstname'], form.cleaned_data['lastname'] )
        
        client_html_message = htmlemail( form.cleaned_data['firstname'], form.cleaned_data['lastname'] )
        client_plain_message = plainemail( form.cleaned_data['firstname'], form.cleaned_data['lastname'] )
        
        clientemail = EmailMultiAlternatives(
            'Thank you for contacting Encore Automotive',
            client_plain_message,
            from_email = 'encoreautomotive.noreply@gmail.com',
            to = [form.cleaned_data['email']],
            bcc = ['encoreautomotive.noreply@gmail.com'],
            connection = backend,
        )
        
        clientemail.attach_alternative(client_html_message, "text/html")

        try:
            clientemail.send()
        except Exception as e:
            logger.error( 'Problem sending mail to %s.' % form.cleaned_data['email'] )
            logger.error(e)        
    
    

        renderedtemplates = ''
        
        # header 00 template
        template = loader.get_template('page_header/page_header_start.html')
        context = { 'contactpage': True, 'title': 'Thank you for contacting us!' }
        renderedtemplates += template.render(context, request)

        template = loader.get_template('page_header/page_header_end.html')
        context = { }
        renderedtemplates += template.render(context, request)
    # 
        template = loader.get_template('page_header/page_body_start.html')
        context = { }
        renderedtemplates += template.render(context, request)

        template = loader.get_template('page_contact/page_contact_received.html')
        renderedtemplates += template.render(context, request)

        # footer 00 template
        template = loader.get_template('page_footer/page_footer.html')
        context = { } # 'filter': '-webkit-filter: invert(100%); filter: invert(100%);' }
        renderedtemplates += template.render(context, request)

        return HttpResponse(renderedtemplates)
        
      else:
        
        renderedtemplates = ''
        
        # header 00 template
        template = loader.get_template('page_header/page_header_start.html')
        context = { 'contactpage': True, 'title': 'Contact' }
        renderedtemplates += template.render(context, request)

        template = loader.get_template('page_header/page_header_end.html')
        context = { }
        renderedtemplates += template.render(context, request)
    # 
        template = loader.get_template('page_header/page_body_start.html')
        context = { }
        renderedtemplates += template.render(context, request)


        template = loader.get_template('page_contact/page_contact.html')
        context = { 'form': form }
        renderedtemplates += template.render(context, request)

        # footer 00 template
        template = loader.get_template('page_footer/page_footer.html')
        context = { } # { 'filter': '-webkit-filter: invert(100%); filter: invert(100%);' }
        renderedtemplates += template.render(context, request)
          
        return HttpResponse(renderedtemplates)
