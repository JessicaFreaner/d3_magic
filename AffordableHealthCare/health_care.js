/*--- IMPORTANT GUIDELINES --- 
1. Use div #canvas-svg for svg rendering
    var svg = d3.select("#canvas-svg");
2. 'data' variable contains JSON data from Data tab
   'config' variable contains data from Properties tab
    Do NOT overwrite these variables
3. To define customizable properties, use capitalized variable names,
    and define them in Properties tab ---*/

var width = config.width, height = config.height, centered;
var projection = d3.geo.albersUsa().scale(500).translate([ width / 4, height / 3 ]);
var path = d3.geo.path().projection(projection);
var svg = d3.select("#canvas-svg")
            .append("svg")
              .attr("width", width)
              .attr("height", height);

svg.append("rect")
  .attr("class", "background")
  .attr("width", width)
  .attr("height", height)
  .on("click", map_clicked);

var g = svg.append("g");
var state_ids = [ 0 ];
var id_state_map = {
    0: ""
};
var id_topo_map = {
    0: null
};
var twenty_seven = {
    0: ""
};
var twenty_seven_before = {
    0: ""
};
var twenty_seven_25k = {
    0: ""
};
var twenty_seven_25k_before = {
    0: ""
};
var family_four_50k = {
    0: ""
};
var family_four_50k_before = {
    0: ""
};
var id_name_map = {
    0: null
};
var short_name_id_map = {
    0: null
};
var state_link = {
    0: null
};
d3.tsv("https://s3-us-west-2.amazonaws.com/vida-public/geo/us-state-names.tsv", function(error, names) {
    for (var i = 0; i < names.length; i++) {
        id_name_map[names[i].id] = names[i];
        short_name_id_map[names[i].code] = names[i].id;
    }
    data.forEach(function(d) {
        var state_id = short_name_id_map[d.State];
        twenty_seven[state_id] = d["1-Lowest Silver After Tax Credit"];
        twenty_seven_before[state_id] = d["1-Lowest Silver Before Tax Credit"];
        twenty_seven_25k[state_id] = d["2-Second Lowest Silver After Tax Credit"];
        twenty_seven_25k_before[state_id] = d["2-Second Lowest Silver Before Tax Credit"];
        family_four_50k[state_id] = d["3-Second Lowest Silver After Tax Credit"];
        family_four_50k_before[state_id] = d["3-Second Lowest Silver Before Tax Credit"];
        state_link[state_id] = d["Marketplace Link"];
    });
    d3.json("https://s3-us-west-2.amazonaws.com/vida-public/geo/us.json", function(error, us) {
        g.append("g")
          .attr("id", "states")
          .attr("class", "states")
          .selectAll("path")
          .data(topojson.feature(us, us.objects.states).features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("id", function(d) {
            state_ids.push(+d.id);
            id_state_map[d.id] = id_name_map[d.id].name;
            id_topo_map[d.id] = d;
            return "map-" + d.id;
        }).on("click", map_clicked);
        g.append("path")
          .datum(topojson.mesh(us, us.objects.states, function(a, b) {
            return a !== b;
        })).attr("id", "state-borders").attr("d", path);
        state_ids = state_ids.sort(function(a, b) {
            return a - b;
        });
        d3.select("#canvas-svg").append("select")
          .attr("id", "state-select")
          .on("change", function() {
            var topo = id_topo_map[$(this).val()];
            map_clicked(topo);
        }).selectAll("option")
        .data(state_ids)
        .enter().append("option")
          .attr("value", function(d) {
            return d;
        }).text(function(d) {
            return id_state_map[d];
        });
        
        d3.select("#canvas-svg").append("div")
          .attr("id", "twenty-seven");
        $("#twenty-seven").html("<h4>27-Year-Old<br>Income > $25k</h4>" + "<h6>Silver Plan</h6>" + "<h1 id='twenty-seven-value'><span class='no-data'>No Data</span></h1>" + "<h6>Before Tax: <span id='twenty-seven-before-value'></span></h6>");
        d3.select("#canvas-svg")
          .append("div")
            .attr("id", "twenty-seven-25k");
        $("#twenty-seven-25k").html("<h4>27-Year-Old<br>Income < $25k</h4>" + "<h6>Silver Plan</h6>" + "<h1 id='twenty-seven-25k-value'><span class='no-data'>No Data</span></h1>" + "<h6>Before Tax: <span id='twenty-seven-25k-before-value'></span></h6>");
        d3.select("#canvas-svg")
          .append("div")
            .attr("id", "family-four-50k");
        $("#family-four-50k").html("<h4>Family of Four<br/>Income < $50k</h4>" + "<h6>Silver Plan</h6>" + "<h1 id='family-four-50k-value'><span class='no-data'>No Data</span></h1>" + "<h6>Before Tax: <span id='family-four-50k-before-value'></span></h6>");
        d3.select("#canvas-svg")
          .append("div")
            .attr("id", "state-marketplace");
        $("#state-marketplace").html("<h4>Health Insurance Marketplace</h4>" + "<h6><a href='#' id='state-marketplace-link' target='_blank'></a></h6>");
        
        // select WA state
        $("#state-select").val(53);
        var topo = id_topo_map[53];
        map_clicked(topo);
    });
});
function map_clicked(d) {
    if (d) {
        $("#state-select").val(d.id);
        if (twenty_seven[d.id]) {
            $("#twenty-seven-value").html(twenty_seven[d.id]);
            $("#twenty-seven-before-value").html(twenty_seven_before[d.id]);
            $("#twenty-seven-25k-value").html(twenty_seven_25k[d.id]);
            $("#twenty-seven-25k-before-value").html(twenty_seven_25k_before[d.id]);
            $("#family-four-50k-value").html(family_four_50k[d.id]);
            $("#family-four-50k-before-value").html(family_four_50k_before[d.id]);
        } else {
            $("#twenty-seven-value").html("<span class='no-data'>No Data</span>");
            $("#twenty-seven-before-value").html("");
            $("#twenty-seven-25k-value").html("<span class='no-data'>No Data</span>");
            $("#twenty-seven-25k-before-value").html("");
            $("#family-four-50k-value").html("<span class='no-data'>No Data</span>");
            $("#family-four-50k-before-value").html("");
        }
        if (state_link[d.id]) {
            $("#state-marketplace-link").attr("href", state_link[d.id]);
            $("#state-marketplace-link").html(state_link[d.id]);
        } else {
            $("#state-marketplace-link").attr("href", "#");
            $("#state-marketplace-link").html("");
        }
        var x, y, k;
        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4;
            centered = d;
        } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
        }
        g.selectAll("path").classed("active", centered && function(d) {
            return d === centered;
        });
    }
}
