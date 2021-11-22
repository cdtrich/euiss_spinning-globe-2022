/////////////////////////////////////////////////
// imports //////////////////////////////////////
/////////////////////////////////////////////////

import "./styles.css";
import * as d3 from "d3";
import * as topojson from "topojson-client";

console.clear();

const createChart = async () => {
  /////////////////////////////////////////////////
  // data //////////////////////////////////////
  /////////////////////////////////////////////////

  let world = await d3.json(
    "https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json"
  );
  const data = await d3.json("src/cities.geojson");
  let cities = data.features;

  // console.log(data);
  // console.log(cities, (d, i) => d[i].properties.date_label);
  // console.log(cities[2].properties.date_label);
  // console.log(cities.length);

  var width = window.innerHeight * 0.9,
    height = window.innerHeight * 0.9;

  /////////////////////////////////////////////////
  // projection ///////////////////////////////////
  /////////////////////////////////////////////////

  var globe = { type: "Sphere" };

  const projection = d3.geoOrthographic().fitExtent(
    [
      [10, 10],
      [width - 10, height - 10]
    ],
    globe
  );

  var canvas = d3
    .select("body")
    .append("canvas")
    .attr("width", width)
    .attr("height", height);

  var c = canvas.node().getContext("2d");

  var path = d3.geoPath(projection, c).pointRadius(8);

  /////////////////////////////////////////////////
  // scales ///////////////////////////////////////
  /////////////////////////////////////////////////
  var col = d3
    .scaleOrdinal()
    .domain([
      "Culture/Society",
      "European Union",
      "Global",
      "History",
      "Politics"
    ])
    .range(["#3C1438", "#096789", "#5EBFBC", "#F28C00", "#D82739"]);

  /////////////////////////////////////////////////
  // copy /////////////////////////////////////////
  /////////////////////////////////////////////////
  var event = d3.select("event");
  var loc = d3.select("loc");
  var day = d3.select("day");
  var month = d3.select("month");
  var year = d3.select("year");
  var key = d3.select("key");

  function ready(error, world, cities) {
    if (error) throw error;

    var land = topojson.feature(world, world.objects.land),
      // dots = cities,
      i = -1,
      n = cities.length;

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
              year.text("2020"),
              key.text("what's to come");
          } else {
            i = -1;
          }
        })
        .tween("rotate", function () {
          var p = d3.geoCentroid(cities[i]),
            r = d3.geoInterpolate(projection.rotate(), [-p[0], -p[1]]),
            type = cities[i].type;

          return function (t) {
            projection.rotate(r(t));
            c.clearRect(0, 0, width, height);

            // bbox
            c.beginPath(),
              path(globe),
              (c.strokeStyle = "#54A2BF"),
              (c.lineWidth = 1),
              c.stroke();
            // countries
            c.beginPath(),
              path(land),
              (c.fillStyle = "#54A2BF"),
              (c.strokeStyle = "#54A2BF"),
              (c.lineWidth = 1),
              c.fill(),
              c.stroke();
            // dots
            c.beginPath(),
              path(cities[i]),
              (c.strokeStyle = "#fff"),
              (c.fillStyle = col((d) => d.type)),
              (c.lineWidth = 3),
              c.fill(),
              c.stroke();
          };
        })
        .transition()
        .each("end", transition);
    })();
  }
  d3.select(window.frameElement).style("height", height + "px");
};

createChart();
