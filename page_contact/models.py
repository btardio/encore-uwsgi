from django.db import models

from datetime import datetime

# Create your models here.


class user_submission(models.Model):
  
    
    
  firstname = models.CharField( max_length = 255 )
  
  lastname = models.CharField( max_length = 255 )
    
  phonearea = models.CharField( max_length = 3 )
                          
  phonefirst = models.CharField( max_length = 3 )
                               
  phonelast = models.CharField( max_length = 4 )

  skypeid = models.CharField( max_length = 255 )

  email = models.EmailField( max_length = 255 )
    
  message = models.TextField( )
    
  ip = models.GenericIPAddressField ( )
  
  timestamp = models.DateTimeField ( )
  
  
  
  
  
