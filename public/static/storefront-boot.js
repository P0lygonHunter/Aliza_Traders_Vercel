(function(){
  fetch('/static/storefront.html')
    .then(function(r){ return r.text(); })
    .then(function(html){
      var root = document.getElementById('storefront-root');
      if (root) root.innerHTML = html;
    })
    .catch(function(e){ console.error('storefront load failed', e); });
})();
