/////////////////////////////////////////////////
// imports //////////////////////////////////////
/////////////////////////////////////////////////

import "./styles.css";
import * as d3 from "d3";
// import * as topojson from "topojson";

console.clear();

const createChart = async () => {
  /////////////////////////////////////////////////
  // data /////////////////////////////////////////
  /////////////////////////////////////////////////

  // let countries = topojson.feature(world, world.objects.countries).features;
  let land = d3.json("src/land.geojson").features;
  let world = await d3.json(
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
  );
  // let cities = await d3.json("src/cities.topojson");
  const cities = await d3.json("src/cities.geojson");
  // const data = topojson.feature(cities, cities.objects).features;
  const data = cities.features;
  console.log(data);
};

/////////////////////////////////////////////////
// versor ///////////////////////////////////////
/////////////////////////////////////////////////

function Versor() {
  /////////////////////////////////////////////////
  // params ///////////////////////////////////////
  /////////////////////////////////////////////////

  var tilt = 20;
  var sphere = { type: "Sphere" };

  /////////////////////////////////////////////////
  // context //////////////////////////////////////
  /////////////////////////////////////////////////

  // var width = 1280;
  // var height = Math.min(width, 720);
  const width = window.innerWidth * 0.9,
    height = window.innerHeight * 0.9;

  const canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  const projection = d3.geoOrthographic().fitExtent(
    [
      [10, 10],
      [width - 10, height - 10]
    ],
    sphere
  );

  /////////////////////////////////////////////////
  // scales ///////////////////////////////////////
  /////////////////////////////////////////////////

  // var color = d3.scaleOrdinal(
  //   ["Culture/Society", "European Union", "Global", "History", "Politics"],
  //   ["#3C1438", "#096789", "#5EBFBC", "#F28C00", "#D82739"]
  // );

  const path = d3.geoPath(projection, context).pointRadius(8);

  /////////////////////////////////////////////////
  // rendering ////////////////////////////////////
  /////////////////////////////////////////////////

  function render(country, arc) {
    context.clearRect(0, 0, width, height);
    // bbox
    context.beginPath(),
      path(sphere),
      (context.strokeStyle = "#ccc"),
      (context.lineWidth = 1),
      context.stroke();
    // coast
    context.beginPath(),
      path(land),
      (context.strokeStyle = "#ccc"),
      (context.lineWidth = 1),
      context.stroke();
    // connector
    context.beginPath(),
      path(arc),
      (context.strokeStyle = "#aaa"),
      (context.lineWidth = 2),
      context.stroke();
    // dots
    context.beginPath(),
      path(country),
      (context.fillStyle = "#000"),
      (context.strokeStyle = "#fff"),
      (context.lineWidth = 3),
      context.fill(),
      context.stroke();
    // context.beginPath(), path(dots), context.fillStyle = col(type), context.lineWidth = 3, context.fill(). context.stroke();
    return context.canvas;
  }

  var p1,
    p2 = [0, 0],
    r1,
    r2 = [0, 0, 0];

  for (const id of data) {
    var name =
      "<b class = 'title'>" +
      id.properties.title +
      "</b>" +
      "<br>" +
      "<b class = 'day'>" +
      id.properties.date_label +
      " " +
      id.properties.year +
      "</b>" +
      "<br>" +
      // "<b class = 'month'>" + id.properties.month + "</b>" + "<br>" +
      // "<b class = 'year'>" + id.properties.year + "</b>" + "<br>" +
      "<b class = 'loc'>" +
      id.properties.loc +
      "</b>";

    // const type = id.properties.type;
    // yield render(id);
    // return render(id);

    let p1 = p2,
      p2 = d3.geoCentroid(id);
    let r1 = r2,
      r2 = [-p2[0], tilt - p2[1], 0];

    const ip = d3.geoInterpolate(p1, p2);
    const iv = Versor.interpolateAngles(r1, r2);

    // repeat(1250);

    // function repeat(t) {
    // function trans() {
    // either this or the line above and below
    let transition = d3
      .transition()
      // d3.transition()
      .duration(1250)
      .tween("render", () => (t) => {
        projection.rotate(iv(t));
        render(id, { type: "LineString", coordinates: [p1, ip(t)] });
      })
      .transition()
      .tween("render", () => (t) => {
        render(id, { type: "LineString", coordinates: [ip(t), p2] });
      })
      // .on("end", repeat);
      .end();
    // };

    // trans();
    // .end();
  }

  function fromAngles([l, p, g]) {
    l *= Math.PI / 360;
    p *= Math.PI / 360;
    g *= Math.PI / 360;
    const sl = Math.sin(l),
      cl = Math.cos(l);
    const sp = Math.sin(p),
      cp = Math.cos(p);
    const sg = Math.sin(g),
      cg = Math.cos(g);
    return [
      cl * cp * cg + sl * sp * sg,
      sl * cp * cg - cl * sp * sg,
      cl * sp * cg + sl * cp * sg,
      cl * cp * sg - sl * sp * cg
    ];
  }

  function toAngles([a, b, c, d]) {
    return [
      (Math.atan2(2 * (a * b + c * d), 1 - 2 * (b * b + c * c)) * 180) /
        Math.PI,
      (Math.asin(Math.max(-1, Math.min(1, 2 * (a * c - d * b)))) * 180) /
        Math.PI,
      (Math.atan2(2 * (a * d + b * c), 1 - 2 * (c * c + d * d)) * 180) / Math.PI
    ];
  }

  function interpolateAngles(a, b) {
    const i = Versor.interpolate(Versor.fromAngles(a), Versor.fromAngles(b));
    return (t) => Versor.toAngles(i(t));
  }

  function interpolateLinear([a1, b1, c1, d1], [a2, b2, c2, d2]) {
    (a2 -= a1), (b2 -= b1), (c2 -= c1), (d2 -= d1);
    const x = new Array(4);
    return (t) => {
      const l = Math.hypot(
        (x[0] = a1 + a2 * t),
        (x[1] = b1 + b2 * t),
        (x[2] = c1 + c2 * t),
        (x[3] = d1 + d2 * t)
      );
      (x[0] /= l), (x[1] /= l), (x[2] /= l), (x[3] /= l);
      return x;
    };
  }

  function interpolate([a1, b1, c1, d1], [a2, b2, c2, d2]) {
    let dot = a1 * a2 + b1 * b2 + c1 * c2 + d1 * d2;
    if (dot < 0) (a2 = -a2), (b2 = -b2), (c2 = -c2), (d2 = -d2), (dot = -dot);
    if (dot > 0.9995)
      return Versor.interpolateLinear([a1, b1, c1, d1], [a2, b2, c2, d2]);
    const theta0 = Math.acos(Math.max(-1, Math.min(1, dot)));
    const x = new Array(4);
    const l = Math.hypot(
      (a2 -= a1 * dot),
      (b2 -= b1 * dot),
      (c2 -= c1 * dot),
      (d2 -= d1 * dot)
    );
    (a2 /= l), (b2 /= l), (c2 /= l), (d2 /= l);
    return (t) => {
      const theta = theta0 * t;
      const s = Math.sin(theta);
      const c = Math.cos(theta);
      x[0] = a1 * c + a2 * s;
      x[1] = b1 * c + b2 * s;
      x[2] = c1 * c + c2 * s;
      x[3] = d1 * c + d2 * s;
      return x;
    };
  }
  return render(id);
}

createChart();
