
/* todos? consolidate engine into 1 field */

var yearfacetedlst = [];
var makefacetedlst = [];
var modelfacetedlst = [];
var enginefacetedlst = [];
var productfacetedlst = [];


var yearfacetedselectedlst = [];
var makefacetedselectedlst = [];
var modelfacetedselectedlst = [];
var enginefacetedselectedlst = [];
var productfacetedselectedlst = [];

var fqs = [];

var currentsort = "partnumber";
var currentoemsort = "yearfaceted";

var currentlyinchange = false;

var yearran = false;
var makeran = false;
var modelran = false;
var engineran = false;
var productran = false;



function clearfqslist(){
    
    fqs.length = 0;
    
}


function alertfqslist( $ ){
    
    liststr = ""
    
    $.each( fqs, function( i )
    {
     
        liststr += fqs[i] + " ";
        
    });
    
    alert(liststr);
    
}

var yearselected = false;
var makeselected = false;
var modelselected = false;
var engineselected = false;

/*
 * 
 * Gathers the facet query and creates a seleted lst of options
 * Sets booleans for selected items so that the facetquery function
 * knows to make the divs visible for sequential searching
 */
function gatherfqs( $ ){
    
    clearfqslist();
    
    yearselected = false;
    makeselected = false;
    modelselected = false;
    
    $.each( $("#body_year_select").prop("selectedOptions"), function( key, val ) 
    {
        if ( yearfacetedlst[val.index] != undefined && yearfacetedlst[val.index] != "No Selection" ){
            yearselected = true;
            fqs.push("yearfaceted:" + yearfacetedlst[val.index]);
            yearfacetedselectedlst.push(yearfacetedlst[val.index]);
        }
    } );
    
    $.each( $("#body_make_select").prop("selectedOptions"), function( key, val ) 
    {
        if ( makefacetedlst[val.index] != undefined && makefacetedlst[val.index] != "No Selection" ){
            makeselected = true;
            fqs.push("makefaceted:" + makefacetedlst[val.index]);
            makefacetedselectedlst.push(makefacetedlst[val.index]);
        }
    } );        

    $.each( $("#body_model_select").prop("selectedOptions"), function( key, val ) 
    {
        if ( modelfacetedlst[val.index] != undefined && modelfacetedlst[val.index] != "No Selection" ){
            modelselected = true;
            fqs.push("modelfaceted:" + modelfacetedlst[val.index]);
            modelfacetedselectedlst.push(modelfacetedlst[val.index]);
        }
    } );        
    
    $.each( $("#body_engine_select").prop("selectedOptions"), function( key, val ) 
    {
        if ( enginefacetedlst[val.index] != undefined && enginefacetedlst[val.index] != "No Selection" ){
            engineselected = true;
            fqs.push("enginefaceted:" + enginefacetedlst[val.index]);
            enginefacetedselectedlst.push(enginefacetedlst[val.index]);
        }
    } );    
        
    $.each( $("#body_product_select").prop("selectedOptions"), function( key, val ) 
    {
        if ( productfacetedlst[val.index] != undefined && productfacetedlst[val.index] != "No Selection" ){
            fqs.push("productfaceted:" + productfacetedlst[val.index]);
            productfacetedselectedlst.push(productfacetedlst[val.index]);
        }
    } );
    
}

/*
 * whenever a select changes this invokes the clear button for the next
 * select box, if it is the last or second to last field then it also
 * invokes query
 * 
 */
function onchangeselect( $, domelement ){
    
    if ( domelement.attr("id") == "body_year_select" ){
        domelement.change(function () {
           
            if ( ! currentlyinchange ){
                
                // whenever year select changes, clear the next select box
                $("#clrselectmake").click();
                                
            }
        });
    }
    else if ( domelement.attr("id") == "body_make_select" ){
        domelement.change(function () {

            if ( ! currentlyinchange ){
                
                $("#clrselectmodel").click();
                
            }
        });
    }
    else if ( domelement.attr("id") == "body_model_select" ){
        domelement.change(function () {
            
            if ( ! currentlyinchange ){
                
                $("#clrselectengine").click();
                                
            }
        });
    }
    else if ( domelement.attr("id") == "body_engine_select" ){
        domelement.change(function () {

            if ( ! currentlyinchange ){
            
                $("#clrselectproduct").click();
                                
                makesearchrequest($, {}, currentsort);
                
            }
        });
    }
    
    else if ( domelement.attr("id") == "body_product_select" ){
        domelement.change(function () {

            if ( ! currentlyinchange ){
                
                gatherfqs( $ );
                                
                makesearchrequest($, {}, currentsort);
                
            }
        });
    }
}

/*
 * converts the facetquery list into a String
 */
function gatherfqstring( $ ){
    
    fqstr = ""
    
    $.each( fqs, function( i )
    {

        if ( i != 0 ){
            fqstr += " AND ";
        }
        fqstr += fqs[i].replace(":", ":\"") + "\"";
        
    });
    
    return fqstr;

}

// used for facet search, solr returns a json str, the results are made into a dict for each facet
function makeintodict( $, alist ){

    count = 2;
    keystr = ""
    var adict = {};
    
    $.each( alist, function( key, val ) {
        
        if ( count % 2 == 0 ){
            
            keystr = val;

        }
        else {
            adict[keystr] = val;
        }
        
        count += 1;
        
    } );
    
    return adict;
    
}

/*
 * Makes an ajax request to solr with facetdict as parameters,
 * fills the select boxes with values
 * Affects the following global variables:
 * outlst: this list contains the inner text of the options for the select, it is used to create the fq and 
 *         determine which options are selected
 * selectedlst: after reselectemptiedfields is called the list is cleared, if a search button were every implemented
 *              user can search with having an empty selectedlst even though things are selected, this is because
 *              this list is filled whenever a select changes with onchange
 * 
 * domelement: the select box to fill
 * facetdict: the parameters for the solr request
 * expectedlst: expected fields returned by the query
 * errorcode: the error to log for the request, which select box failed
 * outlst: this lst contains the options for the select, it is populated after query
 * selectedls: this lst contains the options selected prior to query, it is used to reselect after query
 * reverse: this boolean determines sort order, currently it is not changed whenever user clicks on table column
 */
function makefacetrequest ( $, domelement, facetdict, expectedlst, errorcode, outlst, selectedlst, reverse, retryattempts = 0 ){
    
    gatheredstr = gatherfqstring( $ );
    
    if ( gatheredstr != "" ){
        facetdict['fq'] = gatheredstr;
    }
    
    // note: there are only a certain number of acceptable fields for the request's facetdict
    $.getJSON( "http://" + domain + "/makefacetrequest", facetdict,
        function( data, status, xhr ) { 
            
            try {
                
                var count = 0;
                var items = [];
                
                // check that what was returned by the query is what was expected
                if ( ! expectedlst[0] in data || 
                     ! expectedlst[1] in data[expectedlst[0]] || 
                     ! expectedlst[2] in data[expectedlst[0]][expectedlst[1]] ||
                     ! Array.isArray(data[expectedlst[0]][expectedlst[1]][expectedlst[2]] ) ){
                    
                    domelement.append("Something has gone wrong. This error has been logged.");
                    alert("Something has gone wrong. This error has been logged.");
                    $.get( "http://" + domain + "/logerror?errorcode=" + errorcode + "&errormessage=" + xhr.responseText);
                
                }
                else{
                    
                    domelement.empty();

                    // empty the outlst to refill it with entries from the query
                    outlst.length = 0;
                    
                    // makes the results into a dict
                    adict = makeintodict( $, data[expectedlst[0]][expectedlst[1]][expectedlst[2]] );
                    
                    // sorts the facet results, could be done by solr, but nyi
                    iterlist = Object.keys(adict).sort();
                    
                    if ( reverse ){
                        iterlist = iterlist.reverse();
                    }
                    
                    var option = $("<option></option>");
                    
                    option.append("No Selection");
                    
                    domelement.append(option);                    
                    
                    outlst.push("No Selection");
                    
                    // iterates the results from solr, creating options
                    $.each( iterlist, function( key, val ) 
                    {
                        
                        var option = $("<option></option>");
                        
                        option.append(val); // + " (" + adict[val] + ")");
                        
                        domelement.append(option);
                        
                        // stores all the options in a list - psuedo javascript pointer
                        // to a global variable
                        outlst.push(val);
                        
                    });
                    
                    
                    // disable all selects
                    $("#body_model_select").prop("disabled", true);
                    $("#body_make_select").prop("disabled", true);
                    $("#body_engine_select").prop("disabled", true);
                    $("#body_product_select").prop("disabled", true);
                                        
                    // since queries are returned non sequential keep boolenas
                    // for queries that have ran, so that we can make the 
                    // appropriate divs appear
                    if ( domelement.attr("id") == "body_year_select" ){
                    
                        yearran = true;
                        
                    }
                    else if ( domelement.attr("id") == "body_make_select" ){
                     
                        makeran = true;
                        
                    }
                    else if ( domelement.attr("id") == "body_model_select" ){
                     
                        modelran = true;                        
                        
                    }
                    else if ( domelement.attr("id") == "body_engine_select" ){
                        
                        engineran = true;
                        
                    }
                    else if ( domelement.attr("id") == "body_product_select" ){
                    
                        productran = true;
                    
                    }
                    
                    
                    // enable divs based on whether the required queries have ran
                    if ( yearran ){
                     
                        $("#body_year_select").prop("disabled", false);
                        
                    }
                    
                    if ( yearselected && makeran ){
                        
                        $("#body_make_select").prop("disabled", false);
                        
                    }
                    
                    if ( yearselected && makeselected && modelran ){
                        
                        $("#body_model_select").prop("disabled", false);
                        
                    }
                    
                    if ( yearselected && makeselected && modelselected && engineran ){
                        
                        $("#body_engine_select").prop("disabled", false);
                        
                    }                    
                    
                    if ( yearselected && makeselected && modelselected && engineselected && productran ){
                        
                        $("#body_product_select").prop("disabled", false);
                        
                    }
                    
                    domelement.formSelect({"classes": "enc-select-dropdown"});
                    
                }
        
            }
            catch(error) {
                
                if ( retryattempts < 5 ){
                    retryattempts += 1;
                    makefacetrequest ( $, domelement, facetdict, expectedlst, errorcode, outlst, selectedlst, reverse, retryattempts );
                }
                else{
                    domelement.append("Something has gone wrong. This error has been logged.");
                    alert("Something has gone wrong. This error has been logged.");
                    $.get( "http://" + domain + "/logerror?errorcode=" + errorcode + "&errormessage=" + xhr.responseText);
                }
            }
            
            // reselects fields that were previously selected, clears the selected list (psuedo pointer)
            reselectemptiedfields( $, domelement, selectedlst );
            
        }).fail(function(xhr) {

            if ( retryattempts < 5 ){
                
                retryattempts += 1;
                makefacetrequest ( $, domelement, facetdict, expectedlst, errorcode, outlst, selectedlst, reverse, retryattempts );
            
            }
            else{
                domelement.append("Something has gone wrong. This error has been logged.");
                alert("Something has gone wrong. This error has been logged.");
                $.get( "http://" + domain + "/logerror?errorcode=" + errorcode + "&errormessage=" + xhr.responseText);
            }
                
        });

}

// determines if the fields in the select domelement match those in lstselected and 
// reselects them
function reselectemptiedfields( $, domelement, lstselected ){
    
    $.each( domelement.prop("children"), function( k, v )
    {
        
        $.each( lstselected, function( ka, va ){
            
            if ( v.innerHTML.replace("&amp;", "&").includes(va) ){
                v.selected = true;
            }
        });
    });

    domelement.formSelect({"classes": "enc-select-dropdown"});
    
    lstselected.length = 0;
    
}

// creates a header row for the table
function createheaderrow( $, sort ){
    
    var sortglyphstr = '&nbsp;<span class="ui-icon ui-icon-caret-1-s"></span>';
    
    searchrow = $("<tr></tr>");
    
    headercolumn = $('<th style="width:16%;"><div id="sortpartnumber" class="encoresort">Part Number' + 
                        ( currentsort == "partnumber" ? sortglyphstr : "") + 
                        '</div></th>');
    headercolumn.click( function(){currentsort = "partnumber"; makesearchrequest ( $, {}, currentsort );});
    searchrow.append( headercolumn );
    
    headercolumn = $('<th style="width:19%;"><div id="sortproduct" class="encoresort">Product' +
                        ( currentsort == "productfaceted" ? sortglyphstr : "") + 
                        '</div></th>'); 
    headercolumn.click(  function(){currentsort = "productfaceted"; makesearchrequest ( $, {}, currentsort );});
    searchrow.append( headercolumn );
    
    headercolumn = $('<th style="width:14%;"><div id="sortyear" class="encoresort">Year' + 
                        ( currentsort == "yearfaceted" ? sortglyphstr : "") +
                        '</div></th>'); 
    headercolumn.click(  function(){currentsort = "yearfaceted"; makesearchrequest ( $, {}, currentsort );});
    searchrow.append( headercolumn );
    
    headercolumn = $('<th style="width:16%;"><div id="sortmake" class="encoresort">Make' +
                        ( currentsort == "makefaceted" ? sortglyphstr : "") +
                        '</div></th>'); 
    headercolumn.click(  function(){currentsort = "makefaceted"; makesearchrequest ( $, {}, currentsort );});
    searchrow.append( headercolumn );
    
    headercolumn = $('<th style="width:16%;"><div id="sortmodel" class="encoresort">Model' + 
                        ( currentsort == "modelfaceted" ? sortglyphstr : "") +
                        '</div></th>'); 
    headercolumn.click(  function(){currentsort = "modelfaceted"; makesearchrequest ( $, {}, currentsort );});
    searchrow.append( headercolumn );
    
    headercolumn = $('<th style="width:16%;"><div id="sortengine" class="encoresort">Engine' +
                        ( currentsort == "engineliters" ? sortglyphstr : "") + 
                        '</div></th>'); 
    headercolumn.click(  function(){currentsort = "engineliters"; makesearchrequest ( $, {}, currentsort );});
    searchrow.append( headercolumn );
    
    return searchrow;
}
    
/*
 * 
 * Makes an ajax request to solr with facetdict and sort as parameters
 * This function fills the table in tab 1 with values received from solr, 
 * links are created in the table for detailed product search
 * 
 */

function makesearchrequest ( $, facetdict, sort, retryattempts=0 ){

    var searchresults;
    
    gatheredstr = gatherfqstring( $ );
    
    if ( ! ( gatheredstr.includes("yearfaceted") && 
         gatheredstr.includes("makefaceted") &&
         gatheredstr.includes("modelfaceted") &&
         gatheredstr.includes("enginefaceted") ) ){
        return;
    }
            
    if ( gatheredstr != "" ){
        facetdict['fq'] = gatheredstr;

        facetdict['sort'] = sort + " asc";
        
        // note: there are only a certain number of acceptable fields for the request's facetdict
        $.getJSON( "http://" + domain + "/makesearchrequest", facetdict,
            function( data ) { 
                
                $("#encoreparts").empty();
                
                searchresults = data;
                                
                searchtable = $('<table class="highlight"></table>');
                
                searchrow = createheaderrow( $, sort);
                
                searchtable.append(searchrow);

                // iterates the search results creating a row
                $.each( $(data).attr("grouped").partnumber.doclist.docs, function( index, doc ) 
                {
                    searchrow = $('<tr class="encoreproductrow"></tr>');
                    
                    searchrow.append('<td>' + ( doc.partnumber ? doc.partnumber : "") + "</td>"); searchtable.append(searchrow);
                    
                    searchrow.append('<td>' + ( doc.product ? doc.product : "") + "</td>"); searchtable.append(searchrow);
                    
                    searchrow.append('<td>' + ( doc.year ? doc.year : "" ) + "</td>"); searchtable.append(searchrow);
                    
                    searchrow.append('<td>' + ( doc.make ? doc.make : "" ) + "</td>"); searchtable.append(searchrow);
                    
                    searchrow.append('<td>' + ( doc.model ? doc.model : "" ) + "</td>"); searchtable.append(searchrow);
                    
                    searchrow.prop("encorepartnumber", doc.partnumber);
                    
                    searchrow.append('<td>' + 
                                    ( doc.engineliters ? doc.engineliters + "L " : "" ) + 
                                    ( doc.enginecylinder ? doc.enginecylinder + " Cyl " : "" ) + 
                                    ( doc.enginecc ? doc.enginecc.toString() + "cc " : "" ) + 
                                    ( doc.engineblock ? doc.engineblock : "" ) + 
                                    "</td>"); 
                    
                    // assigns an onclick to the row, for the second tab, part detail search and
                    // execute oemsearch
                    searchrow.click(function(row){ 
                        if ( tabsinstance != null ){ tabsinstance.select("tab2"); } 
                        var inputid = this.encorepartnumber; 
                        executepartdetailsearch( $, inputid ); 
                        $("#encorepartinputid").val(inputid);  
                    });
                        
                    searchtable.append(searchrow);
                });
                
                $("#encoreparts").append(searchtable);
                
            }).fail(function(xhr) {
                
                if ( retryattempts < 5 ){
                    retryattempts += 1;
                    makesearchrequest ( $, facetdict, sort, retryattempts );
                }
                else{
                    $("#encoreparts").append("Something has gone wrong. This error has been logged.");
                    alert("Something has gone wrong. This error has been logged.");
                    $.get( "http://" + domain + "/logerror?errorcode=109&errormessage=" + xhr.responseText);
                }
                
            });
    }
}



function fillyearfaceted ( $ ){
    
    makefacetrequest( $, $("#body_year_select"), {"facet.mincount": "1", "facet.limit": "-1", "facet.field": "yearfaceted", "facet.sort": "false"}, ['facet_counts','facet_fields','yearfaceted'], "100", yearfacetedlst, yearfacetedselectedlst, true );
    
}


function fillmakefaceted ( $ ){
    
    makefacetrequest( $, $("#body_make_select"), {"facet.mincount": "1", "facet.limit": "-1", "facet.field": "makefaceted", "facet.sort": "false"}, ['facet_counts','facet_fields','makefaceted'], "101", makefacetedlst, makefacetedselectedlst, false );
    
}

function fillmodelfaceted ( $ ){
    
    makefacetrequest( $, $("#body_model_select"), {"facet.mincount": "1", "facet.limit": "-1", "facet.field": "modelfaceted", "facet.sort": "false"}, ['facet_counts','facet_fields','modelfaceted'], "102", modelfacetedlst, modelfacetedselectedlst, false );
    
}

function fillenginefaceted ( $ ){
    
    makefacetrequest( $, $("#body_engine_select"), {"facet.mincount": "1", "facet.limit": "-1", "facet.field": "enginefaceted", "facet.sort": "false"}, ['facet_counts','facet_fields','enginefaceted'], "113", enginefacetedlst, enginefacetedselectedlst, false );
    
}

function fillproductfaceted ( $ ){
    
    makefacetrequest( $, $("#body_product_select"), {"facet.mincount": "1", "facet.limit": "-1", "facet.field": "productfaceted", "facet.sort": "false"}, ['facet_counts','facet_fields','productfaceted'], "108", productfacetedlst, productfacetedselectedlst, false );
    
}

/*
 * calls the fill function for only the dom element pass as parameter
 * 
 */
function fillonly ( $, domelement ){
    
    if ( domelement.attr("id") == "body_year_select" ){
        fillyearfaceted( $ );
    }
    else if ( domelement.attr("id") == "body_make_select" ){
        fillmakefaceted( $ );
    }
    else if ( domelement.attr("id") == "body_model_select" ){
        fillmodelfaceted( $ );
    }
    else if ( domelement.attr("id") == "body_engine_select" ){
        fillenginefaceted( $ );
    }    
    else if ( domelement.attr("id") == "body_product_select" ){
        fillproductfaceted( $ );
    }
}


function fill ( $ ){
    
    fillyearfaceted( $ ); 
    fillmakefaceted( $ );
    fillmodelfaceted( $ );
    fillenginefaceted( $ );
    fillproductfaceted ( $ );
    
}

function setonchange ( $ ){
    
    onchangeselect( $, $("#body_year_select") ); 
    onchangeselect( $, $("#body_make_select") );
    onchangeselect( $, $("#body_model_select") );
    onchangeselect( $, $("#body_engine_select") );
    onchangeselect( $, $("#body_product_select") );
    
}

/*
 * makes the filter clear onclick callback for each facet
 */
function setclearfilters( $ ){
    
    $("#clrselectyear").click( function(){ 

        //currentlyinchange = true;
        
        // turns off the event signal handler for selects
        $("#body_year_select").off("change");
        $("#body_make_select").off("change");
        $("#body_model_select").off("change");
        $("#body_engine_select").off("change");
        $("#body_product_select").off("change");
        
        // clears the selected lists
        yearfacetedselectedlst.length = 0;
        makefacetedselectedlst.length = 0;
        modelfacetedselectedlst.length = 0;
        enginefacetedselectedlst.length = 0;
        productfacetedselectedlst.length = 0;          

        // unselects all selects and sets option to No Selection
        $.each( $("#body_year_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; } }); 
        $.each( $("#body_make_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }}); 
        $.each( $("#body_model_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }});
        $.each( $("#body_engine_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }});
        $.each( $("#body_product_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }}); 
        
        // disables the selects after the current select
        $("#body_make_select").prop("disabled", true); 
        $("#body_model_select").prop("disabled", true);
        $("#body_engine_select").prop("disabled", true);
        $("#body_product_select").prop("disabled", true);

        // re initializes selects
        $("#body_year_select").formSelect({"classes": "enc-select-dropdown"});
        $("#body_make_select").formSelect({"classes": "enc-select-dropdown"});
        $("#body_model_select").formSelect({"classes": "enc-select-dropdown"});
        $("#body_engine_select").formSelect({"classes": "enc-select-dropdown"});
        $("#body_product_select").formSelect({"classes": "enc-select-dropdown"});        
        
        // resets booleans indicating query ran
        yearran = false;
        makeran = false;
        modelran = false;
        engineran = false;
        productran = false;
        
        // gathers, or resets the facet query fields
        gatherfqs( $ ); 
        
        // fills, calls query, for the select
        fillonly( $, $("#body_year_select") );

        // empties the table div
        $("#encoreparts").empty();

        //currentlyinchange = false;
        
        // re enables the signal handler for the selects
        onchangeselect( $, $("#body_year_select") ); 
        onchangeselect( $, $("#body_make_select") );
        onchangeselect( $, $("#body_model_select") );
        onchangeselect( $, $("#body_engine_select") );
        onchangeselect( $, $("#body_product_select") );        
        
    });

    $("#clrselectmake").click( function(){ 
        
        //currentlyinchange = true;
        
        $("#body_make_select").off("change");
        $("#body_model_select").off("change");
        $("#body_engine_select").off("change");
        $("#body_product_select").off("change");        
        
        makefacetedselectedlst.length = 0;
        modelfacetedselectedlst.length = 0;
        enginefacetedselectedlst.length = 0;
        productfacetedselectedlst.length = 0;                
        
        $.each( $("#body_make_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }}); 
        $.each( $("#body_model_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }});
        $.each( $("#body_engine_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }});
        $.each( $("#body_product_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }}); 
        
        $("#body_model_select").prop("disabled", true);
        $("#body_engine_select").prop("disabled", true);
        $("#body_product_select").prop("disabled", true);
        
        $("#body_make_select").formSelect({"classes": "enc-select-dropdown"});
        $("#body_model_select").formSelect({"classes": "enc-select-dropdown"});
        $("#body_engine_select").formSelect({"classes": "enc-select-dropdown"});
        $("#body_product_select").formSelect({"classes": "enc-select-dropdown"});

        makeran = false;
        modelran = false;
        engineran = false;
        productran = false;
        
        gatherfqs( $ ); 
     
        fillonly( $, $("#body_make_select") );
        
        $("#encoreparts").empty();
        
        //currentlyinchange = false;
        
        onchangeselect( $, $("#body_make_select") );
        onchangeselect( $, $("#body_model_select") );
        onchangeselect( $, $("#body_engine_select") );
        onchangeselect( $, $("#body_product_select") );                
        
    });

    $("#clrselectmodel").click( function(){ 
        
        //currentlyinchange = true;
        
        $("#body_model_select").off("change");
        $("#body_engine_select").off("change");
        $("#body_product_select").off("change");         
        
        modelfacetedselectedlst.length = 0;
        enginefacetedselectedlst.length = 0;
        productfacetedselectedlst.length = 0;                        
        
        $.each( $("#body_model_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }}); 
        $.each( $("#body_engine_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }});
        $.each( $("#body_product_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }}); 
        
        $("#body_engine_select").prop("disabled", true);
        $("#body_product_select").prop("disabled", true);

        $("#body_model_select").formSelect({"classes": "enc-select-dropdown"});
        $("#body_engine_select").formSelect({"classes": "enc-select-dropdown"});
        $("#body_product_select").formSelect({"classes": "enc-select-dropdown"});        

        modelran = false;
        engineran = false;
        productran = false;
        
        gatherfqs( $ ); 
        
        fillonly( $, $("#body_model_select") );

        $("#encoreparts").empty();
        
        //currentlyinchange = false;
        
        onchangeselect( $, $("#body_model_select") );
        onchangeselect( $, $("#body_engine_select") );
        onchangeselect( $, $("#body_product_select") );    
        
    });

    
    $("#clrselectengine").click( function(){ 
        
        //currentlyinchange = true;
        
        $("#body_engine_select").off("change");
        $("#body_product_select").off("change");         
        
        enginefacetedselectedlst.length = 0;
        productfacetedselectedlst.length = 0;                        
        
        $.each( $("#body_engine_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }});
        $.each( $("#body_product_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }}); 
        
        $("#body_product_select").prop("disabled", true);

        $("#body_engine_select").formSelect({"classes": "enc-select-dropdown"});
        $("#body_product_select").formSelect({"classes": "enc-select-dropdown"});        

        engineran = false;
        productran = false;
        
        gatherfqs( $ ); 
        
        fillonly( $, $("#body_engine_select") );
        
        $("#encoreparts").empty();
        
        //currentlyinchange = false;
        
        onchangeselect( $, $("#body_engine_select") );
        onchangeselect( $, $("#body_product_select") );    
        
    });    
    
    
    $("#clrselectproduct").click( function(){ 
        
        //currentlyinchange = true;
        
        $("#body_product_select").off("change");   

        productfacetedselectedlst.length = 0;                
        
        $.each( $("#body_product_select").prop("children"), function( k, v ) { v.selected = false; if ( v.innerHTML == "No Selection" ){ v.selected = true; }}); 

        $("#body_product_select").formSelect({"classes": "enc-select-dropdown"});

        productran = false;
        
        gatherfqs( $ ); 
        
        fillonly( $, $("#body_product_select") );
        
        //currentlyinchange = false;
        
        onchangeselect( $, $("#body_product_select") );  
        
        // since the search queries fire off whenever 4 of five selects are selected, this clear function calls search
        makesearchrequest($, {}, currentsort); 
    });

}


function myshow(aelem){

    var elems = document.getElementsByClassName("partimagecls");
    var i;
    for (i = 0; i < elems.length; i++) {
        elems[i].style.display="none";
    } 
    
    document.getElementById(aelem).style.display="";
    
}

/*
 * executes a part search for the partnumber. this fills the second tab, left table with 
 * results, returning only 1 row for the part that was searched for 
 */
function executepartdetailsearch( $, partnumber, retryattempts=0 ){
    
    // note: there are only a certain number of acceptable fields for the request
    $.getJSON( "http://" + domain + "/executepartdetailsearch", { "partnumber": partnumber },
            function( data ) { 
                
                $("#encorepartdetail").empty();
                
                var partdetailtable = $('<table class="highlight"></table>');
                
                var headerrow = $("<tr></tr>");
                
                headerrow.append('<th style="width:33%;">Part Number</th>');
                headerrow.append('<th style="width:33%;">Product</th>');
                headerrow.append('<th style="width:33%;">Available</th>');
                
                partdetailtable.append(headerrow);
                
                // iterate the search results, creating a row
                $.each( $(data).attr("response").docs, function( index, doc ){
                    
                    var tablerow = $("<tr></tr>");
                    
                    tablerow.append("<td>" + doc.partnumber + "</td>");
                    tablerow.append("<td>" + doc.product + "</td>");
                    tablerow.append("<td>Available for purchase.</td>");
                
                    partdetailtable.append(tablerow);                    
                    
                });
                
                $("#encorepartdetail").append(partdetailtable);
                
                $("#encorepartdetailimage").empty();
                
                
                
                if ( $(data).attr("response").docs.length > 0 && "numberofimages" in $(data).attr("response").docs[0] ){
                    
                    for ( i = 1; i < parseInt($(data).attr("response").docs[0].numberofimages)+1; i++ ){
                        var partimage = $('<img class="partimagecls" id="' + 
                        $(data).attr("response").docs[0].imageprefix + 
                        "-0" + 
                        i + 
                        '" style="max-height:300px;" src="/static/page_parts/product_images/' + 
                        $(data).attr("response").docs[0].imageprefix + "-0" + 
                        i + 
                        "." + 
                        $(data).attr("response").docs[0].imagesuffix + 
                        '">');
                        $("#encorepartdetailimage").append(partimage);
                        
                        
                        
                        if ( i != 1 ){
                            partimage.hide();
                        }
                        
                    }
                    
                    $("#encorepartdetailimage").append("<br>");                    
                    
                    for ( i = 1; i < parseInt($(data).attr("response").docs[0].numberofimages)+1; i++ ){     
                        var partimagebutton = $('<a onclick="myshow(\'' + 
                        $(data).attr("response").docs[0].imageprefix + 
                        '-0' + 
                        i + 
                        '\');"' +
                        ' class="waves-effect waves-light btn">' + i + '</a>');
                        
                        $("#encorepartdetailimage").append(partimagebutton);
                        $("#encorepartdetailimage").append("&nbsp;");
                    }
                    
                               
                }
                
                
                
            }).fail(function(xhr) {

                if ( retryattempts < 5 ){
                    retryattempts += 1;
                    executepartdetailsearch( $, partnumber, retryattempts );
                }
                else{
                    $("#encorepartdetail").append("Something has gone wrong. This error has been logged.");
                    alert("Something has gone wrong. This error has been logged.");
                    $.get( "http://" + domain + "/logerror?errorcode=110&errormessage=" + xhr.responseText);
                }
                
                
            });
    

}



/*
 * this searches for an equivalent part based on the oem part number 
 */
function executeoempartsearch( $, oemnumber, retryattempts ){
    
    // note: there are only a certain number of acceptable fields for the request    
    $.getJSON( "http://" + domain + "/executeoempartsearch", {"oemnumber": oemnumber},

            function( data ) { 
                
                $("#encorepartoembody").empty();
                
                var partdetailtable = $('<table class="highlight"></table>');
                
                var headerrow = $("<tr></tr>");
                
                headerrow.append('<th style="width:33%;">Part Number</th>');
                headerrow.append('<th style="width:33%;">Product</th>');
                headerrow.append('<th style="width:33%;">Available</th>');
                
                partdetailtable.append(headerrow);
                
                // iterate the response
                $.each( $(data).attr("response").docs, function( index, doc ){
                    
                    var tablerow = $("<tr></tr>");
                    
                    tablerow.append("<td>" + doc.partnumber + "</td>");
                    tablerow.append("<td>" + doc.product + "</td>");
                    tablerow.append("<td>Available for purchase.</td>");
                
                    partdetailtable.append(tablerow);                    
                    
                });
                
                $("#encorepartoembody").append(partdetailtable);
                
            }).fail(function(xhr) {

                if ( retryattempts < 5 ){
                    retryattempts += 1;
                    executeoempartsearch( $, oemnumber, retryattempts );
                }
                else{
                    $("#encorepartdetail").append("Something has gone wrong. This error has been logged.");
                    alert("Something has gone wrong. This error has been logged.");
                    $.get( "http://" + domain + "/logerror?errorcode=112&errormessage=" + xhr.responseText);
                }                    
                
            });

}

/*
 * set onclick for the part search and oemsearch search buttons
 */
function setbtnclick( $ ){
    
    $("#encorepartdetailsearchbtn").click(function()
    {
        var inputid = $("#encorepartinputid").val();
        executepartdetailsearch( $, inputid );

    });
    
    $("#encoreoempartsearchbtn").click(function()
    {
        var inputid = $("#encoreoempartinputid").val();
        executeoempartsearch( $, inputid );
    });
    
    
}
