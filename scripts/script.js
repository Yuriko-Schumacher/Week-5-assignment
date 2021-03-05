const margins = { t: 50, r: 50, b: 50, l: 75 };
const SVGsize = { w: window.innerWidth * 0.8, h: window.innerHeight * 0.8 };
const size = {
	w: SVGsize.w - margins.l - margins.r,
	h: SVGsize.h - margins.t - margins.b,
};
const svg = d3.select("svg").attr("width", SVGsize.w).attr("height", SVGsize.h);
const containerG = svg
	.append("g")
	.attr("transform", `translate(${margins.l}, ${margins.t})`);

let data, scaleY, scaleX, scaleDuration, path;

d3.csv("data/population.countries.csv").then(function (d) {
	data = d;
	console.log(data);
	data.forEach(parseData);

	let countriesData = data.filter((el) => el.countryCode != "WLD");

	scaleX = d3.scaleLinear().domain([1960, 2019]).range([0, size.w]);

	scaleY = d3
		.scaleLinear()
		.domain(d3.extent(countriesData, (d) => d.population))
		.range([size.h, 0]);

	scaleDuration = d3
		.scaleLinear()
		.domain(d3.extent(countriesData, (d) => d.population).reverse())
		.range([0, 5000]);

	let axisX = d3.axisBottom(scaleX).tickFormat((d) => d);
	let axisXG = containerG
		.append("g")
		.classed("axis-x", true)
		.attr("transform", `translate(0, ${size.h})`)
		.call(axisX);

	let axisY = d3.axisLeft(scaleY).tickFormat((d) => d / 1000000);
	let axisYG = containerG.append("g").classed("axis-y", true).call(axisY);

	let xAxisLabel = containerG
		.append("text")
		.attr("class", "axis-label")
		.attr("x", size.w / 2)
		.attr("y", size.h + margins.b - 10)
		.text("Year");

	let yAxisLabel = containerG
		.append("text")
		.attr("class", "axis-label")
		.attr("transform", "rotate(-90)")
		.attr("x", -size.h / 2)
		.attr("y", -margins.l / 2)
		.text("Population (millions)");

	draw(data);
});

function parseData(d) {
	d.year = +d.year;
	d.population = +d.population;
}

function draw(data) {
	data = d3.group(data, (d) => d.countryName);
	data = Array.from(data);
	console.log(data);
	data.forEach((el) => {
		let data = el[1];
		path = containerG
			.append("path")
			.datum(data)
			.attr(
				"d",
				d3
					.line()
					.defined(function (d) {
						return d.population > 0;
					})
					.x(function (d) {
						return scaleX(d.year);
					})
					.y(function (d) {
						return scaleY(d.population);
					})
			)
			.attr("fill", "none")
			.attr("stroke", "gray")
			.attr("stroke-width", 1);

		let totalLength = path.node().getTotalLength();

		path.attr("stroke-dasharray", `${totalLength} ${totalLength}`)
			.attr("stroke-dashoffset", totalLength)
			.transition()
			.duration((d) =>
				d[59].population > 2 * 10 ** 8
					? scaleDuration(2 * 10 ** 8)
					: scaleDuration(d[59].population)
			)
			.attr("stroke-dashoffset", 0);
	});
}
