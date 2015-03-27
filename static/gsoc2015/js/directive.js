/**
 * Created by quek on 22/03/2015.
 */

heter.directive('timeLine', function (dataServices) {
    /* directive that draw the time line and response to changes made to the timeline
     TODO: breakup link function and add a controller that stores information such as the selected value and functions
     TODO: simpifly code
     TODO: event handler for onSelect that manipulates with DOM of other directive should be seperated.
     */

    return {
        restrict: 'E',
        scope: {
            patientBundle: '=data',
            update: '&update'

        },
        templateUrl: STATIC_URL + 'gsoc2015/js/templates/timeline.js.html',
        link: function (scope, element, attrs) {
            // function to check if date is valid ( not used now)
            function checkDateValid(date) {
                return date instanceof Date && isFinite(date)
            }

            // function to format treatment data (dual point data; start and end point) to be consumed by visjs timeline
            function generateTreatment(data) {
                var sections = [];
                angular.forEach(data, function (value, key) {
                    this.push({
                        id: 't_' + key,
                        content: value.treatmentName,
                        start: new Date(value.startDate),
                        end: new Date(value.endDate),
                        group: 'treatment'
                    })
                }, sections);
                return sections
            }

            // function to fromat data from biospsy( single end data)
            function generateBiopsy(data) {
                var sections = [];
                angular.forEach(data, function (value, key) {
                    this.push({
                        id: 'b_' + key,
                        title: value.tumorType + value.tissueType,
                        start: new Date(value.dateOfBiopsy),
                        group: 'Biopsy'
                    })
                }, sections);
                return sections
            }

            // function to clear selection
            function clearColor(selection) {
                selection.style('fill', 'None')
            }

            // click event handler on the timeline.
            function onSelect(properties) {
                var val = properties.items[0];
                d3.selectAll('rect').call(clearColor)
                if (typeof val !== "undefined") {
                    var sampleInfo = val.split("_")
                    if (sampleInfo[0] == 'b') {
                        var rect = d3.select('#rect_' + sampleInfo[1])
                        dataServices.setBiopsy(sampleInfo[1]);
                        console.log('from onselect' , dataServices)
                        scope.$apply()
                        //scope.update();

                        rect.style('fill', 'blue')
                    }
                    else {
                        $('#treatmentLink' + sampleInfo[1]).click()
                    }
                }

            }

            // function that generate time line
            function generateChrono(value) {

                var treatment = [];
                treatment = generateTreatment(value.treatmentList);

                var biopsy = [];
                biopsy = generateBiopsy(value.genomicProfileList);

                var groups = [
                    {
                        id: 'treatment',
                        content: 'treatment'
                    },
                    {
                        id: 'Biopsy',
                        content: 'Biopsy'
                    }

                ];

                var items = treatment.concat(biopsy);
                items = new vis.DataSet(items);

                groups = new vis.DataSet(groups);

                var container = document.getElementById("target1");
                var timeline = new vis.Timeline(container, items, groups, {})

                timeline.on('select', onSelect)
            }

            scope.$watch('patientBundle', function (value, newval) {
                if (typeof value !== "undefined") {
                    generateChrono(value);
                }
            })
        }
    }
});

heter.directive('geneDetail', function (dataServices) {
    /* directive to draw information of the gene mutation
     TODO :  add event listen for changes
     TODO : add controller
     TODO : Make sure dimension of d3 image is correct
     */
    return {
        restrict: 'E',
        scope: {
            groupdata: '='
        },
        templateUrl: STATIC_URL + 'gsoc2015/js/templates/piechart.html',
        link: function (scope, element, attr) {


            // main d3 function
            function plotGeneDetail(data) {
                var y = 0;
                var d3data = [],
                    d3rect = [],
                    d3lab = [];

                // function to parse data to usable format for d3
                angular.forEach(data, function (value, key) {
                    var i = 0;
                    y++;
                    d3lab.push({'id': y, 'gene': key})
                    angular.forEach(value, function (value2, key2) {
                        i++;
                        d3data.push({ 'id': key + i + y,
                            'name': key,
                            'x': i,
                            'y': y,
                            'score': value2.ratio })
                    })

                });

                var geneList = Object.keys(data);
                var sample = data[geneList[0]].length;

                var radius = 5,
                    marginCircle = 5,
                    margin = 10,
                    textSpace = 50;

                var totalCircle = radius * 2 + marginCircle * 2;


                var height = margin + geneList.length * totalCircle,
                    width = margin + textSpace + sample * totalCircle;

                //generate data for the backdrop of the selected biopsy base on the number of biospy
                d3rect = Array.apply(null, {length: sample}).map(Number.call, Number)

                //color of the circles, black = alt/ref > 1 grey alt/ref < 1 white = no mutation
                function color(d) {
                    if (d == 0) {
                        return 'white'
                    }
                    else {
                        if (d > 1) {
                            return 'black'
                        }
                        else if (d < 1) {
                            return 'gray'
                        }

                    }

                }

                var xValue = function (d) {
                        return textSpace + d.x * totalCircle
                    },
                    xAxis = function (d) {
                        return d
                    },

                    yValue = function (d) {
                        return  d.y * totalCircle
                    };

                var svg = d3.select('#pies')
                    .append('svg')
                    .attr("width", width)
                    .attr("height", height)
                    .attr('class', 'piechart')
                    .append('g');

                var rect = svg.selectAll('.rect')
                    .data(d3rect)
                    .enter().append('rect')
                    .attr('x', function (d) {
                        return margin + textSpace + d * totalCircle
                    })
                    .attr('y', 0)
                    .attr('id', function (d) {
                        return 'rect_' + d
                    })
                    .attr('height', height + margin)
                    .attr('width', totalCircle)

                    .style('fill', 'none');

                var text = svg.selectAll('.text')
                    .data(d3lab)
                    .enter().append('text')
                    .attr('x', margin)
                    .attr('y', function (d) {
                        return d.id * totalCircle
                    })
                    .text(function (d) {
                        return d.gene
                    })
                    .style("font-size", "8px");

                var g = svg.selectAll('.dot')
                    .data(d3data)
                    .enter().append('circle')
                    .attr("r", radius)
                    .attr("cx", xValue)
                    .attr("cy", yValue)
                    .style("fill", function (d) {
                        return color(d.score)
                    })
                    .style("stroke", 'black')
            }

            scope.$watch('groupdata', function (newVal, oldVal) {
                if (typeof newVal !== "undefined") {
                    plotGeneDetail(newVal);
                    console.log('triggered')

                }
            })
        }
    }

});

heter.directive('treatmentDetails', function () {
    return {
        restrict: 'E',
        scope: {data: '=data'},
        templateUrl: STATIC_URL + 'gsoc2015/js/templates/treatment.html'
    }
})

heter.directive('biopsyDetails', function (dataServices) {
    return {
        restrict: 'E',
        template: '<p> <b>Tissue Type : </b>[[data().value]]</p>',
        link: function(scope, elem, attr){
            scope.data = dataServices.getBiopsy
        }

    }
})


heter.directive('patientInfo', function(){
    return {
        restrict : 'E',
        scope : { data : '=data'},
        templateUrl : STATIC_URL + 'gsoc2015/js/templates/patientInfo.html'
    }







})
