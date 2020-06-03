var Saba;
(function (Saba) {
    var JsonFormatter;
    (function (JsonFormatter) {
        var okFileList = ['Actors.json', 'Armors.json', 'Classes.json', 'Skills.json', 'Items.json', 'Enemies.json', 'Weapons.json', 'States.json', 'System.json', 'Troops.json', 'MapInfos.json', 'CommonEvents.json'];
        if (Utils.isNwjs()) {
            var fs = require('fs');
            var DATA_PATH = function () {
                var p = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, '/data/');
                if (p.match(/^\/([A-Z]\:)/)) {
                    p = p.slice(1);
                }
                return decodeURIComponent(p);
            }();
        }
        DataManager.loadDataFile = function (name, src) {
            var xhr = new XMLHttpRequest();
            var url = 'data/' + src;
            xhr.open('GET', url);
            xhr.overrideMimeType('application/json');
            xhr.onload = function () {
                if (xhr.status < 400) {
                    window[name] = JSON.parse(xhr.responseText);
                    if (fs && okFileList.indexOf(src) >= 0) {
                        var text = JSON.stringify(window[name], null, '  ');
                        if (xhr.responseText != text) {
                            fs.writeFileSync(DATA_PATH + src, text);
                            console.log('書き込みしました' + url);
                        }
                    }
                    DataManager.onLoad(window[name]);
                }
            };
            xhr.onerror = function () {
                DataManager._errorUrl = DataManager._errorUrl || url;
            };
            window[name] = null;
            xhr.send();
        };
    })(JsonFormatter || (JsonFormatter = {}));
})(Saba || (Saba = {}));
