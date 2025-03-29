var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var addPointToCanvas = function (point) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var getMousePosition = function (evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                var point = JSON.parse(eventbody.body);
                addPointToCanvas(point);
            });
        });
    };

    var setupCanvasEvents = function() {
        canvas.addEventListener("click", function(event) {
            var position = getMousePosition(event);
            app.publishPoint(position.x, position.y);
        });
    };

    return {
        init: function () {
            setupCanvasEvents();
            connectAndSubscribe();
        },

        publishPoint: function(px, py) {
            var pt = new Point(px, py);
            console.info("publishing point at " + pt);
            addPointToCanvas(pt);
            stompClient.send("/app/newpoint", {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected");
        }
    };
})();