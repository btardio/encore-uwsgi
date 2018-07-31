from django import forms

class contact_form(forms.Form):

  firstname = forms.CharField(label = 'First:', max_length = 255, 
                              widget = forms.TextInput( attrs={'class': 'validate'} ) )
  
  lastname = forms.CharField(label = 'Last:', max_length = 255, required = False,
                              widget = forms.TextInput( attrs={'class': 'validate'} ) )
  
  phonearea = forms.CharField(label='Phone:', max_length = 3, min_length = 3,
                              widget = forms.TextInput( attrs={'style': 'validate'} ) )
                          
  phonefirst = forms.CharField(label='', max_length = 3, min_length = 3,
                               widget = forms.TextInput( attrs={'style': 'validate'} ) )
                               
  phonelast = forms.CharField(label='', max_length = 4, min_length = 4,
                              widget = forms.TextInput( attrs={'style': 'validate'} ) )

  skypeid = forms.CharField(label='Skype:', max_length = 255, min_length = 2,
                              widget = forms.TextInput( attrs={'style': 'validate'} ) )

  email = forms.EmailField(label = "Email:",
                           max_length = 255,
                           widget = forms.TextInput( attrs={'class': 'validate'} ) )
  
  
  message = forms.CharField(label = 'Message:', required = False, max_length = 65535,
                                widget = forms.Textarea( attrs={'class': 'materialize-textarea'} ) )
  
  
  
  
  
