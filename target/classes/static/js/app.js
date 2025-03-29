var api = apiclient;

var BlueprintApp = (function () {
    var blueprints = [];
    var authorName = "";
    var currentBlueprint = null;
    var isNewBlueprint = false;

    var setAuthorName = function (newAuthorName) {
        authorName = newAuthorName;
        document.getElementById("selectedAuthor").innerText = authorName;
    };

    var updateTotalPoints = function () {
        var totalPoints = blueprints.reduce(function (acc, blueprint) {
            return acc + blueprint.points.length;
        }, 0);
        $("#totalPoints").text(totalPoints);
    };

    var renderTable = function (blueprintList) {
        var tableBody = blueprintList.map(function (blueprint) {
            return `
                <tr>
                    <td>${blueprint.name}</td>
                    <td>${blueprint.points.length}</td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="BlueprintApp.drawBlueprint('${authorName}', '${blueprint.name}')">Open</button>
                        <button class="btn btn-danger btn-sm" onclick="BlueprintApp.deleteBlueprint('${authorName}', '${blueprint.name}')">Delete</button>
                    </td>
                </tr>
            `;
        }).join("");
        $("#blueprintsTable tbody").html(tableBody);
    };

    var updateBlueprintsByAuthor = function (author) {
        api.getBlueprintsByAuthor(author, function (data) {
            blueprints = data;
            renderTable(blueprints);
            updateTotalPoints();
        });
    };

    var drawBlueprint = function (author, blueprintName) {
        api.getBlueprintsByNameAndAuthor(author, blueprintName, function (blueprint) {
            currentBlueprint = blueprint;
            isNewBlueprint = false;
            redrawCanvas(blueprint);
            $("#name-blueprint").text(`Current blueprint: ${blueprint.name}`);
            $("#saveUpdateBtn").text("Update").removeClass("btn-success").addClass("btn-primary");
        });
    };

    var redrawCanvas = function(blueprint) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (blueprint.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(blueprint.points[0].x, blueprint.points[0].y);

            for (var i = 1; i < blueprint.points.length; i++) {
                ctx.lineTo(blueprint.points[i].x, blueprint.points[i].y);
            }
            ctx.stroke();
        }
    };

    var setupCanvasEvents = function() {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        
        canvas.addEventListener("pointerdown", function(e) {
            if (!currentBlueprint) return;
            
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            
            currentBlueprint.points.push({x: x, y: y});
            
            redrawCanvas(currentBlueprint);
        });
    };

    var saveOrUpdateBlueprint = function() {
        if (!currentBlueprint) return;
        
        var promise;
        if (isNewBlueprint) {
            promise = api.createBlueprint(currentBlueprint);
        } else {
            promise = api.updateBlueprint(currentBlueprint);
        }
        
        promise
            .then(function() {
                return api.getBlueprintsByAuthorPromise(authorName);
            })
            .then(function(data) {
                blueprints = data;
                renderTable(blueprints);
                updateTotalPoints();
                if (isNewBlueprint) {
                    isNewBlueprint = false;
                    $("#saveUpdateBtn").text("Update").removeClass("btn-success").addClass("btn-primary");
                }
                alert("Blueprint saved successfully!");
            })
            .catch(function(error) {
                console.error("Error saving blueprint:", error);
                alert("Error saving blueprint!");
            });
    };

    var createNewBlueprint = function() {
        var blueprintName = prompt("Enter name for new blueprint:");
        if (!blueprintName) return;
        
        currentBlueprint = {
            author: authorName,
            name: blueprintName,
            points: []
        };
        
        isNewBlueprint = true;
        redrawCanvas(currentBlueprint);
        $("#name-blueprint").text(`New blueprint: ${blueprintName}`);
        $("#saveUpdateBtn").text("Save").removeClass("btn-primary").addClass("btn-success");
    };

    var deleteBlueprint = function(author, blueprintName) {
        if (!confirm("Are you sure you want to delete this blueprint?")) return;
        
        api.deleteBlueprint(author, blueprintName)
            .then(function() {
                return api.getBlueprintsByAuthorPromise(authorName);
            })
            .then(function(data) {
                blueprints = data;
                renderTable(blueprints);
                updateTotalPoints();
                currentBlueprint = null;
                var canvas = document.getElementById("canvas");
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                $("#name-blueprint").text("");
                alert("Blueprint deleted successfully!");
            })
            .catch(function(error) {
                console.error("Error deleting blueprint:", error);
                alert("Error deleting blueprint!");
            });
    };

    setupCanvasEvents();

    return {
        setAuthorName: setAuthorName,
        updateBlueprintsByAuthor: updateBlueprintsByAuthor,
        drawBlueprint: drawBlueprint,
        saveOrUpdateBlueprint: saveOrUpdateBlueprint,
        createNewBlueprint: createNewBlueprint,
        deleteBlueprint: deleteBlueprint
    };
})();

$(document).ready(function() {
    $("#getBlueprintsBtn").on("click", function () {
        var authorInput = $("#authorInput").val();
        if (authorInput) {
            BlueprintApp.setAuthorName(authorInput);
            BlueprintApp.updateBlueprintsByAuthor(authorInput);
        } else {
            alert("Please enter an author name.");
        }
    });
    
    $("#saveUpdateBtn").on("click", function() {
        BlueprintApp.saveOrUpdateBlueprint();
    });
    
    $("#createNewBtn").on("click", function() {
        if ($("#authorInput").val()) {
            BlueprintApp.createNewBlueprint();
        } else {
            alert("Please select an author first.");
        }
    });
});