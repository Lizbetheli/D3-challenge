var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 30,
  right: 40,
  bottom: 150,
  left: 150
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(healthData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
      d3.max(healthData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height,0]);

  return yLinearScale;

}




// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderStateAbbr(stateAbbr, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  stateAbbr.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return stateAbbr;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var labelx;
  var labely;

  if (chosenXAxis == "poverty") {
    labelx = "In poverty (%):";
  }
  else if(chosenXAxis == "age") {
    labelx = "Age: ";
  }
  else {
    labelx = "Income: $"
  }

  if (chosenYAxis == "healthcare") {
    labely = "Healthcare:";
  }
  else if(chosenYAxis == "smokes") {
    labely = "Smokes: ";
  }
  else {
    labely = "Obesity: "
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    //.offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${labelx} ${d[chosenXAxis]} <br>${labely} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    
    .on("mouseout", function(data, index) {
      toolTip.show(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(healthData, err) {
  if (err) throw err;

  // parse data
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
    data.age = +data.age;
    data.income = +data.income;

    //data.abbr = data.abbr;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);
  var yLinearScale = yScale(healthData, chosenYAxis);

  // Create y scale function
  // var yLinearScale = d3.scaleLinear()
  //   .domain([0, d3.max(healthData, d => d.healthcare)])
  //   .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
 var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("class","stateCircle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("opacity", "0.8")

  var stateAbbr = chartGroup.selectAll("abbr")
    .data(healthData)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .classed("class","StateText")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("font-size", "8px")
  
   
  // Create group for two x-axis labels
  var labelsGroupX = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");

  var ageLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age: ");

    
  var houseLabel = labelsGroupX.append("text")
  .attr("x", 0)
  .attr("y", 60)
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Hosehold Income: ");
 
 
 
  // append y axis
  
  
  var labelsGroupY = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))


  var healhLabel = labelsGroupY.append("text") 
    .attr("value", "healthcare")
    .attr("dx", "-10em")
    .attr("dy", "-2em")
    .classed("active", true)
    .text("% People lack Healthcare");


  var smokesLabel = labelsGroupY.append("text") 
  .attr("value", "smokes")
  .attr("dx", "-10em")
  .attr("dy", "-4em")
  .classed("inactive", true)
  .text("Smokes %");


  var obeseLabel = labelsGroupY.append("text") 
  .attr("value", "obesity")
  .attr("dx", "-10em")
  .attr("dy", "-6em")
  .classed("inactive", true)
  .text("Obese %");

  // updateToolTip function above csv import
  //var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroupX.selectAll("text")
    .on("click", function() {
      // get value of selection
      var xvalue = d3.select(this).attr("value");
      if (xvalue !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = xvalue;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxesX(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        stateAbbr = renderStateAbbr(stateAbbr, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        if (chosenXAxis === "age") {
          ageLabel
            .classed("active",true)
            .classed("inactive", false);

          povertyLabel
            .classed("active",false)
            .classed("inactive", true);

          houseLabel
            .classed("active",false)
            .classed("inactive", true);
        } 

        else if(chosenXAxis === "income"){
          houseLabel
            .classed("active",true)
            .classed("inactive", false);

          povertyLabel
            .classed("active",false)
            .classed("inactive", true);

          ageLabel
            .classed("active",false)
            .classed("inactive", true);
        } 

        else {
          houseLabel
            .classed("active",false)
            .classed("inactive", true);

          povertyLabel
            .classed("active",true)
            .classed("inactive", false);

          ageLabel
            .classed("active",false)
            .classed("inactive", true);
        }
      }
    })

      labelsGroupY.selectAll("text")
        .on("click", function() {
        // get value of selection
          var yvalue = d3.select(this).attr("value");
          if (yvalue !== chosenYAxis) {
    
            // replaces chosenXAxis with value
            chosenYAxis = yvalue;
    
            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(healthData, chosenYAxis);
    
            // updates x axis with transition
            yAxis = renderAxesY(yLinearScale, yAxis);
    
            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
    
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
            stateAbbr = renderStateAbbr(stateAbbr, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            if (chosenYAxis === "smokes") {
              smokesLabel
                .classed("active",true)
                .classed("inactive", false);
    
              healhLabel
                .classed("active",false)
                .classed("inactive", true);
    
              obeseLabel
                .classed("active",false)
                .classed("inactive", true);
            } 
    
            else if(chosenXAxis === "obesity"){
              smokesLabel
                .classed("active",false)
                .classed("inactive", true);
    
              healhLabel
                .classed("active",false)
                .classed("inactive", true);
    
              obeseLabel
                .classed("active",true)
                .classed("inactive", false);
            } 
    
            else {
              smokesLabel
                .classed("active",false)
                .classed("inactive", true);
    
              healhLabel
                .classed("active",true)
                .classed("inactive", false);
    
              obeseLabel
                .classed("active",false)
                .classed("inactive", true);
            }

          }
      })
    }).catch(function(error) {
      console.log(error);
    });