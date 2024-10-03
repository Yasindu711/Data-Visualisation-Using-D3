//create function to accomodate for when the visualisation updates to a new year
function updateYear(year) {
  //change the year displayed on slider
  d3.select("#displayYear").text(year);

  //update x and y axis
  svg.select(".x-axis").call(xAxis);
  svg.select(".y-axis").call(yAxis);

  //define scales for circles for selected year
  radiusScale.domain([
    d3.min(data, function (d) {
      return d.population[year];
    }),
    d3.max(data, function (d) {
      return d.population[year];
    }),
  ]);

  //update the position of circles
  circles
    .attr("cx", function (d) {
      return xScale(d.gdp[year]);
    })
    .attr("cy", function (d) {
      return yScale(d.expectancy[year]);
    })
    .attr("r", function (d) {
      return radiusScale(d.population[year]);
    });

  //update the country labels next to each circle
  svg
    .selectAll(".country-label")
    .attr("x", function (d) {
      return xScale(d.gdp[year]) + radiusScale(d.population[year]) + 5;
    })
    .attr("y", function (d) {
      return yScale(d.expectancy[year]);
    });

  //update tooltip when hovering over circles
  circles.on("mouseover", function (event, d) {
    var tooltip = d3.select("#tooltip");
    tooltip
      .style("left", event.pageX + 20 + "px")
      .style("top", event.pageY - 40 + "px")
      .style("display", "inline-block")
      .html(
        `Country: ${d.country}<br>GDP: ${d.gdp[year]}% (${d.gdpChange[year]}% annual change)<br>Life Expectancy: ${d.expectancy[year]} Years (${d.expectancyChange[year]}% annual change)<br>Population: ${d.population[year]} (${d.populationChange[year]}% annual change)`
      );
  });

  //update simulation forces so circles dont overlap
  simulation
    .force(
      "x",
      d3
        .forceX()
        .x(function (d) {
          return xScale(d.gdp[year]);
        })
        .strength(1)
    )
    .force(
      "y",
      d3
        .forceY()
        .y(function (d) {
          return yScale(d.expectancy[year]);
        })
        .strength(1)
    )
    .force(
      "collision",
      d3.forceCollide().radius(function (d) {
        return radiusScale(d.population[year]) + 2;
      })
    )
    .alpha(1)
    .restart();
}

function init() {
  var w = 2000;
  var h = 900;
  var padding = 50;
  var xpadding = 20;

  //append svg element to chart div
  svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", w)
    .attr("height", h + padding);

  //convert data and map columns to the properties of object
  var dataConverter = function (d) {
    return {
      country: d.Country,
      gdp: {
        2020: parseFloat(d.GDP20),
        2021: parseFloat(d.GDP21),
        2022: parseFloat(d.GDP22),
      },
      expectancy: {
        2020: parseFloat(d.Expectancy20),
        2021: parseFloat(d.Expectancy21),
        2022: parseFloat(d.Expectancy22),
      },
      population: {
        2020: parseInt(d.Pop20),
        2021: parseInt(d.Pop21),
        2022: parseInt(d.Pop22),
      },
      gdpChange: {
        2022: parseFloat(d.GDP21Change),
        2021: parseFloat(d.GDP20Change),
        2020: "0",
      },
      expectancyChange: {
        2022: parseFloat(d.Expectancy21Change),
        2021: parseFloat(d.Expectancy20Change),
        2020: "0",
      },
      populationChange: {
        2022: parseFloat(d.Pop21Change),
        2021: parseFloat(d.Pop20Change),
        2020: "0",
      },
      continent: d.Continent,
    };
  };
  //load csv file
  d3.csv("Dataset.csv", dataConverter).then(function (loadedData) {
    data = loadedData;

    //global Variables

    //define x axis scale
    xScale = d3
      .scaleLinear()
      .domain([3, 19])
      .range([padding + xpadding, w - padding * 4]);

    //create x axis with 9 ticks
    xAxis = d3.axisBottom().scale(xScale).ticks(9);

    //define y axis scale
    yScale = d3
      .scaleLinear()
      .domain([75, 90])
      .range([h - padding - 10, padding]);

    //create y axis with 10 ticks
    yAxis = d3.axisLeft().scale(yScale).ticks(10);

    //define scale for radius of circles
    radiusScale = d3.scaleSqrt().range([3, 20]);

    //append x axis to svg
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + (h - padding) + ")");

    //append y axis to svg
    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(" + padding + ",0)");

    //create colour scale and assign colour to continents
    var continentColors = d3
      .scaleOrdinal()
      .domain(["Oceania", "Europe", "North America", "South America", "Asia"])
      .range(d3.schemeCategory10);

    //bind data to circles, when mouse hovers over circle display tooltip
    circles = svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .style("fill", function (d) {
        return continentColors(d.continent);
      })
      .on("mouseover", function (event, d) {
        var tooltip = d3.select("#tooltip");
        tooltip
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY - 40 + "px")
          .style("display", "inline-block")
          .html(
            `Country: ${d.country}<br>GDP: ${d.gdp[year]}% (${d.gdpChange[year]}% annual change)<br>Life Expectancy: ${d.expectancy[year]} Years (${d.expectancyChange[year]}% annual change)<br>Population: ${d.population[year]} (${d.populationChange[year]}% annual change)`
          );
      })
      .on("mouseout", function () {
        d3.select("#tooltip").style("display", "none");
      });

    //country label
    svg
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "country-label")
      .attr("x", function (d) {
        return xScale(d.gdp[2022]) + radiusScale(d.population[2022]) + 5;
      })
      .attr("y", function (d) {
        return yScale(d.expectancy[2022]) + 4;
      })
      .attr("dy", "0.35em")
      .text(function (d) {
        return d.country;
      })
      .style("font-size", "15px")
      .style("fill", "black");

    //title of visualisation
    svg
      .append("text")
      .attr("x", w / 2)
      .attr("y", padding / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("text-decoration", "underline")
      .text(
        "Percentage of GDP Spent On Health Care vs Average Life Expectancy by Country"
      );

    //title for x axis
    svg
      .append("text")
      .attr("x", w / 2)
      .attr("y", h - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .text("GDP (%)");

    //title for y axis
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(h / 2))
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .text("Average Life Expectancy (Years)");

    //add legend
    var continents = [
      "Oceania",
      "Europe",
      "North America",
      "South America",
      "Asia",
    ];

    var legend = svg
      .append("g")
      .attr("transform", "translate(" + (w - 150) + "," + padding + ")");

    //add a dot in the legend for each continent.
    legend
      .selectAll("legendDots")
      .data(continents)
      .enter()
      .append("circle")
      .attr("cx", 10)
      .attr("cy", function (d, i) {
        return 10 + i * 25;
      })
      .attr("r", 7)
      .style("fill", function (d) {
        return continentColors(d);
      })
      .on("mouseover", function (event, d) {
        // Loop through each circle and set its opacity based on the hovered continent
        circles.style("opacity", function (data) {
          if (data.continent === d) {
            // Check if the continent of the data point matches the hovered continent
            return 1; // Make the circle fully visible if it's the same continent
          } else {
            return 0.1; // Dim the circle if it's a different continent
          }
        });
        //loop through each country and set colour based on hovered continent
        svg.selectAll(".country-label").style("display", function (data) {
          if (data.continent === d) {
            // Check if the continent of the data point matches the hovered continent
            return "block"; // Show the label if it's the same continent
          } else {
            return "none";
          }
        });
      })
      .on("mouseout", function () {
        circles.style("opacity", 1);
        svg.selectAll(".country-label").style("display", "block");
      });

    //add legend labels besides legend dots
    legend
      .selectAll("legendLabels")
      .data(continents)
      .enter()
      .append("text")
      .attr("x", 30)
      .attr("y", function (d, i) {
        return 10 + i * 25;
      })
      .style("fill", function (d) {
        return continentColors(d);
      })
      .text(function (d) {
        return d;
      })
      .attr("text-anchor", "start")
      .style("alignment-baseline", "middle");

    //add simulation so circles are not touching
    simulation = d3
      .forceSimulation(data)
      .force(
        "x",
        d3
          .forceX()
          .x(function (d) {
            return xScale(d.gdp[2022]);
          })
          .strength(1)
      )
      .force(
        "y",
        d3
          .forceY()
          .y(function (d) {
            return yScale(d.expectancy[2022]);
          })
          .strength(1)
      )
      .force(
        "collision",
        d3.forceCollide().radius(function (d) {
          return radiusScale(d.population[2022]) + 2;
        })
      )
      .on("tick", function ticked() {
        circles
          .attr("cx", function (d) {
            return d.x;
          })
          .attr("cy", function (d) {
            return d.y;
          });
      });

    updateYear(2022);
  });
}

window.onload = init;
