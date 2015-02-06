(function (context, $, d3, undefined) {

'use strict';

var graph       = context.setNamespace('app.graph'),
    graphics    = context.setNamespace('app.graph.graphics'),
    NodeStatus  = context.use('app.constants.NodeStatus');

graphics.scaleNode = function (scale, node, graph) {

    //
    // NOTE we may need the attrtween again later
    //
    // d3.select(node).select('.top-circle').transition()
    //     .duration(400)
    //     .attrTween("transform", function(data, index, a) {
    //         var baseScale = data._shape.scale,
    //             scaleX = baseScale.x*scale,
    //             scaleY = baseScale.y*scale;

    //         return d3.interpolateString(a, 'scale('+scaleX+','+scaleY+')');
    //     });

    var data = graph.resolveData(node, undefined);

    var baseScale = data._shape.scale,
        scaleX = baseScale.x*scale,
        scaleY = baseScale.y*scale;

    d3.select(node).selectAll('.top-circle').transition().duration(500)
        .attr('d', data._shape.path)
        .attr('transform', 'scale('+scaleX+','+scaleY+')');
};

graphics.classNode = function (className, value, node, data, graph) {

    // node = (node === undefined) ? d3.select($('.node').get(data.index)) : node;
    // doesn't work because node isn't a d3 selection?
    // node = d3.select($('.node').get(data.index));
    node = d3.select(node);

    console.log("classing node");
    console.log(data.index);
    console.log(node);
    console.log(node.datum())

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

graphics.shapeNodes = function (nodes, shape) {

    var shapeData;
    
    nodes.each(function (data) {
        shapeData = shape(data);
        d3.select(this).selectAll('.top-circle').transition().duration(500)
            .attr('d', shapeData.path)
            .attr('transform', 'scale('+shapeData.scale.x+','+shapeData.scale.y+')');
    });
};

})(this, jQuery, d3);