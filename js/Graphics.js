(function (window, $, d3, undefined) {

'use strict';

var graph       = window.setNamespace('app.graph'),
    graphics    = window.setNamespace('app.graph.graphics'),
    NodeStatus  = window.use('app.constants.NodeStatus');

graphics.scaleNode = function (scale, node, graph) {

    d3.select(node).select('.top-circle').transition()
        .duration(400)
        .attrTween("transform", function(data, index, a) {
            var baseScale = data._shape.scale,
                scaleX = baseScale.x*scale,
                scaleY = baseScale.y*scale;

            return d3.interpolateString(a, 'scale('+scaleX+','+scaleY+')');
        });
        // .attr('d', d3.svg.symbol()
        //     .type(function (data) { return data._shape; })
        //     .size(function (data) {
        //         return Math.pow(graph.getNodeRadius(data)*3*scale, 2);
        //     })
        // )
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

    var shapeData;
    
    nodes.each(function (data) {
        shapeData = shape(data);
        d3.select(this).selectAll('.top-circle').transition().duration(500)
            .attr('d', shapeData.path)
            .attr('transform', 'scale('+shapeData.scale.x+','+shapeData.scale.y+')');
    });

    // nodes.selectAll('.top-circle')
    //     .attr('d', shape)

    // nodes.selectAll('.top-circle')
    //     .attr('d', d3.svg.symbol()
    //         .type(shape)
    //         .size(size)
    //     )
};

})(window, window.jQuery, window.d3);