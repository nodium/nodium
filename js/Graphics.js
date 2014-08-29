(function (window, $, d3, undefined) {

'use strict';

var graph       = window.setNamespace('app.graph'),
    graphics    = window.setNamespace('app.graph.graphics'),
    NodeStatus  = window.use('app.constants.NodeStatus');

/*
 * Functions here are probably executed in scope of the trait
 */

graphics.scaleNode = function (scale, node, graph) {

    d3.select(node).select('circle').transition()
        .duration(400)
        .attr("r", function(d) { return scale * graph.getNodeRadius(d)*2; });
};

graphics.classNode = function (className, value, node, data, graph) {

    // node = (node === undefined) ? d3.select($('.node').get(data.index)) : node;
    // doesn't work because node isn't a d3 selection?
    node = d3.select($('.node').get(data.index));

    node.classed(className, value);
};

graphics.handleNodeScale = function (scale, event, node) {

    graphics.scaleNode(scale, node, this.graph);
};

graphics.handleClassNode = function (className, event, node, data) {

    graphics.classNode(className, true, node, data, this.graph);
};

graphics.handleUnclassNode = function (className, event, node, data) {

    graphics.classNode(className, false, node, data, this.graph);
};

graphics.handleNodeUpdated = function (event, node, data) {

    console.log("handling node updates");
    console.log(arguments);
    // console.log(node);
    // console.log(data);

    var view = d3.select($('.node').get(data.index)),
        status,
        s;

    console.log(view);
    console.log(data.status);

    for (s in NodeStatus) {

        if (false === NodeStatus.hasOwnProperty(s)) {
            continue;
        }

        status = NodeStatus[s];

        if (status !== data.status) {
            view.classed(status, false);
        }
    }

    view.classed(data.status, true);
};

graphics.colorNodes = function (nodes, color) {

    nodes.selectAll('.top-circle').transition()
        .duration(500)
        .style('fill', color);
};

graphics.classNodes = function (nodes, classifier) {

    console.log("classing nodes");

    nodes.each(function (data) {
        // console.log(data);
        // console.log(d3.select(this));
        d3.select(this).classed(classifier(data));
    });
};

})(window, jQuery, d3);