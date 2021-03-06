document.addEventListener('DOMContentLoaded', function() {
    var onClick = function(e) {
        var id = e.target.getAttribute('data-id') || e.target.parentNode.getAttribute('data-id');
        if(id) {
            chrome.tabs.update(parseInt(id, 10), { selected: true });
            return false;
        }
        return true;
    };
    var ul = document.getElementsByTagName('ol').item(0);
    chrome.tabs.getAllInWindow(function(tabs) {
        tabs.forEach(function(t) {
            var li = document.createElement('li');
            li.setAttribute('data-url', t.url);
            li.setAttribute('title', t.url);
            li.setAttribute('data-title', t.title);
            li.setAttribute('data-id', t.id);

            if(t.favIconUrl) {
                var img = document.createElement('img');
                img.src = t.favIconUrl;
                img.setAttribute('width', '16');
                img.setAttribute('height', '16');
                li.appendChild(img);
            }
            
            var span1 = document.createElement('span');
            span1.setAttribute('class', 'title');
            span1.textContent = t.title;
            li.appendChild(span1);

            var span2 = document.createElement('span');
            span2.setAttribute('class', 'domain');
            span2.textContent = t.url.indexOf('chrome://') == 0 ? t.url : t.url.replace(/^[^:]+:\/\//, '').replace(/\/.*$/, '');
            li.appendChild(span2);

            li.addEventListener('click', onClick, true);
            if(t.selected) {
                li.setAttribute('class', 'selected');
            }
            ul.appendChild(li);
        });
    });

    var input = document.getElementsByTagName('input').item(0);
    var lastQuery = '';
    var updateResult = function() {
        if(lastQuery === input.value) {
            return;
        }
        lastQuery = input.value;

        var queries = input.value.split(/[ 　]/);
        var lis = ul.getElementsByTagName('li');
        for(var i = 0, l = lis.length; i < l; i++) {
            var li = lis.item(i),
                url = li.getAttribute('data-url'),
                title = li.getAttribute('data-title');
            var matched = queries.every(function(q) {
                switch(searchType) {
                case 'all':
                    return (url && url.indexOf(q) >= 0) || (title && title.indexOf(q) >= 0);
                case 'title':
                    return (title && title.indexOf(q) >= 0);
                case 'url':
                    return (url && url.indexOf(q) >= 0);
                default:
                    return false;
                }
            });
            console.log(title + ' : ' + url + ' : ' + matched);
            li.style.display = matched ? '' : 'none';
        }
    };

    var searchType;
    var radios = document.getElementsByName('type');
    var typeChanged = function() {
        for(var i = 0, l = radios.length; i < l; i++) {
            var r = radios.item(i);
            if(r.checked) {
                searchType = r.value;
                lastQuery = null;
                break;
            }
        }
        updateResult();
    };
    typeChanged();
    for(var i = 0, l = radios.length; i < l; i++) {
        radios.item(i).addEventListener('change', typeChanged);
    }

    input.addEventListener('keydown', updateResult);
    input.addEventListener('change', updateResult);
    setInterval(updateResult, 1000);

    document.addEventListener('keydown', function(e) {
        if(e.keyCode === 27) {
            window.close();
        }
    });
});
