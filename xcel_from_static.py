


import csv
import os

productslstdir = ( os.listdir('./page_parts/static/page_parts/product_images/') )

productslst = []
#productlst = [ p for p in productslst ( p[10] == "-" ? p[0:10] : p[0:9] ) ]
# p[0:10].replace("-","")
#print ( productlst )



for p in productslstdir:
    print(len(p))
    if len(p) == 17:
        productslst.append(p[0:10])
    elif len(p) == 16:
        productslst.append(p[0:9])
    else:
        raise Exception("filename either too short or too long")

rowslist = []

with open('encore_starter_xcel.csv', 'r') as csvfile:

    spamreader = csv.reader(csvfile, delimiter=';', quotechar='|')
    for row in spamreader:
        #print( row[12] )
        if row[12] in productslst:
            
            #print ( row[12] )
            #print ( row[23] )
            
            row[23] = row[12]
            
            
            row[24] = productslst.count(row[12])
            
            #if ( row[24] != '' ):
            #    row[24] = int(row[24]) + 1
            #else:
            #    row[24] = 1
                
            row[25] = 'jpg'
            
        rowslist.append(row)
        #pass
        #print (', '.join(row))

#print(rowslist)

with open('encore_generated.csv', 'w') as f:
    writer = csv.writer(f)
    
    
    for row in rowslist:
        print(row)
        writer.writerow(row)
    


    
