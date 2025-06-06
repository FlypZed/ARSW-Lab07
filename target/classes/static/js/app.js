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
    var currentDrawingId = null;

    var addPointToCanvas = function (point) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var drawPolygon = function(points) {
        if (points.length < 3) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.closePath();
        ctx.stroke();
    };

    var clearCanvas = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    var getMousePosition = function (evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var connectAndSubscribe = function (drawingId) {
        console.info('Connecting to WS for drawing ' + drawingId);
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            currentDrawingId = drawingId;
            clearCanvas();

            // Subscribe to points topic
            stompClient.subscribe('/topic/newpoint.' + drawingId, function (eventbody) {
                var point = JSON.parse(eventbody.body);
                addPointToCanvas(point);
            });

            // Subscribe to polygons topic
            stompClient.subscribe('/topic/newpolygon.' + drawingId, function (eventbody) {
                var points = JSON.parse(eventbody.body);
                drawPolygon(points);
            });
        });
    };

    var setupCanvasEvents = function() {
        canvas.addEventListener("click", function(event) {
            if (!stompClient || !currentDrawingId) {
                alert("Please connect to a drawing first!");
                return;
            }
            var position = getMousePosition(event);
            app.publishPoint(position.x, position.y);
        });
    };

    return {
        init: function () {
            setupCanvasEvents();
        },

        connectToDrawing: function() {
            var drawingId = document.getElementById("drawingId").value;
            if (stompClient) {
                this.disconnect();
            }
            connectAndSubscribe(drawingId);
        },

        publishPoint: function(px, py) {
            var pt = new Point(px, py);
            console.info("publishing point at " + pt + " to drawing " + currentDrawingId);
            addPointToCanvas(pt);
            stompClient.send("/app/newpoint." + currentDrawingId, {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
                currentDrawingId = null;
            }
            console.log("Disconnected");
        }
    };
})();

window.onload = function() {
    app.init();
};