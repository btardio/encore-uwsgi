import csv
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

counter = 0

with open('encore_geocode_out2.csv', 'w', newline='\n') as csvfile:
    out = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    with open('encore_carquest_store_list2.csv', newline='\n') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',', quotechar='"')
        for row in spamreader:
            storename = row[0]
            address = row[1]
            city = row[2]
            state = row[3]
            zipcode = row[4]
            phone = row[5]
            country = row[6]
            storeid = row[10]
            
            
            
            if city != 'STORE_ADDR_CITY_NAME':
                
                url = 'http://dev.virtualearth.net/REST/v1/Locations/' + \
                                                country + \
                                                '/' + \
                                                state.replace(' ','%20').replace('.','%20').replace('&','%20').replace('#','%20').replace('"','%20').replace('/','%20') + \
                                                '/' + \
                                                zipcode.replace(' ','%20').replace('.','%20').replace('&','%20').replace('&','%20').replace('#','%20').replace('"','%20').replace('/','%20') + \
                                                '/' + \
                                                city.replace(' ','%20').replace('.','%20').replace('&','%20').replace('&','%20').replace('#','%20').replace('"','%20').replace('/','%20') + \
                                                '/' + \
                                                address.replace(' ','%20').replace('.','%20').replace('&','%20').replace('&','%20').replace('#','%20').replace('"','%20').replace('/','%20') + \
                                                '?o=xml&key=AjqHx4E-DUVOt0YFGMP08TjrlVeG0SPp74M-FrzdEiV4scu1oTd1oN-SNQzvQaLi'
                
                #print ( ( url ) )
                
                lat = 0
                lng = 0
                
                try: 
                    req = urllib.request.Request(url)
                    
                    with urllib.request.urlopen(req) as f:
                        reqxml = f.read()  # .decode('utf-8')
                        
                        tree = ET.fromstring(reqxml)
                        
        #                 root = tree.getroot()
        #
                        lat = tree[6][0][1][0][1][0].text
                        lng = tree[6][0][1][0][1][1].text
                        
                        # print ( city + ' ' + zipcode + '   ' + lat + ',' + lng )
                        
                except Exception as e:
#                     print ( 'error' )
#                     print ( lat )
#                     pass
                    lat = 0
                    lng = 0
#                 if lat <= 0.1 or lng <= 0.1:
                    url = 'http://www.mapquestapi.com/geocoding/v1/address?outFormat=xml&key=pceTDYXwtAXYdgPomq13BxUpUaGP7gE7&location=' + \
                                                    address.replace(' ','%20').replace('.','%20').replace('&','%20').replace('&','%20').replace('#','%20').replace('"','%20').replace('/','%20') + \
                                                    '%20' + \
                                                    city.replace(' ','%20').replace('.','%20').replace('&','%20').replace('&','%20').replace('#','%20').replace('"','%20').replace('/','%20') + \
                                                    '%20' + \
                                                    state.replace(' ','%20').replace('.','%20').replace('&','%20').replace('#','%20').replace('"','%20').replace('/','%20') + \
                                                    '%20' + \
                                                    zipcode.replace(' ','%20').replace('.','%20').replace('&','%20').replace('&','%20').replace('#','%20').replace('"','%20').replace('/','%20') + \
                                                    '%20' + \
                                                    country.replace(' ','%20').replace('.','%20').replace('&','%20').replace('&','%20').replace('#','%20').replace('"','%20').replace('/','%20')

                                                    #'?o=xml&key=AjqHx4E-DUVOt0YFGMP08TjrlVeG0SPp74M-FrzdEiV4scu1oTd1oN-SNQzvQaLi'
                    try: 
                        
                        req = urllib.request.Request(url)
                        
                        #print ( url )
                        
                        with urllib.request.urlopen(req) as f:
                            reqxml = f.read()  # .decode('utf-8')
                            
                            tree = ET.fromstring(reqxml)
                            
#                             print ( tree[1][0][1][0][11].getchildren() )
                            
            #                 root = tree.getroot()
            #                
                            lat = tree[1][0][1][0][11][0][0].text
                            lng = tree[1][0][1][0][11][0][1].text
                            #exit(0)
                            #print ( city + ' ' + zipcode + '   ' + lat + ',' + lng )
                            
                    except Exception as e:
                        print ( e )
                    #print ( )
                
                out.writerow([storename, 'CarQuest', storeid, address, city, state, zipcode, country, phone, lat, lng])
                




    #                 for child in root:
    # #                     print ( child )
    #                     print(child.tag, child.attrib)
                        
                
            #print(', '.join(row))
            
            
            
            
    # >>> 
    # >>> 
    # ...                       data=b'This data is passed to stdin of the CGI')
    # >>> with urllib.request.urlopen(req) as f:
    # ...     print(f.read().decode('utf-8'))