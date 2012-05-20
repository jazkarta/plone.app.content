(function($){



/* reload folder contents listings */
function replaceFolderContentsTable(overrides) {
    var fCF = $("form[name=folderContentsForm]");
    var defaults = {
        "sort_on": fCF.find("input[name=sort_on]").first().val(),
        "pagenumber": fCF.find("input[name=pagenumber]").first().val(),
        "show_all": fCF.find("input[name=show_all]").first().val()
    };
    $.get('foldercontents_get_table', $.extend(defaults, overrides), function(data) {
        $("#folderlisting-main-table").replaceWith(data);
        // fix up links generated by batching
        var orig_template = $("form[name=folderContentsForm] input[name=orig_template]").first().val();
        $("div.listingBar a").each(function(){
            $(this).attr("href", $(this).attr("href").replace(/foldercontents_get_table/, orig_template));
        });
        $(initializeDnDReorder('#listing-table'));
        $("#listing-table input:checkbox").enableCheckboxRangeSelection();
    });
}

/* enable reloading of the table for a given selector and set of overrides */
$.fn.enableTableReload = function(selector, overrides, prevent) {
    var $target = this;
    if(arguments.count < 3)
        prevent = false;
    if(arguments.count < 2)
        overrides = {};

    $target.delegate(selector, "click", function(event) {
        if(prevent)
            event.preventDefault();
        replaceFolderContentsTable(overrides);
    });
}

$(document).ready(function(){
    /* folder contents table loading actions */
    var ccore = $("#content-core");
    ccore.enableTableReload("#foldercontents-show-all", { "show_all": "True", "pagenumber": "1" }, true);
    ccore.enableTableReload("#foldercontents-show-batched", { "show_all": "False" }, true);
    ccore.enableTableReload("#foldercontents-title-column", { "sort_on": "sortable_title" });
    ccore.enableTableReload("#foldercontents-modified-column", { "sort_on": "modified" });
    ccore.enableTableReload("#foldercontents-status-column", { "sort_on": "review_state" });
    ccore.enableTableReload("#foldercontents-selectall", { "select": "screen" }, true);
    ccore.enableTableReload("#foldercontents-selectall-completebatch", { "select": "all" }, true);
    ccore.enableTableReload("#foldercontents-clearselection", { "select": "none" }, true);
    ccore.delegate("div.listingBar a", "click", function(event) {
        event.preventDefault();
        var link = $(this).attr("href");
        var page = decodeURI((RegExp("pagenumber\:int" + '=' + '(.+?)(&|$)').exec(link)||[,null])[1]);
        replaceFolderContentsTable({ "pagenumber": page });
    });
});

})(jQuery);
