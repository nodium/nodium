(function (window, $, d3, undefined) {

'use strict';

var graph       = window.setNamespace('app.graph'),
    graphics    = window.setNamespace('app.graph.graphics'),
    NodeStatus  = window.use('app.constants.NodeStatus');

graphics.scaleNode = function (scale, node, graph) {

    console.log("scaling node");
    console.log(node);
    d3.select(node).select('circle').transition()
        .duration(400)
        .attr("r", function(d) { console.log(this); 
            console.log(scale * graph.getNodeRadius(d)*2);
            return scale * graph.getNodeRadius(d)*2; });
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

graphics.handleNodeColor = function (color, event, node, data) {

    graphics.colorNodes(d3.select(node), color, 500);
};

graphics.colorNodes = function (nodes, color, duration) {

    nodes.selectAll('.top-circle').transition()
        .duration(duration)
        .style('fill', color);
};

graphics.classNodes = function (nodes, classifier) {

    nodes.each(function (data) {
        d3.select(this).classed(classifier(data));
    });
};

graphics.shapeNodes = function (nodes, shape, size) {
    
    nodes.selectAll('.top-circle')
        .attr('d', d3.svg.symbol()
            .type(shape)
            .size(size)
        )
};

})(window, window.jQuery, window.d3);