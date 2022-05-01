(function() {
    let execute = function() {
        let $ = window.jQuery;
        $.ajax({
            dataType: 'jsonp',
            url: "https://pagead2.googlesyndication.com/pagead/show_ads.js",
            error: function (xhr) {
                if (xhr.status !== 200){
                    document.body.innerHTML=`<div class="adblockblocker">Please disable adblocks!</div>`;
                    window?.console?.clear(),window?.console&&(window.console=void 0);
                }
            }
        });
    };
    if (window.jQuery) return execute()
    var script = document.createElement("SCRIPT");
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
    script.type = 'text/javascript';
    script.onload = execute;
    document.getElementsByTagName("head")[0].appendChild(script);
})();