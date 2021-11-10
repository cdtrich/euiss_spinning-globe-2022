import "./styles.css";
// import "d3";

console.clear();

const createChart = async () => {
  var width = 960,
    height = 960;

  var projection = d3.geo
    .orthographic()
    .translate([width / 2, height / 2])
    .scale(width / 2 - 20)
    .clipAngle(90)
    .precision(0.6);

  var canvas = d3
    .select("body")
    .append("canvas")
    .attr("width", width)
    .attr("height", height);

  var c = canvas.node().getContext("2d");

  var path = d3.geo.path().projection(projection).context(c).pointRadius(8);

  // scales
  var col = d3.scale
    .ordinal()
    .domain([
      "Culture/Society",
      "European Union",
      "Global",
      "History",
      "Politics"
    ])
    .range(["#3C1438", "#096789", "#5EBFBC", "#F28C00", "#D82739"]);

  var legend = d3.scale
    .linear()
    .domain([
      "Culture/Society",
      "European Union",
      "Global",
      "History",
      "Politics"
    ])
    // .range(["#090D11", "#0B6889", "#5FBFBC", "#F18C02", "#D82739"]);
    .range([800, 900]);

  // copy
  var event = d3.select("event");
  var loc = d3.select("loc");
  var day = d3.select("day");
  var month = d3.select("month");
  var legend = d3.select("legend");
  var year = d3.select("year");
  var key = d3.select("key");

  // transitions
  queue()
    .defer(
      d3.json,
      "https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json"
    )
    // .defer(d3.json, "https://unpkg.com/world-atlas@1/world/110m.json")
    // .defer(d3.json, "110m.json")
    .defer(d3.json, "src/cities.topojson")
    .defer(d3.csv, "cities.csv")
    .await(ready);

  function ready(error, world, dots, cities) {
    if (error) throw error;

    var globe = { type: "Sphere" },
      land = topojson.feature(world, world.objects.land),
      dots = topojson.feature(dots, dots.objects.foo).features,
      type = dots.type,
      i = -1,
      n = dots.length;

    //   transitioning
    (function transition() {
      d3.transition()
        .duration(1250)
        .each("start", function () {
          if (i < n) {
            event.text(cities[(i = (i + 1) % n)].title),
              loc.text(cities[i].loc),
              day.text(cities[i].day),
              month.text(cities[i].month),
              // legend.text(cities[i].type), legend.fillStyle = col(cities[i].type),
              legend.text(cities[i].type),
              year.text("2020"),
              key.text("what's to come");
          } else {
            i = -1;
          }
        })
        .tween("rotate", function () {
          var p = d3.geo.centroid(dots[i]),
            r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]),
            type = cities[i].type;

          return function (t) {
            projection.rotate(r(t));
            c.clearRect(0, 0, width, height);
            //             bbox
            (c.strokeStyle = "#54A2BF"),
              (c.lineWidth = 1),
              c.beginPath(),
              path(globe),
              c.stroke();
            // 						 countries
            (c.strokeStyle = "#54A2BF"),
              (c.lineWidth = 1),
              (c.fillStyle = "#54A2BF"),
              c.beginPath(),
              path(land),
              c.fill(),
              c.stroke();
            //             dots
            (c.fillStyle = col(type)),
              (c.strokeStyle = "#fff"),
              (c.lineWidth = 3),
              c.beginPath(),
              path(dots[i]),
              c.fill(),
              c.stroke();
          };
        })
        .transition()
        .each("end", transition);
    })();
  }

  d3.select(self.frameElement).style("height", height + "px");
};

createChart();
