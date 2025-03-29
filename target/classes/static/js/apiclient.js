var apiclient = (function () {
    var apiUrl = 'http://localhost:8080/blueprints';

    return {
        getBlueprintsByAuthor: function (authname, callback) {
            $.get(apiUrl + "/" + authname, function (data) {
                callback(data);
            }).fail(function (error) {
                console.error("Error getting blueprints:", error);
            });
        },

        getBlueprintsByAuthorPromise: function(authname) {
            return $.get(apiUrl + "/" + authname);
        },

        getBlueprintsByNameAndAuthor: function (authname, bpname, callback) {
            $.get(apiUrl + "/" + authname + "/" + bpname, function (data) {
                callback(data);
            }).fail(function (error) {
                console.error("Error getting blueprint:", error);
            });
        },

        updateBlueprint: function(blueprint) {
            return $.ajax({
                url: apiUrl + "/" + blueprint.author + "/" + blueprint.name,
                type: 'PUT',
                data: JSON.stringify(blueprint),
                contentType: "application/json"
            });
        },

        createBlueprint: function(blueprint) {
            return $.ajax({
                url: apiUrl,
                type: 'POST',
                data: JSON.stringify(blueprint),
                contentType: "application/json"
            });
        },

        deleteBlueprint: function(author, bpname) {
            return $.ajax({
                url: apiUrl + "/" + author + "/" + bpname,
                type: 'DELETE'
            });
        }
    };
})();